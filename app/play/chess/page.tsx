'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// ── TYPES ──
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type Color = 'white' | 'black';
type Piece = { type: PieceType; color: Color } | null;
type Board = Piece[][];
type Square = [number, number];
type GameMode = 'menu' | 'vs-cpu' | 'vs-friend-host' | 'vs-friend-join' | 'playing' | 'game-over';
type Difficulty = 'easy' | 'medium' | 'hard';

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0,
};

// ── INITIAL BOARD ──
function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow: PieceType[] = ['rook','knight','bishop','queen','king','bishop','knight','rook'];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRow[c], color: 'black' };
    board[1][c] = { type: 'pawn', color: 'black' };
    board[6][c] = { type: 'pawn', color: 'white' };
    board[7][c] = { type: backRow[c], color: 'white' };
  }
  return board;
}

// ── PIECE IMAGES ──
function pieceImg(piece: Piece): string {
  if (!piece) return '';
  const name = piece.type.charAt(0).toUpperCase() + piece.type.slice(1);
  return `/chess/${piece.color}/${piece.color.charAt(0).toUpperCase() + piece.color.slice(1)}_${name}.png`;
}

// ── MOVE GENERATION ──
function inBounds(r: number, c: number) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function getRawMoves(board: Board, row: number, col: number): Square[] {
  const piece = board[row][col];
  if (!piece) return [];
  const moves: Square[] = [];
  const { type, color } = piece;
  const dir = color === 'white' ? -1 : 1;

  if (type === 'pawn') {
    if (inBounds(row + dir, col) && !board[row + dir][col]) {
      moves.push([row + dir, col]);
      const startRow = color === 'white' ? 6 : 1;
      if (row === startRow && !board[row + dir * 2][col]) moves.push([row + dir * 2, col]);
    }
    for (const dc of [-1, 1]) {
      if (inBounds(row + dir, col + dc) && board[row + dir][col + dc]?.color !== color && board[row + dir][col + dc]) {
        moves.push([row + dir, col + dc]);
      }
    }
  }

  if (type === 'knight') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr = row + dr; const nc = col + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
  }

  const slides: Record<string, [number,number][]> = {
    rook: [[0,1],[0,-1],[1,0],[-1,0]],
    bishop: [[1,1],[1,-1],[-1,1],[-1,-1]],
    queen: [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
    king: [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
  };

  if (slides[type]) {
    const limit = type === 'king' ? 1 : 8;
    for (const [dr, dc] of slides[type]) {
      for (let i = 1; i <= limit; i++) {
        const nr = row + dr * i; const nc = col + dc * i;
        if (!inBounds(nr, nc)) break;
        if (board[nr][nc]) {
          if (board[nr][nc]!.color !== color) moves.push([nr, nc]);
          break;
        }
        moves.push([nr, nc]);
      }
    }
  }

  return moves;
}

function findKing(board: Board, color: Color): Square | null {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (board[r][c]?.type === 'king' && board[r][c]?.color === color) return [r, c];
  return null;
}

function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  const opp: Color = color === 'white' ? 'black' : 'white';
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (board[r][c]?.color === opp)
      if (getRawMoves(board, r, c).some(([mr, mc]) => mr === king[0] && mc === king[1])) return true;
  return false;
}

function applyMove(board: Board, from: Square, to: Square): Board {
  const next = board.map(r => [...r]);
  next[to[0]][to[1]] = next[from[0]][from[1]];
  next[from[0]][from[1]] = null;
  // pawn promotion
  if (next[to[0]][to[1]]?.type === 'pawn' && (to[0] === 0 || to[0] === 7))
    next[to[0]][to[1]] = { type: 'queen', color: next[to[0]][to[1]]!.color };
  return next;
}

function getLegalMoves(board: Board, row: number, col: number): Square[] {
  const piece = board[row][col];
  if (!piece) return [];
  return getRawMoves(board, row, col).filter(([tr, tc]) => {
    const next = applyMove(board, [row, col], [tr, tc]);
    return !isInCheck(next, piece.color);
  });
}

function hasAnyMoves(board: Board, color: Color): boolean {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (board[r][c]?.color === color && getLegalMoves(board, r, c).length > 0) return true;
  return false;
}

// ── CPU AI ──
function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p) score += (p.color === 'black' ? 1 : -1) * PIECE_VALUES[p.type];
  }
  return score;
}

function getAllMoves(board: Board, color: Color): { from: Square; to: Square }[] {
  const moves: { from: Square; to: Square }[] = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (board[r][c]?.color === color)
      getLegalMoves(board, r, c).forEach(to => moves.push({ from: [r, c], to }));
  return moves;
}

