export default async function handler(req, res) {
  // 1️⃣ Turn off both edge + client caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing `url` query parameter');
  }

  const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

  try {
    const response = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!response.ok) {
      console.error('Upstream fetch failed:', response.status);
      return res.status(502).send('Error fetching image');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    return res.send(buffer);
  } catch (err) {
    console.error('Profile-pic handler error:', err);
    return res.status(502).send('Error fetching image');
  }
}
