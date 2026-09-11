import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Sparkles, Pause, ArrowLeft, Gamepad2, Trophy, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

// Simple Web Audio API sound synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
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

  jump() {
    this.playTone(450, 'sine', 0.15, 180);
  }

  slide() {
    this.playTone(120, 'triangle', 0.12, 300);
  }

  shift() {
    this.playTone(800, 'sawtooth', 0.2, 200);
  }

  coin() {
    this.playTone(987.77, 'sine', 0.08);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.12), 80);
  }

  closeCall() {
    this.playTone(600, 'square', 0.08, 900);
  }

  hit() {
    this.playTone(60, 'sawtooth', 0.3, 180);
  }
}

const audio = new SoundEngine();

export default function ShadowShiftGame({ onBackToDoor }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [combo, setCombo] = useState(1);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('shadow_shift_high_score') || '0', 10);
  });
  const [energy, setEnergy] = useState(100);
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventTimeLeft, setEventTimeLeft] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);
  const [closeCallNotice, setCloseCallNotice] = useState(null);

  // Game Engine Mutable References
  const engine = useRef({
    animId: null,
    lastTime: 0,
    speed: 6,
    distanceMeter: 0,
    coinsCollected: 0,
    comboMultiplier: 1,
    energyLevel: 100,
    shieldActive: false,
    slowTimeActive: false,
    
    // Tracks configuration
    topTrackY: 160,
    bottomTrackY: 330,
    
    // Player on Upper Track
    player: {
      x: 100,
      y: 160,
      vy: 0,
      width: 24,
      height: 36,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      onTopTrack: true,
    },

    // Shadow on Lower Track
    shadow: {
      x: 100,
      y: 330,
      vy: 0,
      width: 24,
      height: 36,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      onTopTrack: false,
    },

    // Entity lists
    obstacles: [],
    particles: [],
    powerups: [],
    floatingTexts: [],

    // Random Event Engine
    currentEvent: null, // 'BLACKOUT', 'MIRROR', 'GIANT', 'SHADOW_RAIN'
    eventTimer: 0,
    nextEventIn: 25, // seconds until next random event

    // Controls
    keys: {},
  });

  useEffect(() => {
    audio.muted = soundMuted;
  }, [soundMuted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const eng = engine.current;
      eng.keys[e.code] = true;

      if (gameState === 'PLAYING') {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          triggerJump();
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          triggerSlide();
        } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyS') {
          e.preventDefault();
          triggerShift();
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
      engine.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const triggerJump = () => {
    const eng = engine.current;
    if (eng.currentEvent === 'MIRROR') {
      executeSlide();
    } else {
      executeJump();
    }
  };

  const triggerSlide = () => {
    const eng = engine.current;
    if (eng.currentEvent === 'MIRROR') {
      executeJump();
    } else {
      executeSlide();
    }
  };

  const executeJump = () => {
    const eng = engine.current;
    const p = eng.player;
    const s = eng.shadow;

    // Both jump together
    if (!p.isJumping) {
      p.vy = -12;
      p.isJumping = true;
      audio.jump();
    }
    if (!s.isJumping) {
      s.vy = -12;
      s.isJumping = true;
    }
  };

  const executeSlide = () => {
    const eng = engine.current;
    const p = eng.player;
    const s = eng.shadow;

    if (!p.isSliding) {
      p.isSliding = true;
      p.slideTimer = 22; // frames
      audio.slide();
    }
    if (!s.isSliding) {
      s.isSliding = true;
      s.slideTimer = 22;
    }
  };

  const triggerShift = () => {
    const eng = engine.current;
    if (eng.energyLevel < 12) return; // Costs energy

    eng.energyLevel = Math.max(0, eng.energyLevel - 12);
    setEnergy(Math.round(eng.energyLevel));
    audio.shift();

    // Swap tracks for Player and Shadow!
    eng.player.onTopTrack = !eng.player.onTopTrack;
    eng.shadow.onTopTrack = !eng.shadow.onTopTrack;

    // Burst particle effect
    for (let i = 0; i < 16; i++) {
      eng.particles.push({
        x: eng.player.x,
        y: eng.player.onTopTrack ? eng.topTrackY : eng.bottomTrackY,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 4 + 2,
        color: eng.player.onTopTrack ? '#38bdf8' : '#c084fc',
        life: 1,
      });
    }
  };

  const startGame = () => {
    const eng = engine.current;
    eng.speed = 6;
    eng.distanceMeter = 0;
    eng.coinsCollected = 0;
    eng.comboMultiplier = 1;
    eng.energyLevel = 100;
    eng.shieldActive = false;
    eng.slowTimeActive = false;
    eng.obstacles = [];
    eng.particles = [];
    eng.powerups = [];
    eng.floatingTexts = [];
    eng.currentEvent = null;
    eng.eventTimer = 0;
    eng.nextEventIn = 20;

    eng.player = {
      x: 100,
      y: eng.topTrackY,
      vy: 0,
      width: 24,
      height: 36,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      onTopTrack: true,
    };

    eng.shadow = {
      x: 100,
      y: eng.bottomTrackY,
      vy: 0,
      width: 24,
      height: 36,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      onTopTrack: false,
    };

    setGameState('PLAYING');
    setScore(0);
    setDistance(0);
    setCombo(1);
    setCoins(0);
    setEnergy(100);
    setActiveEvent(null);
  };

  // Main Canvas Render & Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spawnObstacle = () => {
      const eng = engine.current;
      const onTop = Math.random() > 0.5;
      const typeRoll = Math.random();
      let type = 'SPIKE';

      if (typeRoll < 0.4) {
        type = 'SPIKE';
      } else if (typeRoll < 0.7) {
        type = 'LASER';
      } else {
        type = 'WALL';
      }

      eng.obstacles.push({
        x: canvas.width + 50,
        onTopTrack: onTop,
        type,
        width: type === 'WALL' ? 24 : type === 'LASER' ? 60 : 28,
        height: type === 'WALL' ? 45 : type === 'LASER' ? 14 : 26,
        passed: false,
      });

      // Spawn Coins / Powerups
      if (Math.random() < 0.6) {
        eng.powerups.push({
          x: canvas.width + 120,
          onTopTrack: !onTop,
          type: Math.random() < 0.7 ? 'ENERGY' : Math.random() < 0.85 ? 'COIN' : 'SHIELD',
          radius: 10,
        });
      }
    };

    let obstacleTimer = 0;

    const gameLoop = (time) => {
      const eng = engine.current;
      const dt = 1 / 60;

      // Update distance & speed
      eng.distanceMeter += eng.speed * 0.1;
      const curDist = Math.floor(eng.distanceMeter);
      setDistance(curDist);
      setScore(Math.floor(curDist * eng.comboMultiplier + eng.coinsCollected * 50));

      // Gradual acceleration
      eng.speed = 6 + Math.min(10, curDist / 400);

      // Energy auto-refill
      eng.energyLevel = Math.min(100, eng.energyLevel + 0.05);
      setEnergy(Math.round(eng.energyLevel));

      // Random Event Engine Logic (Every 25 seconds)
      eng.nextEventIn -= dt;
      if (eng.nextEventIn <= 0) {
        const events = ['BLACKOUT', 'MIRROR', 'GIANT', 'SHADOW_RAIN'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        eng.currentEvent = chosen;
        eng.eventTimer = 10; // Lasts 10s
        eng.nextEventIn = 25;
        setActiveEvent(chosen);
      }

      if (eng.currentEvent) {
        eng.eventTimer -= dt;
        setEventTimeLeft(Math.ceil(eng.eventTimer));
        if (eng.eventTimer <= 0) {
          eng.currentEvent = null;
          setActiveEvent(null);
        }
      }

      // Spawn obstacles periodically
      obstacleTimer++;
      const spawnInterval = Math.max(35, 90 - Math.floor(eng.speed * 3.5));
      if (obstacleTimer > spawnInterval) {
        spawnObstacle();
        obstacleTimer = 0;
      }

      // --- UPDATE PLAYER & SHADOW PHYSICS ---
      [eng.player, eng.shadow].forEach((char) => {
        const groundY = char.onTopTrack ? eng.topTrackY : eng.bottomTrackY;

        // Apply gravity
        char.vy += 0.6;
        char.y += char.vy;

        // Ground collision
        if (char.y >= groundY) {
          char.y = groundY;
          char.vy = 0;
          char.isJumping = false;
        }

        // Slide timer
        if (char.isSliding) {
          char.slideTimer--;
          if (char.slideTimer <= 0) {
            char.isSliding = false;
          }
        }
      });

      // --- UPDATE OBSTACLES & COLLISIONS ---
      for (let i = eng.obstacles.length - 1; i >= 0; i--) {
        const obs = eng.obstacles[i];
        const moveSpeed = eng.slowTimeActive ? eng.speed * 0.5 : eng.speed;
        obs.x -= moveSpeed;

        // Check collision with Player or Shadow depending on which is on this track
        const targetChar = eng.player.onTopTrack === obs.onTopTrack ? eng.player : eng.shadow;
        const charY = targetChar.y - (targetChar.isSliding ? 18 : targetChar.height);
        const charHeight = targetChar.isSliding ? 18 : targetChar.height;

        const obsY = obs.onTopTrack ? eng.topTrackY - obs.height : eng.bottomTrackY - obs.height;

        // AABB Collision check
        const overlapX = targetChar.x < obs.x + obs.width && targetChar.x + targetChar.width > obs.x;
        const overlapY = charY < obsY + obs.height && charY + charHeight > obsY;

        if (overlapX && overlapY) {
          if (eng.shieldActive) {
            eng.shieldActive = false;
            eng.obstacles.splice(i, 1);
            audio.hit();
            continue;
          }

          // GAMEOVER
          audio.hit();
          setGameState('GAMEOVER');
          if (curDist > highScore) {
            setHighScore(curDist);
            localStorage.setItem('shadow_shift_high_score', curDist.toString());
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
          return;
        }

        // Close call detection (Passed close without hitting)
        if (!obs.passed && obs.x + obs.width < targetChar.x) {
          obs.passed = true;
          const distToObs = Math.abs(charY - obsY);
          if (distToObs < 45) {
            eng.comboMultiplier = Math.min(5, eng.comboMultiplier + 1);
            setCombo(eng.comboMultiplier);
            audio.closeCall();
            setCloseCallNotice(`🔥 CLOSE CALL! ×${eng.comboMultiplier}`);
            setTimeout(() => setCloseCallNotice(null), 1200);
          }
        }

        // Remove off-screen obstacles
        if (obs.x < -100) {
          eng.obstacles.splice(i, 1);
        }
      }

      // --- UPDATE POWERUPS & COINS ---
      for (let i = eng.powerups.length - 1; i >= 0; i--) {
        const p = eng.powerups[i];
        p.x -= eng.speed;

        const targetChar = eng.player.onTopTrack === p.onTopTrack ? eng.player : eng.shadow;
        const charY = targetChar.y - 18;

        const pY = p.onTopTrack ? eng.topTrackY - 24 : eng.bottomTrackY - 24;

        const dx = targetChar.x - p.x;
        const dy = charY - pY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 28) {
          if (p.type === 'ENERGY') {
            eng.energyLevel = Math.min(100, eng.energyLevel + 30);
            setEnergy(Math.round(eng.energyLevel));
            audio.coin();
          } else if (p.type === 'COIN') {
            eng.coinsCollected += 1;
            setCoins(eng.coinsCollected);
            audio.coin();
          } else if (p.type === 'SHIELD') {
            eng.shieldActive = true;
            audio.coin();
          }
          eng.powerups.splice(i, 1);
        } else if (p.x < -50) {
          eng.powerups.splice(i, 1);
        }
      }

      // --- CANVAS DRAWING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Environment Color Theme based on distance
      let bgColor = '#0A1128';
      let trackColor = '#1e293b';
      let accentGlow = '#38bdf8';

      if (curDist > 6000) {
        bgColor = '#030712';
        accentGlow = '#f43f5e';
      } else if (curDist > 3000) {
        bgColor = '#2B0918';
        accentGlow = '#fb923c';
      } else if (curDist > 1000) {
        bgColor = '#1A0B2E';
        accentGlow = '#c084fc';
      }

      // Background Fill
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tracks Line Drawing
      ctx.strokeStyle = trackColor;
      ctx.lineWidth = 3;

      // Top Ground
      ctx.beginPath();
      ctx.moveTo(0, eng.topTrackY);
      ctx.lineTo(canvas.width, eng.topTrackY);
      ctx.stroke();

      // Bottom Ground
      ctx.beginPath();
      ctx.moveTo(0, eng.bottomTrackY);
      ctx.lineTo(canvas.width, eng.bottomTrackY);
      ctx.stroke();

      // Divider Dotted Line between tracks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, (eng.topTrackY + eng.bottomTrackY) / 2);
      ctx.lineTo(canvas.width, (eng.topTrackY + eng.bottomTrackY) / 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // --- DRAW OBSTACLES ---
      eng.obstacles.forEach((obs) => {
        const obsY = obs.onTopTrack ? eng.topTrackY : eng.bottomTrackY;

        if (obs.type === 'SPIKE') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(obs.x, obsY);
          ctx.lineTo(obs.x + obs.width / 2, obsY - obs.height);
          ctx.lineTo(obs.x + obs.width, obsY);
          ctx.closePath();
          ctx.fill();
        } else if (obs.type === 'LASER') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.fillRect(obs.x, obsY - obs.height - 10, obs.width, obs.height);
          ctx.strokeStyle = '#f87171';
          ctx.strokeRect(obs.x, obsY - obs.height - 10, obs.width, obs.height);
        } else if (obs.type === 'WALL') {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(obs.x, obsY - obs.height, obs.width, obs.height);
          ctx.strokeStyle = '#fde047';
          ctx.strokeRect(obs.x, obsY - obs.height, obs.width, obs.height);
        }
      });

      // --- DRAW POWERUPS ---
      eng.powerups.forEach((p) => {
        const pY = p.onTopTrack ? eng.topTrackY - 20 : eng.bottomTrackY - 20;

        ctx.beginPath();
        ctx.arc(p.x, pY, p.radius, 0, Math.PI * 2);
        if (p.type === 'ENERGY') {
          ctx.fillStyle = '#38bdf8';
        } else if (p.type === 'COIN') {
          ctx.fillStyle = '#facc15';
        } else {
          ctx.fillStyle = '#34d399';
        }
        ctx.fill();
      });

      // --- DRAW PLAYER CHARACTER ---
      const p = eng.player;
      const pY = p.y - (p.isSliding ? 18 : p.height);
      const pHeight = p.isSliding ? 18 : p.height;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';

      ctx.fillRect(p.x, pY, p.width, pHeight);

      // Player Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x + p.width - 6, pY + 6, 4, 4);
      ctx.restore();

      // --- DRAW SHADOW CHARACTER ---
      const s = eng.shadow;
      const sY = s.y - (s.isSliding ? 18 : s.height);
      const sHeight = s.isSliding ? 18 : s.height;
      const shadowScale = eng.currentEvent === 'GIANT' ? 1.5 : 1;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#c084fc';
      ctx.fillStyle = '#c084fc';

      ctx.fillRect(s.x, sY, s.width * shadowScale, sHeight * shadowScale);

      // Shadow Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.x + (s.width * shadowScale) - 6, sY + 6, 4, 4);
      ctx.restore();

      // --- DRAW PARTICLES ---
      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const pt = eng.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.05;

        if (pt.life <= 0) {
          eng.particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // --- BLACKOUT RANDOM EVENT SPOTLIGHT OVERLAY ---
      if (eng.currentEvent === 'BLACKOUT') {
        const grad = ctx.createRadialGradient(p.x, p.y - 18, 20, p.x, p.y - 18, 140);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Controls Bar */}
      <div className="bg-[#0D1117] bg-theme-card border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDoor}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>DOOR SIMULATOR</span>
          </button>

          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-extrabold text-slate-100 text-theme-title font-mono uppercase tracking-wider">
              🌑 SHADOW SHIFT v1.0
            </h2>
          </div>
        </div>

        {/* Highscore & Energy indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-xl text-purple-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>BEST: <strong>{highScore} m</strong></span>
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
      <div className="bg-[#090D14] bg-theme-card border-2 border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        
        {/* Active Random Event Notice Banner */}
        {activeEvent && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-purple-500/20 border-2 border-purple-400 text-purple-200 px-4 py-1.5 rounded-full font-mono text-xs font-bold flex items-center gap-2 animate-bounce z-20 shadow-lg">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>EVENT: {activeEvent} ({eventTimeLeft}s)</span>
          </div>
        )}

        {/* Close Call Floating Text */}
        {closeCallNotice && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-400 text-amber-300 px-3 py-1 rounded-xl font-mono text-xs font-extrabold animate-pulse z-20">
            {closeCallNotice}
          </div>
        )}

        {/* Canvas HUD Overlay */}
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-[800px] flex items-center justify-between mb-3 text-xs font-mono font-bold text-slate-200 px-2">
            <div className="flex items-center gap-4">
              <span>DISTANCE: <strong className="text-amber-400 text-sm">{distance} m</strong></span>
              <span>COMBO: <strong className="text-emerald-400 text-sm">×{combo}</strong></span>
              <span>COINS: <strong className="text-yellow-400 text-sm">🪙 {coins}</strong></span>
            </div>

            {/* Energy Bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">SHADOW ENERGY:</span>
              <div className="w-28 h-3 bg-slate-900 border border-slate-700 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full transition-all"
                  style={{ width: `${energy}%` }}
                />
              </div>
              <span className="text-xs text-sky-400">{energy}%</span>
            </div>
          </div>
        )}

        {/* HTML5 Canvas Element */}
        <div className="relative w-full max-w-[800px] aspect-[2/1] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />

          {/* MENU OVERLAY */}
          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-xl shadow-purple-500/20 animate-pulse">
                🌑
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-wider text-slate-100 uppercase">
                  SHADOW SHIFT
                </h3>
                <p className="text-xs text-purple-300 font-semibold mt-1">
                  "The longer you survive, the less you can see."
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-left text-xs text-slate-300 space-y-2 max-w-sm">
                <p className="font-bold text-amber-400 border-b border-slate-800 pb-1">🕹️ CONTROLS:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">SPACE</kbd> / <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↑</kbd> : Jump</div>
                  <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↓</kbd> : Slide</div>
                  <div className="col-span-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">SHIFT</kbd> : Swap Track with Shadow</div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START SHADOW RUN</span>
              </button>
            </div>
          )}

          {/* GAMEOVER OVERLAY */}
          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <h3 className="text-3xl font-black text-rose-500 uppercase tracking-widest animate-pulse">
                💀 RUN OVER
              </h3>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs space-y-2 w-64">
                <div className="flex justify-between">
                  <span className="text-slate-400">DISTANCE:</span>
                  <span className="font-bold text-amber-300">{distance} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BEST DISTANCE:</span>
                  <span className="font-bold text-purple-400">{highScore} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FINAL COMBO:</span>
                  <span className="font-bold text-emerald-400">×{combo}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">COINS COLLECTED:</span>
                  <span className="font-bold text-yellow-400">🪙 {coins}</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile & On-Screen Touch Control Pad */}
        <div className="mt-5 w-full max-w-[800px] grid grid-cols-3 gap-3 font-mono">
          <button
            onClick={triggerJump}
            className="py-3.5 rounded-2xl bg-sky-500/20 border-2 border-sky-500/40 hover:bg-sky-500/30 text-sky-300 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <span>⬆️ JUMP</span>
            <span className="text-[10px] opacity-60">(SPACE)</span>
          </button>

          <button
            onClick={triggerSlide}
            className="py-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <span>⬇️ SLIDE</span>
            <span className="text-[10px] opacity-60">(DOWN)</span>
          </button>

          <button
            onClick={triggerShift}
            className="py-3.5 rounded-2xl bg-purple-500/20 border-2 border-purple-500/40 hover:bg-purple-500/30 text-purple-300 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <span>⚡ SHIFT TRACK</span>
            <span className="text-[10px] opacity-60">(SHIFT)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
