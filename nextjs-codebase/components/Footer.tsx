import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-glassBorder bg-black/80 py-8 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col gap-1">
          <p className="font-orbitron font-extrabold text-sm tracking-wider bg-gradient-to-r from-cyberPurple to-cyberCyan bg-clip-text text-transparent">
            ICT SENSIP
          </p>
          {/* STRICT BRANDING TEXT 1 */}
          <p className="font-space text-xs text-slate-400 tracking-wide">
            ICT Sensip - Sir Hasith Illangasinghe
          </p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-1">
          <p className="font-space text-[10px] text-slate-500 uppercase tracking-widest">
            © 2026 ICT Sensip. All rights reserved.
          </p>
          {/* STRICT BRANDING TEXT 2 */}
          <p className="font-space text-xs text-slate-400">
            Made and maintained by JV Creations
          </p>
        </div>
      </div>
    </footer>
  );
}
