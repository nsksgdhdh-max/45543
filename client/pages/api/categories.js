import fs from 'node:fs'
import path from 'node:path'

const categoriesPath = path.join(process.cwd(), 'data', 'categories.json')

const DEFAULT_CATEGORIES = [
  { slug: 'male-health', label: 'Männliche Gesundheit', subcategories: ['Prostatitis und Männergesundheit', 'Potenz und Libido'] },
  { slug: 'vision-hearing', label: 'Sehen und Hören', subcategories: ['Hören und Gleichgewicht'] },
  { slug: 'metabolism', label: 'Stoffwechsel und Diabetes', subcategories: ['Stoffwechsel und Diabetes', 'Gewichtsmanagement'] },
  { slug: 'heart', label: 'Herz und Blutdruck', subcategories: ['Herz und Blutdruck', 'Kreislauf und Energie'] },
  { slug: 'digestive', label: 'Verdauung und Magen-Darm', subcategories: ['Verdauung und Magen-Darm', 'Darmsanierung'] },
  { slug: 'joints', label: 'Gelenke und Bewegungsapparat', subcategories: ['Gelenke und Bewegungsapparat', 'Muskel und Rücken'] },
  { slug: 'weight-loss', label: 'Gewichtsverlust und Detox', subcategories: ['Gewichtsverlust und Detox', 'Appetit und Stoffwechsel'] },
  { slug: 'nerves', label: 'Nervensystem', subcategories: ['Nervensystem', 'Stress und Schlaf'] },
  { slug: 'urinary', label: 'Urogenitalsystem', subcategories: ['Urogenitalsystem', 'Prostata und Harnwege'] },
  { slug: 'venous-health', label: 'Venöse Gesundheit', subcategories: ['Venöse Gesundheit', 'Pflege für die Füße'] },
  { slug: 'skin', label: 'Schönheit und Haut', subcategories: ['Anti-Aging-Pflege', 'Schönheit und Haut'] },
  { slug: 'immune', label: 'Immunität und allgemeine Gesundheit', subcategories: ['Immunität und allgemeine Gesundheit', 'Detox und allgemeine Vitalität'] },
]

function normalizeSubcategories(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(',')
  return raw
    .map((entry) => String(entry || '').trim())
    .filter(Boolean)
    .filter((entry, index, list) => list.indexOf(entry) === index)
}

function readCategories() {
  try {
    const raw = fs.readFileSync(categoriesPath, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CATEGORIES
  } catch (error) {
    return DEFAULT_CATEGORIES
  }
}

function writeCategories(categories) {
  fs.mkdirSync(path.dirname(categoriesPath), { recursive: true })
  fs.writeFileSync(categoriesPath, `${JSON.stringify(categories, null, 2)}\n`)
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ categories: readCategories() })
  }

  if (req.method === 'POST') {
    const { action, category } = req.body || {}
    const categories = readCategories()

    if (action === 'upsert' && category) {
      const slug = String(category.slug || '').trim()
      const label = String(category.label || category.name || slug || 'Neue Kategorie').trim()
      const subcategories = normalizeSubcategories(category.subcategories)

      if (!slug) {
        return res.status(400).json({ error: 'Slug is required' })
      }

      const nextCategories = [...categories]
      const index = nextCategories.findIndex((item) => item.slug === slug)
      const nextCategory = { slug, label, subcategories }

      if (index >= 0) {
        nextCategories[index] = { ...nextCategories[index], ...nextCategory }
      } else {
        nextCategories.push(nextCategory)
      }

      writeCategories(nextCategories)
      return res.status(200).json({ success: true, categories: nextCategories, category: nextCategory })
    }

    if ((action === 'delete' || action === 'remove') && category?.slug) {
      const filtered = categories.filter((item) => item.slug !== category.slug)
      writeCategories(filtered)
      return res.status(200).json({ success: true, categories: filtered })
    }

    return res.status(400).json({ error: 'Unsupported action' })
  }

  if (req.method === 'DELETE') {
    const { slug } = req.body || {}
    if (!slug) {
      return res.status(400).json({ error: 'Category slug is required' })
    }
    const categories = readCategories().filter((item) => item.slug !== slug)
    writeCategories(categories)
    return res.status(200).json({ success: true, categories })
  }

  res.setHeader('Allow', 'GET, POST, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
