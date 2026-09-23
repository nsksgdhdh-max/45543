import { ensureDefaultPartner, getDefaultPartner, readPartners, writePartners } from '../../lib/partners'

function normalizePartnerPayload(input = {}) {
  const raw = input || {}
  const id = String(raw.id || raw.partner_id || raw.name || 'partner')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return {
    id: id || 'partner',
    name: String(raw.name || raw.title || 'New partner').trim() || 'New partner',
    lead_url: String(raw.lead_url || raw.url || 'https://metacpa.ru/create').trim(),
    lead_method: String(raw.lead_method || 'GET').toUpperCase(),
    flow_hash: String(raw.flow_hash || '').trim(),
    api_key: String(raw.api_key || '').trim(),
    token: String(raw.token || '').trim(),
    webmaster_id: String(raw.webmaster_id || raw.webmasterId || '').trim(),
    extra_fields: raw.extra_fields || {
      sub1: 'partner_id',
      sub2: 'product_id',
      sub3: 'product_name',
      sub4: 'product_price',
      sub5: 'product_img',
    },
    active: raw.active !== false,
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ partners: ensureDefaultPartner() })
  }

  if (req.method === 'POST') {
    const incoming = req.body || {}
    const partners = ensureDefaultPartner()
    const partner = normalizePartnerPayload(incoming)
    const existingIndex = partners.findIndex((item) => String(item.id || '').trim() === String(partner.id))

    if (existingIndex >= 0) {
      partners[existingIndex] = { ...partners[existingIndex], ...partner }
    } else {
      partners.push(partner)
    }

    writePartners(partners)
    return res.status(200).json({ ok: true, partner, partners })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    const partners = ensureDefaultPartner().filter((partner) => String(partner.id || '').trim() !== String(id || ''))

    if (partners.length === 0) {
      partners.push(getDefaultPartner())
    }

    writePartners(partners)
    return res.status(200).json({ ok: true, partners })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
