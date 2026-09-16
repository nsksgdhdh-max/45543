import { useState } from 'react'
import Header from '../components/Header'
import { readFileSync } from 'fs'
import path from 'path'
import { readNews } from '../lib/news'

function readSubmissions() {
  const file = path.join(process.cwd(), 'data', 'submissions.json')
  try {
    const s = readFileSync(file, 'utf8')
    return JSON.parse(s || '[]')
  } catch (e) { return [] }
}

function readProducts() {
  const file = path.join(process.cwd(), 'data', 'specific_products.json')
  try {
    const s = readFileSync(file, 'utf8')
    return JSON.parse(s || '[]')
  } catch (e) { return [] }
}

export default function AdminPage({ list, news, products }) {
  const [newsList, setNewsList] = useState(news || [])
  const [productList, setProductList] = useState(products || [])
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', image: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Ошибка сохранения')

      setNewsList((prev) => [json.item, ...prev])
      setForm({ title: '', excerpt: '', body: '', image: '' })
      setStatus('Новость успешно добавлена')
    } catch (error) {
      setStatus(error.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Ошибка удаления')

      setNewsList(json.items || [])
      setStatus('Новость удалена')
    } catch (error) {
      setStatus(error.message || 'Ошибка')
    }
  }

  const handleTopToggle = async (product) => {
    const nextTop = Number(product.top) === 1 ? 0 : 1

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id || product.product_id, top: nextTop }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Ошибка')

      setProductList(json.products || [])
      setStatus(`Товар ${product.name} ${nextTop ? 'отмечен как Top' : 'снят с Top'}`)
    } catch (error) {
      setStatus(error.message || 'Ошибка')
    }
  }

  const handleMainOfferToggle = async (product) => {
    const currentMainOffer = Number(product.main_offer) === 1 || Number(product.new) === 1
    const nextMainOffer = currentMainOffer ? 0 : 1

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id || product.product_id,
          main_offer: nextMainOffer,
          is_new: nextMainOffer,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Ошибка')

      setProductList(json.products || [])
      setStatus(`Товар ${product.name} ${nextMainOffer ? 'сделан главным оффером и помечен как New' : 'снят с главного оффера'}`)
    } catch (error) {
      setStatus(error.message || 'Ошибка')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">Админка — заявки</h1>
            <p className="mt-2 text-sm text-gray-600">Всего заявок: {list.length}</p>
            <ul className="mt-4 space-y-4">
              {list.map((item, i) => {
                const payload = item.post || item
                const productId = payload.product_id || payload.offer_id || '—'
                const name = payload.name || 'Без имени'
                const phone = payload.phone || 'Без телефона'
                const comment = payload.comment || payload.message || ''

                return (
                  <li key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <strong className="text-gray-900">{productId}</strong>
                      <span>—</span>
                      <span>{name}</span>
                      <span>/</span>
                      <span>{phone}</span>
                    </div>
                    {comment && <div className="mt-2 text-sm text-gray-700">Комментарий: {comment}</div>}
                    <div className="mt-2 text-xs text-gray-500">{item.receivedAt}</div>
                    <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-100 p-2 text-xs">{JSON.stringify(item.response || item.error || payload, null, 2)}</pre>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Добавить новость</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Заголовок</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none ring-0 focus:border-indigo-500"
                  placeholder="Новое обновление"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Краткое описание</label>
                <input
                  value={form.excerpt}
                  onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none ring-0 focus:border-indigo-500"
                  placeholder="Коротко о новости"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ссылка на изображение</label>
                <input
                  value={form.image}
                  onChange={(event) => setForm({ ...form, image: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none ring-0 focus:border-indigo-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Текст новости</label>
                <textarea
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  className="h-32 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                  placeholder="Полный текст новости..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {loading ? 'Сохранение...' : 'Добавить новость'}
              </button>

              {status && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</div>}
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold">Список новостей</h3>
              {newsList.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">Пока новостей нет.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {newsList.map((item) => (
                    <li key={item.id || item.createdAt} className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <div>
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        {item.excerpt && <div className="mt-1 text-sm text-gray-600">{item.excerpt}</div>}
                        <div className="mt-1 text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString('ru-RU')}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id || item.createdAt)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Главный оффер и топ товары</h2>
            <p className="mt-2 text-sm text-gray-600">Выберите один товар как главный оффер для главной страницы. Он будет показан крупным блоком и помечен зелёным badge "New".</p>
            <div className="mt-5 space-y-3">
              {productList.map((product) => (
                <div key={product.id || product.product_id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    {product.img && (
                      <img src={product.img} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category || 'Товар'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTopToggle(product)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        Number(product.top) === 1
                          ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                          : 'bg-slate-900 text-white hover:bg-slate-700'
                      }`}
                    >
                      {Number(product.top) === 1 ? 'Топ' : 'Сделать топ'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMainOfferToggle(product)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        Number(product.main_offer) === 1 || Number(product.new) === 1
                          ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {Number(product.main_offer) === 1 || Number(product.new) === 1 ? 'Главный' : 'Сделать главным'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  const list = readSubmissions()
  const news = readNews()
  const products = readProducts()
  return { props: { list, news, products } }
}
