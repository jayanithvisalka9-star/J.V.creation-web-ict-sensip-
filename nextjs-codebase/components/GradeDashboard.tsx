"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, BrainCircuit, FileText, Library, Bell, 
  GraduationCap, Activity, CreditCard, Calendar, CloudUpload, 
  Download, Trophy, ArrowRight, CheckCircle2 
} from "lucide-react";
import AttendanceTable from "./AttendanceTable";
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

interface GradeDashboardProps {
  grade: number;
  students: Student[];
  onMarkAttendance: (studentId: string) => void;
  onTriggerPayment: (studentId: string, name: string) => void;
}

export default function GradeDashboard({
  grade,
  students,
  onMarkAttendance,
  onTriggerPayment,
}: GradeDashboardProps) {
  const [subTab, setSubTab] = useState<"overview" | "attendance" | "quizzes" | "tutes" | "pastpapers">("overview");
  
  // Custom states for interactive modules
  const [tutesList, setTutesList] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Seed study notes (tutes) based on grade
  useEffect(() => {
    const defaultTutes: Record<number, any[]> = {
      9: [
        { name: "Grade 9 ICT - Introduction to Computers.pdf", size: "3.4 MB", date: "2026-05-12", downloads: 45 },
        { name: "Input & Output Devices Notes.pdf", size: "2.1 MB", date: "2026-05-28", downloads: 38 }
      ],
      10: [
        { name: "Grade 10 ICT - Data Representation & Numbers.pdf", size: "4.8 MB", date: "2026-06-01", downloads: 82 },
        { name: "Boolean Logic & Gate Design.pdf", size: "5.2 MB", date: "2026-06-04", downloads: 64 },
        { name: "Database Systems - SQL Queries.pdf", size: "3.1 MB", date: "2026-06-05", downloads: 27 }
      ],
      11: [
        { name: "Grade 11 ICT - Pascal Programming Complete.pdf", size: "6.7 MB", date: "2026-05-15", downloads: 108 },
        { name: "HTML & Web Design Handbook.pdf", size: "4.2 MB", date: "2026-05-24", downloads: 93 },
        { name: "Internet & Email Technologies.pdf", size: "2.8 MB", date: "2026-06-02", downloads: 55 }
      ]
    };
    setTutesList(defaultTutes[grade] || []);
    setActiveQuiz(null);
    setQuizFinished(false);
  }, [grade]);

  // Quiz questions bank
  const quizBank: Record<number, any[]> = {
    9: [
      {
        id: "q-9-1",
        title: "Hardware Components Evaluation",
        duration: "10 Mins",
        questions: [
          { q: "Which of the following is an input device?", options: ["Monitor", "Printer", "Scanner", "Plotter"], correct: 2 },
          { q: "What stands for CPU?", options: ["Computer Processing Unit", "Central Processing Unit", "Core Power Unit", "Central Peripheral Unit"], correct: 1 }
        ]
      }
    ],
    10: [
      {
        id: "q-10-1",
        title: "Number Systems Assessment",
        duration: "15 Mins",
        questions: [
          { q: "What is the binary equivalent of Decimal 10?", options: ["1010", "1100", "1001", "1111"], correct: 0 },
          { q: "Which logic gate outputs 1 only when both inputs are 1?", options: ["OR Gate", "AND Gate", "NOT Gate", "NAND Gate"], correct: 1 },
          { q: "How many bits are in a byte?", options: ["4 bits", "8 bits", "16 bits", "32 bits"], correct: 1 },
          { q: "Hexadecimal uses base:", options: ["Base 2", "Base 8", "Base 10", "Base 16"], correct: 3 },
          { q: "Which number system uses octal notations?", options: ["Base 8", "Base 10", "Base 16", "Base 2"], correct: 0 }
        ]
      }
    ],
    11: [
      {
        id: "q-11-1",
        title: "Pascal Loops & Programming Logic",
        duration: "20 Mins",
        questions: [
          { q: "Which keyword is used to declare variables in Pascal?", options: ["Var", "Begin", "Type", "Const"], correct: 0 },
          { q: "Which of the following is a post-test loop in Pascal?", options: ["While-Do", "For-Do", "Repeat-Until", "If-Then"], correct: 2 }
        ]
      }
    ]
  };

  // Helper stats
  const totalCount = students.length;
  const paidCount = students.filter(s => s.paid).length;
  const avgAttendance = totalCount > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / totalCount)
    : 0;

  // File Upload Simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadProgress(0);

    let progressVal = 0;
    const interval = setInterval(() => {
      progressVal += 10;
      setUploadProgress(progressVal);
      if (progressVal >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(null);
          setTutesList(prev => [
            {
              name: file.name.endsWith(".pdf") ? file.name : `${file.name}.pdf`,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              date: new Date().toISOString().split("T")[0],
              downloads: 0
            },
            ...prev
          ]);
        }, 500);
      }
    }, 150);
  };

  // Quiz Selection
  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setQuizIndex(0);
    setSelectedAnswers([]);
    setQuizFinished(false);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[quizIndex] = optionIdx;
    setSelectedAnswers(updated);
  };

  const submitQuizQuestion = () => {
    if (selectedAnswers[quizIndex] === undefined) return;
    
    if (quizIndex < activeQuiz.questions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      // Finished
      setQuizFinished(true);
      
      // Calculate score
      let correct = 0;
      activeQuiz.questions.forEach((q: any, i: number) => {
        if (selectedAnswers[i] === q.correct) correct++;
      });
      if (correct === activeQuiz.questions.length) {
        confetti({ particleCount: 150, spread: 80 });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sub Tabs Selection Navigation */}
      <div className="flex border-b border-glassBorder overflow-x-auto gap-2 pb-1">
        {[
          { key: "overview", label: "Overview Dashboard", icon: LayoutDashboard },
          { key: "attendance", label: "Attendance Table", icon: Users },
          { key: "quizzes", label: "Online Quizzes", icon: BrainCircuit },
          { key: "tutes", label: "Study Tutes", icon: FileText },
          { key: "pastpapers", label: "Past Papers", icon: Library },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-space text-sm transition duration-300 whitespace-nowrap ${
                isActive ? "text-cyberCyan border-cyberCyan" : "text-slate-400 border-transparent hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. OVERVIEW VIEW */}
      {subTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-space tracking-widest uppercase">Student Registry</span>
                <div className="p-2 rounded-xl bg-cyberPurple/10 border border-cyberPurple/20 text-cyberPurple"><GraduationCap className="w-4 h-4" /></div>
              </div>
              <div>
                <h4 className="font-orbitron font-extrabold text-3xl text-white">{totalCount}</h4>
                <p className="text-[11px] font-space text-slate-400 mt-1">Verified Active Students</p>
              </div>
            </div>
            
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-space tracking-widest uppercase">Average Attendance</span>
                <div className="p-2 rounded-xl bg-cyberCyan/10 border border-cyberCyan/20 text-cyberCyan"><Activity className="w-4 h-4" /></div>
              </div>
              <div>
                <h4 className="font-orbitron font-extrabold text-3xl text-white">{avgAttendance}%</h4>
                <p className="text-[11px] font-space text-slate-400 mt-1">Monthly Lecture Average</p>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-space tracking-widest uppercase">Fee Payments Status</span>
                <div className="p-2 rounded-xl bg-cyberPink/10 border border-cyberPink/20 text-cyberPink"><CreditCard className="w-4 h-4" /></div>
              </div>
              <div>
                <h4 className="font-orbitron font-extrabold text-3xl text-white">{paidCount}/{totalCount}</h4>
                <p className="text-[11px] font-space text-slate-400 mt-1">Monthly Fee Settled</p>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-space tracking-widest uppercase">Next Lecture</span>
                <div className="p-2 rounded-xl bg-cyberGreen/10 border border-cyberGreen/20 text-cyberGreen"><Calendar className="w-4 h-4" /></div>
              </div>
              <div>
                <h4 className="font-orbitron font-extrabold text-sm text-white">Sunday, 08:30 AM</h4>
                <p className="text-[11px] font-space text-slate-400 mt-1">Syllabus Topic: Programming Logic</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-glassBorder pb-3">
                <h3 className="font-orbitron text-sm tracking-widest text-slate-200">FEES & EVENTS</h3>
                <Bell className="w-4 h-4 text-cyberCyan animate-pulse" />
              </div>
              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-glassBorder">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyberPink shadow-[0_0_8px_#ec4899]"></div>
                    <div className="flex flex-col">
                      <span className="font-space font-semibold text-xs text-white">June Fees Deadline</span>
                      <span className="text-[10px] text-slate-400">Tuition deadline</span>
                    </div>
                  </div>
                  <span className="font-space text-xs text-cyberPink font-bold">June 10</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-glassBorder pb-3">
                <h3 className="font-orbitron text-sm tracking-widest text-slate-200">LIVE CLASS STATUS</h3>
              </div>
              <div className="font-space text-xs text-slate-400 py-6 text-center">
                System is fully synced with online student registries. Class attendance scanners are active.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE TABLE VIEW */}
      {subTab === "attendance" && (
        <AttendanceTable 
          students={students} 
          grade={grade} 
          onMarkAttendance={onMarkAttendance} 
          onTriggerPayment={onTriggerPayment} 
        />
      )}

      {/* 3. ONLINE QUIZZES TAB */}
      {subTab === "quizzes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col gap-4">
            <h3 className="font-orbitron text-sm tracking-widest text-slate-200 border-b border-glassBorder pb-3">AVAILABLE EXAMS</h3>
            <div className="flex flex-col gap-3">
              {(quizBank[grade] || []).map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => startQuiz(quiz)}
                  className="flex justify-between items-center p-3.5 bg-white/5 border border-glassBorder hover:border-cyberPurple/50 rounded-xl cursor-pointer transition"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-space font-semibold text-xs text-white">{quiz.title}</span>
                    <span className="text-[10px] text-slate-500 font-space">Duration: {quiz.duration} • MCQs: {quiz.questions.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col gap-6 relative overflow-hidden">
            {!activeQuiz && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
                <BrainCircuit className="w-12 h-12 text-cyberPurple animate-bounce" />
                <h4 className="font-orbitron font-extrabold text-xl text-white">ICT Evaluation Engine</h4>
                <p className="font-space text-sm text-slate-400">Select an assessment from the left panel to begin.</p>
              </div>
            )}

            {activeQuiz && !quizFinished && (
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-glassBorder pb-4">
                  <div>
                    <h4 className="font-orbitron font-extrabold text-lg text-white">{activeQuiz.title}</h4>
                    <span className="font-space text-xs text-slate-400">Question {quizIndex + 1} of {activeQuiz.questions.length}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 my-2">
                  <p className="text-base text-slate-200 font-medium font-space">
                    {activeQuiz.questions[quizIndex].q}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {activeQuiz.questions[quizIndex].options.map((opt: string, idx: number) => {
                    const isSelected = selectedAnswers[quizIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        className={`flex items-center justify-between p-4 rounded-xl text-left text-sm transition-all ${
                          isSelected ? "bg-cyberCyan/10 border border-cyberCyan/50 text-white shadow-glow-cyan" : "bg-white/5 border border-glassBorder text-slate-300 hover:border-cyberCyan/40"
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-4 border-t border-glassBorder">
                  <button
                    onClick={submitQuizQuestion}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyberPurple to-cyberCyan font-space font-semibold text-sm hover:brightness-110 shadow-glow-purple flex items-center gap-2 text-white"
                  >
                    <span>{quizIndex === activeQuiz.questions.length - 1 ? "Finish Exam" : "Submit Answer"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeQuiz && quizFinished && (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-6">
                <Trophy className="w-12 h-12 text-cyberCyan animate-bounce" />
                <h4 className="font-orbitron font-extrabold text-2xl text-white">Quiz Evaluation Completed</h4>
                <div className="flex justify-center items-center gap-6 glass-panel px-6 py-3.5 rounded-2xl border border-glassBorder">
                  <div className="flex flex-col">
                    <span className="text-2xl font-orbitron font-extrabold text-cyberCyan">
                      {Math.round((selectedAnswers.filter((ans, i) => ans === activeQuiz.questions[i].correct).length / activeQuiz.questions.length) * 100)}%
                    </span>
                    <span className="text-[10px] font-space text-slate-400 tracking-wider">EXAM SCORE</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-6 py-2.5 rounded-xl border border-glassBorder text-slate-300 font-space font-semibold text-sm transition"
                >
                  Return to Quiz List
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. STUDY TUTES TAB */}
      {subTab === "tutes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col gap-4">
            <h3 className="font-orbitron text-sm tracking-widest text-slate-200 border-b border-glassBorder pb-3">UPLOAD STUDY TUTE</h3>
            
            <div className="border-2 border-dashed border-glassBorder hover:border-cyberPurple/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition relative">
              <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <CloudUpload className="w-8 h-8 text-cyberPurple mb-3" />
              <span className="font-space text-xs font-semibold text-slate-300">Select PDF Note File</span>
            </div>

            {uploadProgress !== null && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 border border-glassBorder rounded-xl">
                <div className="flex justify-between items-center text-xs font-space">
                  <span className="truncate max-w-[150px] text-slate-300">{uploadedFileName}</span>
                  <span className="text-cyberCyan font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyberPurple to-cyberCyan h-full rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-orbitron text-sm tracking-widest text-slate-200 border-b border-glassBorder pb-3">TUTE RESOURCE FILES</h3>
            <div className="flex flex-col gap-3.5">
              {tutesList.map((tute, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white/5 border border-glassBorder hover:border-white/10 rounded-xl gap-3 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-space font-semibold text-xs text-white max-w-[280px] sm:max-w-[350px] truncate">{tute.name}</span>
                      <span className="text-[10px] text-slate-500 font-space">File size: {tute.size} • Published: {tute.date}</span>
                    </div>
                  </div>
                  <button className="flex items-center justify-center gap-1.5 px-4 py-2 border border-glassBorder hover:border-slate-400 rounded-lg text-xs font-semibold font-space text-slate-300 hover:text-white transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PAST PAPERS TAB */}
      {subTab === "pastpapers" && (
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-glassBorder pb-3.5 mb-5">
            <div>
              <h3 class="font-orbitron text-sm tracking-widest text-slate-200">G.C.E. O/L PAST PAPERS LIBRARY</h3>
              <p className="font-space text-xs text-slate-400 mt-0.5 font-normal">Syllabus past paper documents (2020 - 2025).</p>
            </div>
            <Library className="w-5 h-5 text-cyberPurple" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
              <div key={year} className="flex items-center justify-between p-4 bg-white/5 border border-glassBorder hover:border-cyberCyan/40 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyberCyan/10 border border-cyberCyan/20 text-cyberCyan">
                    <Library className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-space font-semibold text-xs text-white">G.C.E. O/L Past Paper - {year}</span>
                    <span className="text-[9px] text-slate-500 font-space uppercase">ICT Theory & MCQ</span>
                  </div>
                </div>
                <button className="px-3.5 py-1.5 border border-glassBorder hover:border-slate-400 rounded-lg text-xs font-semibold font-space text-slate-300 transition">
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
