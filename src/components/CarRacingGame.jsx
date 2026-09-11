import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, Zap, Shield, Flame, Smartphone, Gamepad2, Gauge } from 'lucide-react';
import confetti from 'canvas-confetti';

// Simple Web Audio API Sound Synthesizer for Racing
class RacingAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, startFreq = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;

      if (startFreq) {
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + duration);
      } else {
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      }

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  nitro() {
    this.playTone(850, 'sawtooth', 0.25, 220);
  }

  coin() {
    this.playTone(987.77, 'sine', 0.08);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.12), 80);
  }

  crash() {
    this.playTone(60, 'sawtooth', 0.4, 200);
  }
}

const audio = new RacingAudio();

export default function CarRacingGame({ onBackToDoor }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
  const [difficulty, setDifficulty] = useState('MEDIUM'); // 'EASY', 'MEDIUM', 'HARD', 'INSANE'
  
  // Live HUD States
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speedKm, setSpeedKm] = useState(100);
  const [elapsedTimeStr, setElapsedTimeStr] = useState('00:00');
  const [coins, setCoins] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('kerala_racing_high_score') || '0', 10);
  });
  const [soundMuted, setSoundMuted] = useState(false);

  // Engine Mutable References
  const engine = useRef({
    animId: null,
    startTime: 0,
    elapsedSeconds: 0,
    frameCount: 0,
    speed: 7,
    nitroActive: false,
    nitroLevel: 100,
    shieldActive: false,
    distanceMeter: 0,
    calculatedScore: 0,
    coinsCollected: 0,
    scoreMultiplier: 1,

    // 3 Highway Lanes (Center X positions)
    lanes: [140, 250, 360],
    currentLaneIndex: 1, // Start in center lane
    targetX: 250,

    // Player Car State
    player: {
      x: 250,
      y: 460,
      width: 44,
      height: 75,
      color: '#38bdf8',
    },

    // Traffic Cars
    traffic: [],

    // Road Markings Offset
    roadOffset: 0,

    // Powerups list
    powerups: [],
    particles: [],

    // Controls
    keys: {},
  });

  useEffect(() => {
    audio.muted = soundMuted;
  }, [soundMuted]);

  // Controls Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const eng = engine.current;
      eng.keys[e.code] = true;

      if (gameState === 'PLAYING') {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          e.preventDefault();
          moveLeft();
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          e.preventDefault();
          moveRight();
        } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          activateNitro(true);
        } else if (e.code === 'KeyP') {
          setGameState(prev => prev === 'PLAYING' ? 'PAUSED' : 'PLAYING');
        }
      } else if (gameState === 'MENU' && e.code === 'Space') {
        startGame();
      } else if (gameState === 'GAMEOVER' && e.code === 'Space') {
        startGame();
      }
    };

    const handleKeyUp = (e) => {
      const eng = engine.current;
      eng.keys[e.code] = false;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        activateNitro(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, difficulty]);

  const moveLeft = () => {
    const eng = engine.current;
    if (eng.currentLaneIndex > 0) {
      eng.currentLaneIndex--;
      eng.targetX = eng.lanes[eng.currentLaneIndex];
    }
  };

  const moveRight = () => {
    const eng = engine.current;
    if (eng.currentLaneIndex < eng.lanes.length - 1) {
      eng.currentLaneIndex++;
      eng.targetX = eng.lanes[eng.currentLaneIndex];
    }
  };

  const activateNitro = (active) => {
    const eng = engine.current;
    if (active && eng.nitroLevel > 5) {
      eng.nitroActive = true;
      audio.nitro();
    } else {
      eng.nitroActive = false;
    }
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    const eng = engine.current;

    let baseSpeed = 7;
    let mult = 1.0;

    if (difficulty === 'EASY') {
      baseSpeed = 5.5;
      mult = 0.8;
    } else if (difficulty === 'MEDIUM') {
      baseSpeed = 7.5;
      mult = 1.0;
    } else if (difficulty === 'HARD') {
      baseSpeed = 10.0;
      mult = 1.5;
    } else if (difficulty === 'INSANE') {
      baseSpeed = 13.0;
      mult = 2.5;
    }

    eng.startTime = Date.now();
    eng.elapsedSeconds = 0;
    eng.frameCount = 0;
    eng.speed = baseSpeed;
    eng.scoreMultiplier = mult;
    eng.nitroActive = false;
    eng.nitroLevel = 100;
    eng.shieldActive = false;
    eng.distanceMeter = 0;
    eng.calculatedScore = 0;
    eng.coinsCollected = 0;

    eng.currentLaneIndex = 1;
    eng.targetX = eng.lanes[1];
    eng.player.x = eng.lanes[1];

    eng.traffic = [];
    eng.powerups = [];
    eng.particles = [];

    setGameState('PLAYING');
    setScore(0);
    setDistance(0);
    setSpeedKm(Math.round(baseSpeed * 18));
    setElapsedTimeStr('00:00');
    setCoins(0);
    setNitro(100);
  };

  // Main Canvas Render & Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spawnTraffic = () => {
      const eng = engine.current;
      const laneIdx = Math.floor(Math.random() * eng.lanes.length);
      const laneX = eng.lanes[laneIdx];

      const types = [
        { name: 'CAR', color: '#ef4444', height: 75, width: 44, speedRatio: 0.6 },
        { name: 'RICKSHAW', color: '#facc15', height: 60, width: 40, speedRatio: 0.4 },
        { name: 'KSRTC_BUS', color: '#10b981', height: 110, width: 48, speedRatio: 0.5 },
        { name: 'POLICE', color: '#3b82f6', height: 75, width: 44, speedRatio: 0.7 },
      ];

      const vehicle = types[Math.floor(Math.random() * types.length)];

      eng.traffic.push({
        x: laneX,
        y: -130,
        width: vehicle.width,
        height: vehicle.height,
        color: vehicle.color,
        name: vehicle.name,
        speed: eng.speed * vehicle.speedRatio,
      });

      // Spawn Coins / Powerups
      if (Math.random() < 0.5) {
        const freeLane = (laneIdx + 1) % 3;
        eng.powerups.push({
          x: eng.lanes[freeLane],
          y: -100,
          type: Math.random() < 0.7 ? 'COIN' : Math.random() < 0.85 ? 'NITRO' : 'SHIELD',
          radius: 12,
        });
      }
    };

    let trafficTimer = 0;

    const gameLoop = () => {
      const eng = engine.current;
      eng.frameCount++;

      // Update elapsed time & speed
      eng.elapsedSeconds = (Date.now() - eng.startTime) / 1000;
      
      const currentSpeed = eng.nitroActive && eng.nitroLevel > 5 ? eng.speed * 1.8 : eng.speed;
      if (eng.nitroActive && eng.nitroLevel > 0) {
        eng.nitroLevel = Math.max(0, eng.nitroLevel - 0.4);
      } else {
        eng.nitroLevel = Math.min(100, eng.nitroLevel + 0.08);
      }

      // Smooth lane movement for Player Car
      eng.player.x += (eng.targetX - eng.player.x) * 0.25;

      // Road markings scroll
      eng.roadOffset = (eng.roadOffset + currentSpeed * 2) % 40;

      // Distance & live score update
      eng.distanceMeter += currentSpeed * 0.15;
      const curDist = Math.floor(eng.distanceMeter);
      eng.calculatedScore = Math.floor((curDist * 2 + eng.elapsedSeconds * 30 + eng.coinsCollected * 100) * eng.scoreMultiplier);

      // Throttled UI state updates (~15 FPS)
      if (eng.frameCount % 4 === 0) {
        setDistance(curDist);
        setScore(eng.calculatedScore);
        setSpeedKm(Math.round(currentSpeed * 16));
        setElapsedTimeStr(formatTime(eng.elapsedSeconds));
        setNitro(Math.round(eng.nitroLevel));
      }

      // Spawn traffic
      trafficTimer++;
      const spawnFreq = difficulty === 'INSANE' ? 30 : difficulty === 'HARD' ? 45 : difficulty === 'EASY' ? 80 : 60;
      if (trafficTimer > spawnFreq) {
        spawnTraffic();
        trafficTimer = 0;
      }

      // --- TRAFFIC MOVEMENTS & COLLISIONS ---
      for (let i = eng.traffic.length - 1; i >= 0; i--) {
        const tr = eng.traffic[i];
        tr.y += currentSpeed - tr.speed;

        // Collision Check with Player
        const px = eng.player.x - eng.player.width / 2;
        const py = eng.player.y - eng.player.height / 2;
        const tx = tr.x - tr.width / 2;
        const ty = tr.y - tr.height / 2;

        const overlap = px < tx + tr.width && px + eng.player.width > tx && py < ty + tr.height && py + eng.player.height > ty;

        if (overlap) {
          if (eng.shieldActive) {
            eng.shieldActive = false;
            eng.traffic.splice(i, 1);
            audio.crash();
            continue;
          }

          // GAMEOVER CRASH
          audio.crash();
          setGameState('GAMEOVER');
          if (eng.calculatedScore > highScore) {
            setHighScore(eng.calculatedScore);
            localStorage.setItem('kerala_racing_high_score', eng.calculatedScore.toString());
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }
          return;
        }

        if (tr.y > canvas.height + 150) {
          eng.traffic.splice(i, 1);
        }
      }

      // --- POWERUPS & COINS ---
      for (let i = eng.powerups.length - 1; i >= 0; i--) {
        const pw = eng.powerups[i];
        pw.y += currentSpeed;

        const dx = eng.player.x - pw.x;
        const dy = eng.player.y - pw.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 32) {
          if (pw.type === 'COIN') {
            eng.coinsCollected += 1;
            setCoins(eng.coinsCollected);
            audio.coin();
          } else if (pw.type === 'NITRO') {
            eng.nitroLevel = Math.min(100, eng.nitroLevel + 40);
            audio.coin();
          } else if (pw.type === 'SHIELD') {
            eng.shieldActive = true;
            audio.coin();
          }
          eng.powerups.splice(i, 1);
        } else if (pw.y > canvas.height + 50) {
          eng.powerups.splice(i, 1);
        }
      }

      // --- CANVAS DRAWING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grass sides
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Asphalt Road (Width 360, centered at X=250)
      const roadLeft = 70;
      const roadRight = 430;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(roadLeft, 0, roadRight - roadLeft, canvas.height);

      // Road Red/White Border Lines
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(roadLeft - 6, 0, 6, canvas.height);
      ctx.fillRect(roadRight, 0, 6, canvas.height);

      // Dotted Lane Dividers
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -eng.roadOffset;

      // Divider 1 (X=195)
      ctx.beginPath();
      ctx.moveTo(195, 0);
      ctx.lineTo(195, canvas.height);
      ctx.stroke();

      // Divider 2 (X=305)
      ctx.beginPath();
      ctx.moveTo(305, 0);
      ctx.lineTo(305, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- DRAW POWERUPS ---
      eng.powerups.forEach((pw) => {
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
        if (pw.type === 'COIN') ctx.fillStyle = '#facc15';
        else if (pw.type === 'NITRO') ctx.fillStyle = '#38bdf8';
        else ctx.fillStyle = '#34d399';
        ctx.fill();

        ctx.font = '700 10px "JetBrains Mono"';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(pw.type === 'COIN' ? '🪙' : pw.type === 'NITRO' ? '⚡' : '🛡️', pw.x, pw.y + 4);
      });

      // --- DRAW TRAFFIC VEHICLES ---
      eng.traffic.forEach((tr) => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = tr.color;
        ctx.fillStyle = tr.color;

        // Vehicle Body
        ctx.fillRect(tr.x - tr.width / 2, tr.y - tr.height / 2, tr.width, tr.height);

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(tr.x - tr.width / 2 + 4, tr.y - tr.height / 2 + 10, tr.width - 8, 14);

        // Headlights
        ctx.fillStyle = '#fde047';
        ctx.fillRect(tr.x - tr.width / 2 + 2, tr.y + tr.height / 2 - 6, 8, 4);
        ctx.fillRect(tr.x + tr.width / 2 - 10, tr.y + tr.height / 2 - 6, 8, 4);

        ctx.restore();
      });

      // --- DRAW PLAYER SPORTS CAR ---
      const p = eng.player;
      ctx.save();
      ctx.shadowBlur = eng.nitroActive ? 25 : 12;
      ctx.shadowColor = eng.nitroActive ? '#f59e0b' : '#38bdf8';
      ctx.fillStyle = eng.nitroActive ? '#fb923c' : p.color;

      // Car Body
      ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);

      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x - p.width / 2 + 4, p.y - p.height / 2 + 15, p.width - 8, 16);

      // Nitro Flame Tail Effect
      if (eng.nitroActive) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(p.x - 10, p.y + p.height / 2);
        ctx.lineTo(p.x, p.y + p.height / 2 + 25);
        ctx.lineTo(p.x + 10, p.y + p.height / 2);
        ctx.fill();
      }

      ctx.restore();

      // CONTINUOUS DIRECT CANVAS LIVE READOUT HUD (SPEED, SCORE, DISTANCE)
      ctx.save();
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`SCORE: ${eng.calculatedScore}`, 16, 28);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`DIST: ${curDist}m`, 145, 28);

      ctx.fillStyle = '#34d399';
      ctx.fillText(`SPEED: ${Math.round(currentSpeed * 16)} km/h`, 255, 28);

      ctx.fillStyle = '#fb923c';
      ctx.fillText(`NITRO: ${Math.round(eng.nitroLevel)}%`, 380, 28);
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, difficulty, highScore]);

  return (
    <div className="space-y-4 font-sans max-w-4xl mx-auto">
      
      {/* Top Controls Bar */}
      <div className="bg-[#0D1117] bg-theme-card border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDoor}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>DOOR SIMULATOR</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">🏎️</span>
            <h2 className="text-base font-extrabold text-slate-100 text-theme-title uppercase tracking-wider">
              KERALA HIGHWAY RIDER v1.0
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>BEST SCORE: <strong>{highScore}</strong></span>
          </div>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Card */}
      <div className="bg-[#090D14] bg-theme-card border-2 border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        
        {/* CONTINUOUS LIVE PLAYING HUD HEADER */}
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-[500px] bg-[#0D1117]/90 backdrop-blur border border-slate-800 p-3 rounded-2xl mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold text-slate-200 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-300">
                SCORE: <strong className="text-amber-400 text-sm">{score}</strong>
              </span>

              <span className="bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-xl text-sky-300">
                DIST: <strong className="text-sky-300 text-sm">{distance} m</strong>
              </span>

              <span className="bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-emerald-300 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>{speedKm} km/h</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-yellow-400">🪙 {coins}</span>
              <span className="text-slate-400 text-[10px]">{elapsedTimeStr}</span>
            </div>
          </div>
        )}

        {/* HTML5 Canvas Element */}
        <div className="relative w-full max-w-[500px] aspect-[1/1] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="w-full h-full object-cover"
          />

          {/* START MENU OVERLAY */}
          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 animate-bounce">
                🏎️
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-wider text-slate-100 uppercase">
                  KERALA HIGHWAY RIDER
                </h3>
                <p className="text-xs text-amber-300 font-semibold mt-1">
                  "Dodge auto-rickshaws & KSRTC buses on NH-66!"
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2 w-full max-w-xs">
                <label className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
                  🎯 SELECT TRAFFIC SPEED:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'EASY', label: 'EASY 🟢', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40' },
                    { id: 'MEDIUM', label: 'MEDIUM 🟡', color: 'border-amber-500 text-amber-300 bg-amber-950/40' },
                    { id: 'HARD', label: 'HARD 🔴', color: 'border-rose-500 text-rose-300 bg-rose-950/40' },
                    { id: 'INSANE', label: 'RUSH 🔥', color: 'border-purple-500 text-purple-300 bg-purple-950/40' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                        difficulty === d.id
                          ? `${d.color} shadow-lg ring-2 ring-amber-400`
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 text-slate-950 font-black text-sm tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START HIGHWAY RACE</span>
              </button>
            </div>
          )}

          {/* GAMEOVER OVERLAY */}
          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <h3 className="text-3xl font-black text-rose-500 uppercase tracking-widest animate-pulse">
                💥 CRASHED!
              </h3>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs space-y-2 w-64">
                <div className="flex justify-between">
                  <span className="text-slate-400">FINAL SCORE:</span>
                  <span className="font-bold text-amber-300">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DISTANCE:</span>
                  <span className="font-bold text-sky-300">{distance} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SURVIVAL TIME:</span>
                  <span className="font-bold text-emerald-300">{elapsedTimeStr}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">COINS COLLECTED:</span>
                  <span className="font-bold text-yellow-400">🪙 {coins}</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-sm tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>RACE AGAIN</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile & Touch Controls */}
        <div className="mt-5 w-full max-w-[500px] grid grid-cols-3 gap-3 font-mono">
          <button
            onClick={moveLeft}
            className="py-3.5 rounded-2xl bg-sky-500/20 border-2 border-sky-500/40 hover:bg-sky-500/30 text-sky-300 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <span>⬅️ LEFT</span>
          </button>

          <button
            onClick={() => activateNitro(!engine.current.nitroActive)}
            className="py-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <span>🚀 NITRO</span>
          </button>

          <button
            onClick={moveRight}
            className="py-3.5 rounded-2xl bg-sky-500/20 border-2 border-sky-500/40 hover:bg-sky-500/30 text-sky-300 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <span>RIGHT ➡️</span>
          </button>
        </div>

      </div>
    </div>
  );
}
