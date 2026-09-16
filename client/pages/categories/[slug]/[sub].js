import fs from 'fs'
import path from 'path'
import Header from '../../../components/Header'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { addToCartAndGo } from '../../../lib/cart'
import {
  inferFamilyCategory,
  inferSubcategoryLabel,
} from '../../../lib/catalog'
import {
  buildProductUrl,
  resolveProductImage,
  toEnglishSlug,
} from '../../../lib/product'

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
  const de = target.find((item) => String(item.code || '').toUpperCase() === 'DE') || target[0]
  if (!de) return 'Цена по запросу'
  return `${de.price || ''} ${de.currency || ''}`.trim()
}

export default function SubcategoryPage({ products, slug, sub, product, isProduct }) {
  const router = useRouter()
  const categoryName = categoryLabels[slug] || slug

  const addProductToCart = (event, item) => {
    event.stopPropagation()
    const price = priceForProduct(item)
    addToCartAndGo({
      ...item,
      price,
      displayPrice: price,
    })
  }

  if (isProduct && product) {
    const price = priceForProduct(product)

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href={`/categories/${slug}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Назад в категорию
            </Link>
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.category || 'Товар'}</p>
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
                    В корзину
                  </button>
                  <Link href={{ pathname: '/form', query: { product_id: product.product_id || product.id, name: product.name, price, img: product.img } }} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Купить
                  </Link>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Описание</p>
                  <p className="mt-3 text-base leading-7 text-slate-700">
                    {product.info || 'Натуральный продукт для ежедневной поддержки здоровья и комфортного применения в повседневной жизни.'}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <nav aria-label="Хлебные крошки" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="font-medium text-gray-500 transition hover:text-indigo-600">Главная</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href="/categories" className="font-medium text-gray-500 transition hover:text-indigo-600">Категории</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href={`/categories/${slug}`} className="font-medium text-gray-500 transition hover:text-indigo-600">{categoryName}</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li aria-current="page" className="font-semibold text-gray-900">{sub}</li>
          </ol>
        </nav>

        <section className="mb-8 overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-200">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">{categoryName}</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">{sub}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">Товары категории «{sub}» в разделе «{categoryName}».</p>
              </div>

              <div className="flex w-fit shrink-0 items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100">
                <span className="text-2xl font-black text-gray-900">{products.length}</span>
                <span className="text-sm font-medium text-gray-500">{products.length === 1 ? 'товар' : products.length >= 2 && products.length <= 4 ? 'товара' : 'товаров'}</span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/categories/${slug}`} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                Все товары категории
              </Link>

              <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                Все категории
              </Link>
            </div>
          </div>
        </section>

        {products.length > 0 ? (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">Товары</h2>
              <span className="text-sm text-gray-500">{products.length} позиций</span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((item) => {
                const price = priceForProduct(item)

                return (
                  <article
                    key={item.product_id || item.id}
                    onClick={() => router.push(buildProductUrl(item, slug))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        router.push(buildProductUrl(item, slug))
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group cursor-pointer overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-gray-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img src={resolveProductImage(item.img)} alt={item.name || 'Товар'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/img/placeholder.svg' }} />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">{inferSubcategoryLabel(item)}</div>
                    </div>

                    <div className="p-5">
                      <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-7 text-gray-900 transition group-hover:text-indigo-600">{item.name}</h3>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Цена</p>
                          <p className="mt-1 truncate text-2xl font-black text-gray-900">{price}</p>
                        </div>

                        <button type="button" aria-label={`Добавить ${item.name} в корзину`} onClick={(event) => addProductToCart(event, item)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835L5.03 5.25m0 0h14.72a1.125 1.125 0 0 1 1.086 1.42l-1.5 5.625a1.125 1.125 0 0 1-1.086.835H8.1a2 2 0 0 1-1.97-1.647L5.03 5.25Zm0 0L4.5 11.25m3.75 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-8 w-8 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2.25l1.5 12.75a2.25 2.25 0 0 0 2.25 2h7.5a2.25 2.25 0 0 0 2.25-2L20.25 6H6" /></svg>
            </div>

            <h2 className="mt-5 text-2xl font-black text-gray-900">В этой подкатегории пока нет товаров</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">Попробуйте вернуться к категории и выбрать другой раздел.</p>
            <Link href={`/categories/${slug}`} className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">Вернуться к категории</Link>
          </section>
        )}
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { slug, sub } = context.params
  const file = path.join(process.cwd(), 'data', 'specific_products.json')

  let products = []
  try {
    const raw = fs.readFileSync(file, 'utf8')
    products = JSON.parse(raw || '[]')
  } catch (e) {
    products = []
  }

  const decodedSub = decodeURIComponent(sub)
  const normalized = decodedSub.replace(/-\d+$/, '')
  const productMatch = products.find((product) => {
    const slugValue = toEnglishSlug(product.name || '')
    return (
      slugValue === decodedSub ||
      slugValue === normalized ||
      String(product.product_id || product.id) === String(decodedSub.replace(/[^\d]/g, ''))
    )
  })

  if (productMatch) {
    return {
      props: {
        products: [],
        slug,
        sub: decodedSub,
        product: productMatch,
        isProduct: true,
      },
    }
  }

  const filtered = products.filter((product) => {
    const family = inferFamilyCategory(product)
    return family.slug === slug && inferSubcategoryLabel(product) === decodedSub
  })

  return {
    props: {
      products: filtered,
      slug,
      sub: decodedSub,
      product: null,
      isProduct: false,
    },
  }
}
