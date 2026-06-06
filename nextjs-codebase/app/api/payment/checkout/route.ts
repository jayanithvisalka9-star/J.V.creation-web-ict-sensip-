import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe Client with secret credentials
const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-04-10" as any }) : null;

export async function POST(req: Request) {
  try {
    const { studentId, studentName, amount } = await req.json();

    if (!studentId || !amount) {
      return NextResponse.json({ error: "Missing required parameters (studentId, amount)" }, { status: 400 });
    }

    const priceAmount = parseFloat(amount); // Class fees: e.g., 3500 LKR or 15 USD

    // Fallback simulation url if credentials are unpopulated
    if (!stripe) {
      console.warn("Stripe credentials absent in env. Triggering sandbox url.");
      return NextResponse.json({
        success: true,
        checkoutUrl: `https://checkout.stripe.dev/preview/mock-payment?studentId=${studentId}&amount=${priceAmount}`,
        simulated: true
      });
    }

    // Generate Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: `ICT Sensip Class Fee - ${studentName}`,
              description: `Monthly tuition fee payment for ID: ${studentId}`,
            },
            unit_amount: priceAmount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      metadata: {
        studentId: studentId,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      simulated: false
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Stripe Session Error", details: error.message },
      { status: 500 }
    );
  }
}
