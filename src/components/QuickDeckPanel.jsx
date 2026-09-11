import React from 'react';
import { Play, Cpu, Radio, ShieldAlert, Sparkles, Volume2, CheckCircle2, Gamepad2, ArrowRight } from 'lucide-react';

export default function QuickDeckPanel({
  students,
  selectedStudent,
  onScanStudent,
  isOpen,
  isAnalyzing,
  onOpenLudo,
  onOpenChess,
  onOpenShadowShift,
  onOpenRacing,
  onOpenSnake,
  onOpenFlappy,
  onOpenTicTacToe,
  onOpenMemoryMatch
}) {
  const gamesList = [
    {
      id: 'ludo',
      name: 'LUDO MATCH',
      emoji: '🎲',
      tag: 'CLASSIC 4-PLAYER',
      badge: 'POPULAR',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
      action: onOpenLudo,
    },
    {
      id: 'chess',
      name: 'CHESS MASTER',
      emoji: '♟️',
      tag: 'STRATEGY AI',
      badge: 'BRAIN BOOSTER',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
      action: onOpenChess,
    },
    {
      id: 'shadowshift',
      name: 'SHADOW SHIFT',
      emoji: '🏃💨',
      tag: 'DUAL RUNNER',
      badge: 'REFLEX',
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/40 text-rose-300',
      action: onOpenShadowShift,
    },
    {
      id: 'racing',
      name: 'HIGHWAY RIDER',
      emoji: '🏎️',
      tag: '2D SPEEDWAY',
      badge: 'ACTION',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
      action: onOpenRacing,
    },
    {
      id: 'snake',
      name: 'CANTEEN SNAKE',
      emoji: '🐍',
      tag: 'SAMOSA & CHAI',
      badge: 'RETRO 2D',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-300',
      action: onOpenSnake,
    },
    {
      id: 'flappy',
      name: 'FLAPPY BTECH',
      emoji: '🐥',
      tag: 'TAP TO FLY',
      badge: 'CHALLENGE',
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-300',
      action: onOpenFlappy,
    },
    {
      id: 'tictactoe',
      name: 'TIC-TAC-TOE PRO',
      emoji: '❌⭕',
      tag: 'X vs O VS AI',
      badge: 'NEW 🌟',
      color: 'from-amber-500/20 to-rose-500/20 border-amber-500/40 text-amber-300',
      action: onOpenTicTacToe,
    },
    {
      id: 'memory',
      name: 'MEMORY MATCH',
      emoji: '🎴',
      tag: 'FLIP CAMPUS CARDS',
      badge: 'NEW 🌟',
      color: 'from-indigo-500/20 to-pink-500/20 border-indigo-500/40 text-indigo-300',
      action: onOpenMemoryMatch,
    },
  ];

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

      {/* 2. College Arcade Games Hub (Replacing Teacher Switcher) */}
      <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              🎮 COLLEGE ARCADE HUB • GOOD STUDENT REWARDS (8 GAMES)
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            &ge;85% ATTENDANCE UNLOCKED
          </span>
        </div>

        {/* 8-Game Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {gamesList.map((g) => (
            <button
              key={g.id}
              onClick={g.action}
              className={`p-3 rounded-2xl bg-gradient-to-br ${g.color} border transition-all text-left flex flex-col justify-between gap-2 hover:scale-[1.02] shadow-md group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">{g.emoji}</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                  {g.badge}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-extrabold font-mono tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors">
                  {g.name}
                </h4>
                <p className="text-[9px] font-mono opacity-80 mt-0.5">{g.tag}</p>
              </div>
            </button>
          ))}
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
