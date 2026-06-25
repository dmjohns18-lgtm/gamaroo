'use client'
import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const ASSET = '/galaxymath/craftpix-896714-space-adventures-2d-game-kit/PNG'

const QUESTIONS: Record<number, {q:string, a:number}[]> = {
  3: [
    {q:'7 × 8',a:56},{q:'6 × 9',a:54},{q:'8 × 8',a:64},{q:'9 × 9',a:81},
    {q:'7 × 7',a:49},{q:'6 × 7',a:42},{q:'8 × 9',a:72},{q:'6 × 8',a:48},
    {q:'56 ÷ 7',a:8},{q:'54 ÷ 6',a:9},{q:'64 ÷ 8',a:8},{q:'72 ÷ 9',a:8},
  ],
  4: [
    {q:'23 × 4',a:92},{q:'15 × 6',a:90},{q:'12 × 8',a:96},{q:'11 × 11',a:121},
    {q:'144 ÷ 12',a:12},{q:'96 ÷ 8',a:12},{q:'25 × 4',a:100},{q:'13 × 7',a:91},
  ],
  5: [
    {q:'125 × 4',a:500},{q:'256 ÷ 8',a:32},{q:'15 × 15',a:225},{q:'13 × 13',a:169},
    {q:'625 ÷ 25',a:25},{q:'24 × 12',a:288},{q:'144 ÷ 9',a:16},{q:'17 × 8',a:136},
  ],
}

function getRoomCode() {
  return Math.random().toString(36).substring(2,8).toUpperCase()
}

function getQ(grade: number) {
  const pool = QUESTIONS[grade] || QUESTIONS[3]
  return pool[Math.floor(Math.random() * pool.length)]
}

function makeChoices(answer: number) {
  const s = new Set([answer])
  while (s.size < 4) {
    const d = Math.floor(Math.random() * 20) - 10
    if (d !== 0) s.add(answer + d)
  }
  return Array.from(s).sort(() => Math.random() - 0.5)
}

interface GameState {
  playerX: number
  playerY: number
  playerVX: number
  playerVY: number
  health: number
  ammo: number
  score: number
  streak: number
  bullets: {id:number,x:number,y:number}[]
  aliens: {id:number,x:number,y:number,vx:number,vy:number,frame:number,health:number}[]
  explosions: {id:number,x:number,y:number,frame:number}[]
  bgOffset: number
  playerFrame: number
  frameCount: number
  paused: boolean
  gameOver: boolean
  keys: Set<string>
}

