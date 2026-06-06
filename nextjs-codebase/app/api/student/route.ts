import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sensip_classes";
let client: MongoClient | null = null;

async function getDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db("sensip_classes");
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;

    if (!studentId) {
      return NextResponse.json({ error: "Missing Student ID parameter" }, { status: 400 });
    }

    let studentData = null;
    let attendanceLogs: any[] = [];

    try {
      const db = await getDatabase();
      const studentsCollection = db.collection("students");
      const attendanceCollection = db.collection("attendance");

      // Fetch student document
      studentData = await studentsCollection.findOne({ id: studentId });

      if (studentData) {
        // Fetch matching attendance records
        attendanceLogs = await attendanceCollection
          .find({ studentId: studentId })
          .sort({ timestamp: -1 })
          .toArray();
      }
    } catch (dbErr) {
      console.warn("DB offline. Using mock schema for student fetch.");
      // Simulated data response
      if (studentId.toLowerCase() === "sensip-10-101") {
        studentData = {
          id: "SENSIP-10-101",
          name: "Nimal Perera",
          details: "English Medium stream",
          phone: "+94771234567",
          paid: true,
          attendance: 94
        };
        attendanceLogs = [
          { timestamp: new Date(Date.now() - 86400000 * 2), status: "Attended" },
          { timestamp: new Date(Date.now() - 86400000 * 9), status: "Attended" }
        ];
      }
    }

    if (!studentData) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      student: {
        id: studentData.id,
        name: studentData.name,
        details: studentData.details,
        phone: studentData.phone,
        paid: studentData.paid,
        attendance: studentData.attendance,
        logs: attendanceLogs.map(log => 
          `${new Date(log.timestamp).toISOString().split('T')[0]} Check-In`
        )
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
