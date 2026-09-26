import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { inferFamilyCategory, inferSubcategoryLabel } from '../../lib/catalog'
import { classifyProductWithAi } from '../../lib/ai'
import { toEnglishSlug } from '../../lib/product'

const DEFAULT_API_URL = 'https://core.metacpa.ru/api/offers/info'
const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'specific_products.json')

function toText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch (error) {
    return ''
  }
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeImage(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw
  if (raw.startsWith('/')) return raw
  if (raw.startsWith('./')) return `/${raw.replace(/^\.\//, '')}`
  return raw
}

function resolveLocalImageExtension(url = '', contentType = '') {
  const mime = String(contentType || '').toLowerCase()
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('svg')) return 'svg'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'

  const lowerUrl = String(url || '').toLowerCase()
  if (lowerUrl.endsWith('.png')) return 'png'
  if (lowerUrl.endsWith('.webp')) return 'webp'
  if (lowerUrl.endsWith('.gif')) return 'gif'
  if (lowerUrl.endsWith('.svg')) return 'svg'
  if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'jpg'

  return 'jpg'
}

async function downloadOfferImageToPublic(imageUrl, productId, productName) {
  const rawImageUrl = String(imageUrl || '').trim()
  if (!rawImageUrl) return ''
  if (!/^https?:\/\//i.test(rawImageUrl)) return normalizeImage(rawImageUrl)

  try {
    const response = await fetch(rawImageUrl)
    if (!response.ok) return normalizeImage(rawImageUrl)

    const buffer = Buffer.from(await response.arrayBuffer())
    if (!buffer.length) return normalizeImage(rawImageUrl)

    const outputDir = path.join(process.cwd(), 'public', 'img', 'offers')
    fs.mkdirSync(outputDir, { recursive: true })

    const hash = crypto.createHash('sha1').update(rawImageUrl).digest('hex').slice(0, 12)
    const baseName = `${toEnglishSlug(productName || productId || 'product') || 'product'}-${hash}`
    const ext = resolveLocalImageExtension(rawImageUrl, response.headers.get('content-type'))
    const localPath = path.join(outputDir, `${baseName}.${ext}`)

    if (!fs.existsSync(localPath)) {
      fs.writeFileSync(localPath, buffer)
    }

    return `/img/offers/${path.basename(localPath)}`
  } catch (error) {
    return normalizeImage(rawImageUrl)
  }
}

function getNestedValue(source, paths) {
  let current = source
  for (const key of paths) {
    if (!current || typeof current !== 'object') return ''
    current = current[key]
    if (current === undefined || current === null) return ''
  }
  return current
}

function getFirstDefined(...candidates) {
  for (const value of candidates) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return value
  }
  return ''
}

function resolveGeoCode(offer, fallback = 'DE') {
  const explicit = getFirstDefined(
    offer?.geo?.code,
    offer?.geo_code,
    offer?.country_code,
    offer?.geo?.country_code,
    offer?.geo?.id,
    offer?.country?.code,
    offer?.target?.[0]?.code,
    offer?.target?.[0]?.geo_code,
    offer?.geo?.name,
    offer?.country,
    offer?.geo_name
  )

  if (!explicit) return fallback
  const value = String(explicit)
  if (/^DE$/i.test(value) || /germany/i.test(value) || value === '276') return 'DE'
  return value.toUpperCase()
}

