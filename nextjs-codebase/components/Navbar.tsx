"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, GraduationCap, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour12: true }));
      setDateString(now.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-10 w-full border-b border-glassBorder bg-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Branding Logo Holder Space */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyberPurple to-cyberCyan flex items-center justify-center p-[2px] shadow-glow-purple">
            <div className="w-full h-full bg-darkBg rounded-[10px] flex items-center justify-center">
              <span className="font-orbitron font-extrabold text-lg bg-gradient-to-r from-cyberPurple to-cyberCyan bg-clip-text text-transparent">S</span>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyberPurple to-cyberCyan rounded-xl blur opacity-30 group-hover:opacity-85 transition duration-300"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-orbitron font-extrabold text-xl tracking-wider text-white">ICT SENSIP</h1>
            <p className="font-space text-xs text-slate-400 tracking-widest">ADVANCED LEARNING</p>
          </div>
        </Link>

        {/* Dynamic Navigation Links connecting both websites */}
        <nav className="hidden md:flex relative space-x-1 bg-black/40 p-1 rounded-full border border-glassBorder">
          <Link 
            href="/student" 
            className={`px-5 py-2 rounded-full font-space font-medium text-xs tracking-wide transition duration-300 ${
              pathname === "/student" ? "bg-cyberPurple/20 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Student Portal
          </Link>
          <Link 
            href="/" 
            className={`px-5 py-2 rounded-full font-space font-medium text-xs tracking-wide transition duration-300 ${
              pathname === "/" ? "bg-cyberPurple/20 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Class Workspace
          </Link>
        </nav>

        {/* Date & Time displays and Admin button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right font-space">
            <span className="text-sm text-slate-200 font-semibold tracking-wider">{timeString}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{dateString}</span>
          </div>

          <Link 
            href="/admin" 
            className={`relative group px-4 py-2.5 rounded-xl border font-space font-semibold tracking-wide text-xs transition-all duration-300 shadow-glow-cyan flex items-center gap-1.5 ${
              pathname === "/admin" 
                ? "border-cyberCyan bg-cyberCyan/20 text-white" 
                : "border-cyberCyan/50 bg-cyberCyan/5 text-cyberCyan hover:bg-cyberCyan/20"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Control</span>
          </Link>
        </div>

      </div>

      {/* Mobile navigation links */}
      <div className="flex md:hidden border-t border-glassBorder justify-around py-2 bg-black/40 text-[10px] font-space">
        <Link href="/student" className={`px-4 py-1.5 rounded-full ${pathname === "/student" ? "bg-cyberPurple/25 text-white" : "text-slate-400"}`}>
          Student Portal
        </Link>
        <Link href="/" className={`px-4 py-1.5 rounded-full ${pathname === "/" ? "bg-cyberPurple/25 text-white" : "text-slate-400"}`}>
          Class Register
        </Link>
      </div>
    </header>
  );
}
