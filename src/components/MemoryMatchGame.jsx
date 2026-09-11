import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Sparkles, Timer, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playServoSound } from '../utils/AudioEngine';

const CARD_ITEMS = [
  { id: 'chai', emoji: '☕', name: 'Canteen Chai' },
  { id: 'samosa', emoji: '🥐', name: 'Hot Samosa' },
  { id: 'auto', emoji: '🛺', name: 'Malabar Auto' },
  { id: 'degree', emoji: '📜', name: 'BTech Certificate' },
  { id: 'backlog', emoji: '📄', name: 'Backlog Paper' },
  { id: 'bus', emoji: '🎟️', name: 'KSRTC Bus Pass' },
  { id: 'phone', emoji: '📱', name: 'Instagram Reels' },
  { id: 'helmet', emoji: '🪖', name: 'College Helmet' },
];

export default function MemoryMatchGame({ onBackToDoor }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    return localStorage.getItem('memory_match_best_moves') || null;
  });

  const initializeDeck = () => {
    // Duplicate 8 items to make 16 cards
    const deck = [...CARD_ITEMS, ...CARD_ITEMS].map((item, index) => ({
      uniqueId: index,
      ...item,
    }));
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setIsTimerRunning(false);
  };

  useEffect(() => {
    initializeDeck();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && matched.length < CARD_ITEMS.length * 2) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, matched]);

  // Match check logic
  useEffect(() => {
    if (flipped.length === 2) {
      const [firstIndex, secondIndex] = flipped;
      const card1 = cards[firstIndex];
      const card2 = cards[secondIndex];

      if (card1.id === card2.id) {
        setMatched(prev => [...prev, firstIndex, secondIndex]);
        setFlipped([]);
        playSuccessChime();
      } else {
        const timer = setTimeout(() => {
          setFlipped([]);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [flipped, cards]);

  // Check victory
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setIsTimerRunning(false);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

      if (!bestScore || moves < Number(bestScore)) {
        setBestScore(moves);
        localStorage.setItem('memory_match_best_moves', moves);
      }
    }
  }, [matched, cards, moves, bestScore]);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    if (!isTimerRunning && matched.length < cards.length) {
      setIsTimerRunning(true);
    }

    if (flipped.length === 0) {
      setFlipped([index]);
    } else if (flipped.length === 1) {
      setFlipped([flipped[0], index]);
      setMoves(m => m + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDoor}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-all"
            title="Back to Smart Door"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎴</span>
              <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
                COLLEGE CAMPUS MEMORY MATCH
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                GAME 8 🎮
              </span>
            </div>
            <p className="text-xs text-slate-400 font-malayalam mt-0.5">
              Match 8 pairs of Kerala college items to claim attendance reward!
            </p>
          </div>
        </div>

        <button
          onClick={initializeDeck}
          className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESTART GAME</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#161B22] p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px] uppercase">Moves Count</span>
          <span className="text-xl font-black text-amber-400">{moves}</span>
        </div>

        <div className="bg-[#161B22] p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px] uppercase">Pairs Matched</span>
          <span className="text-xl font-black text-emerald-400">{matched.length / 2} / 8</span>
        </div>

        <div className="bg-[#161B22] p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px] uppercase">Timer Elapsed</span>
          <span className="text-xl font-black text-sky-400">{seconds}s</span>
        </div>

        <div className="bg-[#161B22] p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px] uppercase">Best Record</span>
          <span className="text-xl font-black text-rose-400">{bestScore ? `${bestScore} moves` : 'None'}</span>
        </div>
      </div>

      {/* 4x4 Grid Deck */}
      <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto aspect-square">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);

            return (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`rounded-2xl border-2 font-black text-3xl sm:text-4xl flex flex-col items-center justify-center transition-all duration-300 transform perspective-500 shadow-lg ${
                  isMatched
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-95 opacity-80'
                    : isFlipped
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 rotate-y-180'
                    : 'bg-[#0D1117] border-slate-800 text-slate-600 hover:border-amber-400/60 hover:scale-105'
                }`}
              >
                {isFlipped ? (
                  <span className="animate-fade-in">{card.emoji}</span>
                ) : (
                  <span className="text-xl opacity-40 font-mono">🌴</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Banner */}
        {cards.length > 0 && matched.length === cards.length && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-rose-500/20 border border-emerald-400 text-center font-mono space-y-2 animate-bounce">
            <h3 className="text-lg font-black text-emerald-300 uppercase">
              🎉 ALL PAIRS MATCHED IN {moves} MOVES!
            </h3>
            <p className="text-xs text-slate-200 font-malayalam">
              "Ayyo mone, super memory power! Innu classil keranda, veettil irunnu relax cheytho!" 🏆
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
