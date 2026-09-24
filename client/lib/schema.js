const SITE_NAME = 'Ewige Vitalität'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ewige-vitalitaet.de').replace(/\/$/, '')
const SITE_DESCRIPTION = 'Gesundheitsprodukte und Wellness-Lösungen für Alltag, Vitalität und Wohlbefinden.'

function normalizePriceValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const numeric = Number(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'))
    return Number.isFinite(numeric) ? numeric : 0
  }
  return 0
}

function priceNumberFromProduct(product) {
  const target = Array.isArray(product?.target) ? product.target : []
  const de = target.find((item) => String(item?.code || '').toUpperCase() === 'DE') || target[0]
  if (!de || !de.price) return 0

  return normalizePriceValue(de.price)
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'de-DE',
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?s={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'DE',
        addressLocality: 'Berlin',
      },
    },
  }
}

export function buildBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildProductSchema(product, url) {
  const priceInfo = Array.isArray(product?.target) ? product.target.find((item) => String(item?.code || '').toUpperCase() === 'DE') || product.target[0] : null
  const price = priceInfo?.price ? String(priceInfo.price).replace(/[^0-9.,]/g, '').replace(',', '.') : '0'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.name || 'Produkt',
    description: product?.info || product?.name || 'Produkt für täglichen Gebrauch und Wohlbefinden.',
    category: product?.subcategory || product?.category || 'Gesundheitsprodukte',
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    image: product?.img ? product.img : undefined,
    sku: product?.product_id || product?.id || undefined,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: priceInfo?.currency || 'EUR',
      price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  }
}

export function buildCollectionPageSchema({ name, description, url, items = [], breadcrumbs = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    breadcrumb: buildBreadcrumbSchema(breadcrumbs),
    mainEntity: {
      '@type': 'ItemList',
      name,
      itemListElement: items.slice(0, 20).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: item.name,
          url: item.url,
          image: item.image,
          brand: {
            '@type': 'Brand',
            name: SITE_NAME,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: Number(item.price || 0),
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    },
  }
}

export function buildCollectionPageSchemaFromProducts({ name, description, url, products = [], breadcrumbs = [] }) {
  return buildCollectionPageSchema({
    name,
    description,
    url,
    items: products.map((product) => ({
      name: product?.name || 'Produkt',
      url: product?.url || '#',
      image: product?.image || '',
      price: normalizePriceValue(product?.price || priceNumberFromProduct(product)).toString(),
    })),
    breadcrumbs,
  })
}
