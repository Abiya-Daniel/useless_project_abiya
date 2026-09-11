import React from 'react';
import { Play, Radio, Gamepad2, Sparkles, ChevronRight } from 'lucide-react';

export default function QuickDeckPanel({
  students,
  selectedStudent,
  onScanStudent,
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
  const arcadeGames = [
    {
      id: 'ludo',
      name: 'LUDO MATCH',
      emoji: '🎲',
      tag: 'Classic 4-Player',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
      action: onOpenLudo
    },
    {
      id: 'chess',
      name: 'CHESS MASTER',
      emoji: '♟️',
      tag: 'Strategy AI',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
      action: onOpenChess
    },
    {
      id: 'shadowshift',
      name: 'SHADOW SHIFT',
      emoji: '🏃💨',
      tag: 'Dual Runner',
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/40 text-rose-300',
      action: onOpenShadowShift
    },
    {
      id: 'racing',
      name: 'HIGHWAY RIDER',
      emoji: '🏎️',
      tag: 'Speed Car Race',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
      action: onOpenRacing
    },
    {
      id: 'snake',
      name: 'CANTEEN SNAKE',
      emoji: '🐍',
      tag: 'Samosa & Chai',
      color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-300',
      action: onOpenSnake
    },
    {
      id: 'flappy',
      name: 'FLAPPY BTECH',
      emoji: '🐥',
      tag: 'Tap to Fly',
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-300',
      action: onOpenFlappy
    },
    {
      id: 'tictactoe',
      name: 'TIC-TAC-TOE PRO',
      emoji: '❌⭕',
      tag: 'X vs O vs AI',
      color: 'from-orange-500/20 to-rose-500/20 border-orange-500/40 text-orange-300',
      action: onOpenTicTacToe
    },
    {
      id: 'memory',
      name: 'MEMORY MATCH',
      emoji: '🎴',
      tag: 'Flip Campus Cards',
      color: 'from-indigo-500/20 to-pink-500/20 border-indigo-500/40 text-indigo-300',
      action: onOpenMemoryMatch
    }
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

      {/* 2. College Arcade Games Hub (Integrated directly in Door Simulator) */}
      <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              🎮 COLLEGE ARCADE HUB • GOOD STUDENT REWARDS (8 GAMES)
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            🔒 &ge;85% STAY HOME
          </span>
        </div>

        {/* 8 Game Launcher Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {arcadeGames.map((game) => (
            <button
              key={game.id}
              onClick={game.action}
              className={`p-3 rounded-2xl bg-gradient-to-br ${game.color} border transition-all text-left flex flex-col justify-between gap-1.5 hover:scale-[1.03] shadow-md group cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">{game.emoji}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold font-mono tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                  {game.name}
                </h4>
                <p className="text-[9px] font-mono opacity-75 truncate">{game.tag}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