function resolveApiFamilySlug(offer, fallbackName = '') {
  const categoryText = [
    ...(Array.isArray(offer?.categories) ? offer.categories.map((item) => sanitizeOfferTitle(item?.title || item?.name || '')) : []),
    offer?.category,
    offer?.category_title,
    offer?.family,
    offer?.subcategory,
    fallbackName,
    sanitizeOfferTitle(offer?.title),
    sanitizeOfferTitle(offer?.name),
    offer?.description,
    offer?.info,
  ].join(' ')

  const normalized = String(categoryText || '').toLowerCase()

  const skinSignals = /(varix|skincare|cosmetic|cosmetics|beauty|cream|gel|serum|lotion|anti[- ]?age|rejuvenation|skin care|body care|varicose|venous|vein|морщин|крем|гель|сыворот|лосьон|уход|кожа|очищение.*кож|кож.*уход)/i
  if (skinSignals.test(normalized)) {
    return 'skin'
  }

  const map = [
    { slug: 'male-health', keywords: ['male', 'prostat', 'prostate', 'potency', 'testosterone', 'libido', 'virility', 'androlog'] },
    { slug: 'vision-hearing', keywords: ['vision', 'hearing', 'ear', 'eye', 'optic', 'audi', 'inner ear', 'hearing loss'] },
    { slug: 'metabolism', keywords: ['metabolism', 'diabetes', 'glucose', 'sugar', 'blood sugar', 'weight support', 'metabolic'] },
    { slug: 'heart', keywords: ['heart', 'blood pressure', 'cardio', 'hypertension', 'pressure', 'circulation'] },
    { slug: 'digestive', keywords: ['digestive', 'gastro', 'stomach', 'gut', 'bowel', 'intestinal', 'digestion', 'detox', 'colon', 'parasite'] },
    { slug: 'joints', keywords: ['joint', 'joints', 'arthritis', 'cartilage', 'pain in joints', 'bones', 'spine', 'back pain', 'muscle'] },
    { slug: 'weight-loss', keywords: ['weight loss', 'slimming', 'fat burning', 'detox', 'body weight', 'lean', 'fat reduction'] },
    { slug: 'nerves', keywords: ['nerves', 'nerve', 'stress', 'insomnia', 'anxiety', 'sleep', 'psyche', 'mental'] },
    { slug: 'urinary', keywords: ['urinary', 'bladder', 'kidney', 'cystitis', 'prostate', 'urology', 'urine'] },
    { slug: 'skin', keywords: ['skin', 'beauty', 'derma', 'wrinkle', 'acne', 'hair', 'face'] },
    { slug: 'immune', keywords: ['immune', 'health', 'vitamin', 'antioxidant', 'wellness', 'support', 'general health'] },
  ]

  const matched = map.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))
  if (matched) return matched.slug

  return inferFamilyCategory({ name: fallbackName, info: normalized, category: 'general' }).slug
}

function resolveApiSubcategory(offer, familySlug) {
  const text = `${sanitizeOfferTitle(offer?.title) || ''} ${sanitizeOfferTitle(offer?.name) || ''} ${offer?.description || ''} ${offer?.info || ''}`
  const categoryTitle = Array.isArray(offer?.categories)
    ? offer.categories.map((entry) => entry?.title || entry?.name || '').filter(Boolean).join(' ')
    : ''

  return inferSubcategoryLabel({
    name: offer?.title || offer?.name || '',
    info: text || categoryTitle,
    category: familySlug,
    subcategory: categoryTitle,
  })
}

function extractPrice(offer, geoCode) {
  const candidates = []

  if (offer?.landing_price && typeof offer.landing_price === 'object') {
    candidates.push(offer.landing_price.value, offer.landing_price.price, offer.landing_price.amount)
    if (offer.landing_price.currency) {
      return {
        price: String(offer.landing_price.value || offer.landing_price.price || offer.landing_price.amount || '0'),
        currency: String(offer.landing_price.currency || 'EUR').toUpperCase(),
      }
    }
  }

  if (Array.isArray(offer?.rates)) {
    for (const rate of offer.rates) {
      const entryValue = rate?.value || rate?.amount || rate?.price || rate?.rate
      const entryCurrency = rate?.currency || rate?.currency_id || rate?.currencyCode || 'EUR'
      if (entryValue !== undefined && entryValue !== null && String(entryValue).trim() !== '') {
        candidates.push(entryValue)
        if (!entryCurrency) continue
        return { price: String(entryValue), currency: String(entryCurrency).toUpperCase() }
      }
    }
  }

  const geoTargetEntries = Array.isArray(offer?.target) ? offer.target : []
  if (geoTargetEntries.length > 0) {
    const match = geoTargetEntries.find((entry) => String(entry?.code || '').toUpperCase() === String(geoCode || 'DE').toUpperCase()) || geoTargetEntries[0]
    if (match) {
      const expense = getFirstDefined(match.price, match.cost, match.value, match.amount)
      if (expense) return { price: String(expense), currency: String(match.currency || 'EUR').toUpperCase() }
    }
  }

  const rawPrice = getFirstDefined(offer?.price, offer?.price_value, offer?.sale_price, offer?.promo_price)
  if (rawPrice) {
    const cleaned = String(rawPrice).replace(/[^0-9.,]/g, '').replace(/,/g, '.')
    return { price: cleaned || '0', currency: String(offer?.currency || offer?.landing_price?.currency || 'EUR').toUpperCase() }
  }

  const fallback = candidates.length > 0 ? candidates[0] : '0'
  return { price: String(fallback).replace(/[^0-9.,]/g, '').replace(/,/g, '.') || '0', currency: 'EUR' }
}

