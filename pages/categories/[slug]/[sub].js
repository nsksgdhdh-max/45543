import fs from 'fs'
import path from 'path'
import Head from 'next/head'
import Header from '../../../components/Header'
import Link from 'next/link'
import { addToCartAndGo } from '../../../lib/cart'
import { inferFamilyCategory, inferSubcategoryLabel } from '../../../lib/catalog'
import {
  buildProductSeo,
  buildProductUrl,
  resolveProductImage,
  toEnglishSlug,
} from '../../../lib/product'

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
  skin: 'Schönheit und Haut',
  immune: 'Immunität und Allgemeine Gesundheit',
}

function fitSeoMetaText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

function buildSubcategoryMeta(categoryName, subName, productName, price = '') {
  const baseName = subName || categoryName
  const title = fitSeoMetaText(`Kaufen ${baseName}`, 60)
  const descriptionBase = `${subName || categoryName}. Kaufen jetzt. Produkte für ${categoryName}. Garantie. Lieferung 3-7 Tage. Qualität und Alltagstauglichkeit.`

  return {
    title,
    description: fitSeoMetaText(descriptionBase, 150),
  }
}

function buildSubcategorySeoBlock(categoryName, subName) {
  return (
    <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
      <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
        {subName} – passende Produkte in {categoryName}
      </h2>

      <div className="mt-6 space-y-6 text-base leading-8 text-slate-700">
        {subName} umfasst Produkte, die ein bestimmtes Gesundheitsziel oder einen konkreten
        Alltagseinsatz abdecken. Diese Struktur hilft dabei, die passende Auswahl schnell zu
        überblicken, ohne lange durch verschiedene Produktgruppen navigieren zu müssen. Gerade bei
        Themen wie Fitness, Wohlbefinden, Schutz, Unterstützung und täglicher Versorgung ist eine
        klare Sortierung besonders wertvoll.

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black text-slate-900">Warum diese Auswahl relevant ist</h3>
            <p className="mt-3">
              Kunden suchen oft gezielt nach Produkten mit einer bestimmten Wirkung oder einem klaren Nutzen.
              Solche Angebote werden übersichtlich zusammengestellt, damit die wichtigsten Informationen auf
              einen Blick erkennbar sind und verschiedene Lösungen leichter verglichen werden können. So bleibt
              die Entscheidung transparent und nachvollziehbar.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Qualität und Alltagstauglichkeit</h3>
            <p className="mt-3">
              Ein guter Produktsortiment sollte nicht nur verständlich, sondern auch praktisch nutzbar sein.
              Die Produkte in {subName} sind deshalb so ausgewählt, dass sie sowohl für den täglichen Einsatz als auch
              für eine gezielte Anwendung geeignet sind. Dadurch entsteht eine Produktübersicht, die sich für viele
              Kunden als hilfreiche Entscheidungshilfe eignet.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-black text-slate-900">Mehr Überblick für bewusste Entscheidungen</h4>
        <p>
          Wer nach einem konkreten Thema sucht, braucht nicht nur Produkte, sondern auch Orientierung. In einer
          gut strukturierten Unterkategorie spart man Zeit, erkennt die wichtigsten Produktmerkmale schneller und
          kann Chancen und Unterschiede leichter einschätzen. Das ist besonders wichtig, wenn mehrere Lösungen für
          ähnliche Anliegen angeboten werden. Die Kategorie {subName} macht genau das sichtbar: klare Einordnung,
          verständliche Informationen und eine fokussierte Auswahl für den jeweiligen Bedarf.
        </p>

        <h4 className="text-lg font-black text-slate-900">Ein sinnvoller Startpunkt für Ihren Einkauf</h4>
        <p>
          Wenn Sie nach einer passenden Lösung für Ihr persönliches Gesundheitsziel suchen, ist die Unterkategorie
          {subName} eine praktische Ausgangsbasis. Sie zeigt Ihnen die wichtigsten Optionen auf einen Blick und hilft,
          den Überblick zu behalten. Dadurch wird die Auswahl nicht nur angenehmer, sondern auch bewusster. Gerade bei
          Themen mit persönlicher Relevanz ist eine klare und verständliche Darstellung eine wichtige Hilfe bei jeder
          Entscheidung.
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

function getProductCharacteristics(product) {
  const items = []

  if (product.manufacturer) {
    items.push({
      label: 'Hersteller',
      value: product.manufacturer,
    })
  }

  if (product.quantity) {
    items.push({
      label: 'Menge',
      value: product.quantity,
    })
  }

  if (product.volume) {
    items.push({
      label: 'Volumen',
      value: product.volume,
    })
  }

  if (product.form) {
    items.push({
      label: 'Form',
      value: product.form,
    })
  }

  return items
}

function getRelatedProducts(product, allProducts = []) {
  if (!product || !Array.isArray(allProducts) || allProducts.length === 0) {
    return []
  }

  const currentId = product.product_id || product.id
  const currentFamily = inferFamilyCategory(product)
  const currentSubcategory = inferSubcategoryLabel(product)

  return allProducts
    .filter((item) => {
      const itemId = item.product_id || item.id
      if (itemId === currentId) return false

      const family = inferFamilyCategory(item)
      if (!family || !currentFamily) return false

      return family.slug === currentFamily.slug
    })
    .sort((a, b) => {
      const aScore =
        (inferSubcategoryLabel(a) === currentSubcategory ? 3 : 0) +
        (a.manufacturer === product.manufacturer ? 1 : 0)
      const bScore =
        (inferSubcategoryLabel(b) === currentSubcategory ? 3 : 0) +
        (b.manufacturer === product.manufacturer ? 1 : 0)

      return bScore - aScore
    })
    .slice(0, 4)
}

export default function SubcategoryPage({
  products,
  slug,
  sub,
  product,
  relatedProducts = [],
}) {
  const canonicalUrl = `${CANONICAL_BASE}/categories/${slug}/${sub}`
  const firstVisibleProduct = products[0]
  const subcategoryMeta = buildSubcategoryMeta(
    categoryLabels[slug] || slug,
    sub,
    firstVisibleProduct?.name || '',
    firstVisibleProduct ? priceForProduct(firstVisibleProduct) : ''
  )

  /*
   * =========================================================
   * СТРАНИЦА ОТДЕЛЬНОГО ТОВАРА
   * =========================================================
   */

  if (product) {
   const price = priceForProduct(product)
    const characteristics = getProductCharacteristics(product)
    const seo = buildProductSeo(product, price)

    return (
     <>
       <Head>
         <title>{seo.title}</title>
         <meta name="description" content={seo.description} />
         <link rel="canonical" href={canonicalUrl} />
       </Head>

       <div className="min-h-screen bg-slate-50 text-slate-900">
         <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* Хлебные крошки */}
          <nav
            aria-label="Хлебные крошки"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500"
          >
            <Link
              href="/"
              className="font-medium transition hover:text-indigo-600"
            >
              Startseite
            </Link>

            <span>/</span>

            <Link
              href="/categories"
              className="font-medium transition hover:text-indigo-600"
            >
              Katalog
            </Link>

            <span>/</span>

            <Link
              href={`/categories/${slug}`}
              className="font-medium transition hover:text-indigo-600"
            >
              {categoryLabels[slug] || slug}
            </Link>

            <span>/</span>

            <span className="font-semibold text-slate-900">
              {product.name}
            </span>
          </nav>

          {/* =================================================
              ОСНОВНАЯ КАРТОЧКА ТОВАРА
          ================================================= */}

          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">

            <div className="px-6 pb-0 pt-6 sm:px-8 lg:px-10">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Aktuelle URL</p>
                <a href={canonicalUrl} className="mt-2 block break-all text-sm font-medium text-indigo-700 underline-offset-4 hover:underline">
                  {canonicalUrl}
                </a>
              </div>
            </div>

            <div className="grid lg:grid-cols-2">

              {/* ФОТО */}
              <div className="bg-slate-50 p-5 sm:p-8 lg:p-10">
                <div className="flex min-h-[380px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-8 sm:min-h-[520px]">

                  <img
                    src={resolveProductImage(product.img)}
                    alt={product.name || ''}
                    className="max-h-[500px] w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src =
                        '/img/placeholder.svg'
                    }}
                  />

                </div>
              </div>

              {/* ПРАВАЯ ЧАСТЬ */}
              <div className="flex flex-col p-6 sm:p-8 lg:p-10">

                {/* Название */}
                <h1 className="mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                  {product.name}
                </h1>

                {/* Дополнительные характеристики */}
                {characteristics.length > 0 && (
                  <div className="mt-5 space-y-3">

                    {characteristics.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm"
                      >
                        <span className="text-slate-500">
                          {item.label}
                        </span>

                        <span className="text-right font-semibold text-slate-800">
                          {item.value}
                        </span>
                      </div>
                    ))}

                  </div>
                )}

                {/* Preis */}
                <div className="mt-7">

                  <p className="text-sm font-medium text-slate-500">
                    Preis
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {price}
                  </p>

                </div>

                {/* Кнопки */}
                <div className="mt-7 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      addToCartAndGo({
                        ...product,
                        price,
                        displayPrice: price,
                      })
                    }
                    className="rounded-xl bg-emerald-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.98]"
                  >
                    In den Warenkorb
                  </button>

                  <Link
                    href={{
                      pathname: '/form',
                      query: {
                        product_id:
                          product.product_id || product.id,
                        partner_id:
                          product.partner_id ||
                          'metacpa_default',
                        name: product.name,
                        price,
                        img: product.img,
                      },
                    }}
                    className="rounded-xl bg-slate-950 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    Kaufen
                  </Link>

                </div>

              </div>
            </div>
          </article>

          {/* =================================================
              ОПИСАНИЕ — ОТДЕЛЬНЫМ БЛОКОМ НИЖЕ ТОВАРА
          ================================================= */}

          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
           <div className="max-w-5xl">
             <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
               Produktbeschreibung
             </p>
             <h2 className="mt-2 text-2xl font-black text-slate-950">
               {seo.title.replace(/\s*\|.*$/, '')}
             </h2>

             <div className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-slate-50 p-5">
               <p className="text-lg leading-8 text-slate-700">{seo.intro}</p>
             </div>

             <div className="mt-6 space-y-6 text-base leading-8 text-slate-700">
               {seo.sections.map((section) => {
                 const Tag = section.level
                 return (
                   <div key={section.heading} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                     <Tag className="mb-3 text-xl font-black text-slate-900">{section.heading}</Tag>
                     <p>{section.text}</p>
                   </div>
                 )
               })}
             </div>

           </div>
          </section>

          {relatedProducts.length > 0 && (
            <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Ähnliche Produkte
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Empfehlungen
                </h2>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {relatedProducts.map((item) => {
                  const itemPrice = priceForProduct(item)

                  return (
                    <article
                      key={item.product_id || item.id}
                      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                    >
                      <Link href={buildProductUrl(item)} className="block overflow-hidden bg-white">
                        <div className="flex h-44 items-center justify-center p-4">
                          <img
                            src={resolveProductImage(item.img)}
                            alt={item.name || ''}
                            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null
                              event.currentTarget.src = '/img/placeholder.svg'
                            }}
                          />
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                          {categoryLabels[slug] || slug}
                        </p>

                        <Link href={buildProductUrl(item)} className="mt-2 block">
                          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition hover:text-indigo-600">
                            {item.name}
                          </h3>
                        </Link>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {item.description || item.desc || item.short_description || 'Weitere Informationen finden Sie auf der Produktseite.'}
                        </p>

                        <div className="mt-auto pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-lg font-black text-slate-950">
                              {itemPrice}
                            </span>
                            <Link
                              href={buildProductUrl(item)}
                              className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                            >
                              Mehr erfahren
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {/* =================================================
              НАВИГАЦИЯ
          ================================================= */}

          <div className="mt-6 flex flex-wrap gap-3" />

        </main>
      </div>
      </>
    )
  }

  /*
   * =========================================================
   * СПИСОК ТОВАРОВ ПОДКАТЕГОРИИ
   * =========================================================
   */

  return (
    <>
      <Head>
        <title>{subcategoryMeta.title}</title>
        <meta name="description" content={subcategoryMeta.description} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* Заголовок */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Produktkatalog
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
            {categoryLabels[slug] || slug}
          </h1>

          <p className="mt-3 text-base text-slate-600">
            {sub}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              href={`/categories/${slug}`}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              ← Zurück zur Kategorie
            </Link>

            <Link
              href="/categories"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Alle Kategorien
            </Link>

          </div>

        </section>

        {/* Produkte */}
        {products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {products.map((o) => {
              const price = priceForProduct(o)

              return (
                <article
                  key={o.product_id || o.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                >

                  {/* Изображение */}
                  <Link
                    href={buildProductUrl(o)}
                    className="relative block overflow-hidden bg-slate-50"
                  >
                    <div className="flex h-64 items-center justify-center p-6 sm:h-72">

                      <img
                        src={resolveProductImage(o.img)}
                        alt={o.name || ''}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src =
                            '/img/placeholder.svg'
                        }}
                      />

                    </div>

                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                      {inferSubcategoryLabel(o)}
                    </div>
                  </Link>

                  {/* Информация */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">

                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                      {categoryLabels[slug] || slug}
                    </p>

                    {/* Название */}
                    <Link
                      href={buildProductUrl(o)}
                      className="mt-2 block"
                    >
                      <h2 className="line-clamp-2 text-xl font-bold leading-snug text-slate-950 transition hover:text-indigo-600">
                        {o.name}
                      </h2>
                    </Link>

                    {/* Beschreibung direkt unter dem Namen */}
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {o.description ||
                        o.desc ||
                        o.short_description ||
                        'Weitere Informationen zu diesem Produkt finden Sie auf der Produktseite.'}
                    </p>

                    {/* Характеристики */}
                    <div className="mt-4 space-y-2 text-sm">

                      {o.manufacturer && (
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                          <span className="text-slate-500">
                            Hersteller
                          </span>

                          <span className="text-right font-semibold text-slate-800">
                            {o.manufacturer}
                          </span>
                        </div>
                      )}

                      {o.quantity && (
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                          <span className="text-slate-500">
                            Menge
                          </span>

                          <span className="font-semibold text-slate-800">
                            {o.quantity}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* Низ карточки */}
                    <div className="mt-auto pt-6">

                      <div className="border-t border-slate-100 pt-5">

                        {/* Preis + корзина */}
                        <div className="flex items-end justify-between gap-4">

                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Preis
                            </p>

                            <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                              {price}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()

                              addToCartAndGo(
                                {
                                  ...o,
                                  price,
                                  displayPrice: price,
                                },
                                event
                              )
                            }}
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
                          >
                            In den Warenkorb
                          </button>

                        </div>

                        {/* Кнопки */}
                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <Link
                            href={{
                              pathname: '/form',
                              query: {
                                product_id:
                                  o.product_id || o.id,
                                partner_id:
                                  o.partner_id ||
                                  'metacpa_default',
                                name: o.name,
                                price,
                                img: o.img,
                              },
                            }}
                            className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            Kaufen
                          </Link>

                          <Link
                            href={buildProductUrl(o)}
                            className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            Mehr erfahren
                          </Link>

                        </div>

                      </div>

                    </div>
                  </div>
                </article>
              )
            })}

          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto max-w-md">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📦
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                Keine Produkte gefunden
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                In dieser Unterkategorie sind derzeit keine Produkte verfügbar.
              </p>

              <Link
                href={`/categories/${slug}`}
                className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Zurück zur Kategorie
              </Link>

            </div>

          </div>
        )}

        {buildSubcategorySeoBlock(categoryLabels[slug] || slug, sub)}

      </main>
    </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const { slug, sub } = context.params

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

  const decodedSub = decodeURIComponent(sub)

  /*
   * Zuerst prüfen wir:
   * является ли URL страницей конкретного Produkt.
   */
  const productMatch = products.find((p) => {
    const family = inferFamilyCategory(p)

    const sameFamily = family.slug === slug

    const sameName =
      toEnglishSlug(p.name || '') === decodedSub

    return sameFamily && sameName
  })

  if (productMatch) {
    const relatedProducts = getRelatedProducts(productMatch, products)

    return {
      props: {
        products: [],
        slug,
        sub: decodedSub,
        product: productMatch,
        relatedProducts,
      },
    }
  }

  /*
   * Andernfalls handelt es sich um eine Unterkategorieseite.
   */
  const filtered = products.filter((p) => {
    const family = inferFamilyCategory(p)

    return (
      family.slug === slug &&
      inferSubcategoryLabel(p) === decodedSub
    )
  })

  return {
    props: {
      products: filtered,
      slug,
      sub: decodedSub,
      product: null,
    },
  }
}