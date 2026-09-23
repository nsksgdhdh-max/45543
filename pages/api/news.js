import { deleteNewsById, saveNews } from '../../lib/news'

export default function handler(req, res) {
  if (req.method === 'POST') {
    const title = String(req.body?.title || '').trim()
    const body = String(req.body?.body || '').trim()

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' })
    }

    const item = saveNews({
      title,
      excerpt: String(req.body?.excerpt || '').trim(),
      body,
      image: String(req.body?.image || '').trim(),
      createdAt: new Date().toISOString(),
    })

    return res.status(201).json({ success: true, item })
  }

  if (req.method === 'DELETE') {
    const id = String(req.body?.id || '').trim()

    if (!id) {
      return res.status(400).json({ error: 'News id is required' })
    }

    const list = deleteNewsById(id)
    return res.status(200).json({ success: true, items: list })
  }

  res.setHeader('Allow', 'POST, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
