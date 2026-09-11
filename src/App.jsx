import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DoorSimulator from './components/DoorSimulator';
import AIAnalysisTerminal from './components/AIAnalysisTerminal';
import VerdictCard from './components/VerdictCard';
import PersonalitySelector from './components/PersonalitySelector';
import StudentManager from './components/StudentManager';
import HardwareLog from './components/HardwareLog';
import CameraQRScanner from './components/CameraQRScanner';
import LudoGame from './components/LudoGame';
import ChessGame from './components/ChessGame';
import ShadowShiftGame from './components/ShadowShiftGame';
import CarRacingGame from './components/CarRacingGame';

import { DEFAULT_STUDENTS } from './data/students';
import { PERSONALITIES } from './data/personalities';
import { RESPONSES_BY_TIER, PERSONALITY_OVERFLOW_QUOTES, PERSONALITY_TIER_QUOTES } from './data/responses';
import { 
  speakText, 
  stopSpeech, 
  playServoSound, 
  playLockClickSound, 
  playSirenSound, 
  playSuccessChime 
} from './utils/AudioEngine';
import confetti from 'canvas-confetti';
import { QrCode, Play, Sparkles, AlertCircle, RefreshCw, Camera, Gamepad2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('door');
  const [students, setStudents] = useState(DEFAULT_STUDENTS);
  const [activePersonality, setActivePersonality] = useState(PERSONALITIES[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const [telemetryLogs, setTelemetryLogs] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'INFO',
      tag: 'SYSTEM_BOOT',
      message: 'ESP32 Smart Door Node v2.4 initialized. Manglish AI Core v2.0 READY.',
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'AI',
      tag: 'PERSONALITY_LOAD',
      message: `Active Teacher Mode set to "${PERSONALITIES[0].name}".`,
    }
  ]);

  // Hash listener for mobile QR code launcher (#ludo, #chess, #shadowshift, #racing)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#ludo') {
        setActiveTab('ludo');
      } else if (window.location.hash === '#chess') {
        setActiveTab('chess');
      } else if (window.location.hash === '#shadowshift') {
        setActiveTab('shadowshift');
      } else if (window.location.hash === '#racing') {
        setActiveTab('racing');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addLog = (type, tag, message) => {
    setTelemetryLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        tag,
        message,
      },
      ...prev.slice(0, 49)
    ]);
  };

  // Trigger evaluation scan
  const handleScanStudent = (student) => {
    setSelectedStudent(student);
    setIsAnalyzing(true);
    setVerdict(null);
    setIsOpen(false);
    stopSpeech();
    setIsSpeaking(false);

    if (activeTab !== 'door') {
      setActiveTab('door');
    }

    addLog('INFO', 'RFID_SCAN', `Card scanned for ${student.name} (${student.rollNo}). Attendance: ${student.attendance}%.`);
  };

  // Called when AI Terminal completes fake analysis ticks
  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    if (!selectedStudent) return;

    const att = selectedStudent.attendance;
    let tierKey = 'MID_50_74';
    let doorShouldOpen = true;

    if (att === 100) {
      tierKey = 'OVERLOAD_100';
      doorShouldOpen = false;
    } else if (att >= 85) {
      tierKey = 'HIGH_85_99';
      doorShouldOpen = false;
    } else if (att >= 75) {
      tierKey = 'SAFE_75_84';
      doorShouldOpen = false;
    } else if (att >= 50) {
      tierKey = 'MID_50_74';
      doorShouldOpen = true;
    } else {
      tierKey = 'LOW_BELOW_50';
      doorShouldOpen = true;
    }

    let chosenVerdict;
    const customTeacherQuote = PERSONALITY_TIER_QUOTES[activePersonality.id]?.[tierKey];
    if (customTeacherQuote) {
      chosenVerdict = customTeacherQuote;
    } else {
      const tierResponses = RESPONSES_BY_TIER[tierKey];
      chosenVerdict = tierResponses[Math.floor(Math.random() * tierResponses.length)];
    }

    setVerdict(chosenVerdict);
    setIsOpen(doorShouldOpen);

    // Hardware sound & visual effects
    if (soundEnabled) {
      if (doorShouldOpen) {
        playServoSound(true);
        playLockClickSound(false);
        if (att < 50) {
          playSirenSound();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      } else {
        playServoSound(false);
        playLockClickSound(true);
        if (att === 100) {
          playSirenSound();
        } else {
          playSuccessChime();
        }
      }

      // Voice announcement speech synthesis
      const spokenMessage = chosenVerdict.announcement || chosenVerdict.primary;

      setIsSpeaking(true);
      speakText(spokenMessage, {
        pitch: activePersonality.pitch,
        rate: activePersonality.rate,
      });

      setTimeout(() => setIsSpeaking(false), 4500);
    }

    addLog(
      doorShouldOpen ? 'WARN' : 'SUCCESS',
      'DECISION_ENGINE',
      `Verdict generated for ${selectedStudent.name}. Door state: ${doorShouldOpen ? 'OPEN (0x90°)' : 'CLOSED (0x00°)'}. Manglish quote: "${chosenVerdict.primary}"`
    );
  };

  const handleReplayAudio = () => {
    if (!verdict) return;
    if (soundEnabled) {
      setIsSpeaking(true);
      speakText(verdict.announcement, {
        pitch: activePersonality.pitch,
        rate: activePersonality.rate,
      });
      setTimeout(() => setIsSpeaking(false), 4500);
    }
  };

  const handleAddStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
    addLog('INFO', 'STUDENT_ROSTER', `Added new student ${newStudent.name} (${newStudent.attendance}%).`);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 ${
      isDarkMode ? 'bg-[#090D14] text-slate-100 dark' : 'bg-slate-50 text-slate-900 light'
    }`}>
      
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activePersonality={activePersonality}
        onQuickSelectStudent={handleScanStudent}
        students={students}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow">
        
        {/* Tab 1: Smart Door Simulator */}
        {activeTab === 'door' && (
          <div className="space-y-6">
            
            {/* Quick Banner Alert */}
            <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-emerald-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">😂</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase font-mono">
                    INVERSE ATTENDANCE RULE + GAME REWARDS:
                  </h4>
                  <p className="text-xs text-slate-300 text-theme-muted font-malayalam mt-0.5">
                    <strong>Good Student (&ge;85%)</strong> &rarr; 🔒 STAY HOME & PLAY CHESS/LUDO/SHADOW SHIFT | <strong>Bad Student (&lt;75%)</strong> &rarr; 🟢 ENTER CLASS
                  </p>
                </div>
              </div>

              {/* Camera Scanner Toggle Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowCameraScanner(!showCameraScanner)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-2 ${
                    showCameraScanner
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 border-amber-400 hover:brightness-110 shadow-lg'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{showCameraScanner ? 'HIDE CAMERA SCANNER' : '📷 OPEN DEVICE CAMERA & SCAN'}</span>
                </button>

                <select
                  onChange={(e) => {
                    const st = students.find(s => s.id === e.target.value);
                    if (st) handleScanStudent(st);
                  }}
                  value={selectedStudent ? selectedStudent.id : ''}
                  className="w-full sm:w-auto bg-[#0D1117] border border-slate-700 text-xs font-mono text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
                >
                  <option value="" disabled>Select Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.avatar} {s.name} ({s.attendance}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Camera Scanner Drawer if Toggled */}
            {showCameraScanner && (
              <div className="animate-fade-in">
                <CameraQRScanner
                  students={students}
                  onScanSuccess={(scannedStudent) => {
                    handleScanStudent(scannedStudent);
                    setShowCameraScanner(false);
                  }}
                />
              </div>
            )}

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: 3D Door Simulator (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <DoorSimulator
                  isOpen={isOpen}
                  isAnalyzing={isAnalyzing}
                  student={selectedStudent}
                  verdict={verdict}
                  isSpeaking={isSpeaking}
                  activePersonality={activePersonality}
                />
              </div>

              {/* Right Column: Fake AI Terminal / Final Verdict Card (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <AIAnalysisTerminal
                  isAnalyzing={isAnalyzing}
                  student={selectedStudent}
                  onComplete={handleAnalysisComplete}
                />

                {verdict && !isAnalyzing && (
                  <VerdictCard
                    student={selectedStudent}
                    verdict={verdict}
                    isOpen={isOpen}
                    activePersonality={activePersonality}
                    onReplayAudio={handleReplayAudio}
                    onRescan={() => setSelectedStudent(null)}
                    onOpenLudo={() => setActiveTab('ludo')}
                    onOpenChess={() => setActiveTab('chess')}
                    onOpenShadowShift={() => setActiveTab('shadowshift')}
                    onOpenRacing={() => setActiveTab('racing')}
                  />
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Home Ludo Game */}
        {activeTab === 'ludo' && (
          <LudoGame
            onBackToDoor={() => setActiveTab('door')}
          />
        )}

        {/* Tab 3: Home Chess Game */}
        {activeTab === 'chess' && (
          <ChessGame
            onBackToDoor={() => setActiveTab('door')}
            onSwitchToLudo={() => setActiveTab('ludo')}
          />
        )}

        {/* Tab 4: Shadow Shift Dual Runner Game */}
        {activeTab === 'shadowshift' && (
          <ShadowShiftGame
            onBackToDoor={() => setActiveTab('door')}
          />
        )}

        {/* Tab 5: Kerala Highway Rider Car Racing Game */}
        {activeTab === 'racing' && (
          <CarRacingGame
            onBackToDoor={() => setActiveTab('door')}
          />
        )}

        {/* Tab 4: Teacher Personalities */}
        {activeTab === 'personality' && (
          <PersonalitySelector
            activePersonality={activePersonality}
            setActivePersonality={(p) => {
              setActivePersonality(p);
              addLog('AI', 'PERSONALITY_CHANGE', `Switched Teacher Mode to "${p.name}".`);
            }}
            soundEnabled={soundEnabled}
          />
        )}

        {/* Tab 5: Student Roster & Teacher QR Cards */}
        {activeTab === 'students' && (
          <StudentManager
            students={students}
            onAddStudent={handleAddStudent}
            onScanStudent={handleScanStudent}
          />
        )}

        {/* Tab 6: Hardware & Servo Telemetry */}
        {activeTab === 'telemetry' && (
          <HardwareLog
            logs={telemetryLogs}
            onClearLogs={() => setTelemetryLogs([])}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0D1117] bg-theme-footer py-4 mt-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-slate-500 text-theme-muted flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🚪 CLASSIL KERANDA MONE v2.0 • KERALA COLLEGE INNOVATION LAB</span>
          <span className="font-malayalam text-amber-500 font-semibold">"Good student &rarr; Veettil poyi Ludo/Chess kalikku mone!" 🎲♟️</span>
        </div>
      </footer>

    </div>
  );
}

