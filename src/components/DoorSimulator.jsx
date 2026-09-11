import React from 'react';
import { Lock, Unlock, Volume2, ShieldAlert, Cpu, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export default function DoorSimulator({ isOpen, isAnalyzing, student, verdict, isSpeaking, activePersonality }) {
  const servoAngle = isOpen ? 90 : 0;

  return (
    <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
      
      {/* Top Status LED Panel */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-300">
            DOOR HARDWARE STATUS:
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold uppercase border ${
            isOpen 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10'
          }`}>
            {isOpen ? '🟢 OPEN (0x90°)' : '🔒 CLOSED (0x00°)'}
          </span>
        </div>

        {/* Servo Motor Angle Badge */}
        <div className="flex items-center gap-2 bg-[#0D1117] px-3 py-1 rounded-xl border border-slate-800 font-mono text-xs">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">SERVO:</span>
          <span className="font-bold text-amber-300">{servoAngle}°</span>
        </div>
      </div>

      {/* Speaker soundwave visualizer overlay during speech */}
      {isSpeaking && (
        <div className="absolute top-16 right-6 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce shadow-lg z-20">
          <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-amber-300">SPEAKING...</span>
          <div className="flex items-end gap-0.5 h-3">
            <div className="w-1 bg-amber-400 h-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 bg-amber-400 h-2/3 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1 bg-amber-400 h-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}

      {/* 3D Door Simulation Container */}
      <div className="relative w-full h-64 my-2 flex items-center justify-center perspective-1000">
        
        {/* Classroom Interior Preview (Behind Door) */}
        <div className="absolute inset-y-0 w-64 bg-slate-900 rounded-2xl border-4 border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
          {/* Blackboard */}
          <div className="w-full h-20 bg-emerald-950/80 border border-emerald-700/50 rounded-lg p-2 font-mono text-[10px] text-emerald-300 flex flex-col justify-between shadow-inner">
            <div className="flex justify-between border-b border-emerald-800 pb-1">
              <span>CS304: ADVANCED AI</span>
              <span>ATTENDANCE &lt; 75% ONLY</span>
            </div>
            <p className="text-center font-bold text-amber-300 text-xs italic">
              "Padichavur veettil pokko!"
            </p>
          </div>

          {/* Classroom Benches & Students */}
          <div className="flex justify-around items-end text-2xl pb-2">
            <span title="Student with 42% attendance">🪑 🧢</span>
            <span title="Student with 31% attendance">🪑 🛵</span>
            <span title="Empty bench for high attendance guys">🪑 ❌</span>
          </div>

          <div className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            KERALA COLLEGE CLASSROOM #304
          </div>
        </div>

        {/* Physical Swinging Door */}
        <div 
          className={`relative w-64 h-full bg-gradient-to-b from-[#1C2128] via-[#22272E] to-[#161B22] border-4 border-slate-700 rounded-2xl shadow-2xl transition-all duration-700 ease-in-out transform origin-left flex flex-col justify-between p-4 z-10 ${
            isOpen ? 'rotate-y-open translate-x-[-15px] opacity-90' : 'rotate-y-0 shadow-rose-900/20'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Door Header Badge */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">🚪 LAB 304</span>
            </div>
            {/* Door Lock Indicator Light */}
            <div className={`w-3 h-3 rounded-full border-2 border-slate-800 ${
              isOpen ? 'bg-emerald-500 shadow-lg shadow-emerald-500' : 'bg-rose-500 shadow-lg shadow-rose-500'
            }`} />
          </div>

          {/* Stencil Sign on Door */}
          <div className="my-auto text-center p-3 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/50">
            <p className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              SMART DOOR VERDICT:
            </p>
            <h3 className={`text-base font-extrabold font-mono mt-1 ${
              isOpen ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isAnalyzing 
                ? 'ANALYZING...' 
                : isOpen 
                ? '🟢 ENTRY APPROVED' 
                : '🚫 ENTRY NOT REQUIRED'}
            </h3>
            <p className="text-[11px] font-malayalam text-slate-300 mt-1">
              {isOpen ? '"Akathottu kerikko mone!"' : '"Nee classil keranda mone!"'}
            </p>
          </div>

          {/* Handle & Lock Cylinder */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-md border border-amber-300" />
              <div className="w-2.5 h-2.5 bg-amber-600 rounded-full border border-amber-400" />
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              {isOpen ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isOpen ? 'UNLOCKED' : 'LOCKED'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Personality & Verdict Summary Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{activePersonality.emoji}</span>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Active Door Personality:</div>
            <div className="text-xs font-bold text-amber-300">{activePersonality.name}</div>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <div className="text-slate-400">REVERSE ATTENDANCE LOGIC:</div>
          <div className="font-bold text-slate-200">
            &ge;85% &rarr; <span className="text-rose-400">STAY HOME</span> | &lt;75% &rarr; <span className="text-emerald-400">FORCE ENTRY</span>
          </div>
        </div>
      </div>

    </div>
  );
}
