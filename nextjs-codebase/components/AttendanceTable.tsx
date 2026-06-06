"use client";

import React, { useState } from "react";
import { Search, FileSpreadsheet } from "lucide-react";

interface Student {
  id: string;
  name: string;
  details: string;
  phone: string;
  paid: boolean;
  attendance: number;
  attendedToday: boolean;
}

interface AttendanceTableProps {
  students: Student[];
  grade: number;
  onMarkAttendance: (studentId: string) => void;
  onTriggerPayment: (studentId: string, name: string) => void;
}

export default function AttendanceTable({
  students,
  grade,
  onMarkAttendance,
  onTriggerPayment,
}: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    if (students.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student ID,Student Name,Details,Contact No,Fee Paid Status,Attendance Rate,Attended Today\n";

    students.forEach(s => {
      const row = [
        s.id,
        `"${s.name}"`,
        `"${s.details}"`,
        s.phone,
        s.paid ? "Paid" : "Unpaid",
        `${s.attendance}%`,
        s.attendedToday ? "Present" : "Absent"
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Grade_${grade}_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filters and CSV Tool bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-xl">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/35 border border-glassBorder text-sm text-slate-200 focus:outline-none focus:border-cyberCyan transition"
            />
          </div>
          {/* Date Selector */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-black/35 border border-glassBorder text-sm text-slate-200 focus:outline-none focus:border-cyberCyan transition"
          />
        </div>
        
        {/* CSV trigger */}
        <button
          onClick={exportCSV}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyberCyan/10 border border-cyberCyan/35 text-cyberCyan font-space text-xs font-semibold hover:bg-cyberCyan/20 transition-all shadow-glow-cyan"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Attendance (CSV)</span>
        </button>
      </div>

      {/* Grid Container */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-glassBorder">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-glassBorder text-slate-400 font-space font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6 border-r border-glassBorder/50">Student ID</th>
                <th className="py-4 px-6 border-r border-glassBorder/50">Student Name</th>
                <th className="py-4 px-6 border-r border-glassBorder/50">Class Status Details</th>
                <th className="py-4 px-6 border-r border-glassBorder/50">Contact (WhatsApp)</th>
                <th className="py-4 px-6 border-r border-glassBorder/50 text-center">Fee Status</th>
                <th className="py-4 px-6 border-r border-glassBorder/50 text-center">Month Attendance</th>
                <th className="py-4 px-6 text-center">Daily Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glassBorder/40 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 font-space">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition border-b border-glassBorder/40">
                    <td className="py-4 px-6 font-mono text-xs font-semibold border-r border-glassBorder/20 text-slate-300">
                      {student.id}
                    </td>
                    <td className="py-4 px-6 font-semibold border-r border-glassBorder/20 text-white">
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 border-r border-glassBorder/20 max-w-[150px] truncate">
                      {student.details}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs border-r border-glassBorder/20 text-slate-400">
                      {student.phone}
                    </td>
                    <td className="py-4 px-6 border-r border-glassBorder/20 text-center">
                      {student.paid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-xs text-emerald-400 font-semibold font-space">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => onTriggerPayment(student.id, student.name)}
                          className="px-3 py-1.5 rounded-lg border border-cyberPink/50 hover:bg-cyberPink/20 text-xs text-cyberPink font-semibold font-space shadow-glow-pink transition"
                        >
                          Pay Tuition
                        </button>
                      )}
                    </td>
                    <td className={`py-4 px-6 border-r border-glassBorder/20 text-center font-mono font-bold ${
                      student.attendance >= 85 ? "text-emerald-400" : student.attendance >= 75 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {student.attendance}%
                    </td>
                    <td className="py-4 px-6 text-center">
                      {student.attendedToday ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyberPurple/10 border border-cyberPurple/35 text-xs text-cyberPurple font-semibold font-space">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyberPurple"></span>
                          Attended
                        </span>
                      ) : (
                        <button
                          onClick={() => onMarkAttendance(student.id)}
                          className="px-3 py-1.5 rounded-lg border border-glassBorder hover:border-slate-400 text-xs text-slate-300 font-semibold font-space transition"
                        >
                          Mark Present
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
