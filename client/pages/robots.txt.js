import products from '../data/specific_products.json'
import { buildCatalogGroups } from '../lib/catalog'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

function getCategoryAllowRules() {
  return buildCatalogGroups(products)
    .map((category) => `Allow: /categories/${category.slug}`)
    .join('\n')
}

export default function RobotsTxtPage() {
  return null
}

export async function getServerSideProps({ res }) {
  const body = `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /admin
Disallow: /api/
Disallow: /_next/
Allow: /categories/
${getCategoryAllowRules()}

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.write(body)
  res.end()

  return { props: {} }
}
