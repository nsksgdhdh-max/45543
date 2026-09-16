import Header from '../components/Header'
import Link from 'next/link'
import products from '../data/specific_products.json'
import { buildCatalogGroups } from '../lib/catalog'
import { resolveProductImage } from '../lib/product'

const categories = buildCatalogGroups(products)

export default function Categories() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <nav className="mb-4 flex items-center justify-start gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-indigo-600">Главная</Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Каталог</span>
          </nav>

          <div className="text-center">
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Категории товаров
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Подборка решений по здоровью и заботе о теле, сформированная по смыслу продукта, а не только по форме.
            </p>
          </div>
        </div>

        <section className="mb-12">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Категории</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Основные категории</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-32px_rgba(79,70,229,0.35)]"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={resolveProductImage(category.image)}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = '/img/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 backdrop-blur-sm">
                    {category.count} товаров
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Раздел</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
