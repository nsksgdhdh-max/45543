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

  const { id, top, main_offer: mainOffer, is_new: isNew, new: newFlag } = req.body || {}
  if (!id) {
    return res.status(400).json({ error: 'Product id is required' })
  }

  const nextTopValue = top !== undefined && top !== null ? (Number(top) === 1 ? 1 : 0) : undefined
  const incomingMainOffer = mainOffer !== undefined && mainOffer !== null ? (Number(mainOffer) === 1 ? 1 : 0) : undefined
  const incomingNewFlag = isNew !== undefined && isNew !== null ? (Number(isNew) === 1 ? 1 : 0) : newFlag !== undefined && newFlag !== null ? (Number(newFlag) === 1 ? 1 : 0) : undefined

  const products = readProducts().map((product) => {
    const productId = String(product.id || product.product_id)
    const isTarget = productId === String(id)
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

    return nextProduct
  })

  fs.mkdirSync(path.dirname(productsPath), { recursive: true })
  fs.writeFileSync(productsPath, `${JSON.stringify(products, null, 2)}\n`)

  return res.status(200).json({ success: true, products })
}
