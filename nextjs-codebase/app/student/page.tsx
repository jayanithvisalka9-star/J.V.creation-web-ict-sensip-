"use client";

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, QrCode, CreditCard, Activity, 
  FileText, Library, Download, CheckCircle, AlertCircle, 
  ArrowRight, LogOut 
} from "lucide-react";
import confetti from "canvas-confetti";

interface Student {
  id: string;
  name: string;
  details: string;
  phone: string;
  paid: boolean;
  attendance: number;
  attendedToday: boolean;
  logs?: string[];
}

export default function StudentPortalPage() {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [students, setStudents] = useState<Record<number, Student[]>>({});
  const [loggedInStudent, setLoggedInStudent] = useState<(Student & { grade: number }) | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [tutesList, setTutesList] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sensip_students");
      if (stored) {
        setStudents(JSON.parse(stored));
      }
    }
  }, []);

  // Update notes based on student grade
  useEffect(() => {
    if (loggedInStudent) {
      const defaultTutes: Record<number, any[]> = {
        9: [
          { name: "Grade 9 ICT - Introduction to Computers.pdf", size: "3.4 MB", date: "2026-05-12" },
          { name: "Input & Output Devices Notes.pdf", size: "2.1 MB", date: "2026-05-28" }
        ],
        10: [
          { name: "Grade 10 ICT - Data Representation & Numbers.pdf", size: "4.8 MB", date: "2026-06-01" },
          { name: "Boolean Logic & Gate Design.pdf", size: "5.2 MB", date: "2026-06-04" }
        ],
        11: [
          { name: "Grade 11 ICT - Pascal Programming Complete.pdf", size: "6.7 MB", date: "2026-05-15" }
        ]
      };
      setTutesList(defaultTutes[loggedInStudent.grade] || []);
    }
  }, [loggedInStudent]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let found: Student | null = null;
    let foundGrade = 10;

    [9, 10, 11].forEach(g => {
      (students[g] || []).forEach(s => {
        if (s.id.toLowerCase() === studentIdInput.trim().toLowerCase()) {
          found = s;
          foundGrade = g;
        }
      });
    });

    if (found) {
      setLoggedInStudent({ ...found, grade: foundGrade });
    } else {
      alert("Student ID not found in class records.");
    }
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    setStudentIdInput("");
  };

  const handleOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInStudent) return;

    const updated = { ...students };
    const grade = loggedInStudent.grade;

    updated[grade] = (updated[grade] || []).map(s => {
      if (s.id === loggedInStudent.id) {
        return { ...s, paid: true };
      }
      return s;
    });

    setStudents(updated);
    localStorage.setItem("sensip_students", JSON.stringify(updated));
    
    // Sync current logged in state
    setLoggedInStudent(prev => prev ? { ...prev, paid: true } : null);
    setPaymentModalOpen(false);

    confetti({ particleCount: 100, spread: 60 });
  };

  // Helper calculation for attendance circle
  const attendancePct = loggedInStudent?.attendance || 0;
  const attendanceLogsCount = loggedInStudent?.logs?.length || 0;
  const dashOffset = 251.2 - (251.2 * attendancePct) / 100;

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. LOGIN STATE */}
      {!loggedInStudent && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.15)]">
            <div className="absolute -top-32 -right-32 w-64 h-64 glow-sphere-1 opacity-20 pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3.5 rounded-2xl bg-cyberPurple/10 border border-cyberPurple/30 text-cyberPurple mb-2">
                <GraduationCap className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="font-orbitron font-extrabold text-xl text-white">STUDENT PORTAL LOGIN</h3>
              <p className="font-space text-xs text-slate-400">Access your digital QR card and manage online payments</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-col gap-1.5">
                <label className="font-space text-[11px] text-slate-400 tracking-wider">Student ID (e.g. SENSIP-10-101)</label>
                <input 
                  required 
                  type="text" 
                  placeholder="SENSIP-XX-XXX"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-black/40 border border-glassBorder focus:outline-none focus:border-cyberPurple text-sm text-center font-mono tracking-widest text-slate-100 transition" 
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyberPurple to-cyberCyan text-white font-space font-bold tracking-wide shadow-glow-purple hover:brightness-110 transition">
                Log In to Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. AUTHENTICATED STATE */}
      {loggedInStudent && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2 border-b border-glassBorder pb-4">
            <div>
              <span className="text-xs font-space font-semibold text-cyberCyan uppercase tracking-widest">Student Workspace</span>
              <h2 className="font-orbitron font-extrabold text-2xl tracking-wide text-white">
                Welcome back, {loggedInStudent.name}
              </h2>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 border border-glassBorder hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 font-space text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Portal</span>
            </button>
          </div>

          {/* Grid Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Student ID Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5">
              <h3 className="font-orbitron text-xs tracking-widest text-cyberCyan border-b border-glassBorder pb-3 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> MY DIGITAL STUDENT CARD
              </h3>
              
              <div className="bg-gradient-to-br from-cyberPurple/25 via-black/60 to-cyberCyan/25 p-5 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col gap-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-orbitron font-black text-xs text-white tracking-widest">ICT SENSIP</span>
                    <span className="font-space text-[8px] text-slate-400 tracking-wider">SIR HASITH ILLANGASINGHE</span>
                  </div>
                  <span className="font-space text-[9px] bg-cyberCyan/20 text-cyberCyan border border-cyberCyan/40 px-2.5 py-0.5 rounded-full font-bold">
                    GRADE 0{loggedInStudent.grade}
                  </span>
                </div>

                <div className="flex items-center gap-4 z-10">
                  <div className="bg-white p-2 rounded-xl w-24 h-24 flex items-center justify-center text-black font-extrabold text-xs text-center border">
                    [QR CARD ID]
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-orbitron font-extrabold text-base text-white truncate max-w-[150px]">
                      {loggedInStudent.name}
                    </span>
                    <span className="font-mono text-xs text-slate-300 font-semibold">ID: {loggedInStudent.id}</span>
                    <span className="font-space text-[10px] text-slate-400">PH: {loggedInStudent.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tuition payments status */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5">
              <h3 className="font-orbitron text-xs tracking-widest text-cyberPink border-b border-glassBorder pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> TUITION FEE INVOICES
              </h3>

              <div className="flex-grow flex flex-col gap-4 justify-center">
                {loggedInStudent.paid ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 text-center flex flex-col items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span className="font-space text-xs font-semibold text-white">JUNE TUITION SETTLED</span>
                    <p className="font-space text-[10px] text-slate-400">Your monthly tuition receipt is cleared in database logs.</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-cyberPink/10 border border-cyberPink/35 text-center flex flex-col items-center gap-2 shadow-glow-pink">
                    <AlertCircle className="w-6 h-6 text-cyberPink" />
                    <span className="font-space text-xs font-semibold text-white">JUNE FEES INVOICE DUE</span>
                    <p className="font-space text-[10px] text-slate-400">Fee Amount: Rs. 3,500</p>
                    <button 
                      onClick={() => setPaymentModalOpen(true)} 
                      className="mt-1 w-full py-2 bg-gradient-to-r from-cyberPink to-cyberPurple text-white font-space font-bold rounded-xl text-xs hover:brightness-110 shadow-glow-pink transition"
                    >
                      Pay Tuition Online
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Circular Attendance Display */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5">
              <h3 className="font-orbitron text-xs tracking-widest text-cyberPurple border-b border-glassBorder pb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" /> PERSONAL ATTENDANCE LOG
              </h3>

              <div className="flex items-center justify-center gap-6 py-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent"></circle>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="url(#purpleGrad)" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={dashOffset} 
                      strokeLinecap="round"
                    ></circle>
                    <defs>
                      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4"></stop>
                        <stop offset="100%" stopColor="#a855f7"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="font-orbitron font-extrabold text-lg text-white">{attendancePct}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-space text-slate-400 text-xs">LECTURES ATTENDED</span>
                  <span className="font-orbitron text-white font-extrabold text-xl">{attendanceLogsCount} Classes</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-space text-[10px] text-slate-500 uppercase tracking-widest">Recent Logs History</span>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                  {(loggedInStudent.logs || []).map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 bg-white/5 border border-glassBorder rounded-lg text-[10px] font-space text-slate-300">
                      <span className="w-1.5 h-1.5 bg-cyberCyan rounded-full"></span>
                      <span>{log}</span>
                      <span className="ml-auto text-emerald-400 font-bold uppercase text-[8px]">Present</span>
                    </div>
                  ))}
                  {(!loggedInStudent.logs || loggedInStudent.logs.length === 0) && (
                    <span className="text-[10px] text-slate-500 font-space italic">No checked-in attendance records.</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* study materials download row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="font-orbitron text-xs tracking-widest text-slate-200 border-b border-glassBorder pb-3 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5" /> MY GRADE STUDY TUTES
              </h3>
              <div className="flex flex-col gap-3">
                {tutesList.map((tute, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-glassBorder rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg"><FileText className="w-4 h-4" /></div>
                      <div className="flex flex-col">
                        <span className="font-space text-xs font-semibold text-white max-w-[200px] truncate">{tute.name}</span>
                        <span className="text-[9px] font-space text-slate-500">{tute.size} • Published: {tute.date}</span>
                      </div>
                    </div>
                    <button className="p-2 border border-glassBorder hover:border-slate-400 text-slate-300 rounded-lg transition">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="font-orbitron text-xs tracking-widest text-slate-200 border-b border-glassBorder pb-3 flex items-center gap-2">
                <Library className="w-4.5 h-4.5" /> G.C.E. O/L PAST PAPERS
              </h3>
              <div className="flex flex-col gap-3">
                {[2025, 2024, 2023].map((year) => (
                  <div key={year} className="flex items-center justify-between p-3 bg-white/5 border border-glassBorder rounded-xl hover:border-cyberCyan/40 transition">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-cyberCyan/10 text-cyberCyan border border-cyberCyan/20 rounded-lg"><Library className="w-4 h-4" /></div>
                      <div className="flex flex-col">
                        <span className="font-space text-xs font-semibold text-white">G.C.E. O/L Past Paper - {year}</span>
                        <span className="text-[9px] font-space text-slate-500 uppercase">ICT Theory & MCQ</span>
                      </div>
                    </div>
                    <button className="p-2 border border-glassBorder hover:border-slate-400 text-slate-300 rounded-lg transition">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Online Stripe checkout Modal */}
      {paymentModalOpen && loggedInStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden relative shadow-[0_0_35px_rgba(236,72,153,0.2)]">
            <div className="flex justify-between items-center p-5 border-b border-glassBorder bg-black/40">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyberPink" />
                <h4 className="font-orbitron font-extrabold text-sm text-white">STRIPE ONLINE TUITION PAY</h4>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="p-4 bg-white/5 border border-glassBorder rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-space text-[10px] text-slate-400 uppercase tracking-widest">Student Payer</span>
                  <p className="font-orbitron font-extrabold text-sm text-white">{loggedInStudent.name}</p>
                  <p className="font-space text-[10px] text-slate-400 mt-0.5">ID: {loggedInStudent.id}</p>
                </div>
                <div className="text-right">
                  <span className="font-space text-[10px] text-slate-400 uppercase tracking-widest">Amount</span>
                  <p class="font-orbitron font-extrabold text-lg text-cyberPink">Rs. 3,500</p>
                </div>
              </div>

              <form onSubmit={handleOnlinePayment} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-space text-[10px] text-slate-400">Cardholder Name</label>
                  <input required type="text" placeholder="Cardholder Name" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-space text-[10px] text-slate-400">Card Number</label>
                  <input required type="text" placeholder="4242 •••• •••• 4242" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[10px] text-slate-400">Expiry</label>
                    <input required type="text" placeholder="MM/YY" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[10px] text-slate-400">CVC</label>
                    <input required type="text" placeholder="•••" className="px-4 py-2 bg-black/40 border border-glassBorder text-xs text-white rounded-lg focus:outline-none" />
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