function offerMatchesGeo(offer, geoCode) {
  const target = String(geoCode || 'DE').toUpperCase()
  const candidates = []

  if (offer?.geo && typeof offer.geo === 'object') {
    candidates.push(offer.geo)
  }
  if (offer?.country && typeof offer.country === 'object') {
    candidates.push(offer.country)
  }
  if (Array.isArray(offer?.geo)) {
    candidates.push(...offer.geo)
  }
  if (Array.isArray(offer?.target)) {
    candidates.push(...offer.target)
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue
    const code = String(candidate.code || candidate.geo_code || candidate.country_code || '').toUpperCase()
    const name = String(candidate.name || candidate.title || candidate.geo_name || candidate.country || '').toLowerCase()
    if (code === target || name.includes('germany') || name.includes('deutschland')) {
      return true
    }
  }

  if (typeof offer?.geo === 'string' || typeof offer?.country === 'string') {
    const raw = String(offer.geo || offer.country || '').toLowerCase()
    return raw.includes('de') || raw.includes('germany') || raw.includes('deutschland')
  }

  return false
}

function parseOfferIdList(value) {
  const raw = String(value || '')
  if (!raw.trim()) return []

  return raw
    .split(/[\s,;]+/)
    .map((segment) => String(segment).trim())
    .filter(Boolean)
    .map((segment) => segment.replace(/[^0-9]/g, ''))
    .filter(Boolean)
}

function offerMatchesOfferId(offer, offerIds) {
  if (!Array.isArray(offerIds) || offerIds.length === 0) return true
  const set = new Set(offerIds.map((item) => String(item)))
  const aliasValues = [
    offer?.id,
    offer?.offer_id,
    offer?.product_id,
    offer?.productId,
    offer?.meta_id,
    offer?.offerId,
  ]

  return aliasValues.some((value) => value !== undefined && value !== null && set.has(String(value)))
}

