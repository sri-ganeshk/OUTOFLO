// api/profile-pic.ts  (or pages/api/profile-pic.ts if Next.js)
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing `url` query parameter')
  }

  try {
    // fetch with a browser-like User-Agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok || !response.body) {
      console.error('Upstream fetch failed:', response.status, await response.text().catch(()=>''))
      return res.status(502).send('Error fetching image')
    }

    // mirror the content-type
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    res.setHeader('Content-Type', contentType)

    // stream the buffer out
    const arrayBuffer = await response.arrayBuffer()
    res.send(Buffer.from(arrayBuffer))
  } catch (err) {
    console.error('Profile-pic handler error:', err)
    res.status(502).send('Error fetching image')
  }
}
