'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ProfileSelect() {
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Quicksand:wght@600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const [, { data: kids }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).single(),
        supabase.from('children').select('*').eq('parent_id', user.id).order('created_at'),
      ]);

      setChildren(kids || []);
      setLoading(false);
    }
    load();
  }, [router]);

  function handleChildSelect(child: any) {
    sessionStorage.setItem('activeChild', JSON.stringify(child));
    router.push('/dashboard/student');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#3D3DE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🦘</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#3D3DE8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: '24px', position: 'relative' }}>
      
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: '#F5A623' }} />

      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 32, letterSpacing: 0.5 }}>Gamaroo</div>

      <div style={{ background: '#fff', borderRadius: 28, padding: '40px 36px', width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#2a2a6e', marginBottom: 4 }}>Who's playing today?</div>
        <div style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 14, color: '#9090B8', fontWeight: 600, marginBottom: 32 }}>Tap your name to start playing!</div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {children.map(child => (
            <div
              key={child.id}
              onClick={() => handleChildSelect(child)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <div
                style={{ width: 84, height: 84, borderRadius: '50%', background: '#f4f4ff', border: '3px solid #e0e0f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3D3DE8'; e.currentTarget.style.background = '#e0e0f8'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0f8'; e.currentTarget.style.background = '#f4f4ff'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {child.avatar || '🦊'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#2a2a6e' }}>{child.name}</div>
              <div style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 11, fontWeight: 600, color: '#9090B8' }}>Grade {child.grade}</div>
            </div>
          ))}

          {children.length < 4 && (
            <div
              onClick={() => router.push('/onboarding')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <div
                style={{ width: 84, height: 84, borderRadius: '50%', background: 'transparent', border: '3px dashed #e0e0f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#c0c0e0', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3D3DE8'; e.currentTarget.style.color = '#3D3DE8'; e.currentTarget.style.background = '#f4f4ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0f8'; e.currentTarget.style.color = '#c0c0e0'; e.currentTarget.style.background = 'transparent'; }}
              >
                +
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#c0c0e0' }}>Add child</div>
              <div style={{ height: 16 }} />
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/dashboard/parent')}
          style={{ background: '#f4f4ff', border: '2px solid #e0e0f8', borderRadius: 99, padding: '10px 22px', color: '#3D3DE8', fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e0e0f8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f4f4ff'; }}
        >
          Parent View
        </button>
      </div>
    </div>
  );
}
