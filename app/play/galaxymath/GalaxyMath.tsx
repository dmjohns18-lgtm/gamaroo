'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '../../../lib/supabase/client'

const ASSET = '/galaxymath/craftpix-896714-space-adventures-2d-game-kit/PNG'

const QUESTIONS = {
  3: [
    { q: '7 × 8', a: 56 }, { q: '6 × 9', a: 54 }, { q: '8 × 8', a: 64 },
    { q: '9 × 9', a: 81 }, { q: '7 × 7', a: 49 }, { q: '6 × 7', a: 42 },
    { q: '8 × 9', a: 72 }, { q: '6 × 8', a: 48 }, { q: '7 × 9', a: 63 },
    { q: '56 ÷ 7', a: 8 }, { q: '54 ÷ 6', a: 9 }, { q: '64 ÷ 8', a: 8 },
  ],
  4: [
    { q: '23 × 4', a: 92 }, { q: '15 × 6', a: 90 }, { q: '12 × 8', a: 96 },
    { q: '144 ÷ 12', a: 12 }, { q: '96 ÷ 8', a: 12 }, { q: '11 × 11', a: 121 },
  ],
  5: [
    { q: '125 × 4', a: 500 }, { q: '256 ÷ 8', a: 32 }, { q: '15 × 15', a: 225 },
    { q: '144 ÷ 12', a: 12 }, { q: '13 × 13', a: 169 }, { q: '625 ÷ 25', a: 25 },
  ],
}

function getRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function getQuestion(grade: number) {
  const pool = QUESTIONS[grade as keyof typeof QUESTIONS] || QUESTIONS[3]
  return pool[Math.floor(Math.random() * pool.length)]
}

function generateChoices(answer: number) {
  const choices = new Set([answer])
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10
    if (offset !== 0) choices.add(answer + offset)
  }
  return Array.from(choices).sort(() => Math.random() - 0.5)
}