function sanitizeOfferTitle(value) {
  let result = String(value || '')
    .replace(/\s*#\s*/g, ' ')
    .replace(/\s*\[[A-Z]{2,3}\]\s*/g, ' ')
    .replace(/\bFull price\b/gi, ' ')
    .replace(/\bfull price\b/gi, ' ')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*[|/\\]+\s*/g, ' ')
    .replace(/\s*[:;]+\s*/g, ' ')
    .replace(/\s*[+]+\s*$/g, '')
    .replace(/\s*[-–—]+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const connectorMatch = result.match(/^(.*?)(?:\s+[+]\s*|\s+-\s+|\s+\|\s+|\s+:\s+)(.*)$/i)
  if (connectorMatch && connectorMatch[1]) {
    result = connectorMatch[1].trim()
  }

  result = result
    .replace(/\s*\+\s*$/g, '')
    .replace(/\s*[-–—]\s*$/g, '')
    .replace(/\s*\(\s*\)/g, '')
    .replace(/\b(full price|best price|sale|special offer)\b/gi, ' ')
    .replace(/\s+[-+|:]\s+/g, ' ')
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return result
}

function extractOfferName(offer) {
  const rawName = getFirstDefined(
    offer?.title,
    offer?.name,
    offer?.product_name,
    offer?.offer_name,
    offer?.brand,
    'Unnamed product'
  )

  return sanitizeOfferTitle(rawName)
}

function extractOfferDescription(offer) {
  return stripHtml(
    getFirstDefined(
      offer?.description,
      offer?.info,
      offer?.short_description,
      offer?.body,
      offer?.text,
      offer?.details,
      offer?.product?.description,
      ''
    )
  )
}

async function buildProductPayload(rawOffer, geoCode = 'DE', partnerId = 'metacpa_default') {
  const geo = String(resolveGeoCode(rawOffer, geoCode) || geoCode || 'DE').toUpperCase()
  const name = String(extractOfferName(rawOffer) || 'Unnamed product').trim() || 'Unnamed product'
  const description = extractOfferDescription(rawOffer)
  const fallbackName = `${name} ${description}`.slice(0, 200)
  const familySlug = resolveApiFamilySlug(rawOffer, fallbackName)
  const subcategory = resolveApiSubcategory(rawOffer, familySlug)
  const rawImageUrl = normalizeImage(
    getFirstDefined(
      rawOffer?.thumbnail,
      rawOffer?.img,
      rawOffer?.image,
      rawOffer?.picture,
      rawOffer?.photo,
      rawOffer?.main_image,
      getNestedValue(rawOffer, ['media', 'main']),
      getNestedValue(rawOffer, ['images', 0]),
      getNestedValue(rawOffer, ['product', 'image']),
      getNestedValue(rawOffer, ['product', 'img']),
      ''
    )
  )

  const priceInfo = extractPrice(rawOffer, geo)
  const productId = String(getFirstDefined(rawOffer?.product_id, rawOffer?.id, rawOffer?.offer_id, `${Date.now()}-${Math.random().toString(16).slice(2)}`))
  const image = await downloadOfferImageToPublic(rawImageUrl, productId, name)

  const aiResult = await classifyProductWithAi({
    name,
    description,
    info: description,
    categoryHints: Array.isArray(rawOffer?.categories) ? rawOffer.categories.map((item) => item?.title || item?.name || '').filter(Boolean) : [],
    fallbackFamily: familySlug,
    fallbackSubcategory: subcategory,
  })

  const familyHint = {
    name,
    info: description,
    category: aiResult.familyLabel || aiResult.newCategoryLabel || aiResult.familySlug || familySlug,
    subcategory: aiResult.subcategoryLabel || subcategory,
  }
  const normalizedFamily = inferFamilyCategory(familyHint)
  const resolvedFamilySlug = normalizedFamily.slug || 'immune'
  const resolvedSubcategory = aiResult.subcategoryLabel || subcategory || inferSubcategoryLabel({
    name,
    info: description,
    category: resolvedFamilySlug,
    subcategory: '',
  })

  return {
    id: String(getFirstDefined(rawOffer?.id, productId)),
    partner_id: String(partnerId || 'metacpa_default'),
    product_id: String(productId),
    flow_hash: '',
    name,
    info: description || 'Описание товара пока недоступно.',
    img: image,
    category: resolvedFamilySlug,
    subcategory: resolvedSubcategory,
    top: 0,
    main_offer: 0,
    new: 0,
    cr: 1,
    user_access: 1,
    epc: 0,
    ai_classification: {
      reason: aiResult.reason || 'auto',
      family_label: aiResult.familyLabel || resolvedFamilySlug,
      subcategory_label: resolvedSubcategory,
      created_new_category: Boolean(aiResult.shouldCreateNewCategory),
      created_new_category_name: aiResult.newCategoryLabel || null,
    },
    target: [
      {
        code: geo,
        currency: String(priceInfo.currency || 'EUR').toUpperCase(),
        price: String(priceInfo.price || '0'),
        geo_name: geo === 'DE' ? 'Германия' : geo,
      },
    ],
  }
}

async function fetchMetaOffers({ baseUrl, token, webmasterId, pagination = 0 }) {
  const endpoint = new URL(String(baseUrl || DEFAULT_API_URL).trim())
  const params = new URLSearchParams()
  if (token) params.set('token', String(token))
  if (webmasterId) params.set('webmaster_id', String(webmasterId))
  params.set('pagination', String(pagination))

  const attempts = [
    {
      method: 'GET',
      url: `${endpoint.toString()}?${params.toString()}`,
      headers: { Accept: 'application/json' },
    },
    {
      method: 'POST',
      url: endpoint.toString(),
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    },
  ]

  let lastError = null
  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, {
        method: attempt.method,
        headers: attempt.headers,
        body: attempt.body,
      })

      const text = await response.text()
      if (!response.ok) {
        const upstreamMessage = text.slice(0, 200)
        if (response.status === 401 || response.status === 403) {
          lastError = new Error(`MetaCPA API rejected the token/key (${response.status}). ${upstreamMessage}`)
        } else {
          lastError = new Error(`${response.status}: ${upstreamMessage}`)
        }
        continue
      }

      try {
        return JSON.parse(text)
      } catch (error) {
        lastError = new Error(`Invalid upstream JSON: ${text.slice(0, 200)}`)
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Could not fetch offers from upstream')
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      action = 'import',
      baseUrl = DEFAULT_API_URL,
      token = '',
      geoCode = 'DE',
      limit = 25,
      webmasterId = '',
      offerId = '',
      offerIds = '',
      partnerId = 'metacpa_default',
      flow_hash: importFlowHash = '',
    } = req.body || {}

    if (action === 'preview') {
      return res.status(200).json({ ok: true, baseUrl, geoCode, tokenProvided: Boolean(token) })
    }

    try {
      const payload = await fetchMetaOffers({
        baseUrl: String(baseUrl || DEFAULT_API_URL),
        token: String(token || ''),
        webmasterId: String(webmasterId || ''),
        pagination: 0,
      })

      if (payload && typeof payload === 'object' && 'message' in payload && String(payload.message).toLowerCase().includes('token or key is invalid')) {
        return res.status(401).json({
          success: false,
          error: 'MetaCPA token is invalid or expired.',
          upstream: payload,
        })
      }

      const offers = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.offers)
          ? payload.offers
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : []

      const geo = String(geoCode || 'DE').toUpperCase()
      const maxRecords = Number(limit) > 0 ? Number(limit) : 25
      const targetOfferIds = parseOfferIdList(String(offerId || offerIds || ''))
      const imported = []
      const resolvedImportFlowHash = String(importFlowHash || '').trim()

      const germanOffers = offers.filter((offer) => {
        if (!offer || typeof offer !== 'object') return false
        if (targetOfferIds.length > 0 && !offerMatchesOfferId(offer, targetOfferIds)) return false
        if (!offerMatchesGeo(offer, geo)) return false
        return true
      })

      const seenIds = new Set()
      for (const offer of germanOffers.slice(0, maxRecords)) {
        const product = await buildProductPayload(offer, geo, partnerId)
        if (resolvedImportFlowHash) {
          product.flow_hash = resolvedImportFlowHash
        }
        if (!product.name || !product.info) continue
        const key = `${String(product.partner_id || 'metacpa_default')}:${String(product.product_id || product.id)}`
        if (seenIds.has(key)) continue
        seenIds.add(key)
        imported.push(product)
      }

      let existing = []
      try {
        const existingRaw = fs.readFileSync(PRODUCTS_PATH, 'utf8')
        existing = JSON.parse(existingRaw || '[]')
      } catch (error) {
        existing = []
      }

      const merged = [...existing]
      for (const product of imported) {
        const productKey = `${String(product.partner_id || 'metacpa_default')}:${String(product.product_id || product.id)}`
        const index = merged.findIndex((item) => `${String(item.partner_id || 'metacpa_default')}:${String(item.product_id || item.id)}` === productKey)
        if (index >= 0) {
          merged[index] = { ...merged[index], ...product }
        } else {
          merged.push(product)
        }
      }

      fs.mkdirSync(path.dirname(PRODUCTS_PATH), { recursive: true })
      fs.writeFileSync(PRODUCTS_PATH, `${JSON.stringify(merged, null, 2)}\n`)

      return res.status(200).json({
        success: true,
        imported: imported.length,
        total: merged.length,
        products: imported,
      })
    } catch (error) {
      return res.status(500).json({ error: String(error.message || error) })
    }
  }

  return res.status(405).json({ error: 'Method not allowed. Use POST to import offers.' })
}
