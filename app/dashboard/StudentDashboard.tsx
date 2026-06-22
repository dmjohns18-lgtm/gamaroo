'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const GAMES = [
  { id: 'mathhoops',    name: 'MathHoops',       emoji: '🏀', subject: 'Math', grades: [3,4,5], skill: 'Multiplication',   color: '#C2410C', bg: '#FFF3E0', mastery: 72 },
  { id: 'factorfc',     name: 'FactorFC',         emoji: '⚽', subject: 'Math', grades: [3,4,5], skill: 'Factors',          color: '#2E7D32', bg: '#E8F5E9', mastery: 45 },
  { id: 'galaxymath',   name: 'Galaxy Math',      emoji: '🚀', subject: 'Math', grades: [3,4,5], skill: 'Mixed Ops',        color: '#4527A0', bg: '#EDE7F6', mastery: 60 },
  { id: 'mathquest',    name: "Roo's Math Quest", emoji: '🦘', subject: 'Math', grades: [4,5],   skill: 'Multiplication',   color: '#00695C', bg: '#E0F2F1', mastery: 0  },
  { id: 'multiplymania',name: 'Multiply Mania',   emoji: '✖️', subject: 'Math', grades: [3,4],   skill: 'Multiplication',   color: '#AD1457', bg: '#FCE4EC', mastery: 33 },
  { id: 'roosgarden',   name: "Roo's Garden",     emoji: '🌸', subject: 'ELA',  grades: [0,1],   skill: 'Beginning Sounds', color: '#558B2F', bg: '#F1F8E9', mastery: 0  },
  { id: 'truefalse',    name: 'True or False',    emoji: '❓', subject: 'Math', grades: [3,4,5], skill: 'Review',           color: '#1565C0', bg: '#E3F2FD', mastery: 88 },
  { id: 'quickfire',    name: 'Quick Fire',       emoji: '🔥', subject: 'Math', grades: [3,4,5], skill: 'Speed Drill',      color: '#BF360C', bg: '#FBE9E7', mastery: 55 },
]

const TROPHIES = [
  { name: 'MathHoops',     emoji: '🏀', bronze: true,  silver: true,  gold: false },
  { name: 'FactorFC',      emoji: '⚽', bronze: true,  silver: false, gold: false },
  { name: 'Galaxy Math',   emoji: '🚀', bronze: true,  silver: true,  gold: true  },
  { name: 'Math Quest',    emoji: '🦘', bronze: false, silver: false, gold: false },
  { name: 'Multiply Mania',emoji: '✖️', bronze: true,  silver: false, gold: false },
  { name: "Roo's Garden",  emoji: '🌸', bronze: false, silver: false, gold: false },
]

const PROGRESS = [
  { name: 'MathHoops',     pct: 72 },
  { name: 'Galaxy Math',   pct: 60 },
  { name: 'True or False', pct: 88 },
  { name: 'Multiply Mania',pct: 33 },
  { name: 'Quick Fire',    pct: 55 },
]

