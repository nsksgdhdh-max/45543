import fs from 'fs'
import path from 'path'
import Head from 'next/head'
import Header from '../../components/Header'
import Link from 'next/link'
import { useState } from 'react'
import { addToCartAndGo } from '../../lib/cart'
import { inferFamilyCategory } from '../../lib/catalog'
import { buildProductSeo, getProductIdFromParam, resolveProductImage, toEnglishSlug } from '../../lib/product'

const CATEGORY_LABELS = {
  'male-health': 'Männliche Gesundheit',
  'vision-hearing': 'Sehen und Hören',
  metabolism: 'Stoffwechsel und Diabetes',
  heart: 'Herz und Blutdruck',
  digestive: 'Verdauung und Magen-Darm',
  joints: 'Gelenke und Bewegungsapparat',
  'weight-loss': 'Gewichtsverlust und Detox',
  nerves: 'Nervensystem',
  urinary: 'Urogenitalsystem',
  'venous-health': 'Venen- und Kreislaufgesundheit',
  skin: 'Schönheit und Haut',
  immune: 'Immunität und Allgemeine Gesundheit',
}

function priceForProduct(product) {
  const target = Array.isArray(product.target) ? product.target : []
  const de = target.find((item) => String(item.code || '').toUpperCase() === 'DE') || target[0]
  if (!de) return 'Preis auf Anfrage'
  return `${de.price || ''} ${de.currency || ''}`.trim()
}

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function ProductDetailPage({ product }) {
  const [orderSent, setOrderSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-slate-900">Produkt nicht gefunden</h1>
            <Link href="/categories" className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
              Zurück zum Katalog
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const price = priceForProduct(product)
  const seo = buildProductSeo(product, price)

  async function handleQuickOrder(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      product_id: String(product.product_id || product.id),
      partner_id: String(product.partner_id || 'metacpa_default'),
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      ref: '993341',
      langCode: 'DE',
      s: '',
      w: '',
      t: '',
      p: '',
      m: '',
    }

    if (!payload.name || !payload.phone) {
      setMessage('Bitte geben Sie Ihren Namen und Ihre Telefonnummer für die Bestellung ein.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || 'Bestellung konnte nicht abgeschlossen werden')
      setOrderSent(true)
      setMessage('Ihre Anfrage wurde gesendet. Wir melden uns in Kürze bei Ihnen.')
      form.reset()
    } catch (error) {
      setMessage(error.message || 'Bestellfehler')
    } finally {
      setLoading(false)
    }
  }

  const canonicalUrl = `${CANONICAL_BASE}/categories/${toEnglishSlug(product.category || product.subcategory || 'male-health')}/${toEnglishSlug(product.name || '')}`

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/categories" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Zurück zum Katalog</Link>
        </div>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
            <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
              <img
                src={resolveProductImage(product.img)}
                alt={product.name}
                className="h-full max-h-[480px] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = '/img/placeholder.svg'
                }}
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.category || 'Produkt'}</p>
              <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{product.name}</h1>

              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{price}</span>
                {product.subcategory && <span className="text-sm text-slate-500">{product.subcategory}</span>}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    addToCartAndGo({ ...product, price, displayPrice: price }, event)
                  }}
                  className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                >
                  In den Warenkorb
                </button>
                <Link href={{ pathname: '/form', query: { product_id: product.product_id || product.id, partner_id: product.partner_id || 'metacpa_default', name: product.name, price, img: product.img } }} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Kaufen
                </Link>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Beschreibung</p>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  {product.info || 'Natürliches Produkt zur täglichen Unterstützung von Gesundheit und Wohlbefinden im Alltag.'}
                </p>
              </div>
            </div>
          </div>
        </article>

        <section className="mt-10 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Schnellbestellung</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Schnellanfrage</h2>
          </div>

          <form onSubmit={handleQuickOrder} className="grid gap-4 md:grid-cols-3">
            <input type="hidden" name="product_id" value={product.product_id || product.id} />
            <input type="hidden" name="partner_id" value={product.partner_id || 'metacpa_default'} />
            <input type="hidden" name="ref" value="993341" />
            <input type="hidden" name="langCode" value="DE" />

            <label className="block text-sm font-medium text-slate-700">
              Name
              <input name="name" type="text" placeholder="Ihr Name" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Telefon
              <input name="phone" type="tel" placeholder="+49 ..." className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white" />
            </label>

            <div className="flex items-end">
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500">
                {loading ? 'Wird gesendet...' : 'Bestellen'}
              </button>
            </div>
          </form>

          {message && (
            <p className={`mt-4 text-sm ${orderSent ? 'text-emerald-600' : 'text-slate-600'}`}>
              {message}
            </p>
          )}
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Produktinformationen</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">{product.name}</h2>
          </div>

          <div className="space-y-6 text-base leading-7 text-slate-700">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-slate-50 p-5">
              <p className="text-lg font-medium text-slate-800">{seo.intro}</p>
            </div>

            {seo.sections.map((section) => {
              const Tag = section.level
              return (
                <div key={section.heading} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <Tag className="mb-2 text-xl font-black text-slate-900">{section.heading}</Tag>
                  <p>{section.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const rawId = context.params?.id
  const productId = getProductIdFromParam(rawId)
  const file = path.join(process.cwd(), 'data', 'specific_products.json')
  let products = []

  try {
    const raw = fs.readFileSync(file, 'utf8')
    products = JSON.parse(raw || '[]')
  } catch (error) {
    products = []
  }

  const normalizedSlug = String(rawId || '').trim().replace(/-+$/, '')
  const fallbackSlug = normalizedSlug.replace(/-\d+$/, '')

  const product =
    (products || []).find(
      (item) => String(item.product_id || item.id) === String(productId)
    ) ||
    (products || []).find((item) => {
      if (!fallbackSlug) return false
      return toEnglishSlug(item.name || '') === fallbackSlug
    }) ||
    null

  if (product) {
    const family = inferFamilyCategory(product)
    const resolvedCategory = family?.slug || product?.category || 'male-health'
    const canonicalSlug = toEnglishSlug(resolvedCategory)
    const canonicalProductSlug = toEnglishSlug(product.name || '')

    if (canonicalSlug && canonicalProductSlug) {
      return {
        redirect: {
          destination: `/categories/${canonicalSlug}/${canonicalProductSlug}`,
          permanent: false,
        },
      }
    }
  }

  return { props: { product } }
}
