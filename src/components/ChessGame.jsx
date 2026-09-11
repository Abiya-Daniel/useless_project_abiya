import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ArrowLeft, RotateCcw, Trophy, Smartphone, Sparkles, Bot, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { playLockClickSound, playSuccessChime } from '../utils/AudioEngine';

const PIECE_SYMBOLS = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
};

const MANGLISH_CHESS_COMMENTS = [
  "White (You) played a brilliant opening move! Professor is sweating! ♟️",
  "AI Professor is thinking: 'Ithrem padicha monu chess polum ariyaam!'",
  "Knight jump! Canteen strategy activated! ♞",
  "Check! Professor's King is under threat!",
  "Attendance >75% Grandmaster mode activated! Take down the Professor!",
  "Pawn structure solid aanu mone! Win this game at home!",
];

export default function ChessGame({ onBackToDoor, onSwitchToLudo }) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [commentary, setCommentary] = useState('"Classil keriyilla, pakshe Chess-il Grandmaster aavu!" ♟️');
  const [history, setHistory] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');

  // AI Black Bot Turn Effect
  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      const timer = setTimeout(() => {
        makeAiMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game]);

  const makeAiMove = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;

    // AI selects random move or capture move
    const captureMoves = moves.filter(m => m.captured);
    const chosenMove = captureMoves.length > 0 
      ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
      : moves[Math.floor(Math.random() * moves.length)];

    const newGame = new Chess(game.fen());
    newGame.move(chosenMove);
    setGame(newGame);
    setHistory(newGame.history());
    playLockClickSound(false);

    // Update commentary
    const comment = MANGLISH_CHESS_COMMENTS[Math.floor(Math.random() * MANGLISH_CHESS_COMMENTS.length)];
    setCommentary(`AI Professor played ${chosenMove.san}! ${comment}`);

    checkGameOver(newGame);
  };

  const handleSquareClick = (square) => {
    if (game.turn() !== 'w' || game.isGameOver()) return;

    // If square is a legal move target for currently selected piece
    if (selectedSquare && possibleMoves.includes(square)) {
      const newGame = new Chess(game.fen());
      try {
        const move = newGame.move({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          setGame(newGame);
          setSelectedSquare(null);
          setPossibleMoves([]);
          setHistory(newGame.history());
          playLockClickSound(true);

          const comment = MANGLISH_CHESS_COMMENTS[Math.floor(Math.random() * MANGLISH_CHESS_COMMENTS.length)];
          setCommentary(`You played ${move.san}! ${comment}`);

          checkGameOver(newGame);
          return;
        }
      } catch (e) {
        console.warn('Invalid move', e);
      }
    }

    // Otherwise select piece
    const piece = game.get(square);
    if (piece && piece.color === 'w') {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true }).map(m => m.to);
      setPossibleMoves(moves);
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const checkGameOver = (currentGame) => {
    if (currentGame.isCheckmate()) {
      setIsGameOver(true);
      const winner = currentGame.turn() === 'b' ? 'YOU (WHITE)' : 'AI PROFESSOR (BLACK)';
      setGameResult(`CHECKMATE! ${winner} WON THE GAME! 👑`);
      if (currentGame.turn() === 'b') {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        playSuccessChime();
      }
    } else if (currentGame.isDraw()) {
      setIsGameOver(true);
      setGameResult('DRAW! Stalemate reached!');
    }
  };

  const handleRestart = () => {
    const freshGame = new Chess();
    setGame(freshGame);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setHistory([]);
    setIsGameOver(false);
    setGameResult('');
    setCommentary('"New Chess Game started vs AI Professor!" ♟️');
  };

  const board = game.board();
  const gameUrl = window.location.origin + window.location.pathname + '#chess';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in font-sans">
      
      {/* Top Header */}
      <div className="bg-[#0D1117] border border-amber-500/30 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDoor && (
            <button
              onClick={onBackToDoor}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO DOOR</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♟️</span>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider font-mono">
                KERALA COLLEGE HOME CHESS
              </h2>
            </div>
            <p className="text-xs text-amber-300 font-malayalam mt-0.5">
              High Attendance (&gt;75%) Reward Game • You are <strong>WHITE ♔ (Student)</strong> vs AI Professor!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToLudo && (
            <button
              onClick={onSwitchToLudo}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <span>🎲 SWITCH TO LUDO</span>
            </button>
          )}

          <button
            onClick={handleRestart}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART</span>
          </button>
        </div>
      </div>

      {/* Turn & Commentary Banner */}
      <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-slate-700 ${
            game.turn() === 'w' ? 'bg-amber-100 text-slate-950' : 'bg-slate-900 text-white'
          }`}>
            {game.turn() === 'w' ? '♔' : '♚'}
          </div>

          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE TURN:</div>
            <div className="text-sm font-extrabold font-mono text-slate-100 flex items-center gap-1.5">
              <span>{game.turn() === 'w' ? 'YOU (WHITE ♔)' : 'AI PROFESSOR (BLACK ♚)'}</span>
              {game.turn() === 'b' && (
                <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                  THINKING...
                </span>
              )}
            </div>
            <p className="text-xs font-malayalam text-amber-300 mt-0.5">{commentary}</p>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          <div>TOTAL MOVES: <strong className="text-amber-300">{history.length}</strong></div>
          <div>IN CHECK: <strong className={game.inCheck() ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{game.inCheck() ? 'YES 🚨' : 'NO'}</strong></div>
        </div>
      </div>

      {/* Game Over Banner */}
      {isGameOver && (
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border-2 border-amber-400 rounded-3xl p-6 text-center space-y-3 shadow-2xl animate-bounce">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-black font-mono text-amber-300 uppercase">
            {gameResult}
          </h3>
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs font-mono shadow-lg hover:brightness-110"
          >
            PLAY AGAIN ♟️
          </button>
        </div>
      )}

      {/* Interactive 8x8 Chessboard */}
      <div className="bg-[#0D1117] border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center">
        
        <div className="relative w-full max-w-[440px] aspect-square bg-amber-950 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-8 grid-rows-8 select-none">
          {board.map((row, rowIndex) =>
            row.map((square, colIndex) => {
              const file = String.fromCharCode(97 + colIndex);
              const rank = 8 - rowIndex;
              const squareName = `${file}${rank}`;
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selectedSquare === squareName;
              const isPossible = possibleMoves.includes(squareName);

              return (
                <button
                  key={squareName}
                  onClick={() => handleSquareClick(squareName)}
                  className={`w-full h-full flex items-center justify-center relative transition-all ${
                    isDark ? 'bg-[#B58863]' : 'bg-[#F0D9B5]'
                  } ${isSelected ? 'ring-4 ring-amber-400 z-10' : ''}`}
                >
                  {/* Square target indicator for possible moves */}
                  {isPossible && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500/80 shadow-lg animate-pulse" />
                  )}

                  {/* Piece Symbol */}
                  {square && (
                    <span className={`text-2xl sm:text-3xl font-bold ${
                      square.color === 'w' 
                        ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' 
                        : 'text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                    }`}>
                      {PIECE_SYMBOLS[square.color === 'w' ? square.type.toUpperCase() : square.type]}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* Mobile QR Launch Card */}
      <div className="bg-[#0D1117] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl border-2 border-amber-400 shadow-lg shrink-0">
            <QRCodeSVG
              value={gameUrl}
              size={110}
              level="M"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold font-mono text-slate-200 uppercase">
                📱 PLAY CHESS ON YOUR MOBILE PHONE
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-malayalam mt-1 max-w-md">
              Scan this QR code with your mobile camera to play Chess vs AI Professor on your phone!
            </p>
            <p className="text-[10px] font-mono text-amber-400 mt-1">
              Mobile URL: {gameUrl}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
