import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a scam detection expert. Respond ONLY with valid JSON, no markdown:
{"verdict":"SCAM"|"LIKELY SCAM"|"SUSPICIOUS"|"LIKELY SAFE"|"SAFE","confidence":0-100,"summary":"1-2 sentences","red_flags":["..."],"advice":"one sentence"}`,
        messages: [{ role: 'user', content: `Analyze for scam indicators:\n\n${text}` }],
      }),
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '{}';
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: String(err) });
  }
}
