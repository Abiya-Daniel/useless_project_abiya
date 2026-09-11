import React from 'react';
import { Play, Cpu, Radio, ShieldAlert, Sparkles, Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function QuickDeckPanel({
  students,
  selectedStudent,
  onScanStudent,
  activePersonality,
  setActivePersonality,
  personalities,
  isOpen,
  isAnalyzing
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Quick Student RFID Scan Cards Deck */}
      <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              🎛️ QUICK RFID CARD TAP SCANNER (SELECT STUDENT)
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            1-TAP EVALUATION
          </span>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {students.map((student) => {
            const isSelected = selectedStudent?.id === student.id;
            const isGood = student.attendance >= 85;
            const isLow = student.attendance < 50;

            return (
              <div
                key={student.id}
                onClick={() => onScanStudent(student)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'bg-[#0D1117] bg-theme-card border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {/* Selection indicator line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400" />
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 group-hover:scale-110 transition-transform">
                      {student.avatar}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 font-sans group-hover:text-amber-300 transition-colors">
                        {student.name}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">
                        {student.rollNo}
                      </p>
                    </div>
                  </div>

                  {/* Attendance badge */}
                  <div className="text-right">
                    <span className={`text-xs font-extrabold font-mono ${
                      isGood ? 'text-emerald-400' : isLow ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {student.attendance}%
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block">ATTENDANCE</span>
                  </div>
                </div>

                {/* Inverse Rule Verdict Tag & Tap Action */}
                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80">
                  <span className={`px-2 py-0.5 rounded-md font-semibold border ${
                    isGood
                      ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {isGood ? '🔒 STAY HOME' : '🟢 ENTER CLASS'}
                  </span>

                  <button
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-amber-500/20 group-hover:text-amber-300 group-hover:border-amber-500/40 border border-slate-700'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isSelected && isAnalyzing ? 'SCANNING...' : 'SCAN RFID'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Teacher Personality Switcher Bar */}
      <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">{activePersonality.emoji}</span>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              🧑‍🏫 QUICK TEACHER PERSONALITY SELECTOR
            </h3>
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            ACTIVE: {activePersonality.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {personalities.map((p) => {
            const isActive = activePersonality.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersonality(p)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-[#0D1117] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[11px] font-bold truncate max-w-full font-sans">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ESP32 Hardware Diagnostics & Servo Telemetry Panel */}
      <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              📟 ESP32 HARDWARE HARD-LOCK DIAGNOSTICS
            </h3>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            NODE ONLINE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#0D1117] p-3 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Servo Motor Angle</div>
            <div className="text-sm font-bold text-amber-300">
              {isOpen ? '0x90° (UNLOCKED)' : '0x00° (LOCKED)'}
            </div>
            <div className="text-[9px] text-slate-400">SG90 Servo • Pin 18</div>
          </div>

          <div className="bg-[#0D1117] p-3 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Ultrasonic Distance</div>
            <div className="text-sm font-bold text-emerald-400">
              18.4 cm
            </div>
            <div className="text-[9px] text-slate-400">HC-SR04 • Trigger &lt; 50cm</div>
          </div>

          <div className="bg-[#0D1117] p-3 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">RFID Reader Frequency</div>
            <div className="text-sm font-bold text-rose-400">
              13.56 MHz
            </div>
            <div className="text-[9px] text-slate-400">MFRC522 SPI Node</div>
          </div>

          <div className="bg-[#0D1117] p-3 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">TTS Voice Core</div>
            <div className="text-sm font-bold text-sky-400">
              MALAYALAM v2.0
            </div>
            <div className="text-[9px] text-slate-400">Audio Synth Ready</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs font-mono text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] font-malayalam">
              "അറ്റൻഡൻസ് 85%-ൽ കൂടുതൽ ഉള്ളവർക്ക് വീട്ടിൽ പോയി ഗെയിം കളിക്കാം. 75%-ൽ കുറവുള്ളവർ ക്ലാസ്സിൽ കയറണം!"
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold shrink-0">RULE ACTIVE</span>
        </div>

      </div>

    </div>
  );
}
