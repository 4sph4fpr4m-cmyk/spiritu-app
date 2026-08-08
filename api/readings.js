export default async function handler(req, res) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date required' });

  try {
    const response = await fetch(`https://www.missalemeum.com/en/calendar/${date}`, {
      headers: { 'User-Agent': 'Spiritu/1.0' }
    });
    const text = await response.text();

    // Extract feast name and class from the page title/heading
    // Pattern: "St. John Mary Vianney | 3rd class | Missale Meum"
    // or from the h1: "St. John Mary Vianney"
    const titleMatch = text.match(/<title>([^|]+)\s*\|/);
    const classMatch = text.match(/(\d+(?:st|nd|rd|th))\s+class/i);
    const commemorationMatch = text.match(/Commemoration[:\s]+([^<\n]+)/i);

    const feastName = titleMatch ? titleMatch[1].trim() : null;
    const feastClass = classMatch ? classMatch[1].trim() : null;
    const commemoration = commemorationMatch ? commemorationMatch[1].trim() : null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      html: text,
      feast: feastName,
      class: feastClass,
      commemoration: commemoration,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
}
