import React from 'react';
import { PERSONALITIES } from '../data/personalities';
import { Volume2, CheckCircle2, Sparkles, Settings } from 'lucide-react';
import { speakText } from '../utils/AudioEngine';

export default function PersonalitySelector({ activePersonality, setActivePersonality, soundEnabled }) {
  
  const handleTestVoice = (personality) => {
    if (!soundEnabled) return;
    speakText(personality.tagline, {
      pitch: personality.pitch,
      rate: personality.rate,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D1117] bg-theme-card border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-extrabold text-slate-100 text-theme-title uppercase tracking-tight">
                🧑‍🏫 DOOR PERSONALITY ("TEACHER MODE")
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-malayalam mt-1">
              Select the attitude of the Smart Door when evaluating students at the classroom entrance.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-2xl">{activePersonality.emoji}</span>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE PERSONALITY:</div>
              <div className="text-xs font-bold text-amber-300">{activePersonality.name}</div>
            </div>
          </div>
        </div>

        {/* Personality Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {PERSONALITIES.map((p) => {
            const isActive = activePersonality.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActivePersonality(p)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all relative flex flex-col justify-between group ${
                  isActive
                    ? `bg-slate-900 ${p.borderColor} shadow-xl shadow-amber-500/5 ring-2 ring-amber-500/40`
                    : 'bg-[#161B22] border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 text-amber-400">
                    <CheckCircle2 className="w-5 h-5 fill-amber-400/20" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 group-hover:scale-110 transition-transform">
                      {p.emoji}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-100 font-sans">
                        {p.name}
                      </h3>
                      <p className="text-[11px] font-malayalam text-amber-400 font-semibold">
                        {p.malayalamName}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <p className="text-xs italic font-malayalam text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    {p.tagline}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestVoice(p);
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-amber-500/20 hover:border-amber-500/40 text-[11px] font-mono font-bold text-slate-300 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>TEST VOICE SAMPLE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
