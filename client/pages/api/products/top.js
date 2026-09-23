import fs from 'fs'
import path from 'path'

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
    id,
    partner_id: partnerId,
    top,
    main_offer: mainOffer,
    is_new: isNew,
    new: newFlag,
    title_template: titleTemplate,
    description_template: descriptionTemplate,
    seo_title_template: seoTitleTemplate,
    seo_description_template: seoDescriptionTemplate,
    delete: shouldDelete,
  } = req.body || {}

  const products = readProducts()

  if (!id) {
    return res.status(400).json({ error: 'Product id is required' })
  }

  const resolveKey = (product) => `${String(product.partner_id || 'metacpa_default')}:${String(product.id || product.product_id)}`
  const targetKey = `${String(partnerId || 'metacpa_default')}:${String(id)}`

  if (shouldDelete === true || shouldDelete === 1 || shouldDelete === 'true') {
    const nextProducts = products.filter((product) => resolveKey(product) !== targetKey)

    fs.mkdirSync(path.dirname(productsPath), { recursive: true })
    fs.writeFileSync(productsPath, `${JSON.stringify(nextProducts, null, 2)}\n`)

    return res.status(200).json({ success: true, products: nextProducts, deleted: true })
  }

  const nextTopValue = top !== undefined && top !== null ? (Number(top) === 1 ? 1 : 0) : undefined
  const incomingMainOffer = mainOffer !== undefined && mainOffer !== null ? (Number(mainOffer) === 1 ? 1 : 0) : undefined
  const incomingNewFlag = isNew !== undefined && isNew !== null ? (Number(isNew) === 1 ? 1 : 0) : newFlag !== undefined && newFlag !== null ? (Number(newFlag) === 1 ? 1 : 0) : undefined

  const nextProducts = products.map((product) => {
    const isTarget = resolveKey(product) === targetKey
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
    }

    return nextProduct
  })

  fs.mkdirSync(path.dirname(productsPath), { recursive: true })
  fs.writeFileSync(productsPath, `${JSON.stringify(nextProducts, null, 2)}\n`)

  return res.status(200).json({ success: true, products: nextProducts })
}
