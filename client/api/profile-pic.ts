// api/profile-pic.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing `url` query parameter')
  }

  try {
    // fetch the LinkedIn image as a stream
    const response = await axios.get(url, { responseType: 'stream' })
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg')
    response.data.pipe(res)
  } catch (err) {
    console.error(err)
    res.status(502).send('Error fetching image')
  }
}
