import { useEffect, useState } from 'react'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Header from '../../components/Header'
import { useRouter } from 'next/router'
import { addToCartAndGo } from '../../lib/cart'
import { inferFamilyCategory, inferSubcategoryLabel } from '../../lib/catalog'
import { buildProductUrl, resolveProductImage } from '../../lib/product'

const categoryLabels = {
  'male-health': 'Мужское здоровье',
  'vision-hearing': 'Зрение и слух',
  metabolism: 'Метаболизм и диабет',
  heart: 'Сердце и давление',
  digestive: 'ЖКТ и пищеварение',
  joints: 'Суставы и опорно-двигательная система',
  'weight-loss': 'Похудение и детокс',
  nerves: 'Нервная система',
  urinary: 'Мочеполовая система',
  skin: 'Красота и кожа',
  immune: 'Иммунитет и общее здоровье',
}

function priceForProduct(product) {
  const target = Array.isArray(product.target) ? product.target : []

  const de =
    target.find(
      (item) => String(item.code || '').toUpperCase() === 'DE'
    ) || target[0]

  if (!de) return 'Цена по запросу'

  return `${de.price || ''} ${de.currency || ''}`.trim()
}

export default function CategoryPage({ initialProducts, slug }) {
  const router = useRouter()

  const [offers, setOffers] = useState(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [availableSubcats, setAvailableSubcats] = useState([])

  useEffect(() => {
    const selectedSub =
      typeof router.query.sub === 'string'
        ? decodeURIComponent(router.query.sub)
        : 'all'

    setActiveFilter(selectedSub)
  }, [router.query.sub])

  useEffect(() => {
    setLoading(true)

    const subs = Array.from(
      new Set(
        (initialProducts || []).map((product) =>
          inferSubcategoryLabel(product)
        )
      )
    )

    setAvailableSubcats(subs)
    setOffers(initialProducts || [])
    setLoading(false)
  }, [slug, initialProducts])

  const filteredOffers = offers.filter((product) => {
    if (activeFilter === 'all' || !activeFilter) return true

    return inferSubcategoryLabel(product) === activeFilter
  })

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* HEADER CATEGORY */}
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-100/50 blur-3xl" />

          <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <nav aria-label="Хлебные крошки" className="mb-6 flex justify-start">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <li>
                  <Link href="/" className="font-medium transition hover:text-indigo-600">
                    Главная
                  </Link>
                </li>
                <li className="text-slate-300">/</li>
                <li>
                  <Link href="/categories" className="font-medium transition hover:text-indigo-600">
                    Каталог
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
                  Выберите нужный раздел и найдите подходящие товары
                  в этой категории.
                </p>

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
                    Разделы категории
                  </p>

                  <p className="hidden text-xs text-slate-400 sm:block">
                    Выберите раздел
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
                    Все товары
                  </button>

                  {availableSubcats.map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => {
                        setActiveFilter(sub)

                        router.push(
                          {
                            pathname: `/categories/${slug}`,
                            query: { sub },
                          },
                          undefined,
                          { shallow: true }
                        )
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

        {/* LOADING */}
        {loading && (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-slate-100" />

                <div className="space-y-3 p-4">
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}

          </div>
        )}

        {/* PRODUCTS */}
        {!loading && filteredOffers.length > 0 && (
          <section className="mt-6">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                Товары
              </h2>

              <span className="text-sm text-slate-400">
                {filteredOffers.length} позиций
              </span>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">

              {filteredOffers.map((product) => {
                const price = priceForProduct(product)

                return (
                  <Link
                    key={product.product_id || product.id}
                    href={buildProductUrl(product, slug)}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                  >

                    {/* IMAGE */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100">

                      <img
                        src={resolveProductImage(product.img)}
                        alt={product.name || 'Товар'}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src =
                            '/img/placeholder.svg'
                        }}
                      />

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur">
                        В наличии
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
                            Цена
                          </p>

                          <p className="mt-0.5 truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                            {price}
                          </p>

                        </div>

                        {/* CART */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleAddToCart(product)
                          }}
                          aria-label="Добавить в корзину"
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
                              d="M2.25 3h1.386c.51 0 .955.343 1.087.835L5.03 5.25m0 0h14.72a1.125 1.125 0 0 1 1.086 1.42l-1.5 5.625a1.125 1.125 0 0 1-1.086.835H8.1a1.125 1.125 0 0 1-1.087-.835L5.03 5.25Zm0 0L4.5 11.25m3.75 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1-3 0Z"
                            />
                          </svg>

                        </button>

                      </div>

                    </div>

                  </Link>
                )
              })}

            </div>
          </section>
        )}

        {/* EMPTY */}
        {!loading && filteredOffers.length === 0 && (
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
              Товаров пока нет
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              В этой категории пока ничего не найдено.
              Попробуйте выбрать другой раздел.
            </p>

            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={goToAll}
                className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
              >
                Показать все товары
              </button>
            )}

          </section>
        )}

      </main>
    </div>
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

  const initialProducts = products.filter(
    (product) => inferFamilyCategory(product).slug === slug
  )

  return {
    props: {
      initialProducts,
      slug,
    },
  }
}