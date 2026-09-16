import { saveOne } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, phone, comment } = req.body || {}

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields: name and phone' })
  }

  const payload = {
    source: 'contact',
    name: String(name).trim(),
    phone: String(phone).trim(),
    comment: String(comment || '').trim(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    createdAt: new Date().toISOString(),
  }

  try {
    saveOne({
      receivedAt: new Date().toISOString(),
      source: 'contact',
      post: payload,
      response: { ok: true },
    })

    return res.status(200).json({ ok: true, message: 'Заявка сохранена' })
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
