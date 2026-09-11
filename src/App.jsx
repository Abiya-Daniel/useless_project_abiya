import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DoorSimulator from './components/DoorSimulator';
import QuickDeckPanel from './components/QuickDeckPanel';
import ArcadeHub from './components/ArcadeHub';
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
import SnakeGame from './components/SnakeGame';
import FlappyGame from './components/FlappyGame';
import TicTacToeGame from './components/TicTacToeGame';
import MemoryMatchGame from './components/MemoryMatchGame';

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

  // Hash listener for mobile QR code launcher (#ludo, #chess, #shadowshift, #racing, #snake, #flappy, #tictactoe, #memory)
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
      } else if (window.location.hash === '#snake') {
        setActiveTab('snake');
      } else if (window.location.hash === '#flappy') {
        setActiveTab('flappy');
      } else if (window.location.hash === '#tictactoe') {
        setActiveTab('tictactoe');
      } else if (window.location.hash === '#memory') {
        setActiveTab('memory');
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
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-rose-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                
                {/* Rule Banner Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h4 className="text-xs font-extrabold tracking-wider text-amber-400 uppercase font-mono flex items-center gap-2 flex-wrap">
                      <span>INVERSE ATTENDANCE RULE & ARCADE GAME REWARDS</span>
                      <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 font-bold">
                        8 GAMES READY 🎮
                      </span>
                    </h4>
                  </div>

                  {/* Good vs Bad Student Rule Badges Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-lg shrink-0">
                        🔒
                      </div>
                      <div>
                        <div className="font-bold text-rose-300 font-mono">
                          GOOD STUDENT (&ge;85% ATTENDANCE)
                        </div>
                        <div className="text-[11px] text-slate-300 font-malayalam">
                          STAY HOME & PLAY CHESS • LUDO • SHADOW SHIFT • RIDER • SNAKE • FLAPPY • TIC-TAC-TOE • MEMORY MATCH
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg shrink-0">
                        🟢
                      </div>
                      <div>
                        <div className="font-bold text-emerald-300 font-mono">
                          BAD STUDENT (&lt;75% ATTENDANCE)
                        </div>
                        <div className="text-[11px] text-slate-300 font-malayalam">
                          DOOR UNLOCKS &rarr; FORCED TO ENTER CLASS & LISTEN TO LECTURE!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camera Scanner & Selector Action Group */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setShowCameraScanner(!showCameraScanner)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-2 ${
                      showCameraScanner
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 text-slate-950 border-amber-400 hover:brightness-110 shadow-lg font-black'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{showCameraScanner ? 'HIDE CAMERA SCANNER' : '📷 SCAN QR CODE'}</span>
                  </button>

                  <select
                    onChange={(e) => {
                      const st = students.find(s => s.id === e.target.value);
                      if (st) handleScanStudent(st);
                    }}
                    value={selectedStudent ? selectedStudent.id : ''}
                    className="bg-[#0D1117] bg-theme-card border border-slate-700 text-xs font-mono text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="" disabled>Select Student Card...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.avatar} {s.name} ({s.attendance}%)
                      </option>
                    ))}
                  </select>
                </div>

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
              
              {/* Left Column: 3D Door Simulator & Quick Scan Deck (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <DoorSimulator
                  isOpen={isOpen}
                  isAnalyzing={isAnalyzing}
                  student={selectedStudent}
                  verdict={verdict}
                  isSpeaking={isSpeaking}
                  activePersonality={activePersonality}
                />

                <QuickDeckPanel
                  students={students}
                  selectedStudent={selectedStudent}
                  onScanStudent={handleScanStudent}
                  isAnalyzing={isAnalyzing}
                  onOpenLudo={() => setActiveTab('ludo')}
                  onOpenChess={() => setActiveTab('chess')}
                  onOpenShadowShift={() => setActiveTab('shadowshift')}
                  onOpenRacing={() => setActiveTab('racing')}
                  onOpenSnake={() => setActiveTab('snake')}
                  onOpenFlappy={() => setActiveTab('flappy')}
                  onOpenTicTacToe={() => setActiveTab('tictactoe')}
                  onOpenMemoryMatch={() => setActiveTab('memory')}
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
                  />
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: College Arcade Hub (8 Games Lounge) */}
        {activeTab === 'arcade' && (
          <ArcadeHub
            onOpenLudo={() => setActiveTab('ludo')}
            onOpenChess={() => setActiveTab('chess')}
            onOpenShadowShift={() => setActiveTab('shadowshift')}
            onOpenRacing={() => setActiveTab('racing')}
            onOpenSnake={() => setActiveTab('snake')}
            onOpenFlappy={() => setActiveTab('flappy')}
            onOpenTicTacToe={() => setActiveTab('tictactoe')}
            onOpenMemoryMatch={() => setActiveTab('memory')}
          />
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

        {/* Tab 6: Canteen Snake 2D Game */}
        {activeTab === 'snake' && (
          <SnakeGame
            onBackToDoor={() => setActiveTab('door')}
          />
        )}

        {/* Tab 7: Flappy BTech Tap-to-Fly Game */}
        {activeTab === 'flappy' && (
          <FlappyGame
            onBackToDoor={() => setActiveTab('door')}
          />
        )}

        {/* Tab 8: Tic-Tac-Toe Pro Game */}
        {activeTab === 'tictactoe' && (
          <TicTacToeGame
            onBackToDoor={() => setActiveTab('door')}
          />
        )}

        {/* Tab 9: Campus Memory Match Challenge */}
        {activeTab === 'memory' && (
          <MemoryMatchGame
            onBackToDoor={() => setActiveTab('door')}
          />
        )}

        {/* Tab 10: Teacher Personalities */}
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

        {/* Tab 11: Student Roster & Teacher QR Cards */}
        {activeTab === 'students' && (
          <StudentManager
            students={students}
            onAddStudent={handleAddStudent}
            onScanStudent={handleScanStudent}
          />
        )}

        {/* Tab 12: Hardware & Servo Telemetry */}
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
          <span className="font-malayalam text-amber-500 font-semibold">"Good student &rarr; Veettil poyi Arcade Games kalikku mone!" 🎲♟️🏎️🐍🐥❌⭕🎴</span>
        </div>
      </footer>

    </div>
  );
}

