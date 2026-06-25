import { readFileSync } from 'fs'
import path from 'path'
import { readFileSync } from 
'fs'
import path from 'path'

export const dynamic = 
'force-dynamic'

export function GET() {
  const html = 
readFileSync(path.join(process.cwd(), 
'public', 'index.html'), 
'utf8')
  return new Response(html, {
    headers: { 'Content-Type': 
'text/html; charset=utf-8' },
  })
}
export const dynamic = 'force-static'

export function GET() {
  const html = readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf8')
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
