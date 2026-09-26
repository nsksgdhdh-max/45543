import fs from 'node:fs'
import path from 'node:path'
import { saveNews, readNews } from '../../lib/news'
import { generateSeoNewsDrafts } from '../../lib/seo-agent'
import { toEnglishSlug } from '../../lib/product'

const productsPath = path.join(process.cwd(), 'data', 'specific_products.json')
const imagesDir = path.join(process.cwd(), 'public', 'news-images')

function readProducts() {
  try {
    const raw = fs.readFileSync(productsPath, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

function extensionFromContentType(contentType = '') {
  const type = String(contentType).toLowerCase()
  if (type.includes('jpeg')) return '.jpg'
  if (type.includes('png')) return '.png'
  if (type.includes('webp')) return '.webp'
  if (type.includes('gif')) return '.gif'
  if (type.includes('svg')) return '.svg'
  return '.jpg'
}

function extensionFromSource(source) {
  try {
    const url = new URL(source)
    const ext = path.extname(url.pathname || '').toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
      return ext === '.jpeg' ? '.jpg' : ext
    }
  } catch (error) {
    const ext = path.extname(String(source || '')).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
      return ext === '.jpeg' ? '.jpg' : ext
    }
  }

  return '.jpg'
}

async function downloadImageToSite(source, name) {
  const raw = String(source || '').trim()
  if (!raw) return '/img/placeholder.svg'
  if (raw.startsWith('/')) {
    const sourceFile = path.join(process.cwd(), 'public', raw.replace(/^\//, ''))
    if (!fs.existsSync(sourceFile)) return raw

    const extension = extensionFromSource(raw) || path.extname(sourceFile) || '.jpg'
    fs.mkdirSync(imagesDir, { recursive: true })
    const fileName = `${toEnglishSlug(name || 'news-image')}-${Date.now()}${extension}`
    const filePath = path.join(imagesDir, fileName)
    fs.copyFileSync(sourceFile, filePath)
    return `/news-images/${fileName}`
  }
  if (raw.startsWith('data:')) {
    const match = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
    if (!match) return '/img/placeholder.svg'

    const mime = match[1]
    const buffer = Buffer.from(match[2], 'base64')
    const extension = extensionFromContentType(mime)
    fs.mkdirSync(imagesDir, { recursive: true })
    const fileName = `${toEnglishSlug(name || 'news-image')}-${Date.now()}${extension}`
    const filePath = path.join(imagesDir, fileName)
    fs.writeFileSync(filePath, buffer)
    return `/news-images/${fileName}`
  }

  if (!/^https?:\/\//i.test(raw)) {
    return raw
  }

  const response = await fetch(raw)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || ''
  const extension = extensionFromContentType(contentType) || extensionFromSource(raw)
  fs.mkdirSync(imagesDir, { recursive: true })
  const fileName = `${toEnglishSlug(name || 'news-image')}-${Date.now()}${extension}`
  const filePath = path.join(imagesDir, fileName)
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer))
  return `/news-images/${fileName}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const action = String(req.body?.action || 'generate')
  const limit = Math.max(1, Math.min(10, Number(req.body?.limit || 3) || 3))
  const categorySlug = String(req.body?.categorySlug || 'all').trim() || 'all'
  const products = readProducts()
  const news = readNews()

  const result = generateSeoNewsDrafts({
    products,
    news,
    limit,
    categorySlug,
  })

  if (action === 'publish') {
    const published = []
    const warnings = []

    for (const draft of result.drafts) {
      let image = draft.image || ''
      try {
        image = await downloadImageToSite(draft.sourceImageUrl || draft.image || '', draft.sourceProductName || draft.title)
      } catch (error) {
        warnings.push(`${draft.title}: ${error.message || 'image download failed'}`)
        image = draft.image || '/img/placeholder.svg'
      }

      published.push(
        saveNews({
          ...draft,
          image,
          createdAt: new Date().toISOString(),
        }),
      )
    }

    return res.status(200).json({
      success: true,
      published,
      warnings,
      analysis: result.analysis,
    })
  }

  return res.status(200).json({
    success: true,
    drafts: result.drafts,
    analysis: result.analysis,
  })
}
