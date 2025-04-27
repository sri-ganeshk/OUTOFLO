import http from 'http'
import https from 'https'

export default function handler(req, res) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).end('Missing `url` query parameter')
  }

  // pick the right client
  const client = url.startsWith('https') ? https : http
  
  // turn off all caching at the Vercel edge + browser
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  // Create request options with headers
  const options = {
    headers: {
      // LinkedIn (and many sites) require a UA
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
                    '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      // Prevent conditional requests from our side
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }

  // Remove any browser conditional headers
  delete options.headers['if-modified-since'];
  delete options.headers['if-none-match'];

  // proxy the request
  client
    .get(url, options, upstream => {
      // forward content-type
      if (upstream.headers['content-type']) {
        res.setHeader('Content-Type', upstream.headers['content-type'])
      } else {
        res.setHeader('Content-Type', 'application/octet-stream')
      }

      // Explicitly prevent caching
      res.setHeader('Expires', '0')
      res.setHeader('Pragma', 'no-cache')

      // pipe the image bytes straight to the response
      upstream.pipe(res)
    })
    .on('error', err => {
      console.error('Proxy error:', err)
      if (!res.headersSent) res.status(502).end('Error fetching image')
    })
}