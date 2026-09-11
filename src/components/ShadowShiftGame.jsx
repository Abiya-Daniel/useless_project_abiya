import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Sparkles, Pause, ArrowLeft, Gamepad2, Trophy, Award, Clock, Flame, CheckCircle } from 'lucide-react';
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
  const [difficulty, setDifficulty] = useState('MEDIUM'); // 'EASY', 'MEDIUM', 'HARD', 'EXPERT'
  
  // Live HUD States
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elapsedTimeStr, setElapsedTimeStr] = useState('00:00');
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

  // Game Engine Mutable References (Prevents re-triggering React useEffect loops)
  const engine = useRef({
    animId: null,
    lastTime: 0,
    startTime: 0,
    elapsedSeconds: 0,
    speed: 6,
    distanceMeter: 0,
    calculatedScore: 0,
    coinsCollected: 0,
    comboMultiplier: 1,
    energyLevel: 100,
    shieldActive: false,
    shieldsLeft: 0,
    slowTimeActive: false,
    scoreMultiplier: 1,
    frameCount: 0,
    
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

    // Random Event Engine
    currentEvent: null, // 'BLACKOUT', 'MIRROR', 'GIANT', 'SHADOW_RAIN'
    eventTimer: 0,
    nextEventIn: 20,

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
  }, [gameState, difficulty]);

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
      p.slideTimer = 22;
      audio.slide();
    }
    if (!s.isSliding) {
      s.isSliding = true;
      s.slideTimer = 22;
    }
  };

  const triggerShift = () => {
    const eng = engine.current;
    if (eng.energyLevel < 10) return;

    eng.energyLevel = Math.max(0, eng.energyLevel - 10);
    setEnergy(Math.round(eng.energyLevel));
    audio.shift();

    eng.player.onTopTrack = !eng.player.onTopTrack;
    eng.shadow.onTopTrack = !eng.shadow.onTopTrack;

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

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    const eng = engine.current;
    
    let startSpeed = 6;
    let scoreMult = 1;
    let initialShields = 0;

    if (difficulty === 'EASY') {
      startSpeed = 4.5;
      scoreMult = 0.8;
      initialShields = 3;
    } else if (difficulty === 'MEDIUM') {
      startSpeed = 6.0;
      scoreMult = 1.0;
      initialShields = 1;
    } else if (difficulty === 'HARD') {
      startSpeed = 8.5;
      scoreMult = 1.5;
      initialShields = 0;
    } else if (difficulty === 'EXPERT') {
      startSpeed = 11.0;
      scoreMult = 2.5;
      initialShields = 0;
    }

    eng.startTime = Date.now();
    eng.elapsedSeconds = 0;
    eng.frameCount = 0;
    eng.speed = startSpeed;
    eng.scoreMultiplier = scoreMult;
    eng.shieldsLeft = initialShields;
    eng.shieldActive = initialShields > 0;
    eng.distanceMeter = 0;
    eng.calculatedScore = 0;
    eng.coinsCollected = 0;
    eng.comboMultiplier = 1;
    eng.energyLevel = 100;
    eng.slowTimeActive = false;
    eng.obstacles = [];
    eng.particles = [];
    eng.powerups = [];
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
    setElapsedTimeStr('00:00');
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

    const gameLoop = () => {
      const eng = engine.current;
      const dt = 1 / 60;
      eng.frameCount++;

      // Update elapsed time
      eng.elapsedSeconds = (Date.now() - eng.startTime) / 1000;

      // Update distance & live calculated score
      eng.distanceMeter += eng.speed * 0.12;
      const curDist = Math.floor(eng.distanceMeter);
      
      // LIVE TIME SCORE CALCULATION: (Distance * Combo + Elapsed Seconds * 25 + Coins * 50) * Multiplier
      eng.calculatedScore = Math.floor(
        (eng.distanceMeter * eng.comboMultiplier + eng.elapsedSeconds * 25 + eng.coinsCollected * 50) * eng.scoreMultiplier
      );

      // Throttled UI state updates every 4 frames (~15 FPS) to keep React UI smooth without loop resets
      if (eng.frameCount % 4 === 0) {
        setDistance(curDist);
        setScore(eng.calculatedScore);
        setElapsedTimeStr(formatTime(eng.elapsedSeconds));
      }

      // Gradual speed acceleration
      const accelRate = difficulty === 'EXPERT' ? 300 : difficulty === 'HARD' ? 350 : 450;
      eng.speed = (difficulty === 'EASY' ? 4.5 : difficulty === 'HARD' ? 8.5 : difficulty === 'EXPERT' ? 11.0 : 6.0) + Math.min(8, curDist / accelRate);

      // Energy refill
      const refillSpeed = difficulty === 'EASY' ? 0.08 : 0.05;
      eng.energyLevel = Math.min(100, eng.energyLevel + refillSpeed);
      if (eng.frameCount % 6 === 0) {
        setEnergy(Math.round(eng.energyLevel));
      }

      // Random Event Engine Logic (Every 20 seconds)
      eng.nextEventIn -= dt;
      if (eng.nextEventIn <= 0) {
        const events = ['BLACKOUT', 'MIRROR', 'GIANT', 'SHADOW_RAIN'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        eng.currentEvent = chosen;
        eng.eventTimer = 10;
        eng.nextEventIn = 20;
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

      // Obstacle spawner
      obstacleTimer++;
      const baseInterval = difficulty === 'EXPERT' ? 35 : difficulty === 'HARD' ? 45 : difficulty === 'EASY' ? 75 : 60;
      const spawnInterval = Math.max(25, baseInterval - Math.floor(eng.speed * 2));
      if (obstacleTimer > spawnInterval) {
        spawnObstacle();
        obstacleTimer = 0;
      }

      // --- PLAYER & SHADOW PHYSICS ---
      [eng.player, eng.shadow].forEach((char) => {
        const groundY = char.onTopTrack ? eng.topTrackY : eng.bottomTrackY;

        char.vy += 0.6;
        char.y += char.vy;

        if (char.y >= groundY) {
          char.y = groundY;
          char.vy = 0;
          char.isJumping = false;
        }

        if (char.isSliding) {
          char.slideTimer--;
          if (char.slideTimer <= 0) {
            char.isSliding = false;
          }
        }
      });

      // --- OBSTACLES & COLLISIONS ---
      for (let i = eng.obstacles.length - 1; i >= 0; i--) {
        const obs = eng.obstacles[i];
        const moveSpeed = eng.slowTimeActive ? eng.speed * 0.5 : eng.speed;
        obs.x -= moveSpeed;

        const targetChar = eng.player.onTopTrack === obs.onTopTrack ? eng.player : eng.shadow;
        const charY = targetChar.y - (targetChar.isSliding ? 18 : targetChar.height);
        const charHeight = targetChar.isSliding ? 18 : targetChar.height;

        const obsY = obs.onTopTrack ? eng.topTrackY - obs.height : eng.bottomTrackY - obs.height;

        const overlapX = targetChar.x < obs.x + obs.width && targetChar.x + targetChar.width > obs.x;
        const overlapY = charY < obsY + obs.height && charY + charHeight > obsY;

        if (overlapX && overlapY) {
          if (eng.shieldsLeft > 0 || eng.shieldActive) {
            if (eng.shieldsLeft > 0) eng.shieldsLeft--;
            if (eng.shieldsLeft <= 0) eng.shieldActive = false;
            
            eng.obstacles.splice(i, 1);
            audio.hit();
            continue;
          }

          // GAMEOVER
          audio.hit();
          setGameState('GAMEOVER');
          if (eng.calculatedScore > highScore) {
            setHighScore(eng.calculatedScore);
            localStorage.setItem('shadow_shift_high_score', eng.calculatedScore.toString());
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
          return;
        }

        // Close Call detection
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

        if (obs.x < -100) {
          eng.obstacles.splice(i, 1);
        }
      }

      // --- POWERUPS & COINS ---
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
            eng.shieldsLeft += 1;
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

      let bgColor = '#0A1128';
      let trackColor = '#1e293b';

      if (curDist > 6000) {
        bgColor = '#030712';
      } else if (curDist > 3000) {
        bgColor = '#2B0918';
      } else if (curDist > 1000) {
        bgColor = '#1A0B2E';
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = trackColor;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(0, eng.topTrackY);
      ctx.lineTo(canvas.width, eng.topTrackY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, eng.bottomTrackY);
      ctx.lineTo(canvas.width, eng.bottomTrackY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, (eng.topTrackY + eng.bottomTrackY) / 2);
      ctx.lineTo(canvas.width, (eng.topTrackY + eng.bottomTrackY) / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw obstacles
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

      // Draw powerups
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

      // Draw player character
      const p = eng.player;
      const pY = p.y - (p.isSliding ? 18 : p.height);
      const pHeight = p.isSliding ? 18 : p.height;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';

      ctx.fillRect(p.x, pY, p.width, pHeight);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x + p.width - 6, pY + 6, 4, 4);
      ctx.restore();

      // Draw shadow character
      const s = eng.shadow;
      const sY = s.y - (s.isSliding ? 18 : s.height);
      const sHeight = s.isSliding ? 18 : s.height;
      const shadowScale = eng.currentEvent === 'GIANT' ? 1.5 : 1;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#c084fc';
      ctx.fillStyle = '#c084fc';

      ctx.fillRect(s.x, sY, s.width * shadowScale, sHeight * shadowScale);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.x + (s.width * shadowScale) - 6, sY + 6, 4, 4);
      ctx.restore();

      // Draw particles
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

      // Blackout event spotlight overlay
      if (eng.currentEvent === 'BLACKOUT') {
        const grad = ctx.createRadialGradient(p.x, p.y - 18, 20, p.x, p.y - 18, 140);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // CONTINUOUS DIRECT CANVAS LIVE HUD READOUT (60 FPS INSTANT MOVING DISTANCE & SCORE)
      ctx.save();
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`SCORE: ${eng.calculatedScore}`, 16, 28);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`DISTANCE: ${curDist}m`, 160, 28);

      ctx.fillStyle = '#34d399';
      ctx.fillText(`TIME: ${formatTime(eng.elapsedSeconds)}`, 310, 28);

      ctx.fillStyle = '#c084fc';
      ctx.fillText(`ENERGY: ${Math.round(eng.energyLevel)}%`, 430, 28);
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, difficulty, highScore]);

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
            <span>HIGH SCORE: <strong>{highScore}</strong></span>
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

        {/* CONTINUOUS LIVE PLAYING HUD HEADER */}
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-[800px] bg-[#0D1117]/90 backdrop-blur border border-slate-800 p-3 rounded-2xl mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold text-slate-200 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              {/* LIVE TIME SCORE */}
              <span className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>SCORE: <strong className="text-amber-400 text-sm font-extrabold">{score}</strong></span>
              </span>

              {/* LIVE MOVING DISTANCE */}
              <span className="bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <span className="text-sky-400">🏃</span>
                <span>DISTANCE: <strong className="text-sky-300 text-sm font-extrabold">{distance} m</strong></span>
              </span>

              {/* LIVE SURVIVAL TIME */}
              <span className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>TIME: <strong className="text-emerald-300 text-sm font-extrabold">{elapsedTimeStr}</strong></span>
              </span>

              <span>COMBO: <strong className="text-emerald-400 text-sm">×{combo}</strong></span>
              <span>COINS: <strong className="text-yellow-400 text-sm">🪙 {coins}</strong></span>
            </div>

            {/* Difficulty Badge & Energy Bar */}
            <div className="flex items-center gap-3">
              <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold border ${
                difficulty === 'EASY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                difficulty === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                difficulty === 'HARD' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}>
                {difficulty}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">ENERGY:</span>
                <div className="w-20 h-2.5 bg-slate-900 border border-slate-700 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full transition-all"
                    style={{ width: `${energy}%` }}
                  />
                </div>
                <span className="text-xs text-sky-400">{energy}%</span>
              </div>
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

          {/* MENU OVERLAY WITH DIFFICULTY SELECTOR */}
          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-xl shadow-purple-500/20 animate-pulse">
                🌑
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-wider text-slate-100 uppercase">
                  SHADOW SHIFT v1.0
                </h3>
                <p className="text-xs text-purple-300 font-semibold mt-1">
                  "The longer you survive, the less you can see."
                </p>
              </div>

              {/* Difficulty Selector Picker */}
              <div className="space-y-2 w-full max-w-sm">
                <label className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
                  🎯 SELECT GAME DIFFICULTY LEVEL:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'EASY', label: 'EASY 🟢', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40' },
                    { id: 'MEDIUM', label: 'MEDIUM 🟡', color: 'border-amber-500 text-amber-300 bg-amber-950/40' },
                    { id: 'HARD', label: 'HARD 🔴', color: 'border-rose-500 text-rose-300 bg-rose-950/40' },
                    { id: 'EXPERT', label: 'EXPERT 🔥', color: 'border-purple-500 text-purple-300 bg-purple-950/40' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
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

              {/* Controls Key map */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-left text-xs text-slate-300 space-y-1 max-w-sm">
                <p className="font-bold text-amber-400 border-b border-slate-800 pb-1 text-[11px]">🕹️ CONTROLS:</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700">SPACE</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700">↑</kbd> : Jump</div>
                  <div><kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700">↓</kbd> : Slide</div>
                  <div className="col-span-2"><kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700">SHIFT</kbd> : Swap Track with Shadow</div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START SHADOW RUN ({difficulty})</span>
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
                  <span className="text-slate-400">FINAL SCORE:</span>
                  <span className="font-bold text-amber-300">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SURVIVAL TIME:</span>
                  <span className="font-bold text-emerald-300">{elapsedTimeStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DISTANCE:</span>
                  <span className="font-bold text-sky-300">{distance} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HIGH SCORE:</span>
                  <span className="font-bold text-purple-400">{highScore}</span>
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
