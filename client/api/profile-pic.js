export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Never cache this proxy response
  res.setHeader('Cache-Control', 'no-store');

  try {
    // Ask LinkedIn’s CDN to treat us like a real browser
    const upstream = await fetch(url, {
      headers: {
        // forward the user’s UA so it looks legit
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        // LinkedIn will let through images if referer is linkedin.com
        Referer: 'https://www.linkedin.com/',
        // let them know we’ll accept any image type
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }

    // Stream the binary out
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    upstream.body.pipe(res);
  } catch (error) {
    console.error('fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
