// pages/api/profile-pic.js
export default async function handler(req, res) {
  console.log('[profile-pic] incoming request →', req.method, req.url);

  const { url } = req.query;
  console.log('[profile-pic] query param url:', url);
  if (!url || typeof url !== 'string') {
    console.error('[profile-pic] ❌ missing or invalid url param');
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // prevent any caching on your proxy
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    console.log('[profile-pic] ▶ fetching upstream image');
    const upstream = await fetch(url, {
      headers: {
        // forward the real UA or fall back to a common browser string
        'User-Agent':    req.headers['user-agent'] || 'Mozilla/5.0',
        // trick LinkedIn’s CDN into thinking we’re coming from linkedin.com
        'Referer':       'https://www.linkedin.com/',
        'Accept':        'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });

    console.log('[profile-pic] upstream status:', upstream.status);
    if (!upstream.ok) {
      console.error('[profile-pic] ❌ upstream fetch failed with', upstream.status);
      return res.status(upstream.status).end();
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    console.log('[profile-pic] content-type →', contentType);
    res.setHeader('Content-Type', contentType);

    // stream binary directly through
    upstream.body.pipe(res).on('finish', () => {
      console.log('[profile-pic] ✅ streamed successfully');
    });
  } catch (err) {
    console.error('[profile-pic] 🚨 fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
