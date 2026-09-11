import React, { useState, useRef } from 'react';
import { Users, Plus, QrCode, Play, Sparkles, Printer, Download, X, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

export default function StudentManager({ students, onAddStudent, onScanStudent }) {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [attendance, setAttendance] = useState(85);
  const [avatar, setAvatar] = useState('🎒');

  const [qrModalStudent, setQrModalStudent] = useState(null);
  const passCardRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent = {
      id: `std_${Date.now()}`,
      name: name.trim(),
      rollNo: rollNo.trim() || `CS-2024-${Math.floor(Math.random() * 90 + 10)}`,
      department,
      attendance: Number(attendance),
      avatar: avatar || '🎓',
      status: Number(attendance) >= 85 ? 'Custom High Student' : 'Custom Low Student',
      badgeColor: Number(attendance) >= 85 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    };

    onAddStudent(newStudent);
    setName('');
    setRollNo('');
    setAttendance(85);
  };

  const handleDownloadQrPass = async () => {
    if (!passCardRef.current || !qrModalStudent) return;
    try {
      const canvas = await html2canvas(passCardRef.current, {
        backgroundColor: '#0D1117',
        scale: 2,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Student_QR_Pass_${qrModalStudent.name.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (e) {
      console.error('Error downloading QR pass:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D1117] bg-theme-card border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-slate-100 text-theme-title uppercase tracking-tight">
              📋 STUDENT ROSTER & UNIQUE QR PASS CARDS
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-malayalam mt-1">
            Every student gets a unique small-matrix QR ID Pass for classroom door camera scanning.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
          <span className="text-slate-400">Total Enrolled:</span>
          <span className="font-bold text-amber-300">{students.length} Students</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add New Custom Student Form */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-slate-200 uppercase font-mono mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>CREATE CUSTOM STUDENT</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Student Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abin Mathew"
                required
                className="w-full bg-[#161B22] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Roll No / ID:</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. CS-2024-99"
                className="w-full bg-[#161B22] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Emoji Avatar:</label>
              <select
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-[#161B22] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="🎒">🎒 Student Pack</option>
                <option value="👨‍💻">👨‍💻 Tech Guy</option>
                <option value="🛵">🛵 Bike Legend</option>
                <option value="📚">📚 Scholar</option>
                <option value="☕">☕ Canteen Regular</option>
                <option value="😴">😴 Sleepy Bench</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400">Attendance Percentage:</label>
                <span className={`font-bold ${attendance >= 85 ? 'text-emerald-400' : attendance < 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {attendance}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0% (Danger)</span>
                <span>75% (Safe)</span>
                <span>100% (Overload)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>ADD TO CLASS ROSTER</span>
            </button>
          </form>
        </div>

        {/* Existing Student List with Unique Small QR Codes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((s) => {
              // Compact unique payload string for instant high-speed scanning
              const qrPayload = JSON.stringify({ id: s.id, rollNo: s.rollNo, name: s.name, att: s.attendance });
              
              return (
                <div
                  key={s.id}
                  className="bg-[#0D1117] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-xl bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform">
                          {s.avatar}
                        </span>
                        <div>
                          <h4 className="text-base font-bold text-slate-100 font-sans">
                            {s.name}
                          </h4>
                          <p className="text-xs font-mono text-slate-400">
                            {s.rollNo} • {s.department}
                          </p>
                        </div>
                      </div>

                      {/* Attendance Score Badge */}
                      <div className="text-right">
                        <div className={`text-xl font-black font-mono ${
                          s.attendance >= 85 ? 'text-emerald-400' : s.attendance < 50 ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {s.attendance}%
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 block">ATTENDANCE</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] border ${s.badgeColor}`}>
                        {s.status}
                      </span>

                      <span className="text-slate-400 font-mono text-[11px]">
                        Outcome: <strong className={s.attendance >= 85 ? 'text-rose-400' : 'text-emerald-400'}>
                          {s.attendance >= 85 ? '🚫 STAY HOME' : '🟢 ENTER CLASS'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Small QR Thumbnail & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-700 shadow-sm shrink-0">
                      <QRCodeSVG
                        value={qrPayload}
                        size={48}
                        level="L"
                        includeMargin={false}
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => setQrModalStudent(s)}
                        className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>VIEW QR PASS</span>
                      </button>

                      <button
                        onClick={() => onScanStudent(s)}
                        className="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                        <span>DOOR SCAN</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Teacher QR Pass Modal with Compact High-Readability QR Code */}
      {qrModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0D1117] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            
            <button
              onClick={() => setQrModalStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-full bg-slate-800/80"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable QR Pass Card Container */}
            <div ref={passCardRef} className="bg-[#161B22] border border-slate-800 rounded-2xl p-6 text-center font-mono space-y-4">
              
              {/* College Header */}
              <div className="border-b border-dashed border-slate-700 pb-3">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  KERALA COLLEGE OF ENGINEERING
                </div>
                <h3 className="text-base font-black text-slate-100 uppercase tracking-tight mt-0.5">
                  OFFICIAL STUDENT QR ID PASS
                </h3>
                <p className="text-[10px] font-malayalam text-slate-400">
                  കേരള കോളേജ് സ്മാർട്ട് അറ്റൻഡൻസ് ഐഡി കാർഡ്
                </p>
              </div>

              {/* Student Details */}
              <div className="flex items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{qrModalStudent.avatar}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-sans">
                      {qrModalStudent.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{qrModalStudent.rollNo}</p>
                    <p className="text-[10px] text-slate-500">{qrModalStudent.department}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-extrabold ${qrModalStudent.attendance >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {qrModalStudent.attendance}%
                  </div>
                  <span className="text-[9px] text-slate-400 block">ATTENDANCE</span>
                </div>
              </div>

              {/* Generated Crisp Small Matrix QR Code */}
              <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-700 w-fit mx-auto shadow-xl">
                <QRCodeSVG
                  value={JSON.stringify({ id: qrModalStudent.id, rollNo: qrModalStudent.rollNo, name: qrModalStudent.name, att: qrModalStudent.attendance })}
                  size={135}
                  level="M"
                  includeMargin={true}
                />
              </div>

              <p className="text-[10px] text-slate-400 font-mono">
                Unique Student Pass ID: <strong className="text-amber-400">{qrModalStudent.id}</strong>
              </p>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                onClick={handleDownloadQrPass}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD PASS PNG</span>
              </button>

              <button
                onClick={() => {
                  onScanStudent(qrModalStudent);
                  setQrModalStudent(null);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>SCAN ON DOOR SIMULATOR</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
