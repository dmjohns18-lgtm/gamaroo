export const dynamic = 'force-static'
import { readFileSync } from 'fs'
import path from 'path'

export default function Home() {
  const html = readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf8')
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const body = bodyMatch ? bodyMatch[1] : html
  return <div dangerouslySetInnerHTML={{ __html: body }} />
}