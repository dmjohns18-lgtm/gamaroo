'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function CallbackClient() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'teacher') router.push('/dashboard/teacher')
      else if (profile?.role === 'student') router.push('/dashboard/student')
      else if (profile?.role === 'parent') router.push('/profile-select')
      else router.push('/onboarding')
    }
    redirect()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", background: '#f4f4ff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🦘</div>
        <p style={{ color: '#9090B8', fontWeight: 700 }}>Signing you in...</p>
      </div>
    </div>
  )
}
