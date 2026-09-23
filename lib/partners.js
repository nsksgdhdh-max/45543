import fs from 'fs'
import path from 'path'

const PARTNERS_PATH = path.join(process.cwd(), 'data', 'partners.json')
export const DEFAULT_PARTNER_ID = 'metacpa_default'
export const LEGACY_M1_PARTNER_ID = 'm1'

export function getM1Partner() {
  return {
    id: LEGACY_M1_PARTNER_ID,
    name: 'M1 legacy',
    lead_url: 'https://m1.top/send_order/',
    lead_method: 'POST',
    flow_hash: '',
    api_key: '',
    token: '',
    webmaster_id: '993341',
    extra_fields: {
      sub1: 'partner_id',
      sub2: 'product_id',
      sub3: 'product_name',
      sub4: 'product_price',
      sub5: 'product_img',
    },
    active: true,
  }
}

export function getDefaultPartner() {
  return {
    id: DEFAULT_PARTNER_ID,
    name: 'MetaCPA default',
    lead_url: 'https://metacpa.ru/create',
    lead_method: 'GET',
    flow_hash: '',
    api_key: '',
    token: '',
    webmaster_id: '993341',
    extra_fields: {
      sub1: 'partner_id',
      sub2: 'product_id',
      sub3: 'product_name',
      sub4: 'product_price',
      sub5: 'product_img',
    },
    active: true,
  }
}

export function readPartners() {
  try {
    const raw = fs.readFileSync(PARTNERS_PATH, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

export function writePartners(partners) {
  fs.mkdirSync(path.dirname(PARTNERS_PATH), { recursive: true })
  fs.writeFileSync(PARTNERS_PATH, `${JSON.stringify(partners, null, 2)}\n`)
  return partners
}

export function ensureDefaultPartner() {
  const partners = readPartners()
  const normalized = partners.filter(Boolean)
  if (!normalized.some((partner) => String(partner.id || '').trim() === DEFAULT_PARTNER_ID)) {
    normalized.unshift(getDefaultPartner())
    writePartners(normalized)
  }
  if (!normalized.some((partner) => String(partner.id || '').trim() === LEGACY_M1_PARTNER_ID)) {
    normalized.push(getM1Partner())
    writePartners(normalized)
  }
  return normalized
}

export function findPartnerById(partnerId, fallbackId = DEFAULT_PARTNER_ID) {
  const partners = ensureDefaultPartner()
  const resolved = String(partnerId || fallbackId || DEFAULT_PARTNER_ID).trim()
  return partners.find((partner) => String(partner.id || '').trim() === resolved)
    || partners.find((partner) => String(partner.id || '').trim() === DEFAULT_PARTNER_ID)
    || partners.find((partner) => String(partner.id || '').trim() === LEGACY_M1_PARTNER_ID)
    || getDefaultPartner()
}

export function resolveProductPartnerId(product) {
  const explicit = String(product?.partner_id || product?.vendor_id || '').trim()
  if (explicit) return explicit
  const legacyMarker = String(product?.source || product?.provider || '').trim().toLowerCase()
  if (legacyMarker === 'm1' || legacyMarker === 'legacy') return LEGACY_M1_PARTNER_ID
  return LEGACY_M1_PARTNER_ID
}

export function buildPartnerProductKey(product = {}) {
  const partnerId = resolveProductPartnerId(product)
  const productId = String(product?.product_id || product?.id || 'unknown')
  return `${partnerId}:${productId}`
}