export default function GalaxyMath() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState>({
    playerX: 400, playerY: 500, playerVX: 0, playerVY: 0,
    health: 100, ammo: 5, score: 0, streak: 0,
    bullets: [], aliens: [], explosions: [],
    bgOffset: 0, playerFrame: 0, frameCount: 0,
    paused: false, gameOver: false, keys: new Set()
  })
  const imagesRef = useRef<Record<string, HTMLImageElement>>({})
  const animRef = useRef<number>()
  const bulletId = useRef(0)
  const alienId = useRef(0)
  const expId = useRef(0)

  const [screen, setScreen] = useState<'lobby'|'game'|'over'>('lobby')
  const [grade, setGrade] = useState(3)
  const [playerName, setPlayerName] = useState('Player')
  const [mode, setMode] = useState<'solo'|'host'|'join'>('solo')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [question, setQuestion] = useState(getQ(3))
  const [choices, setChoices] = useState(makeChoices(56))
  const [showQ, setShowQ] = useState(false)
  const [feedback, setFeedback] = useState<string|null>(null)
  const [hud, setHud] = useState({health:100, ammo:5, score:0, streak:0})
  const [finalScore, setFinalScore] = useState(0)
  const channelRef = useRef<any>(null)
  const [opponent, setOpponent] = useState<{name:string,health:number,score:number}|null>(null)

  // Preload images
  useEffect(() => {
    const paths: Record<string,string> = {
      bg1: `${ASSET}/Backgrounds/01/Layer1.png`,
      bg2: `${ASSET}/Backgrounds/01/Layer2.png`,
      bg3: `${ASSET}/Backgrounds/01/Layer3.png`,
      projectile: `${ASSET}/Projectile/01.png`,
    }
    for (let i = 0; i < 14; i++) {
      paths[`player${i}`] = `${ASSET}/Main Planes/Plane01/Idle and Moving/skeleton-MovingNIdle_${i}.png`
    }
    for (let i = 0; i < 26; i++) {
      paths[`alien${i}`] = `${ASSET}/Enemy/Char01/Moving/skeleton-Moving_${i}.png`
    }
    for (let i = 0; i < 8; i++) {
      paths[`exp${i}`] = `${ASSET}/Collision_Fx/skeleton-Colision_${i}.png`
    }
    Object.entries(paths).forEach(([k,v]) => {
      const img = new Image()
      img.src = v
      imagesRef.current[k] = img
    })
  }, [])

  // Controls
  useEffect(() => {
    if (screen !== 'game') return
    const down = (e: KeyboardEvent) => {
      stateRef.current.keys.add(e.key)
      if (e.key === ' ') { e.preventDefault(); fireShot() }
      if (e.key === 'p' || e.key === 'P') togglePause()
    }
    const up = (e: KeyboardEvent) => stateRef.current.keys.delete(e.key)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [screen, showQ])

  function fireShot() {
    const s = stateRef.current
    if (s.ammo <= 0 || s.paused || s.gameOver) return
    s.ammo = Math.max(0, s.ammo - 1)
    s.bullets.push({ id: bulletId.current++, x: s.playerX, y: s.playerY - 30 })
    setHud(h => ({ ...h, ammo: s.ammo }))
    // Show question if ammo hits 0
    if (s.ammo === 0) askQuestion()
  }

  function askQuestion() {
    const s = stateRef.current
    s.paused = true
    const q = getQ(grade)
    setQuestion(q)
    setChoices(makeChoices(q.a))
    setShowQ(true)
  }

  function togglePause() {
    if (showQ) return
    stateRef.current.paused = !stateRef.current.paused
  }

  function answerQ(choice: number) {
    const s = stateRef.current
    const correct = choice === question.a
    if (correct) {
      s.ammo = Math.min(s.ammo + 5, 10)
      s.score += 50
      s.streak += 1
      setFeedback('✓ Correct! +5 ammo')
    } else {
      s.health = Math.max(0, s.health - 20)
      s.streak = 0
      setFeedback('✗ Wrong! -20 HP')
      if (s.health <= 0) endGame()
    }
    setHud({ health: s.health, ammo: s.ammo, score: s.score, streak: s.streak })
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast', event: 'update',
        payload: { health: s.health, score: s.score }
      })
    }
    setTimeout(() => {
      setFeedback(null)
      setShowQ(false)
      s.paused = false
    }, 800)
  }

  function endGame() {
    stateRef.current.gameOver = true
    setFinalScore(stateRef.current.score)
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setScreen('over')
  }

  // Game loop
  useEffect(() => {
    if (screen !== 'game') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let lastSpawn = 0

    function loop(ts: number) {
      const s = stateRef.current
      const W = canvas!.width
      const H = canvas!.height
      const imgs = imagesRef.current

      if (!s.paused && !s.gameOver) {
        s.frameCount++

        // Player movement
        const speed = 4
        if (s.keys.has('ArrowLeft') || s.keys.has('a')) s.playerVX = -speed
        else if (s.keys.has('ArrowRight') || s.keys.has('d')) s.playerVX = speed
        else s.playerVX *= 0.85
        if (s.keys.has('ArrowUp') || s.keys.has('w')) s.playerVY = -speed
        else if (s.keys.has('ArrowDown') || s.keys.has('s')) s.playerVY = speed
        else s.playerVY *= 0.85

        s.playerX = Math.max(30, Math.min(W - 30, s.playerX + s.playerVX))
        s.playerY = Math.max(30, Math.min(H - 100, s.playerY + s.playerVY))
        s.playerFrame = (s.playerFrame + 1) % 14

        // Background scroll
        s.bgOffset = (s.bgOffset + 1) % H

        // Spawn aliens
        if (ts - lastSpawn > 2500 && s.aliens.length < 6) {
          s.aliens.push({
            id: alienId.current++,
            x: Math.random() * (W - 80) + 40,
            y: -40,
            vx: (Math.random() - 0.5) * 2,
            vy: 1 + Math.random(),
            frame: 0,
            health: 2
          })
          lastSpawn = ts
        }

        // Update aliens
        s.aliens = s.aliens.filter(a => {
          a.x += a.vx
          a.y += a.vy
          a.frame = (a.frame + 1) % 26
          if (a.x < 20 || a.x > W - 20) a.vx *= -1
          // Alien reaches player
          if (a.y > H) {
            s.health = Math.max(0, s.health - 15)
            setHud(h => ({ ...h, health: s.health }))
            if (s.health <= 0) endGame()
            return false
          }
          return true
        })

        // Update bullets
        s.bullets = s.bullets.filter(b => {
          b.y -= 12
          if (b.y < -20) return false
          // Check hit
          const hit = s.aliens.findIndex(a => Math.abs(b.x - a.x) < 30 && Math.abs(b.y - a.y) < 30)
          if (hit !== -1) {
            s.aliens[hit].health--
            if (s.aliens[hit].health <= 0) {
              s.explosions.push({ id: expId.current++, x: s.aliens[hit].x, y: s.aliens[hit].y, frame: 0 })
              s.aliens.splice(hit, 1)
              s.score += 20
              setHud(h => ({ ...h, score: s.score }))
            }
            return false
          }
          return true
        })

        // Update explosions
        s.explosions = s.explosions.filter(e => {
          e.frame++
          return e.frame < 8
        })

        // Auto-ask question every 15 seconds
        if (s.frameCount % 900 === 0) askQuestion()
      }

      // Draw
      ctx.clearRect(0, 0, W, H)

      // Background layers
      if (imgs.bg1?.complete) {
        ctx.drawImage(imgs.bg1, 0, 0, W, H)
      } else {
        ctx.fillStyle = '#0a0a2e'
        ctx.fillRect(0, 0, W, H)
      }
      if (imgs.bg2?.complete) {
        ctx.globalAlpha = 0.6
        ctx.drawImage(imgs.bg2, 0, s.bgOffset - H, W, H)
        ctx.drawImage(imgs.bg2, 0, s.bgOffset, W, H)
        ctx.globalAlpha = 1
      }

      // Bullets
      s.bullets.forEach(b => {
        if (imgs.projectile?.complete) {
          ctx.drawImage(imgs.projectile, b.x - 8, b.y - 16, 16, 32)
        } else {
          ctx.fillStyle = '#fbbf24'
          ctx.fillRect(b.x - 3, b.y - 12, 6, 24)
        }
      })

      // Aliens
      s.aliens.forEach(a => {
        const img = imgs[`alien${a.frame % 26}`]
        if (img?.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, a.x - 32, a.y - 32, 64, 64)
        } else {
          ctx.fillStyle = '#ef4444'
          ctx.fillRect(a.x - 20, a.y - 20, 40, 40)
        }
      })

      // Explosions
      s.explosions.forEach(e => {
        const img = imgs[`exp${Math.min(e.frame, 7)}`]
        if (img?.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, e.x - 40, e.y - 40, 80, 80)
        }
      })

      // Player ship
      const pImg = imgs[`player${s.playerFrame}`]
      if (pImg?.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, s.playerX - 40, s.playerY - 40, 80, 80)
      } else {
        ctx.fillStyle = '#818cf8'
        ctx.beginPath()
        ctx.moveTo(s.playerX, s.playerY - 30)
        ctx.lineTo(s.playerX - 20, s.playerY + 20)
        ctx.lineTo(s.playerX + 20, s.playerY + 20)
        ctx.closePath()
        ctx.fill()
      }

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, W, 56)

      // Health bar
      ctx.fillStyle = '#374151'
      ctx.fillRect(16, 16, 200, 20)
      ctx.fillStyle = s.health > 50 ? '#22c55e' : s.health > 25 ? '#f59e0b' : '#ef4444'
      ctx.fillRect(16, 16, s.health * 2, 20)
      ctx.strokeStyle = '#6b7280'
      ctx.strokeRect(16, 16, 200, 20)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 12px Nunito, sans-serif'
      ctx.fillText(`HP: ${s.health}%`, 22, 30)

      // Score
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 18px Nunito, sans-serif'
      ctx.fillText(`⭐ ${s.score}`, W/2 - 30, 34)

      // Ammo
      ctx.fillStyle = '#a78bfa'
      ctx.font = 'bold 16px Nunito, sans-serif'
      ctx.fillText(`🚀 ${s.ammo}`, W - 80, 34)

      // Streak
      if (s.streak >= 3) {
        ctx.fillStyle = '#f97316'
        ctx.fillText(`🔥 x${s.streak}`, W/2 + 60, 34)
      }

      // Room code
      if (mode !== 'solo' && roomCode) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 14px monospace'
        ctx.fillText(`Room: ${roomCode}`, W/2 - 40, H - 16)
      }

      // Controls hint
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '12px Nunito, sans-serif'
      ctx.fillText('Arrow keys to move • Space to shoot', 16, H - 16)

      if (!s.gameOver) animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [screen, grade, mode, roomCode])

  async function hostGame() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const code = getRoomCode()
    setRoomCode(code)
    setMode('host')
    const ch = supabase.channel(`galaxy-${code}`)
    channelRef.current = ch
    ch.on('broadcast', { event: 'join' }, ({ payload }) => {
      setOpponent({ name: payload.name, health: 100, score: 0 })
    }).on('broadcast', { event: 'update' }, ({ payload }) => {
      setOpponent(o => o ? { ...o, health: payload.health, score: payload.score } : o)
    }).subscribe()
    startGame()
  }

  async function joinGame() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    setMode('join')
    const ch = supabase.channel(`galaxy-${joinCode}`)
    channelRef.current = ch
    ch.on('broadcast', { event: 'update' }, ({ payload }) => {
      setOpponent(o => o ? { ...o, health: payload.health, score: payload.score } : o)
    }).subscribe(() => {
      ch.send({ type: 'broadcast', event: 'join', payload: { name: playerName } })
      setOpponent({ name: 'Host', health: 100, score: 0 })
      setRoomCode(joinCode)
      startGame()
    })
  }

  function startGame() {
    const s = stateRef.current
    s.playerX = window.innerWidth / 2
    s.playerY = window.innerHeight - 150
    s.health = 100
    s.ammo = 5
    s.score = 0
    s.streak = 0
    s.bullets = []
    s.aliens = []
    s.explosions = []
    s.bgOffset = 0
    s.playerFrame = 0
    s.frameCount = 0
    s.paused = false
    s.gameOver = false
    s.keys = new Set()
    setHud({ health: 100, ammo: 5, score: 0, streak: 0 })
    setShowQ(false)
    setFeedback(null)
    const q = getQ(grade)
    setQuestion(q)
    setChoices(makeChoices(q.a))
    setScreen('game')
  }

  if (screen === 'lobby') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, sans-serif', color: 'white', padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>🚀</div>
      <h1 style={{ fontSize: 42, fontWeight: 900, color: '#a78bfa', margin: 0 }}>Galaxy Math</h1>
      <p style={{ color: '#94a3b8', marginBottom: 32, textAlign: 'center' }}>
        Fly your ship • Answer math questions to reload • Shoot aliens!
      </p>

      <div style={{ background: 'rgba(30,27,75,0.9)', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 420, border: '1px solid #3730a3' }}>

        <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Your Name</label>
        <input value={playerName} onChange={e => setPlayerName(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #3730a3',
            background: '#0f0e2a', color: 'white', marginBottom: 16, boxSizing: 'border-box', fontSize: 15 }} />

        <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Grade</label>
        <select value={grade} onChange={e => setGrade(Number(e.target.value))}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #3730a3',
            background: '#0f0e2a', color: 'white', marginBottom: 24, boxSizing: 'border-box', fontSize: 15 }}>
          <option value={3}>Grade 3 — Multiplication & Division</option>
          <option value={4}>Grade 4 — Multi-digit Operations</option>
          <option value={5}>Grade 5 — Advanced Operations</option>
        </select>

        <button onClick={startGame}
          style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white',
            fontWeight: 900, fontSize: 17, cursor: 'pointer', marginBottom: 10 }}>
          🚀 Solo Play
        </button>

        <button onClick={hostGame}
          style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #1d4ed8, #0369a1)', color: 'white',
            fontWeight: 900, fontSize: 17, cursor: 'pointer', marginBottom: 10 }}>
          👥 Host Multiplayer
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ROOM CODE" maxLength={6}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #3730a3',
              background: '#0f0e2a', color: 'white', fontFamily: 'monospace',
              fontSize: 16, letterSpacing: 3, textTransform: 'uppercase' }} />
          <button onClick={joinGame}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#059669', color: 'white', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
            Join
          </button>
        </div>
      </div>

      <p style={{ color: '#475569', fontSize: 13, marginTop: 24 }}>
        Arrow keys to move • Space to shoot • Answer math to reload ammo
      </p>
    </div>
  )

  if (screen === 'over') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, sans-serif', color: 'white' }}>
      <div style={{ fontSize: 72 }}>💥</div>
      <h1 style={{ fontSize: 52, fontWeight: 900, color: '#ef4444', margin: '8px 0' }}>Game Over</h1>
      <p style={{ fontSize: 28, color: '#fbbf24', margin: '8px 0' }}>Score: {finalScore}</p>
      {opponent && <p style={{ color: '#94a3b8' }}>{opponent.name}: {opponent.score}</p>}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={startGame}
          style={{ padding: '14px 32px', borderRadius: 12, border: 'none',
            background: '#7c3aed', color: 'white', fontWeight: 900, fontSize: 18, cursor: 'pointer' }}>
          Play Again
        </button>
        <button onClick={() => setScreen('lobby')}
          style={{ padding: '14px 32px', borderRadius: 12, border: '2px solid #3730a3',
            background: 'transparent', color: 'white', fontWeight: 900, fontSize: 18, cursor: 'pointer' }}>
          Menu
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#0a0a2e' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Question overlay */}
      {showQ && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <div style={{ background: '#1e1b4b', borderRadius: 20, padding: 32,
            border: '2px solid #7c3aed', width: '100%', maxWidth: 400,
            fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>🚀 Reload your ammo!</div>
            {feedback ? (
              <div style={{ fontSize: 28, fontWeight: 900,
                color: feedback.startsWith('✓') ? '#22c55e' : '#ef4444' }}>{feedback}</div>
            ) : (
              <>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 24 }}>
                  {question.q} = ?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {choices.map(c => (
                    <button key={c} onClick={() => answerQ(c)}
                      style={{ padding: '16px', borderRadius: 12, border: '2px solid #3730a3',
                        background: '#0f0e2a', color: 'white', fontWeight: 900,
                        fontSize: 22, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#3730a3')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#0f0e2a')}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Opponent HUD */}
      {opponent && (
        <div style={{ position: 'absolute', top: 60, right: 16, background: 'rgba(0,0,0,0.7)',
          borderRadius: 10, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', color: 'white',
          fontSize: 13, zIndex: 10 }}>
          <div style={{ color: '#f87171', fontWeight: 800 }}>{opponent.name}</div>
          <div style={{ width: 100, height: 6, background: '#374151', borderRadius: 3, margin: '4px 0' }}>
            <div style={{ width: `${opponent.health}%`, height: '100%', background: '#ef4444', borderRadius: 3 }} />
          </div>
          <div style={{ color: '#fbbf24' }}>⭐ {opponent.score}</div>
        </div>
      )}
    </div>
  )
}