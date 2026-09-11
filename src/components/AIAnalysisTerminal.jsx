import React, { useEffect, useState } from 'react';
import { Terminal, Check, Loader2, Sparkles, Cpu } from 'lucide-react';

const ANALYSIS_STEPS = [
  "Attendance nokkunnu........",
  "Late entry nokkunnu.........",
  "Previous class nokkunnu.....",
  "Student behavior............",
  "Door mood...................",
  "Random Malayalam logic......",
  "Teacher mood................",
];

export default function AIAnalysisTerminal({ isAnalyzing, student, onComplete }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCompletedSteps([]);
      setCurrentStepIndex(0);
      return;
    }

    setCompletedSteps([]);
    setCurrentStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      if (step < ANALYSIS_STEPS.length) {
        setCompletedSteps(prev => [...prev, ANALYSIS_STEPS[step]]);
        step++;
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 400);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing && completedSteps.length === 0) {
    return (
      <div className="bg-[#0D1117] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col items-center justify-center min-h-[220px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 animate-pulse">
          <Terminal className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-mono font-bold text-slate-300 text-theme-title uppercase tracking-wider">
          🤖 FAKE AI DIAGNOSTIC ENGINE
        </h4>
        <p className="text-xs text-slate-400 text-theme-muted font-mono mt-1 max-w-sm">
          Select or scan any student card to trigger Malayalam inverse logic evaluation...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] bg-theme-card border border-amber-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden font-mono">
      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-amber-400 font-bold ml-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            AI_ANALYSIS_TERMINAL.SH
          </span>
        </div>
        <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
          {student ? `Target: ${student.name} (${student.attendance}%)` : 'Scanning...'}
        </span>
      </div>

      {/* Interactive Step-by-Step Terminal Feed */}
      <div className="space-y-2 text-xs text-slate-300">
        <div className="text-amber-400 font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          🤖 AI ANALYSIS STARTED...
        </div>

        {completedSteps.map((stepText, idx) => (
          <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-800/40 animate-fade-in">
            <span className="text-slate-300">{stepText}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> ✓
            </span>
          </div>
        ))}

        {currentStepIndex < ANALYSIS_STEPS.length && isAnalyzing && (
          <div className="flex items-center gap-2 text-amber-300 py-1 font-bold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Processing Malayalam logic algorithms...</span>
          </div>
        )}

        {currentStepIndex >= ANALYSIS_STEPS.length && (
          <div className="pt-2 text-emerald-400 font-extrabold flex items-center gap-2">
            <span>Final decision:</span>
            <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
              EVALUATION COMPLETE ✓
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
