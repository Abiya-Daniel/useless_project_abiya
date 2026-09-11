import React from 'react';
import { DoorClosed, Sparkles, Volume2, VolumeX, ShieldAlert, Cpu, Users, Settings, Sun, Moon, Gamepad2 } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled, 
  activePersonality,
  onQuickSelectStudent,
  students,
  isDarkMode,
  setIsDarkMode
}) {
  return (
    <header className="border-b border-slate-800 bg-[#0D1117]/90 bg-theme-header backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#0D1117] bg-theme-card rounded-[10px] flex items-center justify-center">
                <DoorClosed className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0D1117] bg-theme-card"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 bg-clip-text text-transparent">
                CLASSIL KERANDA MONE
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                v2.0 Manglish AI
              </span>
            </div>
            <p className="text-xs text-slate-400 text-theme-muted font-malayalam flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-amber-400 inline" />
              കേരള കോളേജ് യുസ്‌ലെസ് ഇന്നൊവേഷൻ ലാബ് (Kerala College Useless Innovation Lab)
            </p>
          </div>
        </div>

        {/* Quick Student Selector Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 text-theme-muted hidden lg:inline">
            Quick Scan:
          </span>
          {students.slice(0, 4).map((s) => (
            <button
              key={s.id}
              onClick={() => onQuickSelectStudent(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                s.attendance >= 85
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                  : s.attendance < 50
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <span>{s.avatar}</span>
              <span className="font-semibold">{s.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75 font-mono">({s.attendance}%)</span>
            </button>
          ))}
        </div>

        {/* Controls & Nav Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Light Mode / Dark Mode Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              isDarkMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300 shadow-sm'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            <span className="font-semibold">{isDarkMode ? '☀️ LIGHT MODE' : '🌙 DARK MODE'}</span>
          </button>

          {/* Audio toggle button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
            title={soundEnabled ? 'Door Audio Enabled (Click to Mute)' : 'Door Audio Muted (Click to Enable)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline font-semibold">{soundEnabled ? 'VOICE ON' : 'MUTED'}</span>
          </button>

          {/* Personality Badge button */}
          <button
            onClick={() => setActiveTab('personality')}
            className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-medium flex items-center gap-2 transition-all"
          >
            <span className="text-base">{activePersonality.emoji}</span>
            <span className="hidden sm:inline font-semibold">{activePersonality.name}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-t border-slate-800/80 bg-[#090D14]/80 bg-theme-subnav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('door')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'door'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 text-theme-muted hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <DoorClosed className="w-4 h-4" />
            <span>🚪 Smart Door Simulator</span>
          </button>


          <button
            onClick={() => setActiveTab('personality')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'personality'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 text-theme-muted hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>🧑‍🏫 Teacher Personalities</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 text-theme-muted hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>📋 Student Roster & QR</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 text-theme-muted hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>📟 Hardware Log</span>
          </button>
        </div>
      </div>
    </header>
  );
}

