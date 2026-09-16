import fs from 'fs'
import path from 'path'

const newsPath = path.join(process.cwd(), 'data', 'news.json')

export function readNews() {
  try {
    const raw = fs.readFileSync(newsPath, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    const list = Array.isArray(parsed) ? parsed : []
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  } catch (error) {
    return []
  }
}

export function saveNews(entry) {
  const list = readNews()
  const item = {
    id: entry?.id || `news-${Date.now()}`,
    title: String(entry?.title || '').trim(),
    excerpt: String(entry?.excerpt || '').trim(),
    body: String(entry?.body || '').trim(),
    image: String(entry?.image || '').trim(),
    createdAt: entry?.createdAt || new Date().toISOString(),
  }

  const next = [item, ...list].filter((document) => document.title || document.body)

  fs.mkdirSync(path.dirname(newsPath), { recursive: true })
  fs.writeFileSync(newsPath, `${JSON.stringify(next, null, 2)}\n`)

  return item
}

export function deleteNewsById(id) {
  const list = readNews().filter((item) => String(item.id || item.createdAt) !== String(id))

  fs.mkdirSync(path.dirname(newsPath), { recursive: true })
  fs.writeFileSync(newsPath, `${JSON.stringify(list, null, 2)}\n`)

  return list
}
