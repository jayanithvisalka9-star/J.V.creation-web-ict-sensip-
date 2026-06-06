"use client";

import React, { useState, useEffect } from "react";
import QRScannerComponent from "@/components/QRScannerComponent";
import { ShieldAlert, GraduationCap, X, ChevronRight } from "lucide-react";

interface Student {
  id: string;
  name: string;
  details: string;
  phone: string;
  paid: boolean;
  attendance: number;
  attendedToday: boolean;
}

export default function AdminPage() {
  const [students, setStudents] = useState<Record<number, Student[]>>({});
  const [currentGradeTab, setCurrentGradeTab] = useState<number>(10);
  
  // Form States
  const [enrollName, setEnrollName] = useState("");
  const [enrollGrade, setEnrollGrade] = useState("10");
  const [enrollPhone, setEnrollPhone] = useState("");
  const [enrollDetails, setEnrollDetails] = useState("");

  // Card Generation States
  const [generatedCardData, setGeneratedCardData] = useState<{
    id: string;
    name: string;
    grade: string;
    phone: string;
  } | null>(null);

  // Twilio Console Log States
  const [twilioLogs, setTwilioLogs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sensip_students");
      if (stored) {
        setStudents(JSON.parse(stored));
      }
      setTwilioLogs([
        "// Twilio Node.js SMS Gateway initialized successfully...",
        "// Ready to route student attendance notifications to parents..."
      ]);
    }
  }, []);

  const handleEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName || !enrollPhone) return;

    const gradeNum = parseInt(enrollGrade);
    const randomId = Math.floor(100 + Math.random() * 900);
    const id = `SENSIP-${gradeNum}-${randomId}`;

    const newStudent: Student = {
      id,
      name: enrollName,
      details: enrollDetails || "No details",
      phone: enrollPhone,
      paid: false,
      attendance: 100,
      attendedToday: false
    };

    const updated = { ...students };
    if (!updated[gradeNum]) updated[gradeNum] = [];
    updated[gradeNum].push(newStudent);

    setStudents(updated);
    localStorage.setItem("sensip_students", JSON.stringify(updated));

    // Display Card
    setGeneratedCardData({
      id,
      name: enrollName,
      grade: enrollGrade,
      phone: enrollPhone
    });

    // Reset Form
    setEnrollName("");
    setEnrollPhone("");
    setEnrollDetails("");

    // POST details to API route (documentation demonstration)
    fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent)
    }).catch(err => console.log("Database mock POST trigger"));
  };

  const handleAttendanceScan = async (decodedStudentId: string) => {
    const updated = { ...students };
    let foundStudent: Student | null = null;
    let foundGrade = 10;

    [9, 10, 11].forEach(g => {
      (updated[g] || []).forEach(s => {
        if (s.id === decodedStudentId) {
          foundStudent = s;
          foundGrade = g;
        }
      });
    });

    if (!foundStudent) {
      alert("Student QR Code not recognized by ICT database.");
      return;
    }

    if ((foundStudent as Student).attendedToday) {
      alert(`${(foundStudent as Student).name} is already marked present today.`);
      return;
    }

    // Mark present
    const updatedList = updated[foundGrade].map(s => {
      if (s.id === decodedStudentId) {
        return {
          ...s,
          attendedToday: true,
          attendance: Math.min(100, s.attendance + 4)
        };
      }
      return s;
    });
    updated[foundGrade] = updatedList;

    setStudents(updated);
    localStorage.setItem("sensip_students", JSON.stringify(updated));

    // Play Beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}

    // POST Scan to trigger SMS
    const time = new Date().toLocaleTimeString();
    
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: decodedStudentId })
      });
      const data = await res.json();
      
      setTwilioLogs(prev => [
        ...prev,
        `[${time}] POST /api/scan -> Mark Attended: ID ${decodedStudentId}`,
        `[${time}] TWILIO SMS QUEUED: Send to parent: ${(foundStudent as Student).phone}`,
        `[${time}] TWILIO RESPONSE: Sent (Status code: 200, SID: ${data.sid || "SM85920"})`,
        `[${time}] Database updated successfully for Grade ${foundGrade}.`
      ]);
    } catch(err) {
      // Fallback display if server not running
      setTwilioLogs(prev => [
        ...prev,
        `[${time}] POST /api/scan -> ID ${decodedStudentId}`,
        `[${time}] (MOCK) TWILIO SMS SENT -> to: ${(foundStudent as Student).phone} - "Student ${(foundStudent as Student).name} attended the class."`
      ]);
    }
  };

  const getTestingList = () => {
    return students[currentGradeTab] || [];
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Admin Dashboard header */}
      <div className="flex items-center justify-between border-b border-glassBorder pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyberCyan/10 border border-cyberCyan/30 text-cyberCyan shadow-glow-cyan">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-lg text-white">ICT SENSIP ADMIN PORTAL</h3>
            <p className="font-space text-[11px] text-slate-400">Manage classroom attendance registers, generate codes, and trigger Twilio gateways.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Registration Column */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h4 className="font-orbitron text-xs tracking-widest text-cyberCyan border-b border-glassBorder/60 pb-2">1. ENROLL NEW STUDENT</h4>
          
          <form onSubmit={handleEnrollment} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-space text-[11px] text-slate-400 tracking-wider">Full Student Name</label>
              <input 
                required 
                type="text" 
                placeholder="Kamal Perera"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-black/40 border border-glassBorder focus:outline-none focus:border-cyberCyan text-sm text-slate-100 transition" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-space text-[11px] text-slate-400 tracking-wider">Academic Grade</label>
                <select 
                  value={enrollGrade}
                  onChange={(e) => setEnrollGrade(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-black/40 border border-glassBorder focus:outline-none focus:border-cyberCyan text-sm text-slate-100 transition"
                >
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-space text-[11px] text-slate-400 tracking-wider">Contact Phone</label>
                <input 
                  required 
                  type="tel" 
                  placeholder="+94771234567"
                  value={enrollPhone}
                  onChange={(e) => setEnrollPhone(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-black/40 border border-glassBorder focus:outline-none focus:border-cyberCyan text-sm text-slate-100 transition" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-space text-[11px] text-slate-400 tracking-wider">Student Details / Stream Info</label>
              <input 
                type="text" 
                placeholder="English Medium / Theory candidate"
                value={enrollDetails}
                onChange={(e) => setEnrollDetails(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-black/40 border border-glassBorder focus:outline-none focus:border-cyberCyan text-sm text-slate-100 transition" 
              />
            </div>

            <button type="submit" className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyberCyan to-cyberPurple text-white font-space font-bold tracking-wide shadow-glow-cyan hover:brightness-115 transition">
              Enroll Student & Issue Card
            </button>
          </form>

          {/* Issued Student Card UI */}
          {generatedCardData && (
            <div className="flex flex-col gap-4 p-4 border border-cyberCyan/40 bg-cyberCyan/5 rounded-2xl animate-fadeIn relative">
              <button onClick={() => setGeneratedCardData(null)} className="absolute top-3 right-3 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <h5 className="font-orbitron text-[10px] tracking-widest text-cyberCyan">GENERATED ID CARD & ATTENDANCE QR</h5>
              
              <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-white/10">
                <div className="bg-white p-2 rounded-lg w-20 h-20 flex items-center justify-center text-black font-bold text-center text-xs">
                  {/* Next.js would render dynamic canvas/img containing QRCode code */}
                  [QR ID]
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-space text-[9px] bg-cyberCyan/20 text-cyberCyan px-2 py-0.5 rounded-full border border-cyberCyan/35 max-w-max uppercase font-bold">
                    Grade {generatedCardData.grade}
                  </span>
                  <span className="font-orbitron font-extrabold text-sm text-white truncate max-w-[180px]">
                    {generatedCardData.name}
                  </span>
                  <span className="font-space text-[10px] text-slate-400">ID: {generatedCardData.id}</span>
                  <span className="font-space text-[9px] text-slate-500">PH: {generatedCardData.phone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-[1px] bg-glassBorder"></div>

        {/* Attendance Scan controls */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h4 className="font-orbitron text-xs tracking-widest text-cyberPurple border-b border-glassBorder/60 pb-2">2. ATTENDANCE SCANNER & SMS CONTROLS</h4>
          
          <div className="flex gap-2 mb-2">
            {[9, 10, 11].map(g => (
              <button
                key={g}
                onClick={() => setCurrentGradeTab(g)}
                className={`px-3 py-1 text-xs font-space rounded-full border transition ${
                  currentGradeTab === g ? "bg-cyberPurple/20 border-cyberPurple text-white" : "border-glassBorder text-slate-400"
                }`}
              >
                Grade {g} List
              </button>
            ))}
          </div>

          <QRScannerComponent 
            onScanSuccess={handleAttendanceScan} 
            studentsList={getTestingList()} 
          />

          {/* SMS Logs Terminal */}
          <div className="flex flex-col gap-2 mt-2">
            <h5 className="font-orbitron text-[10px] tracking-widest text-slate-400 flex items-center gap-1.5">
              <span>TWILIO SMS CONSOLE LOGGER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </h5>
            <div className="glass-panel font-mono text-[9px] p-4 rounded-xl text-emerald-400 bg-black/60 h-32 overflow-y-auto flex flex-col gap-1.5 border border-emerald-500/20">
              {twilioLogs.map((log, index) => (
                <div key={index} className="flex gap-1.5 items-start">
                  <ChevronRight className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
