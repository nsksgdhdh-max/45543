import { useState } from 'react'
import Header from '../components/Header'
import { readFileSync } from 'fs'
import path from 'path'
import { readNews } from '../lib/news'
import { readPartners } from '../lib/partners'

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

const DEFAULT_TITLE_TEMPLATE = 'Kaufen {name} Deutschland'
const DEFAULT_DESCRIPTION_TEMPLATE = '{name}. Kaufen jetzt. Preis ab {price}. Für eine einfache Routine im Alltag. Qualitativ geprüft. Garantie. Lieferung 3-7 Tage.'

function getProductKey(product) {
  return `${String(product?.partner_id || 'metacpa_default')}:${String(product?.product_id || product?.id || '')}`
}

function getSeoDraft(product) {
  return {
    title_template: product?.seo_title_template || product?.title_template || DEFAULT_TITLE_TEMPLATE,
    description_template: product?.seo_description_template || product?.description_template || DEFAULT_DESCRIPTION_TEMPLATE,
  }
}

export default function AdminPage({ list, news, products, partners }) {
  const [newsList, setNewsList] = useState(news || [])
  const [productList, setProductList] = useState(products || [])
  const [partnerList, setPartnerList] = useState(partners || [])
  const [apiForm, setApiForm] = useState({
    baseUrl: 'https://core.metacpa.ru/api/offers/info',
    token: '',
    geoCode: 'DE',
    limit: '25',
    offerId: '',
    webmasterId: '',
    partnerId: 'metacpa_default',
    flow_hash: '',
  })
  const [partnerForm, setPartnerForm] = useState({
    id: 'metacpa_default',
    name: 'MetaCPA default',
    lead_url: 'https://metacpa.ru/create',
    lead_method: 'GET',
    flow_hash: '',
    api_key: '',
    token: '',
    webmaster_id: '993341',
  })
  const [manualProductForm, setManualProductForm] = useState({
    name: '',
    product_id: '',
    category: 'male-health',
    subcategory: 'Prostatitis und Männergesundheit',
    price: '39',
    img: '',
    tracking_link: '',
    top: 0,
    main_offer: 0,
    info: '',
  })
  const [manualProductLoading, setManualProductLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', image: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [seoDrafts, setSeoDrafts] = useState(() => Object.fromEntries((products || []).map((product) => [getProductKey(product), getSeoDraft(product)])))
  const [aiLogs, setAiLogs] = useState(
    (products || []).filter((item) => item?.ai_classification).map((item) => ({
      id: item.product_id || item.id,
      family_label: item.ai_classification?.family_label || item.category,
      subcategory_label: item.ai_classification?.subcategory_label || item.subcategory,
      reason: item.ai_classification?.reason || 'manual',
      created_new_category: Boolean(item.ai_classification?.created_new_category),
      created_new_category_name: item.ai_classification?.created_new_category_name || null,
    }))
  )

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
        body: JSON.stringify({ id: product.id || product.product_id, partner_id: product.partner_id || 'metacpa_default', top: nextTop }),
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
          partner_id: product.partner_id || 'metacpa_default',
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

  const handleDeleteProduct = async (product) => {
    const productId = product.id || product.product_id
    if (!productId) return
    if (!window.confirm(`Удалить товар "${product.name || 'без названия'}" из каталога?`)) return

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, partner_id: product.partner_id || 'metacpa_default', delete: true }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Ошибка удаления')

      setProductList(json.products || [])
      setStatus(`Товар ${product.name || 'без названия'} удалён из каталога`)
    } catch (error) {
      setStatus(error.message || 'Ошибка удаления')
    }
  }

  const handleSeoTemplateSave = async (product) => {
    const key = getProductKey(product)
    const draft = seoDrafts[key] || getSeoDraft(product)

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id || product.product_id,
          partner_id: product.partner_id || 'metacpa_default',
          title_template: draft.title_template,
          description_template: draft.description_template,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось сохранить шаблон')

      setProductList(json.products || [])
      setStatus(`Шаблон SEO сохранён для ${product.name || 'товара'}`)
    } catch (error) {
      setStatus(error.message || 'Ошибка сохранения шаблона')
    }
  }

  const handleManualProductSave = async (event) => {
    event.preventDefault()

    if (!manualProductForm.name.trim()) {
      setStatus('Укажите название товара')
      return
    }

    setManualProductLoading(true)
    setStatus('')

    try {
      const payload = {
        action: 'create',
        product: {
          ...manualProductForm,
          name: manualProductForm.name.trim(),
          product_id: manualProductForm.product_id || String(Date.now()),
          category: manualProductForm.category || 'male-health',
          subcategory: manualProductForm.subcategory || 'Prostatitis und Männergesundheit',
          price: manualProductForm.price || '39',
          img: manualProductForm.img || '/img/placeholder.svg',
          top: Number(manualProductForm.top) ? 1 : 0,
          main_offer: Number(manualProductForm.main_offer) ? 1 : 0,
          new: Number(manualProductForm.main_offer) ? 1 : 0,
          tracking_link: manualProductForm.tracking_link || '',
          info: manualProductForm.info || '',
        },
      }

      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось добавить товар')

      setProductList(json.products || [])
      setManualProductForm({
        name: '',
        product_id: '',
        category: 'male-health',
        subcategory: 'Prostatitis und Männergesundheit',
        price: '39',
        img: '',
        tracking_link: '',
        top: 0,
        main_offer: 0,
        info: '',
      })
      setStatus(`Товар «${payload.product.name}» добавлен в каталог`)
    } catch (error) {
      setStatus(error.message || 'Ошибка добавления товара')
    } finally {
      setManualProductLoading(false)
    }
  }

  const handlePartnerSave = async (event) => {
    event.preventDefault()
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerForm),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось сохранить партнёра')
      setPartnerList(json.partners || [])
      setApiForm((prev) => ({ ...prev, partnerId: json.partner?.id || prev.partnerId }))
      setStatus(`Партнёр ${json.partner?.name || 'сохранён'} добавлен`)
    } catch (error) {
      setStatus(error.message || 'Ошибка сохранения партнёра')
    }
  }

  const handlePartnerDelete = async (partnerId) => {
    try {
      const response = await fetch('/api/partners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: partnerId }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось удалить партнёра')
      setPartnerList(json.partners || [])
      setStatus('Партнёр удалён')
    } catch (error) {
      setStatus(error.message || 'Ошибка удаления партнёра')
    }
  }

  const handleApiImport = async (event) => {
    event.preventDefault()
    setApiLoading(true)
    setApiStatus('')

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          baseUrl: apiForm.baseUrl,
          token: apiForm.token,
          geoCode: apiForm.geoCode,
          limit: Number(apiForm.limit || 25),
          offerId: apiForm.offerId,
          webmasterId: apiForm.webmasterId,
          partnerId: apiForm.partnerId,
          flow_hash: apiForm.flow_hash,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Ошибка импорта')

      const freshProducts = json.products || []
      const mergedProducts = (() => {
        const map = new Map((productList || []).map((item) => [`${String(item.partner_id || 'metacpa_default')}:${String(item.product_id || item.id)}`, item]))
        for (const item of freshProducts) {
          map.set(`${String(item.partner_id || 'metacpa_default')}:${String(item.product_id || item.id)}`, item)
        }
        return [...map.values()]
      })()

      setProductList(mergedProducts)
      setAiLogs(
        mergedProducts
          .filter((item) => item?.ai_classification)
          .map((item) => ({
            id: item.product_id || item.id,
            family_label: item.ai_classification?.family_label || item.category,
            subcategory_label: item.ai_classification?.subcategory_label || item.subcategory,
            reason: item.ai_classification?.reason || 'manual',
            created_new_category: Boolean(item.ai_classification?.created_new_category),
            created_new_category_name: item.ai_classification?.created_new_category_name || null,
          }))
      )

      setApiStatus(`Импорт завершён: добавлено ${json.imported || 0} новых товаров`)
    } catch (error) {
      setApiStatus(error.message || 'Ошибка импорта')
    } finally {
      setApiLoading(false)
    }
  }

  const [activeSection, setActiveSection] = useState('requests')

  const sidebarItems = [
    { id: 'requests', label: 'Заявки', count: list.length },
    { id: 'products', label: 'Товары', count: productList.length },
    { id: 'partners', label: 'Партнёры', count: partnerList.length },
    { id: 'top-products', label: 'Топ товары', count: productList.filter((item) => Number(item.top) === 1).length },
  ]

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-200 bg-slate-900 p-5 text-white shadow-xl">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight">Панель управления</h1>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition ${
                    activeSection === item.id
                      ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-lg shadow-indigo-950/20'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-xs opacity-80">
                    {item.count}
                  </span>
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Статус</div>
              <div className="mt-2 text-lg font-bold text-white">Онлайн</div>
              <div className="mt-2 text-xs text-slate-300">Товары: {productList.length}</div>
            </div>
          </aside>

          <div className="space-y-8">
            {activeSection === 'requests' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Заявки</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">Последние обращения</h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                    Всего: {list.length}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {list.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      Пока заявок нет.
                    </div>
                  ) : (
                    list.map((item, i) => {
                      const payload = item.post || item
                      const productId = payload.product_id || payload.offer_id || '—'
                      const name = payload.name || 'Без имени'
                      const phone = payload.phone || 'Без телефона'
                      const comment = payload.comment || payload.message || ''

                      return (
                        <article key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">{productId}</span>
                              <span className="font-semibold text-slate-900">{name}</span>
                              <span className="text-slate-400">•</span>
                              <span>{phone}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-500">{item.receivedAt}</span>
                          </div>

                          {comment && (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                              {comment}
                            </div>
                          )}

                          <details className="mt-3 group">
                            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                              Показать данные заявки
                            </summary>
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-3 text-xs text-slate-200">
                              {JSON.stringify(item.response || item.error || payload, null, 2)}
                            </pre>
                          </details>
                        </article>
                      )
                    })
                  )}
                </div>
              </section>
            )}

            {activeSection === 'products' && (
              <>
                <div className="grid gap-8 2xl:grid-cols-[1fr_1fr]">
                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Товар</p>
                      <h2 className="mt-1 text-2xl font-black text-slate-900">Добавить товар вручную</h2>
                    </div>

                    <form onSubmit={handleManualProductSave} className="mt-5 space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Название товара</label>
                        <input
                          value={manualProductForm.name}
                          onChange={(event) => setManualProductForm({ ...manualProductForm, name: event.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                          placeholder="VitalMax Premium"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">ID товара</label>
                          <input
                            value={manualProductForm.product_id}
                            onChange={(event) => setManualProductForm({ ...manualProductForm, product_id: event.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                            placeholder="12345"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">Цена, EUR</label>
                          <input
                            value={manualProductForm.price}
                            onChange={(event) => setManualProductForm({ ...manualProductForm, price: event.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                            placeholder="39"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">Категория</label>
                          <select
                            value={manualProductForm.category}
                            onChange={(event) => setManualProductForm({ ...manualProductForm, category: event.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                          >
                            <option value="male-health">Männliche Gesundheit</option>
                            <option value="vision-hearing">Sehen und Hören</option>
                            <option value="metabolism">Stoffwechsel und Diabetes</option>
                            <option value="heart">Herz und Blutdruck</option>
                            <option value="digestive">Verdauung und Magen-Darm</option>
                            <option value="joints">Gelenke und Bewegungsapparat</option>
                            <option value="weight-loss">Gewichtsverlust und Detox</option>
                            <option value="nerves">Nervensystem</option>
                            <option value="urinary">Urogenitalsystem</option>
                            <option value="venous-health">Venen- und Kreislaufgesundheit</option>
                            <option value="skin">Schönheit und Haut</option>
                            <option value="immune">Immunität und Allgemeine Gesundheit</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">Подкатегория</label>
                          <input
                            value={manualProductForm.subcategory}
                            onChange={(event) => setManualProductForm({ ...manualProductForm, subcategory: event.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                            placeholder="Prostatitis und Männergesundheit"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Ссылка на изображение</label>
                        <input
                          value={manualProductForm.img}
                          onChange={(event) => setManualProductForm({ ...manualProductForm, img: event.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                          placeholder="/img/your-product.png"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Ссылка на оффер</label>
                        <input
                          value={manualProductForm.tracking_link}
                          onChange={(event) => setManualProductForm({ ...manualProductForm, tracking_link: event.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Краткое описание</label>
                        <textarea
                          value={manualProductForm.info}
                          onChange={(event) => setManualProductForm({ ...manualProductForm, info: event.target.value })}
                          className="h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                          placeholder="Кратко о пользе товара..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Number(manualProductForm.top) === 1}
                            onChange={(event) => setManualProductForm({ ...manualProductForm, top: event.target.checked ? 1 : 0 })}
                          />
                          Топ товар
                        </label>
                        <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Number(manualProductForm.main_offer) === 1}
                            onChange={(event) => setManualProductForm({ ...manualProductForm, main_offer: event.target.checked ? 1 : 0 })}
                          />
                          Главный оффер
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={manualProductLoading}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {manualProductLoading ? 'Сохраняем...' : 'Добавить товар в каталог'}
                      </button>

                      {status && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</div>}
                    </form>
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-2xl font-black text-slate-900">Импорт товаров через API</h2>
                    <p className="mt-2 text-sm text-gray-600">Импорт идёт строго по Германии (DE), без мульти-geo вариаций, а товары дублируются по ID оффера. Если нужен точный импорт одного товара — просто вставь его Offer ID / product ID в поле ниже; webmaster ID нужен только если сам API его требует.</p>

                    <form onSubmit={handleApiImport} className="mt-5 space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">API URL</label>
                        <input
                          value={apiForm.baseUrl}
                          onChange={(event) => setApiForm({ ...apiForm, baseUrl: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                          placeholder="https://core.metacpa.ru/api/offers/info"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Token</label>
                        <input
                          value={apiForm.token}
                          onChange={(event) => setApiForm({ ...apiForm, token: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                          placeholder="вставьте токен"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Партнёр для импорта</label>
                        <select
                          value={apiForm.partnerId}
                          onChange={(event) => setApiForm({ ...apiForm, partnerId: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                        >
                          {(partnerList.length ? partnerList : [{ id: 'metacpa_default', name: 'MetaCPA default' }]).map((partner) => (
                            <option key={partner.id} value={partner.id}>{partner.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Offer ID / product ID (точный импорт)</label>
                        <input
                          value={apiForm.offerId}
                          onChange={(event) => setApiForm({ ...apiForm, offerId: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                          placeholder="6134"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Geo</label>
                          <input
                            value={apiForm.geoCode}
                            onChange={(event) => setApiForm({ ...apiForm, geoCode: event.target.value })}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                            placeholder="DE"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Сколько товаров импортировать</label>
                          <input
                            value={apiForm.limit}
                            onChange={(event) => setApiForm({ ...apiForm, limit: event.target.value })}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                            placeholder="25"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Webmaster ID (только если API требует)</label>
                        <input
                          value={apiForm.webmasterId}
                          onChange={(event) => setApiForm({ ...apiForm, webmasterId: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                          placeholder="необязательно"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Flow hash для этого импорта (необязательно)</label>
                        <input
                          value={apiForm.flow_hash}
                          onChange={(event) => setApiForm({ ...apiForm, flow_hash: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                          placeholder="29c2bkas8w — если у этого товара/партнёра нужен отдельный flow_hash"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={apiLoading}
                        className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                      >
                        {apiLoading ? 'Импортирую...' : 'Импортировать товары'}
                      </button>

                      {apiStatus && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{apiStatus}</div>}
                    </form>
                  </section>
                </div>

                <div className="grid gap-8 2xl:grid-cols-[0.9fr_1.1fr]">
                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-2xl font-black text-slate-900">Партнёры и отправка лидов</h2>
                    <p className="mt-2 text-sm text-gray-600">У каждого партнёра свой идентификатор, endpoint и при необходимости отдельный flow_hash.</p>

                    <form onSubmit={handlePartnerSave} className="mt-5 space-y-4 border-b border-gray-200 pb-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">ID партнёра</label>
                          <input value={partnerForm.id} onChange={(event) => setPartnerForm({ ...partnerForm, id: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="metacpa_default" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                          <input value={partnerForm.name} onChange={(event) => setPartnerForm({ ...partnerForm, name: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="MetaCPA" />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Lead URL</label>
                          <input value={partnerForm.lead_url} onChange={(event) => setPartnerForm({ ...partnerForm, lead_url: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="https://metacpa.ru/create" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Method</label>
                          <select value={partnerForm.lead_method} onChange={(event) => setPartnerForm({ ...partnerForm, lead_method: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Flow hash (необязательно)</label>
                          <input value={partnerForm.flow_hash} onChange={(event) => setPartnerForm({ ...partnerForm, flow_hash: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="29c2bkas8w" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">API key</label>
                          <input value={partnerForm.api_key} onChange={(event) => setPartnerForm({ ...partnerForm, api_key: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="partner key" />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Token</label>
                          <input value={partnerForm.token} onChange={(event) => setPartnerForm({ ...partnerForm, token: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="token" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Webmaster ID</label>
                          <input value={partnerForm.webmaster_id} onChange={(event) => setPartnerForm({ ...partnerForm, webmaster_id: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="993341" />
                        </div>
                      </div>

                      <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500">Сохранить партнёра</button>
                    </form>

                    <div className="mt-5 space-y-3">
                      {partnerList.map((partner) => (
                        <div key={partner.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                          <div>
                            <div className="font-semibold text-gray-900">{partner.name}</div>
                            <div className="text-xs text-gray-500">{partner.id} • {partner.lead_url || 'URL не задан'} • {partner.flow_hash ? 'flow_hash active' : 'legacy fallback'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setApiForm((prev) => ({ ...prev, partnerId: partner.id }))} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Выбрать</button>
                            <button type="button" onClick={() => handlePartnerDelete(partner.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Удалить</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Каталог</p>
                        <h2 className="mt-1 text-2xl font-black text-slate-900">Отображение товаров</h2>
                      </div>
                      <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        {productList.length} шт.
                      </div>
                    </div>

                    <div className="space-y-3">
                      {productList.map((product) => (
                        <div key={product.id || product.product_id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                          <div className="flex items-center justify-between gap-4">
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

                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product)}
                                className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                            <div className="mb-2 text-sm font-semibold text-slate-800">Шаблоны SEO для товара</div>
                            <div className="space-y-3">
                              <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Title template</label>
                                <input
                                  value={seoDrafts[getProductKey(product)]?.title_template || getSeoDraft(product).title_template}
                                  onChange={(event) => {
                                    const key = getProductKey(product)
                                    setSeoDrafts((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...(prev[key] || getSeoDraft(product)),
                                        title_template: event.target.value,
                                      },
                                    }))
                                  }}
                                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                  placeholder={DEFAULT_TITLE_TEMPLATE}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Description template</label>
                                <textarea
                                  value={seoDrafts[getProductKey(product)]?.description_template || getSeoDraft(product).description_template}
                                  onChange={(event) => {
                                    const key = getProductKey(product)
                                    setSeoDrafts((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...(prev[key] || getSeoDraft(product)),
                                        description_template: event.target.value,
                                      },
                                    }))
                                  }}
                                  className="h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                  placeholder={DEFAULT_DESCRIPTION_TEMPLATE}
                                />
                              </div>
                              <div className="text-[11px] text-slate-500">Поддержка: {'{name}'}, {'{price}'}, {'{country}'}, {'{delivery}'}, {'{guarantee}'}</div>
                              <button
                                type="button"
                                onClick={() => handleSeoTemplateSave(product)}
                                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                              >
                                Сохранить шаблон
                              </button>
                            </div>
                          </div>

                          {product.ai_classification && (
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-slate-700">
                              <div className="font-semibold text-indigo-900">AI классификация</div>
                              <div className="mt-1">Семейство: {product.ai_classification.family_label || product.category}</div>
                              <div>Подкатегория: {product.ai_classification.subcategory_label || product.subcategory}</div>
                              <div>Причина: {product.ai_classification.reason || '—'}</div>
                              {product.ai_classification.created_new_category && (
                                <div>Создана новая категория: {product.ai_classification.created_new_category_name || '—'}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}

            {activeSection === 'partners' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-2xl font-black text-slate-900">Партнёры</h2>
                <p className="mt-2 text-sm text-gray-600">Добавляйте и управляйте партнёрами для импорта и отправки лидов.</p>

                <form onSubmit={handlePartnerSave} className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">ID партнёра</label>
                      <input value={partnerForm.id} onChange={(event) => setPartnerForm({ ...partnerForm, id: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="metacpa_default" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                      <input value={partnerForm.name} onChange={(event) => setPartnerForm({ ...partnerForm, name: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="MetaCPA" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Lead URL</label>
                      <input value={partnerForm.lead_url} onChange={(event) => setPartnerForm({ ...partnerForm, lead_url: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="https://metacpa.ru/create" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Method</label>
                      <select value={partnerForm.lead_method} onChange={(event) => setPartnerForm({ ...partnerForm, lead_method: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Flow hash (необязательно)</label>
                      <input value={partnerForm.flow_hash} onChange={(event) => setPartnerForm({ ...partnerForm, flow_hash: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="29c2bkas8w" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">API key</label>
                      <input value={partnerForm.api_key} onChange={(event) => setPartnerForm({ ...partnerForm, api_key: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="partner key" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Token</label>
                      <input value={partnerForm.token} onChange={(event) => setPartnerForm({ ...partnerForm, token: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="token" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Webmaster ID</label>
                      <input value={partnerForm.webmaster_id} onChange={(event) => setPartnerForm({ ...partnerForm, webmaster_id: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500" placeholder="993341" />
                    </div>
                  </div>

                  <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500">Сохранить партнёра</button>
                </form>

                <div className="mt-5 space-y-3">
                  {partnerList.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <div>
                        <div className="font-semibold text-gray-900">{partner.name}</div>
                        <div className="text-xs text-gray-500">{partner.id} • {partner.lead_url || 'URL не задан'} • {partner.flow_hash ? 'flow_hash active' : 'legacy fallback'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setApiForm((prev) => ({ ...prev, partnerId: partner.id }))} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Выбрать</button>
                        <button type="button" onClick={() => handlePartnerDelete(partner.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Удалить</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'top-products' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-2xl font-black text-slate-900">Топ товары</h2>
                <p className="mt-2 text-sm text-gray-600">Выберите товары для главной страницы и блоков топ-предложений.</p>
                <div className="mt-5 space-y-3">
                  {productList.map((product) => (
                    <div key={product.id || product.product_id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-4">
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
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  const list = readSubmissions()
  const news = readNews()
  const products = readProducts()
  const partners = readPartners()
  return { props: { list, news, products, partners } }
}