export default function StudentDashboard() {
  const router = useRouter()
  const { user, profile, loading } = useAuth() as any
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [hovered, setHovered]         = useState<string|null>(null)
  const [gameStats, setGameStats]     = useState({ gamesPlayed: 0, accuracy: 0, streak: 0 })

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading])

  useEffect(() => {
    if (!user) return
    async function fetchStats() {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
      if (sessions && sessions.length > 0) {
        const totalGames = sessions.length
        const avgAccuracy = Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / totalGames)
        setGameStats({ gamesPlayed: totalGames, accuracy: avgAccuracy, streak: 0 })
      }
    }
    fetchStats()
  }, [user])

  if (loading || !profile) return (
    <div style={{ minHeight: '100vh', background: '#3D3DD4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontFamily: 'Nunito, sans-serif' }}>
      Loading... 🦘
    </div>
  )

  const s = {
    name: profile.username,
    grade: profile.grade,
    avatar: profile.avatar || '🦊',
    points: profile.total_points || 0,
    gamesPlayed: gameStats.gamesPlayed,
    accuracy: gameStats.accuracy,
    streak: gameStats.streak,
  }

  const myGames    = GAMES.filter(g => g.grades.includes(s.grade) && (subjectFilter === 'All' || g.subject === subjectFilter))

  const VISIBLE = 3
  const maxIdx     = Math.max(0, myGames.length - VISIBLE)

  const visibleGames      = myGames.slice(carouselIdx, carouselIdx + VISIBLE)

  const GameCard = ({ game }: { game: typeof GAMES[0] }) => (
    <div
      onClick={() => router.push(`/play/${game.id}`)}
      onMouseEnter={() => setHovered(game.id)}
      onMouseLeave={() => setHovered(null)}
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '20px 18px',
        cursor: 'pointer',
        flex: '1',
        border: `1.5px solid ${hovered === game.id ? '#3D3DD4' : '#eee'}`,
        transform: hovered === game.id ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered === game.id ? '0 10px 28px rgba(61,61,212,0.15)' : '0 2px 8px rgba(61,61,212,0.06)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: game.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '12px' }}>
        {game.emoji}
      </div>
      <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', marginBottom: '8px', background: game.bg, color: game.color, letterSpacing: '0.5px' }}>
        {game.subject.toUpperCase()}
      </div>
      <div style={{ color: '#1A1A6B', fontWeight: 800, fontSize: '15px', marginBottom: '3px' }}>{game.name}</div>
      <div style={{ color: '#888', fontSize: '12px', marginBottom: '14px' }}>{game.skill}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', fontWeight: 600, marginBottom: '4px' }}>
        <span>Mastery</span>
        <span style={{ color: game.mastery >= 80 ? '#16A34A' : game.mastery > 0 ? '#D97706' : '#bbb' }}>{game.mastery}%</span>
      </div>
      <div style={{ height: '5px', background: '#ECEEF8', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '99px', width: `${game.mastery}%`, background: game.mastery >= 80 ? '#16A34A' : game.mastery > 0 ? '#D97706' : 'transparent', transition: 'width 0.5s' }}/>
      </div>
    </div>
  )

  const ArrowBtn = ({ dir, onClick, disabled }: { dir: string, onClick: () => void, disabled: boolean }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: '40px', height: '40px', borderRadius: '50%', border: 'none',
      background: disabled ? '#E0E0E0' : '#3D3DD4', color: disabled ? '#aaa' : '#fff',
      fontSize: '18px', cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, transition: 'all 0.15s',
    }}>{dir}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#ECEEF8', fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {/* TOP NAV */}
      <nav style={{ background: '#3D3DD4', borderBottom: '3px solid #F5A623', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>🦘 Gamaroo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(245,166,35,0.2)', borderRadius: '20px', padding: '4px 14px', color: '#F5A623', fontSize: '13px', fontWeight: 700 }}>🔥 {s.streak} day streak</div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>{s.avatar}</div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#3D3DD4', padding: '28px 32px 40px', position: 'relative', overflow: 'hidden' }}>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '28px', margin: '0 0 4px' }}>Hey, {s.name}! 👋</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', margin: 0 }}>Keep playing to level up your trophies!</p>
        <div style={{ position: 'absolute', right: '32px', bottom: 0, fontSize: '80px', opacity: 0.12, lineHeight: 1 }}>🦘</div>
      </div>

      <div style={{ padding: '0 32px 40px', marginTop: '16px' }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'POINTS',   value: s.points.toLocaleString(), color: '#F5A623' },
            { label: 'GAMES',    value: String(s.gamesPlayed),     color: '#3D3DD4' },
            { label: 'ACCURACY', value: `${s.accuracy}%`,          color: '#16A34A' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(61,61,212,0.08)' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: '8px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#aaa', fontWeight: 700, letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* MY GAMES CAROUSEL */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ color: '#1A1A6B', fontWeight: 900, fontSize: '18px', margin: 0 }}>🎮 Pick a game</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['All','Math','ELA'].map(t => (
                <button key={t} onClick={() => { setSubjectFilter(t); setCarouselIdx(0); }} style={{
                  padding: '5px 16px', borderRadius: '20px', fontSize: '12px',
                  fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: subjectFilter === t ? '#3D3DD4' : '#fff',
                  color: subjectFilter === t ? '#fff' : '#888',
                  transition: 'all 0.15s',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArrowBtn dir="‹" onClick={() => setCarouselIdx(i => Math.max(0, i-1))} disabled={carouselIdx === 0} />
            <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
              {visibleGames.map(game => <GameCard key={game.id} game={game} />)}
            </div>
            <ArrowBtn dir="›" onClick={() => setCarouselIdx(i => Math.min(maxIdx, i+1))} disabled={carouselIdx >= maxIdx} />
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* TROPHY SHELF */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(61,61,212,0.06)' }}>
            <h3 style={{ color: '#1A1A6B', fontWeight: 900, fontSize: '15px', marginBottom: '16px' }}>🏆 Trophy Shelf</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
              {TROPHIES.map(t => (
                <div key={t.name} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', marginBottom: '3px' }}>{t.emoji}</div>
                  <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, marginBottom: '6px' }}>{t.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                    {[{ label:'🥉',earned:t.bronze },{ label:'🥈',earned:t.silver },{ label:'🥇',earned:t.gold }].map((m,i) => (
                      <div key={i} style={{ width:'22px',height:'22px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',background:m.earned?'#FFFBEB':'#F5F5F5',border:m.earned?'1px solid #F5A623':'1px solid #E0E0E0',opacity:m.earned?1:0.4 }}>{m.label}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:'16px',paddingTop:'14px',borderTop:'1px solid #ECEEF8',display:'flex',gap:'16px',justifyContent:'center' }}>
              {[['🥉','1 session'],['🥈','70%+'],['🥇','90%+ x3']].map(([m,l]) => (
                <div key={l} style={{ fontSize:'11px',color:'#aaa',display:'flex',alignItems:'center',gap:'4px' }}><span>{m}</span><span>{l}</span></div>
              ))}
            </div>
          </div>

          {/* PROGRESS */}
          <div style={{ background: '#3D3DD4', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(61,61,212,0.15)' }}>
            <h3 style={{ color: '#F5A623', fontWeight: 900, fontSize: '15px', marginBottom: '16px' }}>📊 My Progress</h3>
            {PROGRESS.map(p => (
              <div key={p.name} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color:'rgba(255,255,255,0.75)',fontSize:'13px',fontWeight:600 }}>{p.name}</span>
                <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                  <div style={{ width:'90px',height:'5px',background:'rgba(255,255,255,0.15)',borderRadius:'99px',overflow:'hidden' }}>
                    <div style={{ height:'100%',borderRadius:'99px',width:`${p.pct}%`,background:'#F5A623' }}/>
                  </div>
                  <span style={{ color:'#fff',fontWeight:800,fontSize:'13px',width:'32px',textAlign:'right' }}>{p.pct}%</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
