"use client";

import React, { useState, useEffect } from "react";
import GradeDashboard from "@/components/GradeDashboard";
import { CreditCard, X } from "lucide-react";
import confetti from "canvas-confetti";

interface Student {
  id: string;
  name: string;
  details: string;
  phone: string;
  paid: boolean;
  attendance: number;
  attendedToday: boolean;
}

const initialStudents: Record<number, Student[]> = {
  9: [
    { id: "SENSIP-9-204", name: "Amara Silva", details: "Local English medium", phone: "+94711122334", paid: true, attendance: 90, attendedToday: false },
    { id: "SENSIP-9-301", name: "Kasun Jayasinghe", details: "Maths / Science stream", phone: "+94778899001", paid: false, attendance: 75, attendedToday: false }
  ],
  10: [
    { id: "SENSIP-10-101", name: "Nimal Perera", details: "English Medium stream", phone: "+94771234567", paid: true, attendance: 94, attendedToday: false },
    { id: "SENSIP-10-102", name: "Sajith Weerasinghe", details: "Sinhala Medium ICT stream", phone: "+94723456789", paid: true, attendance: 88, attendedToday: false },
    { id: "SENSIP-10-103", name: "Dilini Fernando", details: "Revision Student", phone: "+94789012345", paid: false, attendance: 80, attendedToday: false }
  ],
  11: [
    { id: "SENSIP-11-501", name: "Suresh Fernando", details: "O/L Exam Candidate 2026", phone: "+94719988776", paid: true, attendance: 96, attendedToday: false },
    { id: "SENSIP-11-409", name: "Ruvini Jayawardene", details: "ICT Theory Student", phone: "+94776655443", paid: false, attendance: 70, attendedToday: false }
  ]
};

export default function HomePage() {
  const [activeGrade, setActiveGrade] = useState<number>(10);
  const [students, setStudents] = useState<Record<number, Student[]>>({});
  const [paymentModalData, setPaymentModalData] = useState<{ id: string; name: string } | null>(null);

  // Load from local storage if available (simulates persistent DB state)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sensip_students");
      if (stored) {
        setStudents(JSON.parse(stored));
      } else {
        localStorage.setItem("sensip_students", JSON.stringify(initialStudents));
        setStudents(initialStudents);
      }
    }
  }, []);

  const handleMarkAttendance = (studentId: string) => {
    const updated = { ...students };
    let phoneNum = "";
    let sName = "";
    
    // Find and update student
    [9, 10, 11].forEach(g => {
      updated[g] = (updated[g] || []).map(student => {
        if (student.id === studentId) {
          phoneNum = student.phone;
          sName = student.name;
          return {
            ...student,
            attendedToday: true,
            attendance: Math.min(100, student.attendance + 4)
          };
        }
        return student;
      });
    });

    setStudents(updated);
    localStorage.setItem("sensip_students", JSON.stringify(updated));

    // Call simulated scan to notify backend/Twilio SMS (API documentation trigger)
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, isManual: true })
    }).catch(err => console.log("Offline trigger mode"));
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalData) return;

    const updated = { ...students };
    [9, 10, 11].forEach(g => {
      updated[g] = (updated[g] || []).map(student => {
        if (student.id === paymentModalData.id) {
          return { ...student, paid: true };
        }
        return student;
      });
    });

    setStudents(updated);
    localStorage.setItem("sensip_students", JSON.stringify(updated));
    setPaymentModalData(null);

    confetti({ particleCount: 80, spread: 50 });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Grade Selector Header Display */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
        <div>
          <span className="text-xs font-space font-semibold text-cyberPurple uppercase tracking-widest">Classroom Workspace</span>
          <h2 className="font-orbitron font-extrabold text-3xl tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Grade {activeGrade} ICT
          </h2>
        </div>

        {/* Grade tabs navigation (Desktop and Mobile styles) */}
        <nav className="flex items-center space-x-1 bg-black/40 p-1.5 rounded-full border border-glassBorder">
          {[9, 10, 11].map(gradeNum => (
            <button
              key={gradeNum}
              onClick={() => setActiveGrade(gradeNum)}
              className={`px-6 py-2 rounded-full font-space font-medium text-sm tracking-wide transition duration-300 ${
                activeGrade === gradeNum 
                  ? "bg-gradient-to-r from-cyberPurple/30 to-cyberCyan/30 border border-cyberPurple/50 text-white shadow-glow-purple"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Grade {gradeNum}
            </button>
          ))}
        </nav>
      </div>

      {/* Grade Dashboard component rendering nested tabs */}
      {students[activeGrade] && (
        <GradeDashboard
          grade={activeGrade}
          students={students[activeGrade]}
          onMarkAttendance={handleMarkAttendance}
          onTriggerPayment={(id, name) => setPaymentModalData({ id, name })}
        />
      )}

      {/* SECURE PAYMENT SIMULATOR PORTAL MODAL */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden relative shadow-[0_0_35px_rgba(236,72,153,0.2)]">
            <div className="flex justify-between items-center p-5 border-b border-glassBorder bg-black/40">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyberPink" />
                <h4 className="font-orbitron font-extrabold text-sm text-white">SECURE TUITION CHECKOUT</h4>
              </div>
              <button onClick={() => setPaymentModalData(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="p-4 bg-white/5 border border-glassBorder rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-space text-[10px] text-slate-400 uppercase tracking-widest">Selected Student</span>
                  <p className="font-orbitron font-extrabold text-sm text-white">{paymentModalData.name}</p>
                  <p className="font-space text-[10px] text-slate-400 mt-0.5">ID: {paymentModalData.id}</p>
                </div>
                <div className="text-right">
                  <span className="font-space text-[10px] text-slate-400 uppercase tracking-widest">Monthly Fee</span>
                  <p className="font-orbitron font-extrabold text-lg text-cyberPink">Rs. 3,500</p>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-space text-[10px] text-slate-400">Cardholder Name</label>
                  <input required type="text" placeholder="Cardholder Name" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none focus:border-cyberPink" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-space text-[10px] text-slate-400">Card Number (Stripe checkout)</label>
                  <input required type="text" placeholder="4242 •••• •••• 4242" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none focus:border-cyberPink" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[10px] text-slate-400">Expiration</label>
                    <input required type="text" placeholder="MM/YY" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none focus:border-cyberPink" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[10px] text-slate-400">CVC</label>
                    <input required type="text" placeholder="•••" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none focus:border-cyberPink" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyberPink to-cyberPurple text-white font-space font-bold tracking-wide text-xs hover:brightness-110 shadow-glow-pink transition">
                  Pay Fee & Clear Invoice
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
