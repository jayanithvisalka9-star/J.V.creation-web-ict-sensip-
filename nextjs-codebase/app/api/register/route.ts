import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection URI template (stored in environment variables)
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
    const body = await req.json();
    const { id, name, grade, phone, details } = body;

    // Server-side validations
    if (!id || !name || !grade || !phone) {
      return NextResponse.json(
        { error: "Missing required parameters (id, name, grade, phone)" },
        { status: 400 }
      );
    }

    // Connect to database and store student details
    let savedInDB = false;
    try {
      const db = await getDatabase();
      const studentsCollection = db.collection("students");
      
      // Upsert record
      await studentsCollection.updateOne(
        { id: id },
        { 
          $set: { 
            name, 
            grade: parseInt(grade), 
            phone, 
            details: details || "",
            paid: false, 
            attendance: 100, 
            registeredAt: new Date() 
          } 
        },
        { upsert: true }
      );
      savedInDB = true;
    } catch (dbErr) {
      console.warn("MongoDB offline, continuing with local simulated response:", dbErr.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Student registered successfully.", 
      studentId: id,
      databaseSynced: savedInDB 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
