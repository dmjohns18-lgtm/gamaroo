import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    return NextResponse.redirect(`${origin}/setup?code=${code}`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
