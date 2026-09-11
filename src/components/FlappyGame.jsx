import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, Gamepad2 } from 'lucide-react';
import confetti from 'canvas-confetti';

class FlappyAudio {
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
  playTone(freq, type = 'sine', duration = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
  flap() { this.playTone(400, 'sine', 0.1); }
  score() { this.playTone(880, 'sine', 0.12); }
  hit() { this.playTone(100, 'sawtooth', 0.3); }
}

const audio = new FlappyAudio();

export default function FlappyGame({ onBackToDoor }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'GAMEOVER'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('kerala_flappy_high_score') || '0', 10);
  });
  const [soundMuted, setSoundMuted] = useState(false);

  const engine = useRef({
    birdY: 200,
    vy: 0,
    gravity: 0.45,
    jumpImpulse: -7.5,
    pipes: [],
    frameCount: 0,
    score: 0,
  });

  useEffect(() => { audio.muted = soundMuted; }, [soundMuted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerFlap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const triggerFlap = () => {
    if (gameState === 'PLAYING') {
      engine.current.vy = engine.current.jumpImpulse;
      audio.flap();
    } else if (gameState === 'MENU' || gameState === 'GAMEOVER') {
      startGame();
    }
  };

  const startGame = () => {
    const eng = engine.current;
    eng.birdY = 200;
    eng.vy = 0;
    eng.pipes = [];
    eng.frameCount = 0;
    eng.score = 0;
    setScore(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spawnPipe = () => {
      const gap = 120;
      const minTop = 50;
      const maxTop = canvas.height - gap - 50;
      const topHeight = Math.floor(Math.random() * (maxTop - minTop) + minTop);

      engine.current.pipes.push({
        x: canvas.width + 40,
        topHeight,
        bottomY: topHeight + gap,
        passed: false,
      });
    };

    const gameLoop = () => {
      const eng = engine.current;
      eng.frameCount++;

      // Physics update
      eng.vy += eng.gravity;
      eng.birdY += eng.vy;

      // Ground / Ceiling Check
      if (eng.birdY >= canvas.height - 24 || eng.birdY <= 10) {
        audio.hit();
        setGameState('GAMEOVER');
        if (eng.score > highScore) {
          setHighScore(eng.score);
          localStorage.setItem('kerala_flappy_high_score', eng.score.toString());
          confetti({ particleCount: 80, spread: 60 });
        }
        return;
      }

      // Spawn Pipes
      if (eng.frameCount % 90 === 0) {
        spawnPipe();
      }

      // Update Pipes & Collisions
      const birdX = 80;
      const birdRadius = 14;

      for (let i = eng.pipes.length - 1; i >= 0; i--) {
        const p = eng.pipes[i];
        p.x -= 3;

        // Collision Check
        if (birdX + birdRadius > p.x && birdX - birdRadius < p.x + 48) {
          if (eng.birdY - birdRadius < p.topHeight || eng.birdY + birdRadius > p.bottomY) {
            audio.hit();
            setGameState('GAMEOVER');
            if (eng.score > highScore) {
              setHighScore(eng.score);
              localStorage.setItem('kerala_flappy_high_score', eng.score.toString());
              confetti({ particleCount: 80, spread: 60 });
            }
            return;
          }
        }

        // Score Check
        if (!p.passed && p.x + 48 < birdX) {
          p.passed = true;
          eng.score += 1;
          setScore(eng.score);
          audio.score();
        }

        if (p.x < -60) {
          eng.pipes.splice(i, 1);
        }
      }

      // --- CANVAS DRAWING ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Classroom Pillars (Pipes)
      eng.pipes.forEach((p) => {
        ctx.fillStyle = '#10b981';
        // Top Pipe
        ctx.fillRect(p.x, 0, 48, p.topHeight);
        // Bottom Pipe
        ctx.fillRect(p.x, p.bottomY, 48, canvas.height - p.bottomY);

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, 0, 48, p.topHeight);
        ctx.strokeRect(p.x, p.bottomY, 48, canvas.height - p.bottomY);
      });

      // Draw Flappy Bird (Student Avatar)
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(birdX, eng.birdY, birdRadius, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(birdX + 4, eng.birdY - 6, 4, 4);

      // Wing
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(birdX - 10, eng.birdY, 10, 6);
      ctx.restore();

      // Score HUD
      ctx.font = '800 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText(`SCORE: ${eng.score}`, canvas.width / 2, 35);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="space-y-4 font-sans max-w-2xl mx-auto">
      {/* Top Header */}
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
            <span className="text-2xl">🐥</span>
            <h2 className="text-base font-extrabold text-slate-100 uppercase tracking-wider">
              FLAPPY BTECH v1.0
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>BEST: <strong>{highScore}</strong></span>
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
        
        <div 
          onClick={triggerFlap}
          className="relative w-[380px] h-[480px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl cursor-pointer select-none"
        >
          <canvas ref={canvasRef} width={380} height={480} className="w-full h-full" />

          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-xl animate-bounce">
                🐥
              </div>
              <h3 className="text-2xl font-black text-slate-100 uppercase">FLAPPY BTECH</h3>
              <p className="text-xs text-amber-300">Tap / Press Space to fly between attendance pillars!</p>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-sm tracking-wider shadow-lg hover:brightness-110 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START FLYING</span>
              </button>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <h3 className="text-3xl font-black text-rose-500 uppercase tracking-widest animate-pulse">💥 CRASHED!</h3>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-1 w-48">
                <div>FINAL SCORE: <strong className="text-amber-400">{score}</strong></div>
                <div>BEST SCORE: <strong className="text-emerald-400">{highScore}</strong></div>
              </div>
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-sm tracking-wider shadow-lg flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={triggerFlap}
          className="mt-4 w-full max-w-[380px] py-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-300 font-mono font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
        >
          <span>🚀 TAP / SPACE TO FLAP</span>
        </button>

      </div>
    </div>
  );
}
