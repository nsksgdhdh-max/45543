import fs from 'fs'
import path from 'path'
import { saveOne } from '../../lib/db'
import { findPartnerById, resolveProductPartnerId } from '../../lib/partners'

const LEGACY_WEBMASTER_ID = '993341'
const LEGACY_WEBMASTER_API = '9c23a4de7c85633bf978986b9e8c1729'
const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'specific_products.json')

function getClientIP(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  if (forwarded) return forwarded
  return req.socket?.remoteAddress || '127.0.0.1'
}

function readProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_PATH, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

function findProductByPayload(productList, productId, partnerId) {
  if (!productId) return null

  const normalizedPartner = String(partnerId || '').trim()
  return productList.find((item) => {
    const itemId = String(item.product_id || item.id || '')
    const itemPartner = String(item.partner_id || item.vendor_id || 'metacpa_default')
    return itemId === String(productId) && (!normalizedPartner || itemPartner === normalizedPartner)
  }) || productList.find((item) => String(item.product_id || item.id || '') === String(productId)) || null
}

async function sendLegacyLead(post) {
  const formData = new URLSearchParams()
  for (const [key, value] of Object.entries(post)) {
    if (value === undefined || value === null) continue
    formData.set(key, String(value))
  }

  const response = await fetch('https://m1.top/send_order/', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (error) {
    return { raw: text }
  }
}

async function sendPartnerLead(partner, payload, req) {
  const leadUrl = String(partner?.lead_url || 'https://metacpa.ru/create').trim()
  const method = String(partner?.lead_method || 'GET').toUpperCase()
  const params = new URLSearchParams()

  const flowHash = String(payload.flow_hash || partner?.flow_hash || '').trim()
  if (flowHash) params.set('flow_hash', flowHash)
  params.set('name', String(payload.name || '').trim())
  params.set('phone', String(payload.phone || '').trim())
  params.set('ip', String(payload.ip || getClientIP(req) || '127.0.0.1'))

  const knownFields = ['partner_id', 'product_id', 'product_name', 'product_price', 'product_img', 'ref', 'langCode']
  const extra = partner?.extra_fields || {}
  const blocks = {
    partner_id: payload.partner_id || '',
    product_id: payload.product_id || '',
    product_name: payload.product_name || '',
    product_price: payload.product_price || '',
    product_img: payload.product_img || '',
  }

  for (const [fieldKey, fieldValue] of Object.entries(blocks)) {
    const mapped = extra?.[fieldKey] || fieldKey
    if (fieldValue !== undefined && fieldValue !== null && String(fieldValue).trim() !== '') {
      params.set(String(mapped), String(fieldValue))
    }
  }

  if (partner?.api_key) params.set('api_key', String(partner.api_key))
  if (partner?.token) params.set('token', String(partner.token))
  if (partner?.webmaster_id) params.set('webmaster_id', String(partner.webmaster_id))

  for (const [key, value] of Object.entries(payload)) {
    if (knownFields.includes(key) || value === undefined || value === null || String(value).trim() === '') continue
    params.set(String(key), String(value))
  }

  const finalUrl = method === 'POST' ? leadUrl : `${leadUrl}${leadUrl.includes('?') ? '&' : '?'}${params.toString()}`
  const response = await fetch(finalUrl, {
    method,
    body: method === 'POST' ? params : undefined,
    headers: method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : { Accept: 'application/json' },
  })

  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (error) {
    return { raw: text }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body || {}
  const { name, phone, product_id, partner_id, ref, langCode, s, w, t, p, m, flow_hash } = body
  if (!name || !phone || !product_id) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const productList = readProducts()
  const resolvedProduct = findProductByPayload(productList, product_id, partner_id || '')
  const resolvedPartnerId = String(resolvedProduct?.partner_id || partner_id || 'metacpa_default')
  const partner = findPartnerById(resolvedPartnerId)
  const productFlowHash = String(resolvedProduct?.flow_hash || flow_hash || partner?.flow_hash || '').trim()
  const shouldUseLegacy = String(partner?.id || '').trim().toLowerCase() === 'm1'
    || !String(partner?.lead_url || '').includes('metacpa.ru')

  const post = {
    ref: ref || partner?.webmaster_id || LEGACY_WEBMASTER_ID,
    api_key: partner?.api_key || LEGACY_WEBMASTER_API,
    product_id,
    partner_id: resolvedPartnerId,
    flow_hash: productFlowHash,
    phone,
    name,
    ip: getClientIP(req),
    s: s || '',
    w: w || '',
    t: t || '',
    p: p || '',
    m: m || '',
    langCode: langCode || 'DE',
    product_name: resolvedProduct?.name || body.product_name || '',
    product_price: body.product_price || '',
    product_img: body.product_img || resolvedProduct?.img || '',
  }

  try {
    const response = shouldUseLegacy
      ? await sendLegacyLead(post)
      : await sendPartnerLead(partner, post, req)

    saveOne({
      receivedAt: new Date().toISOString(),
      partner_id: resolvedPartnerId,
      post,
      response,
    })

    return res.status(200).json({ ok: true, partner_id: resolvedPartnerId, response })
  } catch (error) {
    saveOne({
      receivedAt: new Date().toISOString(),
      partner_id: resolvedPartnerId,
      post,
      error: String(error),
    })
    return res.status(500).json({ error: String(error) })
  }
}
