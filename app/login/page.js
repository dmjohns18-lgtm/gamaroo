'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import GoogleLoginButton from '../../components/GoogleLoginButton'

export default function LoginPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user && profile) router.push('/dashboard')
      else if (user && !profile) router.push('/setup')
    }
  }, [user, profile, loading])

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#2A3BAF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Nunito, system-ui, sans-serif'
    }}>
      Loading...
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2A3BAF 0%, #3B4BC8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Nunito, system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🦘</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '900',
          color: '#1E293B',
          margin: '0 0 8px'
        }}>
          Welcome to Gamaroo!
        </h1>
        <p style={{
          color: '#64748b',
          marginBottom: '32px',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Sign in to track your progress and earn badges!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLoginButton />
        </div>
        <p style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#94a3b8',
          fontWeight: '600'
        }}>
          Free for students. Always.
        </p>
        <a href="/" style={{
          display: 'block',
          marginTop: '16px',
          color: '#3B4BC8',
          fontWeight: '700',
          fontSize: '14px',
          textDecoration: 'none'
        }}>
          ← Back to homepage
        </a>
      </div>
    </div>
  )
}
