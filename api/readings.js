export default async function handler(req, res) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date required' });

  try {
    const response = await fetch(`https://www.missalemeum.com/en/calendar/${date}`, {
      headers: { 'User-Agent': 'Spiritu/1.0' }
    });
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
}