function minimax(board: Board, depth: number, isMax: boolean, alpha: number, beta: number): number {
  const color: Color = isMax ? 'black' : 'white';
  if (depth === 0 || !hasAnyMoves(board, color)) return evaluateBoard(board);
  let best = isMax ? -Infinity : Infinity;
  for (const { from, to } of getAllMoves(board, color)) {
    const next = applyMove(board, from, to);
    const val = minimax(next, depth - 1, !isMax, alpha, beta);
    if (isMax) { best = Math.max(best, val); alpha = Math.max(alpha, best); }
    else { best = Math.min(best, val); beta = Math.min(beta, best); }
    if (beta <= alpha) break;
  }
  return best;
}

function getCpuMove(board: Board, difficulty: Difficulty): { from: Square; to: Square } | null {
  const moves = getAllMoves(board, 'black');
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    // Random move
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === 'medium') {
    // Capture if possible, else random
    const captures = moves.filter(({ to }) => board[to[0]][to[1]] !== null);
    const pool = captures.length > 0 && Math.random() > 0.3 ? captures : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Hard: minimax depth 3
  let best = -Infinity;
  let bestMove = moves[0];
  for (const move of moves) {
    const next = applyMove(board, move.from, move.to);
    const val = minimax(next, 2, false, -Infinity, Infinity);
    if (val > best) { best = val; bestMove = move; }
  }
  return bestMove;
}

