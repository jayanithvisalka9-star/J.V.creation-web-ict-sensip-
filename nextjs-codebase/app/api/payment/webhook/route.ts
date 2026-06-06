import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-04-10" as any }) : null;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sensip_classes";
let client: MongoClient | null = null;

async function getDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db("sensip_classes");
}

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe connection uninitialized" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
  } catch (err: any) {
    console.error(`Webhook Signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle transaction success
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const studentId = session.metadata?.studentId;

    if (studentId) {
      try {
        const db = await getDatabase();
        const studentsCollection = db.collection("students");

        // Set student billing status to paid
        await studentsCollection.updateOne(
          { id: studentId },
          { $set: { paid: true, lastPaymentDate: new Date() } }
        );
        console.log(`Payment confirmed for Student: ${studentId}`);
      } catch (dbErr: any) {
        console.error("Failed to update student database inside webhook:", dbErr.message);
        return NextResponse.json({ error: "Database update failure" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
