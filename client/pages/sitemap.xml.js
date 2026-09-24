import products from '../data/specific_products.json'
import { buildCatalogGroups } from '../lib/catalog'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

const STATIC_URLS = [
  '/',
  '/about',
  '/categories',
  '/kontakt',
  '/impressum',
  '/datenschutz',
]

function escapeXml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getDynamicUrls() {
  return buildCatalogGroups(products)
    .map((category) => `${BASE_URL}/categories/${encodeURIComponent(category.slug)}`)
    .filter(Boolean)
}

export default function SitemapXmlPage() {
  return null
}

export async function getServerSideProps({ res }) {
  const urls = [...STATIC_URLS.map((path) => `${BASE_URL}${path}`), ...getDynamicUrls()]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${escapeXml(url)}</loc>
  </url>`,
    )
    .join('')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.write(xml)
  res.end()

  return { props: {} }
}
