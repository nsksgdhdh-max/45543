import fs from 'node:fs'
import path from 'node:path'

const productsPath = path.join(process.cwd(), 'data', 'specific_products.json')

function readProducts() {
  try {
    const raw = fs.readFileSync(productsPath, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    action,
    product,
    id,
    partner_id: partnerId,
    category,
    subcategory,
    top,
    main_offer: mainOffer,
    is_new: isNew,
    new: newFlag,
    title_template: titleTemplate,
    description_template: descriptionTemplate,
    seo_title_template: seoTitleTemplate,
    seo_description_template: seoDescriptionTemplate,
    delete: shouldDelete,
    name,
  } = req.body || {}

  const products = readProducts()

  if (action === 'create' || product) {
    const created = product || {}
    const safePartnerId = String(created.partner_id || partnerId || 'metacpa_default')
    const safeId = String(created.id || created.product_id || id || Date.now())
    const safeProductId = String(created.product_id || safeId)

    const nextProduct = {
      ...created,
      id: safeId,
      product_id: safeProductId,
      partner_id: safePartnerId,
      category: created.category || 'male-health',
      subcategory: created.subcategory || 'General',
      name: created.name || 'New product',
      info: created.info || '',
      img: created.img || '/img/placeholder.svg',
      tracking_link: created.tracking_link || created.trackingLink || null,
      top: Number(created.top || top || 0) === 1 ? 1 : 0,
      main_offer: Number(created.main_offer || mainOffer || 0) === 1 ? 1 : 0,
      new: Number(created.new || created.main_offer || mainOffer || 0) === 1 ? 1 : 0,
      target: [
        {
          code: 'DE',
          currency: 'EUR',
          price: String(created.price || '39'),
          price_high: String(created.price || '39'),
          pay: String(created.price || '39'),
          pay_currency: 'EUR',
          geo_name: 'Deutschland',
          callm1: '0',
        },
      ],
    }

    const exists = products.some((item) => {
      const currentKey = `${String(item.partner_id || 'metacpa_default')}:${String(item.id || item.product_id)}`
      const targetKey = `${safePartnerId}:${safeId}`
      return currentKey === targetKey
    })

    const nextProducts = exists
      ? products.map((item) => {
          const currentKey = `${String(item.partner_id || 'metacpa_default')}:${String(item.id || item.product_id)}`
          return currentKey === `${safePartnerId}:${safeId}` ? { ...item, ...nextProduct } : item
        })
      : [...products, nextProduct]

    fs.mkdirSync(path.dirname(productsPath), { recursive: true })
    fs.writeFileSync(productsPath, `${JSON.stringify(nextProducts, null, 2)}\n`)

    return res.status(200).json({ success: true, products: nextProducts, created: !exists })
  }

  if (!id) {
    return res.status(400).json({ error: 'Product id is required' })
  }

  const resolvePartner = (value) => String(value || 'metacpa_default')
  const targetPartner = resolvePartner(partnerId)
  const targetId = String(id)
  const matchesById = (product) => {
    const productPartner = resolvePartner(product.partner_id)
    const productId = String(product.id || '')
    const productProductId = String(product.product_id || '')
    return (productId === targetId || productProductId === targetId) && productPartner === targetPartner
  }
  const hasStrictMatch = products.some((product) => matchesById(product))
  const matchesTarget = (product) => {
    if (hasStrictMatch) return matchesById(product)
    const productId = String(product.id || '')
    const productProductId = String(product.product_id || '')
    return productId === targetId || productProductId === targetId
  }

  if (shouldDelete === true || shouldDelete === 1 || shouldDelete === 'true') {
    if (!products.some((product) => matchesTarget(product))) {
      return res.status(404).json({ error: 'Product not found' })
    }
    const nextProducts = products.filter((product) => !matchesTarget(product))

    fs.mkdirSync(path.dirname(productsPath), { recursive: true })
    fs.writeFileSync(productsPath, `${JSON.stringify(nextProducts, null, 2)}\n`)

    return res.status(200).json({ success: true, products: nextProducts, deleted: true })
  }

  const nextTopValue = top !== undefined && top !== null ? (Number(top) === 1 ? 1 : 0) : undefined
  const incomingMainOffer = mainOffer !== undefined && mainOffer !== null ? (Number(mainOffer) === 1 ? 1 : 0) : undefined
  const incomingNewFlag = isNew !== undefined && isNew !== null ? (Number(isNew) === 1 ? 1 : 0) : newFlag !== undefined && newFlag !== null ? (Number(newFlag) === 1 ? 1 : 0) : undefined
  const nextCategoryValue = category !== undefined && category !== null ? String(category) : undefined
  const nextSubcategoryValue = subcategory !== undefined && subcategory !== null ? String(subcategory) : undefined
  const nextNameValue = name !== undefined && name !== null ? String(name).trim() : undefined

  if (nextNameValue !== undefined && !nextNameValue) {
    return res.status(400).json({ error: 'Product name is required' })
  }
  if (!products.some((product) => matchesTarget(product))) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const nextProducts = products.map((product) => {
    const isTarget = matchesTarget(product)
    const nextProduct = { ...product }

    if (nextTopValue !== undefined) {
      nextProduct.top = nextTopValue
    }

    if (incomingMainOffer !== undefined || incomingNewFlag !== undefined) {
      const nextMainValue = incomingMainOffer ?? (isTarget && incomingNewFlag === 1 ? 1 : 0)
      const nextNewValue = incomingNewFlag ?? nextMainValue

      if (isTarget) {
        nextProduct.main_offer = nextMainValue
        nextProduct.new = nextNewValue
      } else if (nextMainValue === 1) {
        nextProduct.main_offer = 0
        nextProduct.new = 0
      }
    }

    if (isTarget) {
      if (nextCategoryValue !== undefined) {
        nextProduct.category = nextCategoryValue
      }

      if (nextSubcategoryValue !== undefined) {
        nextProduct.subcategory = nextSubcategoryValue
      }

      const resolvedTitleTemplate = titleTemplate ?? seoTitleTemplate
      const resolvedDescriptionTemplate = descriptionTemplate ?? seoDescriptionTemplate

      if (resolvedTitleTemplate !== undefined) {
        nextProduct.title_template = resolvedTitleTemplate
        nextProduct.seo_title_template = resolvedTitleTemplate
      }

      if (resolvedDescriptionTemplate !== undefined) {
        nextProduct.description_template = resolvedDescriptionTemplate
        nextProduct.seo_description_template = resolvedDescriptionTemplate
      }

      if (nextNameValue !== undefined) {
        nextProduct.name = nextNameValue
      }
    }

    return nextProduct
  })

  fs.mkdirSync(path.dirname(productsPath), { recursive: true })
  fs.writeFileSync(productsPath, `${JSON.stringify(nextProducts, null, 2)}\n`)

  return res.status(200).json({ success: true, products: nextProducts })
}
