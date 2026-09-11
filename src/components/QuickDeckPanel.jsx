import React from 'react';
import { Play, Radio, Sparkles } from 'lucide-react';

export default function QuickDeckPanel({
  students,
  selectedStudent,
  onScanStudent,
  isAnalyzing
}) {
  return (
    <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            🎛️ QUICK RFID CARD TAP SCANNER (SELECT STUDENT)
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
          1-TAP EVALUATION
        </span>
      </div>

      {/* Compact Student Cards Grid */}
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
              {/* Selection indicator bar */}
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

                {/* Attendance Score */}
                <div className="text-right">
                  <span className={`text-xs font-extrabold font-mono ${
                    isGood ? 'text-emerald-400' : isLow ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {student.attendance}%
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">ATTENDANCE</span>
                </div>
              </div>

              {/* Inverse Rule Verdict Badge & Tap Action */}
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
  );
}
