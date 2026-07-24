export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Slug required' });

  try {
    const url = `https://sensusfidelium.com/the-liturgical-year-dom-prosper-gueranger/${slug}/`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Spiritu/1.0' }
    });
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Gueranger text' });
  }
}

