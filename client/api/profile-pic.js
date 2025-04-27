// client/api/profile-pic.js
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing `url` query parameter');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)…'
      }
    });
    if (!response.ok || !response.body) {
      console.error('Upstream failed:', response.status);
      return res.status(502).send('Error fetching image');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error('Profile-pic handler error:', err);
    res.status(502).send('Error fetching image');
  }
}
