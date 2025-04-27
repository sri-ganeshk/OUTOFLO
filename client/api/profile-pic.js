// api/proxy-image.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing imageUrl parameter' });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).end(); // Return the error status code
    }

    const imageBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', response.headers.get('content-type'));
    res.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Error fetching image:', error);
    return res.status(500).json({ error: 'Failed to fetch image' });
  }
}
