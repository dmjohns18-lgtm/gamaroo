'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Suspense } from 'react'

const avatars = [
  '🏀', '⚽', '🏈', '⚾', '🎾', '🏐',
  '🦁', '🐯', '🦊', '🐸', '🐼', '🐨',
  '🦄', '🐬', '🦋', '🌸', '⭐', '🌈',
  '🎀', '👑', '💎', '🌺', '🧸', '🦸‍♀️',
  '🦸', '🎮', '🎯', '🏆', '🚀', '🎵'
]

function SetupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [grade, setGrade] = useState('')
  const [avatar, setAvatar] = useState('🏀')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const code = searchParams.get('code')
    
    async function init() {
      if (code) {
        console.log('Exchanging code...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        console.log('Exchange result:', data?.session?.user?.email, error)
        if (data?.session) {
          setSessionReady(true)
          setChecking(false)
          return
        }
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Existing session:', session?.user?.email)
      if (session) {
        setSessionReady(true)
      }
      setChecking(false)
    }
    
    init()
  }, [])

  const handleSubmit = async () => {
    if (!username || !grade) { setError('Please fill in all fields!'); return }
    if (username.length < 3) { setError('Username must be at least 3 characters!'); return }

    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setError('Session expired. Please sign in again.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').insert({
      id: session.user.id,
      username: username.toLowerCase().trim(),
      grade: parseInt(grade),
      avatar,
      tier: 'Rookie',
      total_points: 0
    })

    if (error) {
      if (error.code === '23505') setError('That username is taken!')
      else { setError('Something went wrong.'); console.error(error) }
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (checking) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '24px', fontFamily: 'Nunito, system-ui, sans-serif'
    }}>
      Setting up your session... 🎮
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui, sans-serif', padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '48px',
        width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>{avatar}</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a2e', margin: '0 0 8px' }}>
            Set Up Your Profile
          </h1>
          <p style={{ color: '#666', margin: 0, fontWeight: '600' }}>
            {sessionReady ? "Let's get you ready to play!" : "⚠️ Session issue — try signing in again"}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: '800', color: '#1a1a2e', display: 'block', marginBottom: '12px', fontSize: '15px' }}>
            Pick your avatar
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {avatars.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                width: '52px', height: '52px', fontSize: '26px',
                border: avatar === a ? '3px solid #FF6B35' : '3px solid #eee',
                borderRadius: '12px', background: avatar === a ? '#fff5f0' : '#f9f9f9',
                cursor: 'pointer', transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{a}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '800', color: '#1a1a2e', display: 'block', marginBottom: '8px', fontSize: '15px' }}>
            Username
          </label>
          <input type="text" placeholder="e.g. hoopstar22" value={username}
            onChange={e => setUsername(e.target.value)} maxLength={20}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '12px',
              border: '2px solid #eee', fontSize: '16px', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: '600'
            }}
            onFocus={e => e.target.style.border = '2px solid #FF6B35'}
            onBlur={e => e.target.style.border = '2px solid #eee'}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: '800', color: '#1a1a2e', display: 'block', marginBottom: '8px', fontSize: '15px' }}>
            What grade are you in?
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[1,2,3,4,5].map(g => (
              <button key={g} onClick={() => setGrade(g)} style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                border: grade === g ? '3px solid #FF6B35' : '3px solid #eee',
                background: grade === g ? '#FF6B35' : '#f9f9f9',
                color: grade === g ? 'white' : '#333',
                fontWeight: '900', fontSize: '18px', cursor: 'pointer',
                fontFamily: 'Nunito, system-ui, sans-serif'
              }}>{g}</button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fff0f0', color: '#e53e3e', padding: '12px 16px',
            borderRadius: '10px', marginBottom: '20px', fontWeight: '700', fontSize: '14px'
          }}>{error}</div>
        )}

        <button onClick={handleSubmit} disabled={loading || !sessionReady} style={{
          width: '100%', padding: '16px',
          background: (loading || !sessionReady) ? '#ccc' : 'linear-gradient(135deg, #FF6B35, #f7c59f)',
          color: 'white', border: 'none', borderRadius: '14px',
          fontSize: '18px', fontWeight: '900',
          cursor: (loading || !sessionReady) ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
          fontFamily: 'Nunito, system-ui, sans-serif'
        }}>
          {loading ? 'Setting up...' : "Let's Play! 🚀"}
        </button>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#1a1a2e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: '24px'
      }}>Loading...</div>
    }>
      <SetupForm />
    </Suspense>
  )
}
