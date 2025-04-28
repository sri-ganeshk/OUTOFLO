export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  res.removeHeader('ETag');

  try {
    const response = await fetch(url, {
      // 2. Tell the origin server to bypass its cache, too
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      return res.status(response.status).end();
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error fetching image:', err);
    return res.status(500).json({ error: 'Failed to fetch image' });
  }
}
