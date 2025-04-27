import http from 'http'
import https from 'https'
import { URL } from 'url'

export default async function handler(req, res) {
  try {
    // Get target URL from query parameters
    const { url } = req.query
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid `url` query parameter' })
    }

    // Validate URL to prevent security issues
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    // Select appropriate client based on protocol
    const client = parsedUrl.protocol === 'https:' ? https : http

    // Add cache buster to URL
    parsedUrl.searchParams.append('_cb', Date.now())
    const targetUrl = parsedUrl.toString()

    // Prepare headers to forward
    const headers = {
      // Default headers
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    }

    // Forward selected headers from the original request
    const headersToForward = [
      'accept',
      'content-type',
      'authorization',
      'x-requested-with',
      'cookie'
    ]

    headersToForward.forEach(header => {
      if (req.headers[header]) {
        headers[header] = req.headers[header]
      }
    })

    // Set anti-caching headers on our response
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    
    // Handle CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    // Create request options
    const requestOptions = {
      method: req.method,
      headers: headers,
      timeout: 30000, // 30 second timeout
    }

    return new Promise((resolve, reject) => {
      const proxyReq = client.request(targetUrl, requestOptions, (proxyRes) => {
        // Handle 304 responses by converting to 200
        if (proxyRes.statusCode === 304) {
          res.status(200).end('No content available');
          return resolve();
        }

        // Forward status code (except 304)
        res.statusCode = proxyRes.statusCode;

        // Forward response headers, except caching related ones
        Object.keys(proxyRes.headers).forEach(key => {
          if (!['etag', 'last-modified', 'cache-control'].includes(key.toLowerCase())) {
            res.setHeader(key, proxyRes.headers[key]);
          }
        });

        // Pipe response content
        proxyRes.pipe(res);
        proxyRes.on('end', resolve);
      });

      // Handle request body for POST/PUT methods
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        if (typeof req.body === 'string') {
          proxyReq.write(req.body);
        } else {
          proxyReq.write(JSON.stringify(req.body));
        }
      }

      // Handle errors
      proxyReq.on('error', (error) => {
        console.error('Proxy error:', error);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Failed to proxy request', details: error.message });
        }
        reject(error);
      });

      // End the request
      proxyReq.end();
    });
    
  } catch (error) {
    console.error('Proxy handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal proxy error', details: error.message });
    }
    return;
  }
}