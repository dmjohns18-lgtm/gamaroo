import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: 'pkce',
          persistSession: true,
        }
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) console.error('Exchange error:', error)
  }

  return NextResponse.redirect(new URL('/setup', requestUrl.origin))
}
