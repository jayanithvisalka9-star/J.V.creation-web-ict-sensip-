import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import twilio from "twilio";

// Twilio credentials from environment configuration
const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFrom = process.env.TWILIO_PHONE_NUMBER || "";

// MongoDB configuration
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
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Missing Student ID parameters" }, { status: 400 });
    }

    // 1. Fetch student info and mark present in database
    let studentName = "Student";
    let parentPhone = "";
    let databaseUpdated = false;

    try {
      const db = await getDatabase();
      const studentsCollection = db.collection("students");
      const attendanceCollection = db.collection("attendance");

      const student = await studentsCollection.findOne({ id: studentId });
      if (student) {
        studentName = student.name;
        parentPhone = student.phone;

        // Save daily attendance check-in
        await attendanceCollection.insertOne({
          studentId,
          timestamp: new Date(),
          status: "Attended"
        });

        // Increment monthly count
        await studentsCollection.updateOne(
          { id: studentId },
          { $set: { attendedToday: true }, $inc: { attendance: 4 } }
        );
        databaseUpdated = true;
      }
    } catch (dbErr) {
      console.warn("DB offline. Executing with simulated scan metadata:", dbErr.message);
      // Mock data matching registry
      studentName = studentId.includes("10-101") ? "Nimal Perera" : "Registered Student";
      parentPhone = "+94771234567";
    }

    // 2. Dispatch Parent Notification SMS via Twilio
    let twilioSidResponse = "MOCK_SMS_SID_84920";
    let smsStatus = "simulated";

    if (twilioSid && twilioToken && parentPhone) {
      try {
        const twilioClient = twilio(twilioSid, twilioToken);
        const message = await twilioClient.messages.create({
          body: `Student ${studentName} attended the ICT Sensip class today (${new Date().toLocaleDateString()}).`,
          from: twilioFrom,
          to: parentPhone
        });
        twilioSidResponse = message.sid;
        smsStatus = "dispatched";
      } catch (smsErr: any) {
        console.error("Twilio API failed:", smsErr.message);
        smsStatus = "failed: " + smsErr.message;
      }
    } else {
      console.warn("Twilio credentials missing in .env.local. Running in offline simulator mode.");
    }

    return NextResponse.json({
      success: true,
      message: `Marked attended for ${studentName}.`,
      student: studentName,
      phone: parentPhone,
      smsStatus: smsStatus,
      sid: twilioSidResponse,
      dbUpdated: databaseUpdated
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
