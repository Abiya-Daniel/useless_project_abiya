import React from 'react';
import { Gamepad2, Sparkles, Trophy, Play, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ArcadeHub({
  onOpenLudo,
  onOpenChess,
  onOpenShadowShift,
  onOpenRacing,
  onOpenSnake,
  onOpenFlappy,
  onOpenTicTacToe,
  onOpenMemoryMatch
}) {
  const games = [
    {
      id: 'ludo',
      name: 'LUDO MATCH',
      desc: 'Classic 4-Player Ludo with Kerala roll dice & bot AI.',
      emoji: '🎲',
      badge: 'TOP POPULAR',
      color: 'from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/40 text-amber-300',
      btnColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30',
      action: onOpenLudo
    },
    {
      id: 'chess',
      name: 'CHESS MASTER',
      desc: 'Strategic Chess vs Minimax Bot AI with 3 difficulty levels.',
      emoji: '♟️',
      badge: 'BRAIN BOOSTER',
      color: 'from-purple-500/20 via-indigo-500/20 to-blue-500/20 border-purple-500/40 text-purple-300',
      btnColor: 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30',
      action: onOpenChess
    },
    {
      id: 'shadowshift',
      name: 'SHADOW SHIFT',
      desc: 'Dual-world runner avoiding light & dark obstacles simultaneously.',
      emoji: '🏃💨',
      badge: 'REFLEX TEST',
      color: 'from-rose-500/20 via-pink-500/20 to-purple-500/20 border-rose-500/40 text-rose-300',
      btnColor: 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30',
      action: onOpenShadowShift
    },
    {
      id: 'racing',
      name: 'HIGHWAY RIDER',
      emoji: '🏎️',
      desc: 'Kerala 2D highway speedway car racing with traffic dodging.',
      badge: 'ACTION PACKED',
      color: 'from-emerald-500/20 via-teal-500/20 to-green-500/20 border-emerald-500/40 text-emerald-300',
      btnColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30',
      action: onOpenRacing
    },
    {
      id: 'snake',
      name: 'CANTEEN SNAKE',
      desc: 'Retro 2D snake collecting Samosa, Chai & Canteen Coins.',
      emoji: '🐍',
      badge: 'CANTEEN SPECIAL',
      color: 'from-teal-500/20 via-emerald-500/20 to-cyan-500/20 border-teal-500/40 text-teal-300',
      btnColor: 'bg-teal-500/20 border-teal-500/40 text-teal-300 hover:bg-teal-500/30',
      action: onOpenSnake
    },
    {
      id: 'flappy',
      name: 'FLAPPY BTECH',
      desc: 'Tap-to-fly semester obstacle runner through engineering pillars.',
      emoji: '🐥',
      badge: 'HIGH SCORE',
      color: 'from-sky-500/20 via-blue-500/20 to-indigo-500/20 border-sky-500/40 text-sky-300',
      btnColor: 'bg-sky-500/20 border-sky-500/40 text-sky-300 hover:bg-sky-500/30',
      action: onOpenFlappy
    },
    {
      id: 'tictactoe',
      name: 'TIC-TAC-TOE PRO',
      desc: 'X vs O single player vs AI Professor or 2 player mode.',
      emoji: '❌⭕',
      badge: 'NEW 🌟',
      color: 'from-amber-500/20 via-rose-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
      btnColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30',
      action: onOpenTicTacToe
    },
    {
      id: 'memory',
      name: 'MEMORY MATCH',
      desc: 'Campus card flip match challenge with 8 Kerala college items.',
      emoji: '🎴',
      badge: 'NEW 🌟',
      color: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500/40 text-indigo-300',
      btnColor: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30',
      action: onOpenMemoryMatch
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#0D1117] bg-theme-card border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>KERALA COLLEGE ARCADE HUB • 8 GAMES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight font-mono">
            🎮 HIGH ATTENDANCE GAMING LOUNGE
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-malayalam mt-1 max-w-2xl leading-relaxed">
            Good students (&ge;85% Attendance) stay home and enjoy these 8 custom Kerala college games!
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-[#161B22] p-3 rounded-2xl border border-slate-800 shrink-0 font-mono text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Attendance Reward System</div>
            <div className="font-bold text-emerald-300">100% UNLOCKED FOR SAFE STUDENTS</div>
          </div>
        </div>
      </div>

      {/* 8 Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {games.map((g) => (
          <div
            key={g.id}
            className={`bg-[#0D1117] bg-theme-card border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all hover:scale-[1.02] group relative overflow-hidden`}
          >
            {/* Top background accent gradient */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${g.color}`} />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-4xl p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 group-hover:scale-110 transition-transform">
                  {g.emoji}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {g.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black font-mono text-slate-100 group-hover:text-amber-300 transition-colors">
                  {g.name}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                  {g.desc}
                </p>
              </div>
            </div>

            <button
              onClick={g.action}
              className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md ${g.btnColor}`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>LAUNCH GAME</span>
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
