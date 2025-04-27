import http from 'http'
import https from 'https'

export default function handler(req, res) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).end('Missing `url` query parameter')
  }

  // pick the right client
  const client = url.startsWith('https') ? https : http
  
  // Create a clean request without conditional headers
  const requestOptions = {
    headers: {
      // LinkedIn (and many sites) require a UA
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
                    '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      // Force fresh content
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    }
  }
  
  // Do NOT forward these conditional headers from the browser request
  // This is the key to preventing 304 responses
  
  // Set aggressive anti-caching headers on our response
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  
  // Add a timestamp parameter to bust any caches
  const cacheBuster = new URL(url);
  cacheBuster.searchParams.append('_cb', Date.now());
  
  // proxy the request to the cache-busted URL
  client
    .get(cacheBuster.toString(), requestOptions, upstream => {
      // Always serve as 200 OK, even if upstream returns 304
      if (upstream.statusCode === 304) {
        return res.status(200).end('No image data available');
      }
      
      // forward content-type
      if (upstream.headers['content-type']) {
        res.setHeader('Content-Type', upstream.headers['content-type'])
      } else {
        res.setHeader('Content-Type', 'application/octet-stream')
      }
      
      // Remove any ETag or Last-Modified headers to prevent future 304s
      res.removeHeader('ETag');
      res.removeHeader('Last-Modified');
      
      // pipe the image bytes straight to the response
      upstream.pipe(res)
    })
    .on('error', err => {
      console.error('Proxy error:', err)
      if (!res.headersSent) res.status(502).end('Error fetching image')
    })
}