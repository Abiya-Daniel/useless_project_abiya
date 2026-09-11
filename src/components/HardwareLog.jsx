import React from 'react';
import { Cpu, Terminal, ShieldAlert, Radio, Activity, RefreshCw } from 'lucide-react';

export default function HardwareLog({ logs, onClearLogs }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0D1117] bg-theme-card border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-slate-100 text-theme-title uppercase tracking-tight">
              📟 HARDWARE TELEMETRY & SERVO LOG
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-malayalam mt-1">
            Real-time ESP32 / Arduino serial terminal outputs & relay command logs.
          </p>
        </div>

        <button
          onClick={onClearLogs}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>CLEAR LOGS</span>
        </button>
      </div>

      {/* Simulated Serial Monitor */}
      <div className="bg-[#090D14] border border-slate-800 rounded-3xl p-6 shadow-2xl font-mono text-xs text-slate-300 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">SERIAL_PORT: /dev/ttyUSB0 (Baud Rate: 115200)</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ONLINE
          </span>
        </div>

        <div className="h-80 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic text-center py-12">
              No hardware signals captured yet. Scan a student to generate telemetry log...
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 border-b border-slate-900/60 pb-1.5">
                <span className="text-slate-500 font-bold whitespace-nowrap">[{log.timestamp}]</span>
                <span className={`font-semibold ${
                  log.type === 'WARN' 
                    ? 'text-rose-400' 
                    : log.type === 'SUCCESS' 
                    ? 'text-emerald-400' 
                    : log.type === 'AI' 
                    ? 'text-amber-400' 
                    : 'text-slate-300'
                }`}>
                  [{log.tag}]
                </span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
