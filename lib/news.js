import fs from 'fs'
import path from 'path'
import { toEnglishSlug } from './product'

const newsPath = path.join(process.cwd(), 'data', 'news.json')

export function buildNewsSlug(entry) {
  const value = typeof entry === 'string' ? entry : (entry?.title || entry?.id || entry?.createdAt || '')
  const slug = toEnglishSlug(String(value || ''))

  if (slug) return slug

  const fallback = String(entry?.id || entry?.createdAt || '').trim()
  return fallback || 'news'
}

export function normalizeNewsItem(item) {
  const listItem = item || {}
  const title = String(listItem.title || '').trim()
  const created = listItem.createdAt || new Date().toISOString()
  const slug = String(listItem.slug || buildNewsSlug({ title, id: listItem.id, createdAt: created }))

  return {
    ...listItem,
    id: listItem.id || `news-${Date.now()}`,
    slug,
    title,
    excerpt: String(listItem.excerpt || '').trim(),
    body: String(listItem.body || '').trim(),
    image: String(listItem.image || '').trim(),
    createdAt: created,
  }
}

export function readNews() {
  try {
    const raw = fs.readFileSync(newsPath, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    const list = Array.isArray(parsed) ? parsed : []
    return list
      .map((item) => normalizeNewsItem(item))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  } catch (error) {
    return []
  }
}

export function saveNews(entry) {
  const list = readNews()
  const item = normalizeNewsItem({
    ...entry,
    id: entry?.id || `news-${Date.now()}`,
    title: String(entry?.title || '').trim(),
    excerpt: String(entry?.excerpt || '').trim(),
    body: String(entry?.body || '').trim(),
    image: String(entry?.image || '').trim(),
    createdAt: entry?.createdAt || new Date().toISOString(),
  })

  const next = [item, ...list].filter((document) => document.title || document.body)

  fs.mkdirSync(path.dirname(newsPath), { recursive: true })
  fs.writeFileSync(newsPath, `${JSON.stringify(next, null, 2)}\n`)

  return item
}

export function deleteNewsById(id) {
  const list = readNews().filter((item) => String(item.id || item.slug || item.createdAt) !== String(id))

  fs.mkdirSync(path.dirname(newsPath), { recursive: true })
  fs.writeFileSync(newsPath, `${JSON.stringify(list, null, 2)}\n`)

  return list
}
