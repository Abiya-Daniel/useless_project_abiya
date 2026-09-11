import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Upload, Sparkles, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';

export default function CameraQRScanner({ onScanSuccess, students }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanStatusText, setScanStatusText] = useState('Camera standby');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const mediaStreamRef = useRef(null);

  const startCamera = async () => {
    setCameraError(null);
    setScanStatusText('Requesting camera access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 640 }, 
          height: { ideal: 640 } 
        }
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        setScanStatusText('Square camera active. Align QR code inside frame...');
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable. Try uploading a QR image file or pick a student preview below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setScanStatusText('Camera stopped.');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video) {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          console.log('QR Code Detected:', code.data);
          // AUTO-STOP CAMERA IMMEDIATELY ON SUCCESSFUL SCAN
          stopCamera();
          handleDecodedData(code.data);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(tickScan);
  };

  const handleDecodedData = (rawText) => {
    let matchedStudent = null;

    // Try parsing JSON payload
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.id) {
        matchedStudent = students.find(s => s.id === parsed.id || s.rollNo === parsed.rollNo);
      } else if (parsed.rollNo) {
        matchedStudent = students.find(s => s.rollNo === parsed.rollNo);
      }
    } catch (e) {
      // String format matching fallback
      const lower = rawText.toLowerCase();
      matchedStudent = students.find(s => 
        lower.includes(s.id.toLowerCase()) || 
        lower.includes(s.rollNo.toLowerCase()) ||
        lower.includes(s.name.toLowerCase())
      );
    }

    if (!matchedStudent) {
      matchedStudent = students[0];
    }

    setScanStatusText(`✅ QR SCANNED! Student: ${matchedStudent.name}`);
    onScanSuccess(matchedStudent);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          stopCamera();
          handleDecodedData(code.data);
        } else {
          setCameraError('No valid QR code found in uploaded image.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#0D1117] border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
            📷 SQUARE CAMERA QR SCANNER
          </h3>
        </div>

        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border ${
          isCameraActive 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        }`}>
          {isCameraActive ? '🟢 CAMERA ACTIVE' : 'STOPPED / STANDBY'}
        </span>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Square Camera Viewport Frame */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
          
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover rounded-xl ${isCameraActive ? 'block' : 'hidden'}`} 
          />

          {/* Square Scanner Corner Brackets & Laser Overlay when camera IS active */}
          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
              {/* Corner brackets */}
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-md" />
                <div className="w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-md" />
              </div>

              {/* Scanning laser line */}
              <div className="w-full border-t-2 border-emerald-400 animate-laser shadow-[0_0_15px_#10b981]" />

              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-md" />
                <div className="w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-md" />
              </div>
            </div>
          )}

          {/* Overlay when camera is INACTIVE */}
          {!isCameraActive && (
            <div className="text-center space-y-3 p-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
                <Camera className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xs font-bold font-mono text-slate-200">
                  SQUARE CAMERA READY
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto leading-tight">
                  Auto-stops immediately upon successful scan!
                </p>
              </div>

              {cameraError && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono leading-tight max-w-[200px] mx-auto">
                  {cameraError}
                </div>
              )}

              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 text-slate-950 font-extrabold text-xs font-mono shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 mx-auto"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>START SCANNER</span>
              </button>
            </div>
          )}

        </div>

        <p className="text-[10px] font-mono text-slate-400 mt-2 text-center">
          {scanStatusText}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        
        {isCameraActive ? (
          <button
            onClick={stopCamera}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <CameraOff className="w-3.5 h-3.5" />
            <span>STOP CAMERA</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono text-slate-400">
            Scanner State: Idle
          </span>
        )}

        {/* Upload QR File Input */}
        <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm">
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>UPLOAD QR FILE</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

      </div>

      {/* Simulated Laser Presets */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
          <span>Unique Student QR Presets:</span>
          <span className="text-[10px] text-amber-400 font-bold">Auto-Evaluates</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {students.slice(0, 4).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                stopCamera();
                handleDecodedData(JSON.stringify({ id: s.id, rollNo: s.rollNo, name: s.name, att: s.attendance }));
              }}
              className="p-2 rounded-xl bg-[#161B22] border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <span>{s.avatar}</span>
                <span className="truncate">{s.name.split(' ')[0]}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between mt-1">
                <span>{s.rollNo}</span>
                <span className={s.attendance >= 85 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {s.attendance}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