export default function GalaxyMath() {
  const supabase = createClient()
  const [screen, setScreen] = useState<'lobby' | 'game' | 'result'>('lobby')
  const [mode, setMode] = useState<'solo' | 'host' | 'join'>('solo')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [grade, setGrade] = useState(3)
  const [playerName, setPlayerName] = useState('Player')
  const [question, setQuestion] = useState(getQuestion(3))
  const [choices, setChoices] = useState(generateChoices(56))
  const [health, setHealth] = useState(100)
  const [enemyHealth, setEnemyHealth] = useState(100)
  const [ammo, setAmmo] = useState(5)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [aliens, setAliens] = useState<{id:number,x:number,y:number,frame:number}[]>([])
  const [bullets, setBullets] = useState<{id:number,x:number,y:number}[]>([])
  const [playerX, setPlayerX] = useState(50)
  const [bgOffset, setBgOffset] = useState(0)
  const [frame, setFrame] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [opponent, setOpponent] = useState<{name:string,health:number,score:number} | null>(null)
  const channelRef = useRef<any>(null)
  const gameLoop = useRef<number>()
  const bulletId = useRef(0)
  const alienId = useRef(0)

  // Spawn aliens
  useEffect(() => {
    if (screen !== 'game' || gameOver) return
    const interval = setInterval(() => {
      setAliens(prev => {
        if (prev.length >= 5) return prev
        return [...prev, {
          id: alienId.current++,
          x: Math.random() * 80 + 5,
          y: -10,
          frame: 0
        }]
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [screen, gameOver])

  // Game loop
  useEffect(() => {
    if (screen !== 'game' || gameOver) return
    const loop = setInterval(() => {
      setFrame(f => (f + 1) % 14)
      setBgOffset(o => (o + 0.2) % 100)
      setAliens(prev => prev.map(a => ({ ...a, y: a.y + 0.3, frame: (a.frame + 1) % 8 })).filter(a => {
        if (a.y > 100) {
          setHealth(h => {
            const next = h - 10
            if (next <= 0) setGameOver(true)
            return Math.max(0, next)
          })
          return false
        }
        return true
      }))
      setBullets(prev => prev.map(b => ({ ...b, y: b.y - 3 })).filter(b => b.y > -10))
    }, 50)
    return () => clearInterval(loop)
  }, [screen, gameOver])

  // Bullet/alien collision
  useEffect(() => {
    setBullets(prev => {
      const remaining = [...prev]
      setAliens(al => al.filter(alien => {
        const hit = remaining.findIndex(b =>
          Math.abs(b.x - alien.x) < 8 && Math.abs(b.y - alien.y) < 8
        )
        if (hit !== -1) {
          remaining.splice(hit, 1)
          setScore(s => s + 10)
          return false
        }
        return true
      }))
      return remaining
    })
  }, [bullets])

  function answerQuestion(choice: number) {
    const correct = choice === question.a
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      setAmmo(a => Math.min(a + 3, 10))
      setScore(s => s + 50)
      setStreak(s => s + 1)
    } else {
      setHealth(h => Math.max(0, h - 15))
      setStreak(0)
    }
    setTimeout(() => {
      setFeedback(null)
      const q = getQuestion(grade)
      setQuestion(q)
      setChoices(generateChoices(q.a))
    }, 800)

    if (mode !== 'solo' && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'answer',
        payload: { correct, score: score + (correct ? 50 : 0), health: correct ? health : health - 15 }
      })
    }
  }

  function shoot() {
    if (ammo <= 0 || gameOver) return
    setAmmo(a => a - 1)
    setBullets(prev => [...prev, { id: bulletId.current++, x: playerX, y: 85 }])
  }

  async function hostGame() {
    const code = getRoomCode()
    setRoomCode(code)
    setMode('host')
    const channel = supabase.channel(`galaxy-${code}`)
    channelRef.current = channel
    channel
      .on('broadcast', { event: 'join' }, ({ payload }) => {
        setOpponent({ name: payload.name, health: 100, score: 0 })
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        setOpponent(o => o ? { ...o, health: payload.health, score: payload.score } : o)
      })
      .on('broadcast', { event: 'gameover' }, ({ payload }) => {
        setWinner(payload.winner)
        setScreen('result')
      })
      .subscribe()
    setScreen('game')
  }

  async function joinGame() {
    setMode('join')
    const channel = supabase.channel(`galaxy-${joinCode}`)
    channelRef.current = channel
    channel
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        setOpponent(o => o ? { ...o, health: payload.health, score: payload.score } : o)
      })
      .subscribe(() => {
        channel.send({ type: 'broadcast', event: 'join', payload: { name: playerName } })
        setOpponent({ name: 'Host', health: 100, score: 0 })
        setRoomCode(joinCode)
        setScreen('game')
      })
  }

  function moveLeft() { setPlayerX(x => Math.max(5, x - 5)) }
  function moveRight() { setPlayerX(x => Math.min(95, x + 5)) }

  if (screen === 'lobby') return (
    <div style={{
      minHeight: '100vh', background: '#0a0a1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Nunito, sans-serif', color: 'white', padding: 24
    }}>
      <img src={`${ASSET}/Main Planes/Plane01/Idle and Moving/skeleton-MovingNIdle_0.png`}
        style={{ width: 80, marginBottom: 16 }} />
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#a78bfa', marginBottom: 8 }}>Galaxy Math</h1>
      <p style={{ color: '#94a3b8', marginBottom: 32 }}>Answer questions. Fuel your ship. Destroy aliens!</p>

      <div style={{ background: '#1e1b4b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400 }}>
        <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14 }}>Your Name</label>
        <input value={playerName} onChange={e => setPlayerName(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #3730a3',
            background: '#0f0e2a', color: 'white', marginBottom: 16, boxSizing: 'border-box' }} />

        <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14 }}>Grade</label>
        <select value={grade} onChange={e => setGrade(Number(e.target.value))}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #3730a3',
            background: '#0f0e2a', color: 'white', marginBottom: 24, boxSizing: 'border-box' }}>
          <option value={3}>Grade 3</option>
          <option value={4}>Grade 4</option>
          <option value={5}>Grade 5</option>
        </select>

        <button onClick={() => setScreen('game')}
          style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: '#7c3aed', color: 'white', fontWeight: 800, fontSize: 16,
            cursor: 'pointer', marginBottom: 12 }}>
          Solo Play
        </button>

        <button onClick={hostGame}
          style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: '#1d4ed8', color: 'white', fontWeight: 800, fontSize: 16,
            cursor: 'pointer', marginBottom: 12 }}>
          Host Multiplayer
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Room Code" maxLength={6}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #3730a3',
              background: '#0f0e2a', color: 'white', fontFamily: 'monospace', fontSize: 16 }} />
          <button onClick={joinGame}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#059669', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
            Join
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 'result') return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, sans-serif', color: 'white' }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fbbf24' }}>
        {winner === playerName ? 'You Win! 🏆' : 'Game Over'}
      </h1>
      <p style={{ fontSize: 24, color: '#94a3b8', margin: '16px 0' }}>Score: {score}</p>
      <button onClick={() => { setScreen('lobby'); setHealth(100); setScore(0); setAmmo(5); setAliens([]); setBullets([]); setGameOver(false) }}
        style={{ padding: '14px 32px', borderRadius: 10, border: 'none',
          background: '#7c3aed', color: 'white', fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>
        Play Again
      </button>
    </div>
  )

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a1a',
      fontFamily: 'Nunito, sans-serif', position: 'relative', userSelect: 'none' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={`${ASSET}/Backgrounds/01/Layer1.png`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
      </div>

      {/* HUD */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.6)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#a78bfa', fontWeight: 800 }}>{playerName}</span>
          <div style={{ width: 120, height: 12, background: '#1e1b4b', borderRadius: 6 }}>
            <div style={{ width: `${health}%`, height: '100%', background: '#22c55e',
              borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>{health}%</span>
        </div>

        {mode !== 'solo' && (
          <div style={{ background: '#1e1b4b', padding: '4px 12px', borderRadius: 8,
            fontSize: 14, color: '#fbbf24', fontWeight: 800, letterSpacing: 2 }}>
            {roomCode}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: '#fbbf24', fontWeight: 800 }}>⭐ {score}</span>
          <span style={{ color: '#818cf8' }}>🚀 ×{ammo}</span>
          {streak >= 3 && <span style={{ color: '#f97316' }}>🔥 ×{streak}</span>}
        </div>
      </div>

      {/* Opponent bar */}
      {opponent && (
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, padding: '8px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
          <span style={{ color: '#f87171', fontWeight: 800, fontSize: 13 }}>{opponent.name}</span>
          <div style={{ width: 100, height: 8, background: '#1e1b4b', borderRadius: 4 }}>
            <div style={{ width: `${opponent.health}%`, height: '100%', background: '#f87171', borderRadius: 4 }} />
          </div>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>⭐ {opponent.score}</span>
        </div>
      )}

      {/* Game area */}
      <div style={{ position: 'absolute', inset: 0, top: opponent ? 90 : 50 }}>

        {/* Aliens */}
        {aliens.map(alien => (
          <div key={alien.id} style={{ position: 'absolute', left: `${alien.x}%`, top: `${alien.y}%`,
            transform: 'translate(-50%, -50%)' }}>
            <img src={`${ASSET}/Enemy/Char01/Moving/skeleton-Moving_${alien.frame % 8}.png`}
              style={{ width: 48, imageRendering: 'pixelated' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        ))}

        {/* Bullets */}
        {bullets.map(b => (
          <div key={b.id} style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`,
            transform: 'translate(-50%, -50%)' }}>
            <img src={`${ASSET}/Projectile/01.png`} style={{ width: 16 }} />
          </div>
        ))}

        {/* Player ship */}
        <div style={{ position: 'absolute', left: `${playerX}%`, bottom: '8%',
          transform: 'translateX(-50%)' }}>
          <img src={`${ASSET}/Main Planes/Plane01/Idle and Moving/skeleton-MovingNIdle_${frame % 14}.png`}
            style={{ width: 64, imageRendering: 'pixelated' }} />
        </div>
      </div>

      {/* Question panel */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(15,14,42,0.95)', borderTop: '2px solid #3730a3', padding: 16, zIndex: 10 }}>

        {feedback && (
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, marginBottom: 8,
            color: feedback === 'correct' ? '#22c55e' : '#ef4444' }}>
            {feedback === 'correct' ? '✓ Correct! +3 ammo' : '✗ Wrong! -15 HP'}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 12 }}>
          {question.q} = ?
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {choices.map(c => (
            <button key={c} onClick={() => answerQuestion(c)}
              style={{ padding: '12px', borderRadius: 10, border: '2px solid #3730a3',
                background: '#1e1b4b', color: 'white', fontWeight: 800, fontSize: 18,
                cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#3730a3')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1e1b4b')}>
              {c}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={moveLeft}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#374151', color: 'white', fontWeight: 800, fontSize: 20, cursor: 'pointer' }}>
            ◀
          </button>
          <button onClick={shoot} disabled={ammo <= 0}
            style={{ padding: '10px 32px', borderRadius: 8, border: 'none',
              background: ammo > 0 ? '#7c3aed' : '#374151', color: 'white',
              fontWeight: 800, fontSize: 16, cursor: ammo > 0 ? 'pointer' : 'not-allowed' }}>
            🚀 FIRE ({ammo})
          </button>
          <button onClick={moveRight}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#374151', color: 'white', fontWeight: 800, fontSize: 20, cursor: 'pointer' }}>
            ▶
          </button>
        </div>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 20 }}>
          <h2 style={{ fontSize: 48, color: '#ef4444', fontWeight: 900 }}>Game Over</h2>
          <p style={{ color: '#94a3b8', fontSize: 20, margin: '12px 0' }}>Score: {score}</p>
          <button onClick={() => { setHealth(100); setScore(0); setAmmo(5); setAliens([]); setBullets([]); setGameOver(false) }}
            style={{ padding: '14px 32px', borderRadius: 10, border: 'none',
              background: '#7c3aed', color: 'white', fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}