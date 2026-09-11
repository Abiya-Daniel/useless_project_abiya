import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, Gamepad2, ArrowUp, ArrowDown, ArrowLeft as LeftIcon, ArrowRight as RightIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

class SnakeAudio {
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
  eat() { this.playTone(880, 'sine', 0.1); }
  die() { this.playTone(120, 'sawtooth', 0.3); }
}

const audio = new SnakeAudio();

export default function SnakeGame({ onBackToDoor }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'GAMEOVER'
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('kerala_snake_high_score') || '0', 10);
  });
  const [soundMuted, setSoundMuted] = useState(false);

  const engine = useRef({
    gridSize: 20,
    tileCount: 20,
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15, type: '🥐', pts: 10 },
    dx: 1,
    dy: 0,
    speedMs: 100,
    score: 0,
  });

  useEffect(() => { audio.muted = soundMuted; }, [soundMuted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const eng = engine.current;
      if (gameState === 'PLAYING') {
        if ((e.code === 'ArrowUp' || e.code === 'KeyW') && eng.dy !== 1) {
          eng.dx = 0; eng.dy = -1;
        } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && eng.dy !== -1) {
          eng.dx = 0; eng.dy = 1;
        } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && eng.dx !== 1) {
          eng.dx = -1; eng.dy = 0;
        } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && eng.dx !== -1) {
          eng.dx = 1; eng.dy = 0;
        }
      } else if (gameState === 'MENU' && e.code === 'Space') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const setDir = (dir) => {
    const eng = engine.current;
    if (dir === 'UP' && eng.dy !== 1) { eng.dx = 0; eng.dy = -1; }
    if (dir === 'DOWN' && eng.dy !== -1) { eng.dx = 0; eng.dy = 1; }
    if (dir === 'LEFT' && eng.dx !== 1) { eng.dx = -1; eng.dy = 0; }
    if (dir === 'RIGHT' && eng.dx !== -1) { eng.dx = 1; eng.dy = 0; }
  };

  const spawnFood = () => {
    const eng = engine.current;
    const items = [
      { type: '🥐', pts: 10 },
      { type: '☕', pts: 25 },
      { type: '🪙', pts: 50 },
    ];
    const picked = items[Math.floor(Math.random() * items.length)];
    eng.food = {
      x: Math.floor(Math.random() * eng.tileCount),
      y: Math.floor(Math.random() * eng.tileCount),
      ...picked
    };
  };

  const startGame = () => {
    const eng = engine.current;
    let spd = 100;
    if (difficulty === 'EASY') spd = 130;
    if (difficulty === 'HARD') spd = 70;

    eng.speedMs = spd;
    eng.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    eng.dx = 1;
    eng.dy = 0;
    eng.score = 0;
    spawnFood();
    setScore(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      const eng = engine.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const head = { x: eng.snake[0].x + eng.dx, y: eng.snake[0].y + eng.dy };

      // Wall Collision Check
      if (head.x < 0 || head.x >= eng.tileCount || head.y < 0 || head.y >= eng.tileCount) {
        audio.die();
        setGameState('GAMEOVER');
        if (eng.score > highScore) {
          setHighScore(eng.score);
          localStorage.setItem('kerala_snake_high_score', eng.score.toString());
          confetti({ particleCount: 80, spread: 60 });
        }
        return;
      }

      // Self Collision Check
      for (let i = 0; i < eng.snake.length; i++) {
        if (eng.snake[i].x === head.x && eng.snake[i].y === head.y) {
          audio.die();
          setGameState('GAMEOVER');
          return;
        }
      }

      eng.snake.unshift(head);

      // Food Collision Check
      if (head.x === eng.food.x && head.y === eng.food.y) {
        eng.score += eng.food.pts;
        setScore(eng.score);
        audio.eat();
        spawnFood();
      } else {
        eng.snake.pop();
      }

      // --- CANVAS DRAWING ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < eng.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * eng.gridSize, 0);
        ctx.lineTo(i * eng.gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * eng.gridSize);
        ctx.lineTo(canvas.width, i * eng.gridSize);
        ctx.stroke();
      }

      // Draw Food
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        eng.food.type, 
        eng.food.x * eng.gridSize + eng.gridSize / 2, 
        eng.food.y * eng.gridSize + eng.gridSize / 2
      );

      // Draw Snake
      eng.snake.forEach((part, idx) => {
        ctx.fillStyle = idx === 0 ? '#38bdf8' : '#34d399';
        ctx.beginPath();
        ctx.roundRect(
          part.x * eng.gridSize + 1, 
          part.y * eng.gridSize + 1, 
          eng.gridSize - 2, 
          eng.gridSize - 2, 
          4
        );
        ctx.fill();
      });

    }, engine.current.speedMs);

    return () => clearInterval(interval);
  }, [gameState, difficulty, highScore]);

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
            <span className="text-2xl">🐍</span>
            <h2 className="text-base font-extrabold text-slate-100 uppercase tracking-wider">
              CANTEEN SNAKE v1.0
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-xl text-emerald-300">
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
      <div className="bg-[#090D14] bg-theme-card border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-[400px] bg-[#0D1117] border border-slate-800 p-2.5 rounded-2xl mb-3 flex items-center justify-between text-xs font-mono font-bold text-slate-200">
            <span>LIVE SCORE: <strong className="text-amber-400 text-sm">{score}</strong></span>
            <span>SPEED: <strong className="text-emerald-400">{difficulty}</strong></span>
          </div>
        )}

        <div className="relative w-[400px] h-[400px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
          <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />

          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-xl animate-bounce">
                🐍
              </div>
              <h3 className="text-2xl font-black text-slate-100 uppercase">CANTEEN SNAKE</h3>
              <p className="text-xs text-emerald-300">Eat Samosas & Chai to grow long!</p>

              <div className="flex gap-2">
                {['EASY', 'MEDIUM', 'HARD'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1 rounded-xl border text-xs font-bold ${difficulty === d ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm tracking-wider shadow-lg hover:brightness-110 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START GAME</span>
              </button>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 font-mono">
              <h3 className="text-3xl font-black text-rose-500 uppercase tracking-widest animate-pulse">💥 GAME OVER</h3>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-1 w-48">
                <div>FINAL SCORE: <strong className="text-amber-400">{score}</strong></div>
                <div>BEST SCORE: <strong className="text-emerald-400">{highScore}</strong></div>
              </div>
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider shadow-lg flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          )}
        </div>

        {/* D-Pad Touch Controls */}
        <div className="mt-4 grid grid-cols-3 gap-2 w-48 font-mono">
          <div />
          <button onClick={() => setDir('UP')} className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex justify-center"><ArrowUp className="w-5 h-5" /></button>
          <div />
          <button onClick={() => setDir('LEFT')} className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex justify-center"><LeftIcon className="w-5 h-5" /></button>
          <button onClick={() => setDir('DOWN')} className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex justify-center"><ArrowDown className="w-5 h-5" /></button>
          <button onClick={() => setDir('RIGHT')} className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex justify-center"><RightIcon className="w-5 h-5" /></button>
        </div>

      </div>
    </div>
  );
}
