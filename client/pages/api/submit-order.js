import { saveOne } from '../../lib/db'

const WEBMASTER_ID = '993341'
const WEBMASTER_API = '9c23a4de7c85633bf978986b9e8c1729'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method' })

  const { name, phone, product_id, ref, langCode, s, w, t, p, m } = req.body
  if (!name || !phone || !product_id) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const post = {
    ref: ref || WEBMASTER_ID,
    api_key: WEBMASTER_API,
    product_id,
    phone,
    name,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    s: s || '',
    w: w || '',
    t: t || '',
    p: p || '',
    m: m || '',
    langCode: langCode || 'DE',
  }

  try {
    const r = await fetch('https://m1.top/send_order/', {
      method: 'POST',
      body: new URLSearchParams(post),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    })
    const text = await r.text()
    let json = null
    try { json = JSON.parse(text) } catch (e) { json = { raw: text } }

    // save to local DB
    saveOne({ receivedAt: new Date().toISOString(), post, response: json })

    res.status(200).json({ ok: true, response: json })
  } catch (err) {
    saveOne({ receivedAt: new Date().toISOString(), post, error: String(err) })
    res.status(500).json({ error: String(err) })
  }
}