// ── SUPABASE ──
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── MAIN COMPONENT ──
export default function ChessPage() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [turn, setTurn] = useState<Color>('white');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerColor, setPlayerColor] = useState<Color>('white');
  const [capturedWhite, setCapturedWhite] = useState<PieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceType[]>([]);
  const cpuThinking = useRef(false);

  const DIFF_LABELS = { easy: { label: 'Easy', emoji: '🐢', desc: 'Great for beginners' }, medium: { label: 'Medium', emoji: '⚡', desc: 'A real challenge' }, hard: { label: 'Hard', emoji: '🔥', desc: 'Bring your A-game' } };

  // ── GAME STATUS CHECK ──
  const checkStatus = useCallback((b: Board, nextTurn: Color) => {
    const inCheck = isInCheck(b, nextTurn);
    const hasMoves = hasAnyMoves(b, nextTurn);
    if (!hasMoves) {
      if (inCheck) {
        const w = nextTurn === 'white' ? 'Black' : 'White';
        setWinner(w);
        setStatus(`Checkmate! ${w} wins!`);
      } else {
        setWinner('draw');
        setStatus("Stalemate! It's a draw.");
      }
      setMode('game-over');
    } else if (inCheck) {
      setStatus(`${nextTurn === 'white' ? 'White' : 'Black'} is in check!`);
    } else {
      setStatus('');
    }
  }, []);

  // ── HANDLE SQUARE CLICK ──
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (turn !== 'white') return;
    const piece = board[row][col];

    if (selected) {
      const isLegal = legalMoves.some(([r, c]) => r === row && c === col);
      if (isLegal) {
        const captured = board[row][col];
        const newBoard = applyMove(board, selected, [row, col]);
        if (captured) {
          if (captured.color === 'white') setCapturedWhite(p => [...p, captured.type]);
          else setCapturedBlack(p => [...p, captured.type]);
        }
        setBoard(newBoard);
        setTurn('black');
        setSelected(null);
        setLegalMoves([]);
        checkStatus(newBoard, 'black');
      } else if (piece?.color === 'white') {
        setSelected([row, col]);
        setLegalMoves(getLegalMoves(board, row, col));
      } else {
        setSelected(null);
        setLegalMoves([]);
      }
    } else {
      if (piece?.color === 'white') {
        setSelected([row, col]);
        setLegalMoves(getLegalMoves(board, row, col));
      }
    }
  }, [board, selected, legalMoves, turn, checkStatus]);

  // ── CPU MOVE ──
  useEffect(() => {
    if (mode !== 'playing') return;
    if (turn !== 'black') return;
    if (playerColor === 'black') return;
    if (cpuThinking.current) return;
    cpuThinking.current = true;

    const timer = setTimeout(() => {
      const move = getCpuMove(board, difficulty);
      if (move) {
        const captured = board[move.to[0]][move.to[1]];
        const newBoard = applyMove(board, move.from, move.to);
        if (captured) {
          if (captured.color === 'white') setCapturedWhite(p => [...p, captured.type]);
          else setCapturedBlack(p => [...p, captured.type]);
        }
        setBoard(newBoard);
        setTurn('white');
        checkStatus(newBoard, 'white');
      }
      cpuThinking.current = false;
    }, difficulty === 'hard' ? 800 : 400);

    return () => clearTimeout(timer);
  }, [turn, board, mode, difficulty, playerColor, checkStatus]);

  const startVsCpu = () => {
    setBoard(createInitialBoard());
    setSelected(null); setLegalMoves([]);
    setTurn('white'); setWinner(null); setStatus('');
    setCapturedWhite([]); setCapturedBlack([]);
    setPlayerColor('white');
    setMode('playing');
  };

  const pieceSymbol: Record<PieceType, string> = {
    pawn: '♟', rook: '♜', knight: '♞', bishop: '♝', queen: '♛', king: '♚'
  };

  // ── RENDER BOARD ──
  const renderBoard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', border: '3px solid #8B6914', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      {board.map((row, r) => (
        <div key={r} style={{ display: 'flex' }}>
          {row.map((piece, c) => {
            const isLight = (r + c) % 2 === 0;
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c);
            const isCapture = isLegal && piece !== null;
            const isCheck = piece?.type === 'king' && piece.color === turn && status.includes('check');

            let bg = isLight ? '#F0D9B5' : '#B58863';
            if (isSelected) bg = '#F6F669';
            if (isCheck) bg = '#FF6B6B';

            return (
              <div key={c} onClick={() => handleSquareClick(r, c)} style={{
                width: 64, height: 64, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', transition: 'background 0.1s',
              }}>
                {isLegal && !isCapture && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.18)', position: 'absolute' }} />
                )}
                {isCapture && (
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(0,0,0,0.25)', borderRadius: 2 }} />
                )}
                {piece && (
                  <img src={pieceImg(piece)} alt={`${piece.color} ${piece.type}`}
                    style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.4))', position: 'relative', zIndex: 1, pointerEvents: 'none' }}
                    onError={(e) => {
                      // fallback to unicode if image fails
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                {/* Rank/file labels */}
                {c === 0 && <span style={{ position: 'absolute', top: 2, left: 3, fontSize: 10, fontWeight: 700, color: isLight ? '#B58863' : '#F0D9B5', lineHeight: 1 }}>{8 - r}</span>}
                {r === 7 && <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 10, fontWeight: 700, color: isLight ? '#B58863' : '#F0D9B5', lineHeight: 1 }}>{'abcdefgh'[c]}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  // ── MENU ──
  if (mode === 'menu') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a00 0%, #2d1810 50%, #1a0a00 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} } @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }`}</style>

      <div style={{ textAlign: 'center', marginBottom: 32, animation: 'float 3s ease-in-out infinite' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>♟️</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: '#F0D9B5', letterSpacing: -1, lineHeight: 1 }}>
          Roo's <span style={{ color: '#FFD234' }}>Chess</span>
        </div>
        <div style={{ color: 'rgba(240,217,181,0.5)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginTop: 6 }}>Think ahead. Play smart.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <button onClick={() => setMode('vs-cpu')} style={{ padding: '18px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #B58863, #8B6914)', color: '#fff', fontSize: 18, fontWeight: 900, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", boxShadow: '0 5px 0 #5a3d08', animation: 'pulse 2s infinite', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <div style={{ textAlign: 'left' }}>
            <div>Play vs Computer</div>
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>Easy, Medium, or Hard</div>
          </div>
        </button>

        <button onClick={() => setMode('vs-friend-host')} style={{ padding: '18px 24px', borderRadius: 14, border: '2px solid rgba(240,217,181,0.3)', background: 'rgba(240,217,181,0.08)', color: '#F0D9B5', fontSize: 18, fontWeight: 900, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>👥</span>
          <div style={{ textAlign: 'left' }}>
            <div>Play vs Friend</div>
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>Share a room code</div>
          </div>
        </button>
      </div>

      <a href="/" style={{ color: 'rgba(240,217,181,0.3)', fontSize: 11, marginTop: 28, fontFamily: 'monospace', textDecoration: 'none', letterSpacing: 1 }}>Back to Gamaroo</a>
    </div>
  );

  // ── VS CPU DIFFICULTY ──
  if (mode === 'vs-cpu') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a00, #2d1810)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 32, fontWeight: 900, color: '#F0D9B5', marginBottom: 8 }}>Choose Difficulty</div>
      <div style={{ color: 'rgba(240,217,181,0.5)', fontSize: 13, marginBottom: 28 }}>How tough do you want it?</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        {(['easy','medium','hard'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => { setDifficulty(d); startVsCpu(); }} style={{
            padding: '16px 20px', borderRadius: 14, border: difficulty === d ? '2px solid #FFD234' : '2px solid rgba(240,217,181,0.15)',
            background: difficulty === d ? 'rgba(255,210,52,0.12)' : 'rgba(240,217,181,0.05)',
            color: '#F0D9B5', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
            display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s'
          }}>
            <span style={{ fontSize: 28 }}>{DIFF_LABELS[d].emoji}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900 }}>{DIFF_LABELS[d].label}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{DIFF_LABELS[d].desc}</div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={() => setMode('menu')} style={{ marginTop: 20, background: 'none', border: 'none', color: 'rgba(240,217,181,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>Back</button>
    </div>
  );

  // ── VS FRIEND HOST ──
  if (mode === 'vs-friend-host') {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a00, #2d1810)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: 20 }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />
        <div style={{ background: 'rgba(240,217,181,0.08)', border: '2px solid rgba(240,217,181,0.2)', borderRadius: 20, padding: '32px 28px', maxWidth: 340, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#F0D9B5', marginBottom: 8 }}>Share this code</div>
          <div style={{ fontSize: 13, color: 'rgba(240,217,181,0.5)', marginBottom: 20 }}>Give it to your friend so they can join</div>
          <div style={{ background: '#FFD234', color: '#1a0a00', fontSize: 36, fontWeight: 900, borderRadius: 14, padding: '14px 24px', letterSpacing: 6, marginBottom: 24 }}>{code}</div>
          <button onClick={() => { setRoomCode(code); setPlayerColor('white'); startVsCpu(); }} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #B58863, #8B6914)', color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
            Start Game (Play as White)
          </button>
        </div>
        <button onClick={() => setMode('menu')} style={{ marginTop: 16, background: 'none', border: 'none', color: 'rgba(240,217,181,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>Back</button>
      </div>
    );
  }

  // ── GAME OVER ──
  if (mode === 'game-over') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a00, #2d1810)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />
      <div style={{ background: 'rgba(240,217,181,0.08)', border: '2px solid rgba(240,217,181,0.2)', borderRadius: 20, padding: '40px 32px', maxWidth: 340, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>{winner === 'draw' ? '🤝' : winner === 'White' ? '🏆' : '💀'}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#FFD234', marginBottom: 8 }}>{status}</div>
        <div style={{ color: 'rgba(240,217,181,0.5)', fontSize: 14, marginBottom: 28 }}>
          {winner === 'draw' ? 'Good game — neither side could win!' : `${winner} player wins this round!`}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={startVsCpu} style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #B58863, #8B6914)', color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>Play Again</button>
          <button onClick={() => setMode('menu')} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '2px solid rgba(240,217,181,0.2)', background: 'transparent', color: '#F0D9B5', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>Menu</button>
        </div>
      </div>
    </div>
  );

  // ── PLAYING ──
  const inCheckNow = isInCheck(board, turn);
  const cpuTurn = turn === 'black' && playerColor === 'white';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a00 0%, #2d1810 50%, #1a0a00 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: '16px 8px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 520, marginBottom: 12 }}>
        <button onClick={() => setMode('menu')} style={{ background: 'rgba(240,217,181,0.1)', border: 'none', color: '#F0D9B5', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", padding: '8px 14px', borderRadius: 8 }}>Menu</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#FFD234', fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>
            {cpuTurn ? '🤖 CPU Thinking...' : `${turn === 'white' ? '⬜' : '⬛'} ${turn === playerColor ? 'Your Turn' : "Opponent's Turn"}`}
          </div>
          {status && <div style={{ color: status.includes('check') ? '#FF6B6B' : '#F0D9B5', fontSize: 12, marginTop: 2 }}>{status}</div>}
        </div>
        <div style={{ background: 'rgba(240,217,181,0.1)', padding: '8px 14px', borderRadius: 8, color: '#F0D9B5', fontSize: 12, fontWeight: 700 }}>
          {DIFF_LABELS[difficulty].emoji} {DIFF_LABELS[difficulty].label}
        </div>
      </div>

      {/* Captured by white (black pieces taken) */}
      <div style={{ width: '100%', maxWidth: 520, marginBottom: 6, minHeight: 24, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {capturedBlack.map((p, i) => <span key={i} style={{ fontSize: 18, opacity: 0.7 }}>{pieceSymbol[p]}</span>)}
      </div>

      {/* Board */}
      <div style={{ transform: playerColor === 'black' ? 'rotate(180deg)' : 'none' }}>
        {renderBoard()}
      </div>

      {/* Captured by black (white pieces taken) */}
      <div style={{ width: '100%', maxWidth: 520, marginTop: 6, minHeight: 24, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {capturedWhite.map((p, i) => <span key={i} style={{ fontSize: 18, opacity: 0.7, color: '#F0D9B5' }}>{pieceSymbol[p]}</span>)}
      </div>

      <button onClick={startVsCpu} style={{ marginTop: 16, background: 'rgba(240,217,181,0.08)', border: '1px solid rgba(240,217,181,0.15)', color: 'rgba(240,217,181,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", padding: '8px 20px', borderRadius: 8 }}>
        New Game
      </button>
    </div>
  );
}
