export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing `url` query parameter');
  }

  const UA =
    'Mozilla/5.0 (X11; Linux x86_64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/114.0.0.0 Safari/537.36';

  try {
    // ← cache: 'no-store' must be _outside_ of headers
    let response = await fetch(url, {
      headers: { 'User-Agent': UA },
      cache: 'no-store',
    });

    // just to make sure, log what LinkedIn actually returned:
    console.log('⚙️ fetch status:', response.status);
    console.log('⚙️ response headers:', Object.fromEntries(response.headers.entries()));

    // fallback: if it STILL comes back 304 for some reason, bust the cache with a timestamp
    if (response.status === 304) {
      const bustUrl = url + (url.includes('?') ? '&' : '?') + '_=' + Date.now();
      console.log('⚠️ 304 detected; retrying with cache-bust:', bustUrl);
      response = await fetch(bustUrl, { headers: { 'User-Agent': UA } });
    }

    if (!response.ok) {
      console.error('Upstream fetch failed:', response.status);
      return res.status(502).send('Error fetching image');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
  } catch (err) {
    console.error('Profile-pic handler error:', err);
    res.status(502).send('Error fetching image');
  }
}
