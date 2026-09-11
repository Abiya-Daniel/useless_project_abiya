import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, RotateCcw, Smartphone, Bot, User, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playLockClickSound } from '../utils/AudioEngine';

// Turn Sequence & Player Definitions
const PLAYERS = ['green', 'red', 'blue', 'yellow'];

const PLAYER_DETAILS = {
  green: { name: 'Green (YOU - Human)', team: 'A', color: '#10B981', bg: 'bg-emerald-500', isBot: false, symbol: '🟢', avatar: '👨‍💻' },
  red: { name: 'Red (Bot 2 - Opponent)', team: 'B', color: '#EF4444', bg: 'bg-rose-500', isBot: true, symbol: '🔴', avatar: '👨‍🏫' },
  blue: { name: 'Blue (Bot 1 - TEAMMATE)', team: 'A', color: '#3B82F6', bg: 'bg-blue-500', isBot: true, symbol: '🔵', avatar: '🤝' },
  yellow: { name: 'Yellow (Bot 3 - Opponent)', team: 'B', color: '#F59E0B', bg: 'bg-amber-500', isBot: true, symbol: '🟡', avatar: '🗝️' },
};

const TEAMS = {
  A: { name: 'TEAM A (You 🟢 & Blue Bot 🔵)', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  B: { name: 'TEAM B (Red Bot 🔴 & Yellow Bot 🟡)', color: 'text-rose-400', bg: 'bg-rose-500/20' }
};

// 52 Outer Track cell positions mapped to 15x15 board grid (row 0..14, col 0..14)
const TRACK_COORDS = [
  { r: 6, c: 1 },  // 0: Green Start Star
  { r: 6, c: 2 },  // 1
  { r: 6, c: 3 },  // 2
  { r: 6, c: 4 },  // 3
  { r: 6, c: 5 },  // 4
  { r: 5, c: 6 },  // 5
  { r: 4, c: 6 },  // 6
  { r: 3, c: 6 },  // 7
  { r: 2, c: 6 },  // 8: Safe Star
  { r: 1, c: 6 },  // 9
  { r: 0, c: 6 },  // 10
  { r: 0, c: 7 },  // 11
  { r: 0, c: 8 },  // 12
  { r: 1, c: 8 },  // 13: Red Start Star
  { r: 2, c: 8 },  // 14
  { r: 3, c: 8 },  // 15
  { r: 4, c: 8 },  // 16
  { r: 5, c: 8 },  // 17
  { r: 6, c: 9 },  // 18
  { r: 6, c: 10 }, // 19
  { r: 6, c: 11 }, // 20
  { r: 6, c: 12 }, // 21: Safe Star
  { r: 6, c: 13 }, // 22
  { r: 6, c: 14 }, // 23
  { r: 7, c: 14 }, // 24
  { r: 8, c: 14 }, // 25
  { r: 8, c: 13 }, // 26: Blue Start Star
  { r: 8, c: 12 }, // 27
  { r: 8, c: 11 }, // 28
  { r: 8, c: 10 }, // 29
  { r: 8, c: 9 },  // 30
  { r: 9, c: 8 },  // 31
  { r: 10, c: 8 }, // 32
  { r: 11, c: 8 }, // 33
  { r: 12, c: 8 }, // 34: Safe Star
  { r: 13, c: 8 }, // 35
  { r: 14, c: 8 }, // 36
  { r: 14, c: 7 }, // 37
  { r: 14, c: 6 }, // 38
  { r: 13, c: 6 }, // 39: Yellow Start Star
  { r: 12, c: 6 }, // 40
  { r: 11, c: 6 }, // 41
  { r: 10, c: 6 }, // 42
  { r: 9, c: 6 },  // 43
  { r: 8, c: 5 },  // 44
  { r: 8, c: 4 },  // 45
  { r: 8, c: 3 },  // 46
  { r: 8, c: 2 },  // 47: Safe Star
  { r: 8, c: 1 },  // 48
  { r: 8, c: 0 },  // 49
  { r: 7, c: 0 },  // 50
  { r: 6, c: 0 },  // 51
];

// Home Stretch Coords (5 cells per color leading to center)
const HOME_STRETCH_COORDS = {
  G1: { r: 7, c: 1 }, G2: { r: 7, c: 2 }, G3: { r: 7, c: 3 }, G4: { r: 7, c: 4 }, G5: { r: 7, c: 5 },
  R1: { r: 1, c: 7 }, R2: { r: 2, c: 7 }, R3: { r: 3, c: 7 }, R4: { r: 4, c: 7 }, R5: { r: 5, c: 7 },
  B1: { r: 7, c: 13 }, B2: { r: 7, c: 12 }, B3: { r: 7, c: 11 }, B4: { r: 7, c: 10 }, B5: { r: 7, c: 9 },
  Y1: { r: 13, c: 7 }, Y2: { r: 12, c: 7 }, Y3: { r: 11, c: 7 }, Y4: { r: 10, c: 7 }, Y5: { r: 9, c: 7 },
};

const HOME_FINISH_COORDS = {
  green: { r: 7, c: 6 },
  red: { r: 6, c: 7 },
  blue: { r: 7, c: 8 },
  yellow: { r: 8, c: 7 },
};

// Safe Outer Track cell indices (Stars & Start squares)
const SAFE_OUTER_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Generate path array for each player (51 outer track steps + 5 home stretch + HOME)
const generatePlayerPath = (startOffset) => {
  const outerTrack = [];
  for (let i = 0; i < 51; i++) {
    outerTrack.push((startOffset + i) % 52);
  }
  return outerTrack;
};

const PATHS = {
  green: [...generatePlayerPath(0), 'G1', 'G2', 'G3', 'G4', 'G5', 'HOME'],
  red: [...generatePlayerPath(13), 'R1', 'R2', 'R3', 'R4', 'R5', 'HOME'],
  blue: [...generatePlayerPath(26), 'B1', 'B2', 'B3', 'B4', 'B5', 'HOME'],
  yellow: [...generatePlayerPath(39), 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'HOME'],
};

// Initial 16 Token Data Structure
const INITIAL_TOKENS = [
  // Green (Team A - Human)
  { id: 'green_1', label: 'G1', player: 'green', team: 'A', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'green_2', label: 'G2', player: 'green', team: 'A', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'green_3', label: 'G3', player: 'green', team: 'A', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'green_4', label: 'G4', player: 'green', team: 'A', pathIndex: -1, state: 'yard', isHome: false },

  // Red (Team B - Bot 2)
  { id: 'red_1', label: 'R1', player: 'red', team: 'B', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'red_2', label: 'R2', player: 'red', team: 'B', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'red_3', label: 'R3', player: 'red', team: 'B', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'red_4', label: 'R4', player: 'red', team: 'B', pathIndex: -1, state: 'yard', isHome: false },

  // Blue (Team A - Bot 1 Teammate)
  { id: 'blue_1', label: 'B1', player: 'blue', team: 'A', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'blue_2', label: 'B2', player: 'blue', team: 'A', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'blue_3', label: 'B3', player: 'blue', team: 'A', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'blue_4', label: 'B4', player: 'blue', team: 'A', pathIndex: -1, state: 'yard', isHome: false },

  // Yellow (Team B - Bot 3)
  { id: 'yellow_1', label: 'Y1', player: 'yellow', team: 'B', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'yellow_2', label: 'Y2', player: 'yellow', team: 'B', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'yellow_3', label: 'Y3', player: 'yellow', team: 'B', pathIndex: -1, state: 'yard', isHome: false },
  { id: 'yellow_4', label: 'Y4', player: 'yellow', team: 'B', pathIndex: -1, state: 'yard', isHome: false },
];

export default function LudoGame({ onBackToDoor }) {
  // CENTRAL GAME STATE
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // 0=green, 1=red, 2=blue, 3=yellow
  const [diceValue, setDiceValue] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [validTokenIds, setValidTokenIds] = useState([]);
  const [winningTeam, setWinningTeam] = useState(null);

  const [statusMessage, setStatusMessage] = useState("Green's turn — Roll the dice!");

  const activePlayerKey = PLAYERS[currentPlayerIndex];
  const activePlayer = PLAYER_DETAILS[activePlayerKey];

  const isSameTeam = (p1, p2) => PLAYER_DETAILS[p1].team === PLAYER_DETAILS[p2].team;

  // AUTOMATIC COMPUTER AI TURN CONTROLLER
  useEffect(() => {
    if (winningTeam || isMoving) return;

    if (activePlayer.isBot && !isRolling && !hasRolled) {
      const timer = setTimeout(() => {
        handleRollDice();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, isRolling, hasRolled, isMoving, winningTeam]);

  // AI MOVE SELECTION & EXECUTION
  useEffect(() => {
    if (activePlayer.isBot && hasRolled && !isRolling && !isMoving && !winningTeam) {
      const timer = setTimeout(() => {
        if (validTokenIds.length > 0) {
          const chosenToken = chooseAIToken(activePlayerKey, diceValue, validTokenIds);
          animateTokenMove(chosenToken, diceValue);
        } else {
          nextPlayer(diceValue === 6);
        }
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [hasRolled, isRolling, isMoving, validTokenIds, currentPlayerIndex, diceValue, winningTeam]);

  // AI PRIORITY DECISION TREE
  const chooseAIToken = (player, dice, validIds) => {
    const validTokenObjs = tokens.filter(t => validIds.includes(t.id));
    const path = PATHS[player];

    // Priority 1: Kill an Opponent
    for (const token of validTokenObjs) {
      const targetIndex = token.state === 'yard' ? 0 : token.pathIndex + dice;
      const targetPos = path[targetIndex];

      if (typeof targetPos === 'number' && !SAFE_OUTER_SQUARES.includes(targetPos)) {
        const isKill = tokens.some(t =>
          !isSameTeam(player, t.player) &&
          !t.isYard &&
          !t.isHome &&
          PATHS[t.player][t.pathIndex] === targetPos
        );
        if (isKill) return token;
      }
    }

    // Priority 2: Move to Safe Zone
    for (const token of validTokenObjs) {
      const targetIndex = token.state === 'yard' ? 0 : token.pathIndex + dice;
      const targetPos = path[targetIndex];
      if (typeof targetPos === 'number' && SAFE_OUTER_SQUARES.includes(targetPos)) {
        return token;
      }
    }

    // Priority 3: Bring Token Out of Yard on 6
    if (dice === 6) {
      const yardToken = validTokenObjs.find(t => t.state === 'yard');
      if (yardToken) return yardToken;
    }

    // Priority 4: Move into Home Stretch
    for (const token of validTokenObjs) {
      const targetIndex = token.pathIndex + dice;
      if (targetIndex >= 51 && targetIndex < 56) {
        return token;
      }
    }

    // Priority 5: Move Token into Home (Finish)
    for (const token of validTokenObjs) {
      if (token.pathIndex + dice === path.length - 1) {
        return token;
      }
    }

    // Priority 6: Fallback - Pick first valid token
    return validTokenObjs[0];
  };

  // REAL WORKING DICE ROLL
  const handleRollDice = () => {
    if (isRolling || hasRolled || isMoving || winningTeam) return;

    setIsRolling(true);
    setStatusMessage(`${activePlayer.name} is rolling the dice...`);
    let rollCount = 0;

    const interval = setInterval(() => {
      const rand = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rand);
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1; // Real random 1..6
        setDiceValue(finalDice);
        setIsRolling(false);
        setHasRolled(true);

        playLockClickSound(false);

        // Check 3 Consecutive 6s Rule
        let newSixCount = finalDice === 6 ? consecutiveSixes + 1 : 0;
        setConsecutiveSixes(newSixCount);

        if (newSixCount === 3) {
          setStatusMessage('Three 6s! Turn lost.');
          setConsecutiveSixes(0);
          setTimeout(() => nextPlayer(false), 1000);
          return;
        }

        // Calculate Valid Movable Tokens for Active Player
        const valid = getValidTokens(activePlayerKey, finalDice);
        const validIds = valid.map(t => t.id);
        setValidTokenIds(validIds);

        if (valid.length === 0) {
          setStatusMessage(`${activePlayer.name} rolled ${finalDice} — No valid moves.`);
          setTimeout(() => nextPlayer(finalDice === 6), 900);
        } else {
          setStatusMessage(`${activePlayer.name} rolled ${finalDice}! Select a token to move.`);
        }
      }
    }, 65);
  };

  // Get Valid Tokens for Player
  const getValidTokens = (player, dice) => {
    const playerTokens = tokens.filter(t => t.player === player);
    const path = PATHS[player];

    return playerTokens.filter(token => {
      if (token.isHome) return false;
      if (token.state === 'yard') return dice === 6; // Requires 6 to release from yard
      return token.pathIndex + dice < path.length; // Within path boundary
    });
  };

  // TOKEN STEP-BY-STEP MOVEMENT ANIMATION (180ms per cell)
  const animateTokenMove = async (tokenToMove, dice) => {
    setIsMoving(true);
    const path = PATHS[tokenToMove.player];
    
    // Release from Yard on 6
    if (tokenToMove.state === 'yard' && dice === 6) {
      setTokens(prev => prev.map(t => {
        if (t.id === tokenToMove.id) {
          return {
            ...t,
            pathIndex: 0,
            state: 'track',
            isYard: false,
          };
        }
        return t;
      }));

      playLockClickSound(true);
      setStatusMessage(`${activePlayer.name} released ${tokenToMove.label} from yard!`);
      await new Promise(resolve => setTimeout(resolve, 300));
      finishMove(tokenToMove.id, 0, dice);
      return;
    }

    // Step-by-Step Outer Track Movement
    let currentIdx = tokenToMove.pathIndex;
    const targetIdx = Math.min(tokenToMove.pathIndex + dice, path.length - 1);

    for (let step = currentIdx + 1; step <= targetIdx; step++) {
      await new Promise(resolve => setTimeout(resolve, 180)); // 180ms per cell step
      currentIdx = step;
      
      const newState = step >= 56 ? 'home' : step >= 51 ? 'home_stretch' : 'track';
      const isHome = step === path.length - 1;

      setTokens(prev => prev.map(t => {
        if (t.id === tokenToMove.id) {
          return {
            ...t,
            pathIndex: currentIdx,
            state: newState,
            isHome: isHome,
          };
        }
        return t;
      }));

      playLockClickSound(false);
    }

    finishMove(tokenToMove.id, targetIdx, dice);
  };

  // POST-MOVE: KILL CHECK, HOME CHECK, WIN CHECK, TURN ROTATION
  const finishMove = (tokenId, finalPathIndex, dice) => {
    const movedToken = tokens.find(t => t.id === tokenId);
    const playerKey = movedToken.player;
    const path = PATHS[playerKey];
    const targetPos = path[finalPathIndex];
    const isHome = finalPathIndex === path.length - 1;

    let updatedTokens = [...tokens];
    let killedOccurred = false;

    // Opponent Elimination Check (if on outer track and NOT safe)
    if (!isHome && typeof targetPos === 'number' && !SAFE_OUTER_SQUARES.includes(targetPos)) {
      updatedTokens = updatedTokens.map(t => {
        if (!isSameTeam(playerKey, t.player) && !t.isYard && !t.isHome) {
          const oppPos = PATHS[t.player][t.pathIndex];
          if (oppPos === targetPos) {
            killedOccurred = true;
            setStatusMessage(`💥 ${PLAYER_DETAILS[playerKey].name} knocked ${PLAYER_DETAILS[t.player].name} back to the yard!`);
            return {
              ...t,
              pathIndex: -1,
              state: 'yard',
              isYard: true,
              isHome: false,
            };
          }
        }
        return t;
      });
      if (killedOccurred) {
        setTokens(updatedTokens);
      }
    }

    if (!killedOccurred) {
      if (isHome) {
        setStatusMessage(`⭐ ${PLAYER_DETAILS[playerKey].name} reached HOME!`);
      } else {
        setStatusMessage(`${PLAYER_DETAILS[playerKey].name} moved ${movedToken.label}.`);
      }
    }

    // Check Team Win Condition (Team A = 8/8 tokens home, Team B = 8/8 tokens home)
    const teamAHomeCount = updatedTokens.filter(t => t.team === 'A' && t.isHome).length;
    const teamBHomeCount = updatedTokens.filter(t => t.team === 'B' && t.isHome).length;

    if (teamAHomeCount === 8) {
      setWinningTeam(TEAMS.A);
      setStatusMessage('🏆 TEAM A WINS! GREEN + BLUE (8/8 TOKENS HOME)');
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      playSuccessChime();
      setIsMoving(false);
      return;
    } else if (teamBHomeCount === 8) {
      setWinningTeam(TEAMS.B);
      setStatusMessage('🏆 TEAM B WINS! RED + YELLOW (8/8 TOKENS HOME)');
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      playSuccessChime();
      setIsMoving(false);
      return;
    }

    setIsMoving(false);
    nextPlayer(dice === 6);
  };

  const nextPlayer = (extraTurn = false) => {
    setHasRolled(false);
    setValidTokenIds([]);
    if (!extraTurn) {
      setCurrentPlayerIndex(prev => (prev + 1) % PLAYERS.length);
    }
  };

  // RESET GAME
  const handleResetGame = () => {
    setTokens(INITIAL_TOKENS);
    setCurrentPlayerIndex(0);
    setDiceValue(6);
    setIsRolling(false);
    setIsMoving(false);
    setHasRolled(false);
    setValidTokenIds([]);
    setWinningTeam(null);
    setConsecutiveSixes(0);
    setStatusMessage("Green's turn — Roll the dice!");
  };

  // Map Token object to visual (row, col) grid cell coordinates
  const getTokenCoords = (token) => {
    if (token.isYard) return null;
    const path = PATHS[token.player];
    const posVal = path[token.pathIndex];
    if (posVal === 'HOME') return HOME_FINISH_COORDS[token.player];
    if (typeof posVal === 'string') return HOME_STRETCH_COORDS[posVal];
    if (typeof posVal === 'number') return TRACK_COORDS[posVal];
    return null;
  };

  // Get active tokens on a specific board grid cell (row, col)
  const getTokensOnCell = (r, c) => {
    return tokens.filter(t => {
      const coords = getTokenCoords(t);
      return coords && coords.r === r && coords.c === c;
    });
  };

  // Team Home Counters
  const teamAHomeCount = tokens.filter(t => t.team === 'A' && t.isHome).length;
  const teamBHomeCount = tokens.filter(t => t.team === 'B' && t.isHome).length;
  const gameUrl = window.location.origin + window.location.pathname + '#ludo';

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
              <span className="text-2xl">🎲</span>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider font-mono">
                1 HUMAN VS 3 COMPUTERS (2 VS 2 TEAM MODE)
              </h2>
            </div>
            <p className="text-xs text-amber-300 font-malayalam mt-0.5">
              <strong>Team A:</strong> Green (You 🟢) & Blue Bot 🔵 | <strong>Team B:</strong> Red Bot 🔴 & Yellow Bot 🟡
            </p>
          </div>
        </div>

        <button
          onClick={handleResetGame}
          className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-amber-500/20 hover:border-amber-500/40 text-xs font-mono font-bold text-slate-300 hover:text-amber-300 flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET GAME</span>
        </button>
      </div>

      {/* Team Score Tracker & Real Dice Roller */}
      <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Team Score Counters */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-emerald-400 font-bold block">TEAM A (YOU & BLUE BOT):</span>
            <span className="text-base font-black text-slate-100">{teamAHomeCount} / 8 TOKENS HOME</span>
          </div>

          <div className="bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-rose-400 font-bold block">TEAM B (RED & YELLOW BOTS):</span>
            <span className="text-base font-black text-slate-100">{teamBHomeCount} / 8 TOKENS HOME</span>
          </div>
        </div>

        {/* Real Functional Dice Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRollDice}
            disabled={isRolling || hasRolled || isMoving || activePlayer.isBot || !!winningTeam}
            className={`px-6 py-3.5 rounded-2xl font-black text-lg font-mono shadow-2xl transition-all flex items-center gap-3 ${
              isRolling
                ? 'bg-amber-500 text-slate-950 animate-bounce'
                : hasRolled || isMoving || activePlayer.isBot
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20 ring-4 ring-emerald-500/30'
            }`}
          >
            {/* Visual Real Dice Face */}
            <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-md">
              {diceValue}
            </div>

            <span>
              {isRolling 
                ? 'ROLLING...' 
                : activePlayer.isBot 
                ? `${activePlayer.name.split(' ')[0]} THINKING...` 
                : hasRolled 
                ? `ROLLED ${diceValue}` 
                : 'ROLL YOUR DICE 🎲'}
            </span>
          </button>
        </div>

      </div>

      {/* Active Turn & Dynamic Status Message Area */}
      <div className="bg-[#0D1117] border border-slate-800 p-3 rounded-2xl flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activePlayer.color }} />
          <span className="font-bold text-slate-200">TURN {currentPlayerIndex + 1}/4: {activePlayer.name}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] ${activePlayer.team === 'A' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
            {TEAMS[activePlayer.team].name}
          </span>
        </div>

        <p className="text-xs font-mono font-bold text-amber-300 truncate max-w-md">{statusMessage}</p>
      </div>

      {/* Victory Popup */}
      {winningTeam && (
        <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border-2 border-amber-400 rounded-3xl p-6 text-center space-y-3 shadow-2xl animate-bounce">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-black font-mono text-amber-300 uppercase">
            🏆 {winningTeam.name} WINS! (8/8 TOKENS HOME)
          </h3>
          <p className="text-sm font-malayalam text-slate-200">
            "Classil keriyilla, pakshe 2 vs 2 Ludo Match Champion aayi!" 🎉
          </p>
          <button
            onClick={handleResetGame}
            className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs font-mono shadow-lg hover:brightness-110"
          >
            PLAY AGAIN 🎲
          </button>
        </div>
      )}

      {/* Real 15x15 Classic Ludo Board Grid with Live Token Overlay Rendering */}
      <div className="bg-[#0D1117] border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center">
        
        <div className="relative w-full max-w-[460px] aspect-square bg-slate-950 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-15 grid-rows-15 p-1 gap-0.5 select-none">
          
          {/* Top-Left Red Home Yard: Bot 2 (6x6) */}
          <div className="col-span-6 row-span-6 bg-rose-600 border-4 border-rose-700 rounded-2xl p-3 flex flex-col items-center justify-between shadow-inner relative">
            <div className="w-full flex justify-between items-center text-white font-mono font-bold text-[10px]">
              <span>🔴 TEAM B</span>
              <span className="bg-black/40 px-1 py-0.5 rounded">RED BOT 2</span>
            </div>

            <div className="bg-white rounded-2xl p-2.5 grid grid-cols-2 gap-2.5 shadow-2xl border-2 border-rose-800">
              {tokens.filter(t => t.player === 'red' && t.isYard).map((t) => {
                const isMovable = activePlayerKey === 'red' && hasRolled && validTokenIds.includes(t.id) && !isMoving;
                return (
                  <button
                    key={t.id}
                    onClick={() => isMovable && animateTokenMove(t, diceValue)}
                    disabled={!isMovable || activePlayer.isBot}
                    className={`w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-lg transition-transform ${
                      isMovable ? 'animate-bounce ring-4 ring-amber-300 scale-110 cursor-pointer' : ''
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <span className="text-[9px] text-white/90 font-mono font-bold">RED BOT (OPPONENT)</span>
          </div>

          {/* Top-Center Track (3x6) */}
          <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 bg-slate-900 border border-slate-800 text-[10px] font-mono text-center font-bold relative">
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">11</div>
            <div className="border border-slate-800 bg-emerald-500 text-slate-950 flex items-center justify-center">12</div>
            <div className="border border-slate-800 bg-emerald-500 text-slate-950 flex items-center justify-center">13 ⭐</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">10</div>
            <div className="border border-slate-800 bg-emerald-500 text-slate-950 flex items-center justify-center">G1</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">14</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">9</div>
            <div className="border border-slate-800 bg-emerald-500 text-slate-950 flex items-center justify-center">G2</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">15</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">8</div>
            <div className="border border-slate-800 bg-emerald-500 text-slate-950 flex items-center justify-center">G3</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">16</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">7</div>
            <div className="border border-slate-800 bg-emerald-500 text-slate-950 flex items-center justify-center">G4</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">17</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">6</div>
            <div className="border border-slate-800 bg-emerald-500 text-slate-950 flex items-center justify-center">G5</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">18</div>
          </div>

          {/* Top-Right Green Yard: YOU (Human) (6x6) */}
          <div className="col-span-6 row-span-6 bg-emerald-600 border-4 border-emerald-400 rounded-2xl p-3 flex flex-col items-center justify-between shadow-2xl relative ring-4 ring-emerald-500/40">
            <div className="w-full flex justify-between items-center text-white font-mono font-bold text-[10px]">
              <span>🟢 TEAM A</span>
              <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded shadow">YOU 🟢</span>
            </div>

            <div className="bg-white rounded-2xl p-2.5 grid grid-cols-2 gap-2.5 shadow-2xl border-2 border-emerald-800">
              {tokens.filter(t => t.player === 'green' && t.isYard).map((t) => {
                const isMovable = activePlayerKey === 'green' && hasRolled && validTokenIds.includes(t.id) && !isMoving;
                return (
                  <button
                    key={t.id}
                    onClick={() => isMovable && animateTokenMove(t, diceValue)}
                    disabled={!isMovable}
                    className={`w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-lg transition-transform ${
                      isMovable ? 'animate-bounce ring-4 ring-amber-300 scale-125 cursor-pointer shadow-emerald-500 z-20' : ''
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <span className="text-[9px] text-amber-300 font-mono font-black uppercase">YOUR TOKENS IN YARD</span>
          </div>

          {/* Middle-Left Track (6x3) */}
          <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 bg-slate-900 border border-slate-800 text-[10px] font-mono text-center font-bold relative">
            <div className="border border-slate-800 bg-slate-950 flex items-center justify-center">1</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">2</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">3</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">4</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">5</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">6</div>

            <div className="border border-slate-800 bg-rose-500 text-slate-950 flex items-center justify-center">R1</div>
            <div className="border border-slate-800 bg-rose-500 text-slate-950 flex items-center justify-center">R2</div>
            <div className="border border-slate-800 bg-rose-500 text-slate-950 flex items-center justify-center">R3</div>
            <div className="border border-slate-800 bg-rose-500 text-slate-950 flex items-center justify-center">R4</div>
            <div className="border border-slate-800 bg-rose-500 text-slate-950 flex items-center justify-center">R5</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">7</div>

            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">52</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">51</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">50</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">49</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">48</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">47</div>
          </div>

          {/* Center Ludo Triangles Finish (3x3) */}
          <div className="col-span-3 row-span-3 bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-emerald-500/20 border-4 border-amber-400 rounded-2xl flex flex-col items-center justify-center p-1 text-center shadow-2xl relative">
            <Trophy className="w-6 h-6 text-amber-400 animate-bounce mb-0.5" />
            <span className="text-[9px] font-mono font-black text-amber-300 uppercase">HOME</span>
          </div>

          {/* Middle-Right Track (6x3) */}
          <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 bg-slate-900 border border-slate-800 text-[10px] font-mono text-center font-bold relative">
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">19</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">20</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">21</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">22</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">23</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">24</div>

            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">18</div>
            <div className="border border-slate-800 bg-amber-500 text-slate-950 flex items-center justify-center">Y5</div>
            <div className="border border-slate-800 bg-amber-500 text-slate-950 flex items-center justify-center">Y4</div>
            <div className="border border-slate-800 bg-amber-500 text-slate-950 flex items-center justify-center">Y3</div>
            <div className="border border-slate-800 bg-amber-500 text-slate-950 flex items-center justify-center">Y2</div>
            <div className="border border-slate-800 bg-amber-500 text-slate-950 flex items-center justify-center">Y1</div>

            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">17</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">16</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">15</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">14</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">13</div>
            <div className="border border-slate-800 bg-[#161B22] flex items-center justify-center">12</div>
          </div>

          {/* Bottom-Left Blue Yard: Bot 1 TEAMMATE (6x6) */}
          <div className="col-span-6 row-span-6 bg-blue-600 border-4 border-blue-700 rounded-2xl p-3 flex flex-col items-center justify-between shadow-inner relative">
            <div className="w-full flex justify-between items-center text-white font-mono font-bold text-[10px]">
              <span>🔵 TEAM A</span>
              <span className="bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded shadow">TEAMMATE 🤝</span>
            </div>

            <div className="bg-white rounded-2xl p-2.5 grid grid-cols-2 gap-2.5 shadow-2xl border-2 border-blue-800">
              {tokens.filter(t => t.player === 'blue' && t.isYard).map((t) => {
                const isMovable = activePlayerKey === 'blue' && hasRolled && validTokenIds.includes(t.id) && !isMoving;
                return (
                  <button
                    key={t.id}
                    onClick={() => isMovable && animateTokenMove(t, diceValue)}
                    disabled={!isMovable || activePlayer.isBot}
                    className={`w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-lg transition-transform ${
                      isMovable ? 'animate-bounce ring-4 ring-amber-300 scale-110 cursor-pointer' : ''
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <span className="text-[9px] text-white/90 font-mono font-bold">BLUE BOT (YOUR TEAMMATE)</span>
          </div>

          {/* Bottom-Center Track (3x6) */}
          <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 bg-slate-900 border border-slate-800 text-[10px] font-mono text-center font-bold relative">
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">31</div>
            <div className="border border-slate-800 bg-blue-500 text-slate-950 flex items-center justify-center">B5</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">32</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">30</div>
            <div className="border border-slate-800 bg-blue-500 text-slate-950 flex items-center justify-center">B4</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">33</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">29</div>
            <div className="border border-slate-800 bg-blue-500 text-slate-950 flex items-center justify-center">B3</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">34</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">28</div>
            <div className="border border-slate-800 bg-blue-500 text-slate-950 flex items-center justify-center">B2</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">35</div>

            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">27</div>
            <div className="border border-slate-800 bg-blue-500 text-slate-950 flex items-center justify-center">B1</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">36</div>

            <div className="border border-slate-800 bg-blue-500 text-slate-950 flex items-center justify-center">39 ⭐</div>
            <div className="border border-slate-800 bg-blue-500 text-slate-950 flex items-center justify-center">38</div>
            <div className="border border-slate-800 bg-slate-950 text-slate-500 flex items-center justify-center">37</div>
          </div>

          {/* Bottom-Right Yellow Yard: Bot 3 Opponent (6x6) */}
          <div className="col-span-6 row-span-6 bg-amber-600 border-4 border-amber-700 rounded-2xl p-3 flex flex-col items-center justify-between shadow-inner relative">
            <div className="w-full flex justify-between items-center text-white font-mono font-bold text-[10px]">
              <span>🟡 TEAM B</span>
              <span className="bg-black/40 px-1 py-0.5 rounded">YELLOW BOT 3</span>
            </div>

            <div className="bg-white rounded-2xl p-2.5 grid grid-cols-2 gap-2.5 shadow-2xl border-2 border-amber-800">
              {tokens.filter(t => t.player === 'yellow' && t.isYard).map((t) => {
                const isMovable = activePlayerKey === 'yellow' && hasRolled && validTokenIds.includes(t.id) && !isMoving;
                return (
                  <button
                    key={t.id}
                    onClick={() => isMovable && animateTokenMove(t, diceValue)}
                    disabled={!isMovable || activePlayer.isBot}
                    className={`w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-lg transition-transform ${
                      isMovable ? 'animate-bounce ring-4 ring-amber-300 scale-110 cursor-pointer' : ''
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <span className="text-[9px] text-white/90 font-mono font-bold">YELLOW BOT (OPPONENT)</span>
          </div>

          {/* REAL ACTIVE TOKEN OVERLAY ON THE BOARD CELLS */}
          {tokens.filter(t => !t.isYard).map((t) => {
            const coords = getTokenCoords(t);
            if (!coords) return null;

            const isMovable = activePlayerKey === t.player && hasRolled && validTokenIds.includes(t.id) && !isMoving;
            const pDetail = PLAYER_DETAILS[t.player];

            return (
              <button
                key={t.id}
                onClick={() => isMovable && animateTokenMove(t, diceValue)}
                disabled={!isMovable || activePlayer.isBot}
                className={`absolute z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-[10px] shadow-2xl transition-all duration-200 ${pDetail.bg} text-white ${
                  isMovable ? 'animate-bounce ring-4 ring-amber-300 scale-125 z-40 cursor-pointer' : ''
                }`}
                style={{
                  top: `${(coords.r / 15) * 100}%`,
                  left: `${(coords.c / 15) * 100}%`,
                  width: '6.66%',
                  height: '6.66%',
                }}
                title={`${t.label} (${pDetail.name})`}
              >
                {t.label}
              </button>
            );
          })}

        </div>

      </div>

      {/* Mobile QR Launch Code Card */}
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
                📱 PLAY FULL 2 VS 2 TEAM LUDO ON MOBILE
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-malayalam mt-1 max-w-md">
              Scan this QR code with your mobile camera to play 2 vs 2 Team Ludo (You & Blue Bot vs Red & Yellow Bots) on your smartphone!
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
