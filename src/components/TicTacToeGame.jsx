import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Sparkles, User, Cpu, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playServoSound } from '../utils/AudioEngine';

export default function TicTacToeGame({ onBackToDoor }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [difficulty, setDifficulty] = useState('MEDIUM'); // EASY, MEDIUM, HARD
  const [gameMode, setGameMode] = useState('AI'); // 'AI' or '2PLAYER'
  const [stats, setStats] = useState({ xWins: 0, oWins: 0, draws: 0 });
  const [statusMessage, setStatusMessage] = useState('Your Turn! You are X ❌');

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]            // Diagonals
  ];

  const calculateWinner = (squares) => {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    if (squares.every(s => s !== null)) return { winner: 'DRAW', line: [] };
    return null;
  };

  const winnerInfo = calculateWinner(board);

  // AI Move Logic
  useEffect(() => {
    if (gameMode === 'AI' && !isXNext && !winnerInfo) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, gameMode, winnerInfo]);

  // Handle Win/Draw state changes
  useEffect(() => {
    if (winnerInfo) {
      if (winnerInfo.winner === 'X') {
        setStats(prev => ({ ...prev, xWins: prev.xWins + 1 }));
        setStatusMessage('🎉 Player X Wins! Good Student Reward Unlocked!');
        playSuccessChime();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } else if (winnerInfo.winner === 'O') {
        setStats(prev => ({ ...prev, oWins: prev.oWins + 1 }));
        setStatusMessage(gameMode === 'AI' ? '🤖 AI Professor Wins! "Nee sradhichaal nannaakum!"' : '🎉 Player O Wins!');
        playServoSound(false);
      } else if (winnerInfo.winner === 'DRAW') {
        setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
        setStatusMessage('🤝 Match Drawn! Equal BTech Mindset!');
      }
    }
  }, [board]);

  const handleClick = (index) => {
    if (board[index] || winnerInfo) return;
    if (gameMode === 'AI' && !isXNext) return;

    const nextBoard = [...board];
    nextBoard[index] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  const makeAIMove = () => {
    const emptyIndices = board.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null);
    if (emptyIndices.length === 0) return;

    let targetIndex = null;

    if (difficulty === 'HARD') {
      // 1. Check if AI can win
      for (let idx of emptyIndices) {
        const testBoard = [...board];
        testBoard[idx] = 'O';
        if (calculateWinner(testBoard)?.winner === 'O') {
          targetIndex = idx;
          break;
        }
      }
      // 2. Block player X from winning
      if (targetIndex === null) {
        for (let idx of emptyIndices) {
          const testBoard = [...board];
          testBoard[idx] = 'X';
          if (calculateWinner(testBoard)?.winner === 'X') {
            targetIndex = idx;
            break;
          }
        }
      }
      // 3. Take center if available
      if (targetIndex === null && board[4] === null) targetIndex = 4;
    } else if (difficulty === 'MEDIUM') {
      // 50% smart, 50% random
      if (Math.random() > 0.4) {
        for (let idx of emptyIndices) {
          const testBoard = [...board];
          testBoard[idx] = 'X';
          if (calculateWinner(testBoard)?.winner === 'X') {
            targetIndex = idx;
            break;
          }
        }
      }
    }

    if (targetIndex === null) {
      targetIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    const nextBoard = [...board];
    nextBoard[targetIndex] = 'O';
    setBoard(nextBoard);
    setIsXNext(true);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setStatusMessage('Game Reset! Player X turn.');
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
              <span className="text-2xl">❌⭕</span>
              <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
                TIC-TAC-TOE PRO • X vs O
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                GAME 7 🎮
              </span>
            </div>
            <p className="text-xs text-slate-400 font-malayalam mt-0.5">
              Veettil irunnu Tic Tac Toe kalikku mone! Good student attendance reward.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <button
            onClick={() => {
              setGameMode(gameMode === 'AI' ? '2PLAYER' : 'AI');
              resetGame();
            }}
            className="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            {gameMode === 'AI' ? '🤖 VS AI PROFESSOR' : '👥 2 PLAYER MODE'}
          </button>

          <button
            onClick={resetGame}
            className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all"
            title="Reset Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Controls & Stats Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          
          {/* Difficulty Selector if AI mode */}
          {gameMode === 'AI' && (
            <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                🎯 AI BOT DIFFICULTY
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setDifficulty(level);
                      resetGame();
                    }}
                    className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                      difficulty === level
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Win Stats */}
          <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>SCORE BOARD</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-[#0D1117] p-3 rounded-2xl border border-slate-800">
                <div className="text-lg font-black text-rose-400">{stats.xWins}</div>
                <div className="text-[10px] text-slate-400">PLAYER X</div>
              </div>

              <div className="bg-[#0D1117] p-3 rounded-2xl border border-slate-800">
                <div className="text-lg font-black text-amber-400">{stats.draws}</div>
                <div className="text-[10px] text-slate-400">DRAWS</div>
              </div>

              <div className="bg-[#0D1117] p-3 rounded-2xl border border-slate-800">
                <div className="text-lg font-black text-sky-400">{stats.oWins}</div>
                <div className="text-[10px] text-slate-400">{gameMode === 'AI' ? 'AI BOT' : 'PLAYER O'}</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-center">
              <span className="text-slate-400">STATUS: </span>
              <strong className="text-amber-300 font-malayalam">{statusMessage}</strong>
            </div>
          </div>

        </div>

        {/* 3x3 Interactive Canvas Grid (8 cols) */}
        <div className="md:col-span-8">
          <div className="bg-[#161B22] bg-theme-card border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center">
            
            <div className="grid grid-cols-3 gap-3.5 w-full max-w-xs sm:max-w-sm aspect-square">
              {board.map((value, index) => {
                const isWinningSquare = winnerInfo?.line?.includes(index);

                return (
                  <button
                    key={index}
                    onClick={() => handleClick(index)}
                    className={`rounded-2xl border-2 font-black text-4xl sm:text-5xl flex items-center justify-center transition-all shadow-lg transform active:scale-95 ${
                      isWinningSquare
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                        : value === 'X'
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                        : value === 'O'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                        : 'bg-[#0D1117] border-slate-800 text-slate-600 hover:border-amber-400/50 hover:bg-slate-800/50'
                    }`}
                  >
                    {value === 'X' ? '❌' : value === 'O' ? '⭕' : ''}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={resetGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-mono text-xs font-black hover:brightness-110 shadow-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
