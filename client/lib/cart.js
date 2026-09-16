const CART_KEY = 'lebenskraft_cart'

export function readCart() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

export function saveCart(items) {
  if (typeof window === 'undefined') return items
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('cart:updated'))
  } catch (error) {
    // ignore storage errors silently
  }
  return items
}

export function addToCart(product) {
  if (!product || !product.product_id && !product.id) return []
  const items = readCart()
  const id = String(product.product_id || product.id)
  const index = items.findIndex((item) => String(item.product_id || item.id) === id)
  if (index >= 0) {
    items[index].qty = Number(items[index].qty || 1) + 1
  } else {
    items.push({
      product_id: id,
      id,
      name: product.name,
      price: product.price || product.displayPrice || product.currentPrice || '',
      img: product.img || '',
      qty: 1,
    })
  }
  return saveCart(items)
}

export function addToCartAndGo(product, event) {
  const items = addToCart(product)

  if (typeof window !== 'undefined') {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation()
    }
    window.location.assign('/cart')
  }

  return items
}

export function removeFromCart(productId) {
  const next = readCart().filter((item) => String(item.product_id || item.id) !== String(productId))
  return saveCart(next)
}

export function updateCartQty(productId, qty) {
  const items = readCart().map((item) => {
    if (String(item.product_id || item.id) !== String(productId)) return item
    return { ...item, qty: Math.max(1, Number(qty) || 1) }
  })
  return saveCart(items)
}

export function clearCart() {
  return saveCart([])
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + (Number(item.qty) || 1), 0)
}
