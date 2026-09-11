import React, { useRef } from 'react';
import { Volume2, Download, Share2, AlertTriangle, CheckCircle, XCircle, Sparkles, RefreshCw, Gamepad2, QrCode, Play } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

export default function VerdictCard({ 
  student, 
  verdict, 
  isOpen, 
  activePersonality, 
  onReplayAudio, 
  onRescan, 
  onOpenLudo
}) {
  const cardRef = useRef(null);

  if (!student || !verdict) return null;

  const isOverload = student.attendance === 100;
  const isHighAttendance = student.attendance >= 75;

  const handleDownloadPass = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0D1117',
        scale: 2,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Classil_Keranda_Pass_${student.name.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (e) {
      console.error('Download pass error', e);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Visual Verdict Box styled like official college receipt */}
      <div 
        ref={cardRef}
        className={`bg-[#0D1117] bg-theme-card border-2 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden font-mono ${
          isOverload 
            ? 'border-purple-500 shadow-purple-500/20'
            : isOpen 
            ? 'border-emerald-500 shadow-emerald-500/20' 
            : 'border-rose-500 shadow-rose-500/20'
        }`}
      >
        {/* Top Decorative Header */}
        <div className="text-center border-b border-dashed border-slate-800 pb-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-800/80 text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            🚪 SMART CLASSROOM DOOR SYSTEM
          </div>
          <h2 className="text-2xl font-black tracking-wider text-slate-100 uppercase">
            {isOverload ? '🚨 ATTENDANCE OVERLOAD 🚨' : '🚪 OFFICIAL FINAL DECISION'}
          </h2>
          <p className="text-xs text-slate-400 font-malayalam mt-1">
            Kerala College Smart Attendance Automation • Lab 304
          </p>
        </div>

        {/* Student Details Section */}
        <div className="grid grid-cols-2 gap-4 bg-[#161B22] p-4 rounded-2xl border border-slate-800 mb-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">STUDENT NAME:</span>
            <span className="text-base font-extrabold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span>{student.avatar}</span>
              <span>{student.name}</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{student.rollNo}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">ATTENDANCE SCORE:</span>
            <span className={`text-2xl font-black font-mono ${
              isOverload ? 'text-purple-400' : isHighAttendance ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {student.attendance}%
            </span>
            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
              {isHighAttendance ? 'QUOTA FULL ✓' : 'CRITICAL DEFICIT 🚨'}
            </span>
          </div>
        </div>

        {/* AI Decision Box (Manglish Verdict) */}
        <div className={`p-6 rounded-2xl border text-center relative mb-6 shadow-inner ${
          isOpen
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : isOverload
            ? 'bg-purple-950/30 border-purple-500/40 text-purple-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="text-[11px] uppercase tracking-widest font-mono text-slate-400 mb-2 flex items-center justify-center gap-1.5">
            <span>🤖 AI VERDICT ({activePersonality.name.toUpperCase()} MODE)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-malayalam leading-relaxed mb-3">
            "{verdict.primary}"
          </h3>

          <p className="text-base font-semibold font-malayalam text-slate-200 mb-2">
            "{verdict.secondary}"
          </p>

          <p className="text-sm font-bold font-malayalam text-amber-300 bg-slate-900/60 py-2 px-4 rounded-xl border border-slate-800 inline-block my-2">
            "{verdict.action}"
          </p>

          {/* Teacher Personality Override Quote */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs italic font-malayalam text-slate-400">
            {activePersonality.emoji} {activePersonality.name}: <span className="text-slate-300">"{activePersonality.tagline}"</span>
          </div>
        </div>

        {/* High Attendance Home Reward Banner */}
        {isHighAttendance && (
          <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border-2 border-amber-400/50 rounded-2xl p-4 mb-6 shadow-xl flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
                🎮
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  VEETTIL POYI GAME KALIKKU MONE!
                </h4>
                <p className="text-[11px] text-slate-300 font-malayalam mt-0.5">
                  Attendance safe aanu! Play any of the 8 arcade games in the left panel!
                </p>
              </div>
            </div>

            <button
              onClick={onOpenLudo}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-md hover:brightness-110"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>PLAY GAME</span>
            </button>
          </div>
        )}

        {/* Door Hardware Lock Outcome */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161B22] p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shadow-lg ${
              isOpen 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/20'
            }`}>
              {isOpen ? '🚪' : '🔒'}
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">DOOR STATUS:</div>
              <div className={`text-base font-extrabold font-mono ${isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isOpen ? '🟢 ENTRY APPROVED (DOOR OPEN)' : '🚫 ENTRY NOT REQUIRED (DOOR CLOSED)'}
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right font-malayalam text-xs text-slate-400">
            Have a nice day, mone 😌
          </div>
        </div>

      </div>

      {/* Action Buttons: Replay Audio, Download Pass, Rescan */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono">
        <button
          onClick={onReplayAudio}
          className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>🔊 REPLAY ANNOUNCEMENT</span>
        </button>

        <button
          onClick={handleDownloadPass}
          className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>📄 DOWNLOAD VERDICT PASS</span>
        </button>

        <button
          onClick={onRescan}
          className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          <span>🔄 SCAN ANOTHER STUDENT</span>
        </button>
      </div>

    </div>
  );
}
