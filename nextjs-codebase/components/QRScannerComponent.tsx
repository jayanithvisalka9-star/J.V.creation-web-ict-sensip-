"use client";

import React, { useEffect, useState } from "react";
import { Camera, RefreshCw } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  studentsList: { id: string; name: string }[];
}

export default function QRScannerComponent({ onScanSuccess, studentsList }: QRScannerProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [scanError, setScanError] = useState("");
  const [selectedMockStudent, setSelectedMockStudent] = useState("");

  const startScanner = async () => {
    setScanError("");
    try {
      setScannerActive(true);
      
      // Delays instantiation slightly to ensure DOM element exists
      setTimeout(() => {
        const html5QrCode = new Html5Qrcode("qr-reader-target");
        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            // Stop scanner after success to avoid multiple rapid scans
            html5QrCode.stop().then(() => setScannerActive(false));
          },
          (errorMessage) => {
            // Silence common scanning noise logs
          }
        ).catch((err) => {
          setScanError("Camera access denied or busy. Please use simulated scanner.");
          setScannerActive(false);
        });
      }, 300);

    } catch (err) {
      setScanError("Failed to initialize scanner. Check device permissions.");
      setScannerActive(false);
    }
  };

  const handleMockScan = () => {
    if (!selectedMockStudent) return;
    onScanSuccess(selectedMockStudent);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-48 rounded-2xl bg-black border border-glassBorder overflow-hidden flex flex-col items-center justify-center gap-2">
        {scannerActive ? (
          <div id="qr-reader-target" className="w-full h-full"></div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/80 gap-2">
            <Camera className="w-8 h-8 text-cyberPurple animate-pulse" />
            <span className="font-space text-xs text-slate-300 font-semibold">Camera Scanner Offline</span>
            <button
              type="button"
              onClick={startScanner}
              className="mt-1 px-4 py-1.5 bg-cyberPurple/20 hover:bg-cyberPurple/40 border border-cyberPurple/50 text-cyberPurple text-xs rounded-lg transition"
            >
              Start Camera Feed
            </button>
            {scanError && <p className="text-[10px] text-rose-400 mt-1">{scanError}</p>}
          </div>
        )}
        
        {scannerActive && (
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => {
                const target = document.getElementById("qr-reader-target");
                if (target) {
                  // Simply toggle off state
                  setScannerActive(false);
                }
              }}
              className="px-2 py-1 bg-black/60 hover:bg-black text-[10px] rounded text-slate-300"
            >
              Cancel Scan
            </button>
          </div>
        )}
      </div>

      {/* Manual Dropdown Tester (Simulation fallback) */}
      <div className="flex flex-col gap-2 p-3 bg-white/5 border border-glassBorder rounded-xl">
        <label className="font-space text-[10px] text-slate-400 tracking-wider">
          SIMULATOR TESTING: CHOOSE STUDENT CARD TO SCAN
        </label>
        <div className="flex gap-2">
          <select
            value={selectedMockStudent}
            onChange={(e) => setSelectedMockStudent(e.target.value)}
            className="flex-grow px-3 py-1.5 rounded-lg bg-black/40 border border-glassBorder text-xs text-slate-100 focus:outline-none"
          >
            <option value="">Choose student card...</option>
            {studentsList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleMockScan}
            className="px-4 py-1.5 bg-cyberPurple text-white font-space font-bold text-xs rounded-lg hover:brightness-110 shadow-glow-purple transition flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mark Attend</span>
          </button>
        </div>
      </div>
    </div>
  );
}
