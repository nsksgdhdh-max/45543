import { useEffect, useState } from 'react'
import fs from 'fs'
import path from 'path'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import { useRouter } from 'next/router'
import { addToCart, addToCartAndGo } from '../../lib/cart'
import { buildSubcategoryRouteSlug, filterProductsByQuery, inferFamilyCategory, inferSubcategoryLabel, matchesSubcategoryRoute, normalizeProductRecord } from '../../lib/catalog'
import { buildProductUrl, resolveProductImage } from '../../lib/product'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const categoryLabels = {
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

function fitSeoMetaText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

function buildCategoryMeta(categoryName, productName, price = '') {
  const baseName = categoryName
  const title = fitSeoMetaText(`Kaufen ${baseName}`, 60)
  const descriptionBase = `${categoryName}. Kaufen jetzt. Produkte für Alltag, Wohlbefinden und Gesundheit. Preis ab ${price || '49 EUR'}. Garantie. Lieferung 3-7 Tage.`

  return {
    title,
    description: fitSeoMetaText(descriptionBase, 150),
  }
}

function buildCategorySeoBlock(categoryName) {
  return (
    <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
      <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
        {categoryName} – moderne Lösungen für Gesundheit und Alltag
      </h2>

      <div className="mt-6 space-y-6 text-base leading-8 text-slate-700">
        <p>
          Die Auswahl für {categoryName} umfasst Produkte, die gezielt auf typische
          Bedürfnisse im Alltag ausgerichtet sind. Ob Sie eine tägliche Unterstützung für Ihr
          Wohlbefinden, eine praktische Lösung für ein bestimmtes Anliegen oder hochwertige
          Produkte für die persönliche Gesundheit suchen – hier erwartet Sie eine übersichtliche
          Auswahl, die schnell verständlich ist und leicht nach Ihren Anforderungen sortiert werden kann.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black text-slate-900">Zielgerichtete Auswahl</h3>
            <p className="mt-3">
              Die Produktgruppe {categoryName} ist bewusst so gestaltet, dass Sie schnell zwischen
              relevanten Artikeln unterscheiden und die passende Lösung für Ihren Bedarf finden.
              Dadurch bleibt die Auswahl klar, ohne dass Sie durch eine unübersichtliche Produktliste
              verloren gehen. Besonders wichtig ist dabei eine verständliche Darstellung der Vorteile,
              Anwendung und Produktfunktion.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Wissen, Qualität und Vertrauen</h3>
            <p className="mt-3">
              Die Produkte in dieser Kategorie wurden mit Blick auf Alltagstauglichkeit, hochwertige
              Inhaltsstoffe und praktische Anwendung ausgewählt. So können Sie einfacher vergleichen,
              passende Optionen erkennen und bewusst entscheiden, welches Produkt zu Ihren Erwartungen
              passt. Transparente Produktinfos und klare Produktdarstellungen tragen zu einem bewussteren
              Einkauf bei.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-black text-slate-900">Warum diese Kategorie für viele Kunden relevant ist</h4>
        <p>
          Menschen orientieren sich bei gesundheitsbezogenen Produkten oft nach konkreten Bedürfnissen,
          Beispielen aus dem Alltag oder klaren Produktkategorien. Genau deshalb ist eine gut strukturierte
          Produktübersicht so wichtig. {categoryName} bündelt passende Angebote an einem Ort und schafft so
          eine einfache Orientierung. Kunden können gezielt nach einem Thema suchen, ohne in einer Vielzahl
          von Angeboten unterzugehen. Das macht die Auswahl verständlicher, praxisnäher und deutlich angenehmer.
        </p>

        <h4 className="text-lg font-black text-slate-900">Mehr als nur Produkte – eine praktische Entscheidungshilfe</h4>
        <p>
          Die Auswahl in {categoryName} ist nicht nur für den schnellen Einkauf gedacht, sondern hilft auch
          dabei, die passende Lösung für den persönlichen Bedarf zu erkennen. Eine klare Produktstruktur,
          verständliche Informationen und eine fokussierte Präsentation aller relevanten Angebote machen die
          Entscheidung einfacher und fördern das Vertrauen in die Qualität der Produkte. Wenn Sie gezielt nach
          einer passenden Lösung suchen, ist diese Kategorie ein sinnvoller Ausgangspunkt für eine bewusste Auswahl.
        </p>
      </div>
    </section>
  )
}

function priceForProduct(product) {
  const target = Array.isArray(product.target) ? product.target : []

  const de =
    target.find(
      (item) => String(item.code || '').toUpperCase() === 'DE'
    ) || target[0]

  if (!de) return 'Preis auf Anfrage'

  return `${de.price || ''} ${de.currency || ''}`.trim()
}

export default function CategoryPage({ initialProducts, slug }) {
  const router = useRouter()

  const offers = initialProducts || []
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  const availableSubcats = Array.from(
    new Set(
      offers.map((product) => inferSubcategoryLabel(product)).filter(Boolean)
    )
  )

  useEffect(() => {
    const selectedSub =
      typeof router.query.sub === 'string'
        ? decodeURIComponent(router.query.sub)
        : 'all'

    setActiveFilter(selectedSub)
  }, [router.query.sub])

  const filteredBySubcategory = offers.filter((product) => {
    if (activeFilter === 'all' || !activeFilter) return true

    return matchesSubcategoryRoute(product, activeFilter)
  })

  const filteredOffers = filterProductsByQuery(filteredBySubcategory, search)
  const currentCategoryUrl = activeFilter === 'all'
    ? `${CANONICAL_BASE}/categories/${slug}`
    : `${CANONICAL_BASE}/categories/${slug}?sub=${encodeURIComponent(buildSubcategoryRouteSlug(activeFilter))}`

  const goToAll = () => {
    setActiveFilter('all')

    router.push(
      {
        pathname: `/categories/${slug}`,
      },
      undefined,
      { shallow: true }
    )
  }

  const handleAddToCart = (product) => {
    const price = priceForProduct(product)

    addToCartAndGo({
      ...product,
      price,
      displayPrice: price,
    })
  }

  const canonicalUrl = `${CANONICAL_BASE}/categories/${slug}`
  const firstProduct = filteredOffers[0] || offers[0]
  const categoryMeta = buildCategoryMeta(
    categoryLabels[slug] || slug,
    firstProduct?.name || '',
    firstProduct ? priceForProduct(firstProduct) : ''
  )

  return (
    <>
      <Head>
        <title>{categoryMeta.title}</title>
        <meta name="description" content={categoryMeta.description} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* HEADER CATEGORY */}
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-100/50 blur-3xl" />

          <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex justify-start">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <li>
                  <Link href="/" className="font-medium transition hover:text-indigo-600">
                    Startseite
                  </Link>
                </li>
                <li className="text-slate-300">/</li>
                <li>
                  <Link href="/categories" className="font-medium transition hover:text-indigo-600">
                    Katalog
                  </Link>
                </li>
                <li className="text-slate-300">/</li>
                <li className="font-semibold text-slate-900">
                  {categoryLabels[slug] || slug}
                </li>
                {activeFilter !== 'all' && (
                  <>
                    <li className="text-slate-300">/</li>
                    <li className="font-semibold text-slate-700">{activeFilter}</li>
                  </>
                )}
              </ol>
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  {categoryLabels[slug] || slug}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Wählen Sie den passenden Bereich und finden Sie passende Produkte
                  in dieser Kategorie.
                </p>

              </div>

              <div className="w-full max-w-md">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Filtern
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nach Produkt, Name oder Thema suchen"
                    className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* COUNT */}
              <div className="hidden md:flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="h-5 w-5 text-indigo-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 7.5v9a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 16.5v-9A2.25 2.25 0 0 1 6 5.25h12a2.25 2.25 0 0 1 2.25 2.25Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 9.75h9m-9 4.5h5.25"
                    />
                  </svg>
                </div>
              </div>

            </div>

            {/* SUBCATEGORIES */}
            {availableSubcats.length > 0 && (
              <div className="mt-7 border-t border-slate-100 pt-6">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-sm font-bold text-slate-800">
                    Kategorienbereiche
                  </p>

                  <p className="hidden text-xs text-slate-400 sm:block">
                    Bereich wählen
                  </p>

                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                  <button
                    type="button"
                    onClick={goToAll}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                      activeFilter === 'all'
                        ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    Alle Produkte
                  </button>

                  {availableSubcats.map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => {
                        setActiveFilter(sub)

                        const targetUrl = `/categories/${slug}?sub=${encodeURIComponent(buildSubcategoryRouteSlug(sub))}`
                        router.push(targetUrl, undefined, { shallow: true })
                      }}
                      className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                        activeFilter === sub
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}

                </div>

              </div>
            )}

          </div>
        </section>

        {/* PRODUCTS */}
        {filteredOffers.length > 0 && (
          <section className="mt-6">
 
            <div className="mb-4 flex items-center justify-between">
 
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                Produkte
              </h2>
 
              <span className="text-sm text-slate-400">
                {filteredOffers.length} Produkte
              </span>
 
            </div>

            {search && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <span>Suche:</span>
                <span className="rounded-full bg-white px-2 py-0.5">{search}</span>
                <button type="button" onClick={() => setSearch('')} className="ml-1 text-indigo-900 underline-offset-2 hover:underline">
                  löschen
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">

              {filteredOffers.map((product) => {
                const price = priceForProduct(product)

                const productUrl = buildProductUrl(product, slug)

                return (
                  <div
                    key={product.product_id || product.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                  >
                    <Link
                      href={productUrl}
                      className="block focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <img
                          src={resolveProductImage(product.img)}
                          alt={product.name || 'Produkt'}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = '/img/placeholder.svg'
                          }}
                        />

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur">
                          Auf Lager
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="p-3.5 sm:p-4">
                        <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-slate-900 sm:text-base">
                          {product.name}
                        </h3>

                        <div className="mt-4 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                             Preis
                            </p>
                            <p className="mt-0.5 truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                             {price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          handleAddToCart(product)
                        }}
                        aria-label="In den Warenkorb legen"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-md active:scale-90 sm:h-11 sm:w-11"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835L5.03 5.25m0 0h14.72a1.125 1.125 0 0 1 1.086 1.42l-1.5 5.625a1.125 1.125 0 0 1-1.086.835H8.1a1.125 1.125 0 0 1-1.087-.835L5.03 5.25Zm0 0L4.5 11.25m3.75 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* EMPTY */}
        {filteredOffers.length === 0 && (
          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-8 w-8 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h1.5l1.59 9.41A2 2 0 0 0 8.06 14h7.88a2 2 0 0 0 1.97-1.59L19.5 7.5H5.25"
                />
              </svg>

            </div>

            <h2 className="mt-5 text-xl font-extrabold text-slate-950">
              Noch keine Produkte
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? `Keine Produkte gefunden für “${search}”. Versuchen Sie einen anderen Begriff oder Bereich.`
                : 'In dieser Kategorie wurden noch keine Produkte gefunden. Versuchen Sie einen anderen Bereich.'}
            </p>

            {(activeFilter !== 'all' || search) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  goToAll()
                }}
                className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
              >
                Alle Produkte anzeigen
              </button>
            )}

          </section>
        )}

        {buildCategorySeoBlock(categoryLabels[slug] || slug)}

      </main>
    </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params

  const file = path.join(
    process.cwd(),
    'data',
    'specific_products.json'
  )

  let products = []

  try {
    const raw = fs.readFileSync(file, 'utf8')
    products = JSON.parse(raw || '[]')
  } catch (e) {
    products = []
  }

  const initialProducts = products
    .map((product) => normalizeProductRecord(product))
    .filter((product) => inferFamilyCategory(product).slug === slug)

  return {
    props: {
      initialProducts,
      slug,
    },
  }
}