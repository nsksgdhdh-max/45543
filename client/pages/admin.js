import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { readNews } from '../lib/news'
import { readPartners } from '../lib/partners'

function readSubmissions() {
  const { readFileSync } = require('node:fs')
  const path = require('node:path')
  const file = path.join(process.cwd(), 'data', 'submissions.json')
  try {
    const s = readFileSync(file, 'utf8')
    return JSON.parse(s || '[]')
  } catch (e) { return [] }
}

function readProducts() {
  const { readFileSync } = require('node:fs')
  const path = require('node:path')
  const file = path.join(process.cwd(), 'data', 'specific_products.json')
  try {
    const s = readFileSync(file, 'utf8')
    return JSON.parse(s || '[]')
  } catch (e) { return [] }
}

function readCategories() {
  const { readFileSync } = require('node:fs')
  const path = require('node:path')
  const file = path.join(process.cwd(), 'data', 'categories.json')
  const fallback = [
    { slug: 'male-health', label: 'Männliche Gesundheit', subcategories: ['Prostatitis und Männergesundheit', 'Potenz und Libido'] },
    { slug: 'vision-hearing', label: 'Sehen und Hören', subcategories: ['Hören und Gleichgewicht'] },
    { slug: 'metabolism', label: 'Stoffwechsel und Diabetes', subcategories: ['Stoffwechsel und Diabetes', 'Gewichtsmanagement'] },
    { slug: 'heart', label: 'Herz und Blutdruck', subcategories: ['Herz und Blutdruck', 'Kreislauf und Energie'] },
    { slug: 'digestive', label: 'Verdauung und Magen-Darm', subcategories: ['Verdauung und Magen-Darm', 'Darmsanierung'] },
    { slug: 'joints', label: 'Gelenke und Bewegungsapparat', subcategories: ['Gelenke und Bewegungsapparat', 'Muskel und Rücken'] },
    { slug: 'weight-loss', label: 'Gewichtsverlust und Detox', subcategories: ['Gewichtsverlust und Detox', 'Appetit und Stoffwechsel'] },
    { slug: 'nerves', label: 'Nervensystem', subcategories: ['Nervensystem', 'Stress und Schlaf'] },
    { slug: 'urinary', label: 'Urogenitalsystem', subcategories: ['Urogenitalsystem', 'Prostata und Harnwege'] },
    { slug: 'venous-health', label: 'Venöse Gesundheit', subcategories: ['Venöse Gesundheit', 'Pflege für die Füße'] },
    { slug: 'skin', label: 'Schönheit und Haut', subcategories: ['Anti-Aging-Pflege', 'Schönheit und Haut'] },
    { slug: 'immune', label: 'Immunität und allgemeine Gesundheit', subcategories: ['Immunität und allgemeine Gesundheit', 'Detox und allgemeine Vitalität'] },
  ]

  try {
    const s = readFileSync(file, 'utf8')
    const parsed = JSON.parse(s || '[]')
    return Array.isArray(parsed) && parsed.length ? parsed : fallback
  } catch (e) {
    return fallback
  }
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

export default function AdminPage({ list, news, products, partners, categories }) {
  const [newsList, setNewsList] = useState(news || [])
  const [productList, setProductList] = useState(products || [])
  const [partnerList, setPartnerList] = useState(partners || [])
  const [categoryList, setCategoryList] = useState(categories || readCategories())
  const [categoryForm, setCategoryForm] = useState({
    slug: 'male-health',
    label: 'Männliche Gesundheit',
    subcategories: 'Prostatitis und Männergesundheit, Potenz und Libido',
  })
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
  useEffect(() => {
    const resolvedCategories = Array.isArray(categories) && categories.length ? categories : readCategories()
    setCategoryList(resolvedCategories)
  }, [categories])
  const [productAssignmentDrafts, setProductAssignmentDrafts] = useState({})
  const [apiStatus, setApiStatus] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', image: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [nameDrafts, setNameDrafts] = useState(() => Object.fromEntries((products || []).map((product) => [getProductKey(product), String(product.name || '')])))
  const [seoDrafts, setSeoDrafts] = useState(() => Object.fromEntries((products || []).map((product) => [getProductKey(product), getSeoDraft(product)])))
  const [seoAgentForm, setSeoAgentForm] = useState({
    limit: 3,
    categorySlug: 'all',
  })
  const [seoAgentDrafts, setSeoAgentDrafts] = useState([])
  const [seoAgentAnalysis, setSeoAgentAnalysis] = useState(null)
  const [seoAgentStatus, setSeoAgentStatus] = useState('')
  const [seoAgentLoading, setSeoAgentLoading] = useState(false)
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

  const handleAssignProductToCategory = async (product, category) => {
    const productId = product.id || product.product_id
    if (!productId || !category?.slug) return

    const categorySubcategories = Array.isArray(category.subcategories) ? category.subcategories : []
    const resolvedSubcategory = categorySubcategories.includes(product.subcategory)
      ? product.subcategory
      : categorySubcategories[0] || product.subcategory || 'Allgemeine Gesundheit'

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          partner_id: product.partner_id || 'metacpa_default',
          category: category.slug,
          subcategory: resolvedSubcategory,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось добавить товар в категорию')

      setProductList(json.products || [])
      setStatus(`Товар «${product.name || 'без названия'}» добавлен в категорию «${category.label}»`)
    } catch (error) {
      setStatus(error.message || 'Ошибка добавления товара в категорию')
    }
  }

  const handleRemoveProductFromCategory = async (product, category) => {
    const productId = product.id || product.product_id
    if (!productId || !category?.slug) return

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          partner_id: product.partner_id || 'metacpa_default',
          category: '',
          subcategory: '',
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось удалить товар из категории')

      setProductList(json.products || [])
      setStatus(`Товар «${product.name || 'без названия'}» удалён из категории «${category.label}»`)
    } catch (error) {
      setStatus(error.message || 'Ошибка удаления товара из категории')
    }
  }

  const handleProductCategorySave = async (product) => {
    const productId = product.id || product.product_id
    if (!productId) return

    const key = getProductKey(product)
    const draft = productAssignmentDrafts[key] || {
      category: product.category || categoryList[0]?.slug || 'male-health',
      subcategory: product.subcategory || '',
    }

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          partner_id: product.partner_id || 'metacpa_default',
          category: draft.category,
          subcategory: draft.subcategory,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось привязать товар к категории')

      setProductList(json.products || [])
      setStatus(`Товар «${product.name || 'без названия'}» привязан к категории ${draft.category}`)
    } catch (error) {
      setStatus(error.message || 'Ошибка привязки товара')
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

  const handleProductNameSave = async (product) => {
    const productId = product.id || product.product_id
    if (!productId) return

    const key = getProductKey(product)
    const draftName = String(nameDrafts[key] ?? product.name ?? '').trim()
    if (!draftName) {
      setStatus('Название товара не может быть пустым')
      return
    }

    try {
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          partner_id: product.partner_id || 'metacpa_default',
          name: draftName,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось обновить название товара')

      const nextProducts = json.products || []
      setProductList(nextProducts)
      setNameDrafts((prev) => {
        const next = { ...prev }
        for (const item of nextProducts) {
          next[getProductKey(item)] = String(item.name || '')
        }
        return next
      })
      setStatus(`Название товара обновлено: ${draftName}`)
    } catch (error) {
      setStatus(error.message || 'Ошибка обновления названия товара')
    }
  }

  const handleSeoAgentRun = async (publish = false) => {
    setSeoAgentLoading(true)
    setSeoAgentStatus('')

    try {
      const response = await fetch('/api/seo-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: publish ? 'publish' : 'generate',
          limit: Number(seoAgentForm.limit || 3),
          categorySlug: seoAgentForm.categorySlug || 'all',
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось запустить SEO-агент')

      if (publish) {
        setSeoAgentDrafts([])
        setNewsList((prev) => [...(json.published || []), ...prev])
        const warningText = Array.isArray(json.warnings) && json.warnings.length ? `; предупреждения: ${json.warnings.length}` : ''
        setSeoAgentStatus(`Опубликовано новостей: ${json.published?.length || 0}${warningText}`)
      } else {
        setSeoAgentDrafts(json.drafts || [])
        setSeoAgentAnalysis(json.analysis || null)
        setSeoAgentStatus(`Готово: ${json.drafts?.length || 0} черновиков`)
      }
    } catch (error) {
      setSeoAgentStatus(error.message || 'Ошибка SEO-агента')
    } finally {
      setSeoAgentLoading(false)
    }
  }

  const handleCategorySave = async (event) => {
    event.preventDefault()
    const slug = String(categoryForm.slug || '').trim()
    const label = String(categoryForm.label || '').trim()
    const subcategories = String(categoryForm.subcategories || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)

    if (!slug || !label) {
      setStatus('Укажите slug и название категории')
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          category: { slug, label, subcategories },
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось сохранить категорию')

      const nextCategories = json.categories || []
      setCategoryList(nextCategories)
      setStatus(`Категория «${label}» сохранена`)
    } catch (error) {
      setStatus(error.message || 'Ошибка сохранения категории')
    }
  }

  const handleCategoryDelete = async (slug) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Не удалось удалить категорию')

      const nextCategories = json.categories || []
      setCategoryList(nextCategories)
      setStatus('Категория удалена')
    } catch (error) {
      setStatus(error.message || 'Ошибка удаления категории')
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
    { id: 'news', label: 'Новости', count: newsList.length },
    { id: 'categories', label: 'Категории', count: categoryList.length },
    { id: 'products', label: 'Товары', count: productList.length },
    { id: 'partners', label: 'Партнёры', count: partnerList.length },
    { id: 'top-products', label: 'Топ товары', count: productList.filter((item) => Number(item.top) === 1).length },
    { id: 'seo-agent', label: 'SEO-Agent', count: seoAgentDrafts.length },
  ]
  const productsAvailableForCategory = (categorySlug) =>
    productList.filter((product) => String(product.category || '') !== String(categorySlug || ''))

  useEffect(() => {
    setProductAssignmentDrafts((prev) => {
      const next = { ...prev }
      for (const product of productList) {
        const key = getProductKey(product)
        const selectedCategory = product.category || categoryList[0]?.slug || 'male-health'
        const selectedMeta = (categoryList.length ? categoryList : readCategories()).find((category) => category.slug === selectedCategory)
        next[key] = {
          category: selectedCategory,
          subcategory: product.subcategory || selectedMeta?.subcategories?.[0] || '',
        }
      }
      return next
    })
  }, [categoryList, productList])

  useEffect(() => {
    setNameDrafts((prev) => {
      const next = { ...prev }
      for (const product of productList) {
        const key = getProductKey(product)
        if (next[key] === undefined) {
          next[key] = String(product.name || '')
        }
      }
      return next
    })
  }, [productList])

  const [authState, setAuthState] = useState('checking')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [otpForm, setOtpForm] = useState({ code: '' })
  const [authStatus, setAuthStatus] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    const hashValue = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
    const session = typeof window !== 'undefined' ? localStorage.getItem('ewige-admin-session') : null
    const expectedHash = process.env.NEXT_PUBLIC_ADMIN_HASH || 'ewige-vitalitaet-admin-a4f9'

    if (hashValue === expectedHash && session === 'active') {
      setAuthState('authorized')
      return
    }

    setAuthState('login')
  }, [])

  const navigateToHiddenAdmin = () => {
    if (typeof window === 'undefined') return
    const hash = process.env.NEXT_PUBLIC_ADMIN_HASH || 'ewige-vitalitaet-admin-a4f9'
    window.history.replaceState(null, '', `${window.location.pathname}#${hash}`)
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthStatus('')

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: loginForm.username,
          password: loginForm.password,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Неверный логин или пароль')

      navigateToHiddenAdmin()
      setAuthState('otp')
      const deliveryLabel = json.method === 'telegram' ? 'Telegram' : json.email || 'post@ewige-vitalitaet.de'
      const fallbackInfo = json.method === 'email' && json.message ? ` (${json.message})` : ''
      setAuthStatus(`Код отправлен на ${deliveryLabel}${fallbackInfo}. Код действует 60 секунд.`)
    } catch (error) {
      setAuthStatus(error.message || 'Ошибка входа')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthStatus('')

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          username: loginForm.username,
          code: otpForm.code,
        }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Неверный код подтверждения')

      if (typeof window !== 'undefined') {
        localStorage.setItem('ewige-admin-session', 'active')
      }
      navigateToHiddenAdmin()
      setAuthState('authorized')
      setAuthStatus('Доступ подтверждён')
    } catch (error) {
      setAuthStatus(error.message || 'Ошибка проверки кода')
    } finally {
      setAuthLoading(false)
    }
  }

  if (authState !== 'authorized') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
        <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Secure admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              {authState === 'otp' ? 'Подтверждение по Telegram' : 'Вход в админку'}
            </h1>
          </div>

          {authState === 'otp' ? (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Код подтверждения</label>
                <input
                  value={otpForm.code}
                  onChange={(event) => setOtpForm({ code: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-indigo-500"
                  placeholder=""
                  autoComplete="one-time-code"
                />
              </div>

              {authStatus && <p className="text-sm text-slate-300">{authStatus}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? 'Проверяем...' : 'Подтвердить вход'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Логин</label>
                <input
                  value={loginForm.username}
                  onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-indigo-500"
                  placeholder=""
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Пароль</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-indigo-500"
                  placeholder=""
                />
              </div>

              {authStatus && <p className="text-sm text-amber-300">{authStatus}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? 'Проверяем...' : 'Войти'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

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

            {activeSection === 'news' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Новости</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">Публикации и удаление</h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                    Всего: {newsList.length}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {newsList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      Пока новостей нет.
                    </div>
                  ) : (
                    newsList.map((item) => (
                      <article key={item.id || item.slug || item.createdAt} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <div className="grid gap-4 p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center">
                          <div className="overflow-hidden rounded-xl bg-white">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="h-24 w-full object-cover" />
                            ) : (
                              <div className="flex h-24 items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">News</div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-base font-bold text-slate-900">{item.title}</div>
                            <div className="mt-1 line-clamp-2 text-sm text-slate-600">{item.excerpt || item.body || '—'}</div>
                          </div>

                          <div className="flex justify-start sm:justify-end">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id || item.slug || item.createdAt)}
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeSection === 'categories' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Категории</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">Категории и подкатегории товара</h2>
                </div>

                <form onSubmit={handleCategorySave} className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Slug категории</label>
                      <input
                        value={categoryForm.slug}
                        onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="male-health"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Название категории</label>
                      <input
                        value={categoryForm.label}
                        onChange={(event) => setCategoryForm({ ...categoryForm, label: event.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Männliche Gesundheit"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Подкатегории (через запятую)</label>
                    <textarea
                      value={categoryForm.subcategories}
                      onChange={(event) => setCategoryForm({ ...categoryForm, subcategories: event.target.value })}
                      className="h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                      placeholder="Prostatitis und Männergesundheit, Potenz und Libido"
                    />
                  </div>

                  <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-indigo-600">
                    Сохранить категорию
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {categoryList.map((category) => {
                    const productsInCategory = productList.filter((product) => String(product.category || '') === category.slug)

                    return (
                      <div key={category.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-lg font-black text-slate-900">{category.label}</div>
                            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{category.slug}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const selected = categoryList.find((item) => item.slug === category.slug)
                                setCategoryForm({
                                  slug: selected?.slug || '',
                                  label: selected?.label || '',
                                  subcategories: (selected?.subcategories || []).join(', '),
                                })
                              }}
                              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                            >
                              Выбрать
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCategoryDelete(category.slug)}
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(category.subcategories || []).map((subcategory) => (
                            <span key={`${category.slug}-${subcategory}`} className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {subcategory}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="text-sm font-semibold text-slate-900">Товары в категории: {productsInCategory.length}</div>
                          {productsInCategory.length === 0 ? (
                            <div className="mt-2 text-xs text-slate-500">Пока нет товаров в этой категории.</div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {productsInCategory.slice(0, 25).map((product) => (
                                <div key={`${category.slug}-in-${product.id || product.product_id}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-emerald-50 px-3 py-2">
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-slate-900">{product.name || 'Без названия'}</div>
                                    <div className="text-xs text-slate-500">{product.subcategory || 'Без подкатегории'}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductFromCategory(product, category)}
                                    className="shrink-0 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              ))}
                              {productsInCategory.length > 25 && (
                                <div className="text-xs text-slate-500">Показано 25 из {productsInCategory.length} товаров.</div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="text-sm font-semibold text-slate-900">Добавить товары в эту категорию</div>
                          {productsAvailableForCategory(category.slug).length === 0 ? (
                            <div className="mt-2 text-xs text-slate-500">Нет товаров для добавления в эту категорию. Все товары уже привязаны к другим категориям или уже здесь.</div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {productsAvailableForCategory(category.slug).slice(0, 25).map((product) => (
                                <div key={`${category.slug}-out-${product.id || product.product_id}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-slate-900">{product.name || 'Без названия'}</div>
                                    <div className="text-xs text-slate-500">{product.category || 'Без категории'}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleAssignProductToCategory(product, category)}
                                    className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
                                  >
                                    Добавить
                                  </button>
                                </div>
                              ))}
                              {productsAvailableForCategory(category.slug).length > 25 && (
                                <div className="text-xs text-slate-500">Показано 25 из {productsAvailableForCategory(category.slug).length} товаров.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {activeSection === 'products' && (
              <>
                <div className="grid gap-8 2xl:grid-cols-[1fr_1fr]">
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
                      {productList.map((product) => {
                        const key = getProductKey(product)
                        const assignmentDraft = productAssignmentDrafts[key] || {
                          category: product.category || categoryList[0]?.slug || 'male-health',
                          subcategory: product.subcategory || '',
                        }
                        const selectedCategoryMeta = (categoryList.length ? categoryList : readCategories()).find((category) => category.slug === assignmentDraft.category) || null

                        return (
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

                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="mb-3">
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Название товара</label>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                  <input
                                    value={nameDrafts[key] ?? product.name ?? ''}
                                    onChange={(event) => {
                                      const value = event.target.value
                                      setNameDrafts((prev) => ({
                                        ...prev,
                                        [key]: value,
                                      }))
                                    }}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    placeholder="Введите название товара"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleProductNameSave(product)}
                                    className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                  >
                                    Сохранить название
                                  </button>
                                </div>
                              </div>

                              <div className="mb-2 text-sm font-semibold text-slate-800">Привязка товара к категории</div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Категория</label>
                                  <select
                                    value={assignmentDraft.category}
                                    onChange={(event) => {
                                      const nextCategory = event.target.value
                                      const nextMeta = (categoryList.length ? categoryList : readCategories()).find((category) => category.slug === nextCategory)
                                      setProductAssignmentDrafts((prev) => ({
                                        ...prev,
                                        [key]: {
                                          category: nextCategory,
                                          subcategory: nextMeta?.subcategories?.[0] || prev[key]?.subcategory || '',
                                        },
                                      }))
                                    }}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                  >
                                    {(categoryList.length ? categoryList : readCategories()).map((category) => (
                                      <option key={`product-${key}-${category.slug}`} value={category.slug}>{category.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Подкатегория</label>
                                  <input
                                    value={assignmentDraft.subcategory}
                                    onChange={(event) => {
                                      setProductAssignmentDrafts((prev) => ({
                                        ...prev,
                                        [key]: {
                                          ...(prev[key] || assignmentDraft),
                                          subcategory: event.target.value,
                                        },
                                      }))
                                    }}
                                    list={`subcategory-options-${key}`}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    placeholder="Выберите или напишите"
                                  />
                                  <datalist id={`subcategory-options-${key}`}>
                                    {(selectedCategoryMeta?.subcategories || []).map((subcategory) => (
                                      <option key={`${key}-${subcategory}`} value={subcategory} />
                                    ))}
                                  </datalist>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleProductCategorySave(product)}
                                className="mt-3 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                              >
                                Сохранить категорию
                              </button>
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
                       )
                     })}
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

            {activeSection === 'seo-agent' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">SEO-Agent</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">Автогенерация новостей по товарам</h2>
                    <p className="mt-2 max-w-3xl text-sm text-slate-600">
                      Агент анализирует каталог и пишет живые новости на немецком языке в человеческом стиле — без шаблонного AI-текста.
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                    Черновиков: {seoAgentDrafts.length}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Категория</label>
                    <select
                      value={seoAgentForm.categorySlug}
                      onChange={(event) => setSeoAgentForm((prev) => ({ ...prev, categorySlug: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                    >
                      <option value="all">Alle Kategorien</option>
                      {categoryList.map((category) => (
                        <option key={`seo-agent-${category.slug}`} value={category.slug}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Сколько новостей создать</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={seoAgentForm.limit}
                      onChange={(event) => setSeoAgentForm((prev) => ({ ...prev, limit: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={seoAgentLoading}
                    onClick={() => handleSeoAgentRun(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {seoAgentLoading ? 'Анализ...' : 'Анализировать сайт'}
                  </button>
                  <button
                    type="button"
                    disabled={seoAgentLoading}
                    onClick={() => handleSeoAgentRun(true)}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {seoAgentLoading ? 'Публикация...' : 'Создать и опубликовать новости'}
                  </button>
                </div>

                {seoAgentStatus && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {seoAgentStatus}
                  </div>
                )}

                {seoAgentAnalysis && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-800">Краткий анализ каталога</div>
                    <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                      <div>Товаров: {seoAgentAnalysis.productCount}</div>
                      <div>Доступно тем: {seoAgentAnalysis.availableCount}</div>
                      <div>Новостей уже есть: {seoAgentAnalysis.existingNewsCount}</div>
                    </div>
                    {Array.isArray(seoAgentAnalysis.topCategories) && seoAgentAnalysis.topCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {seoAgentAnalysis.topCategories.map((category) => (
                          <span key={category.slug} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {category.label} · {category.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  {seoAgentDrafts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      Пока нет черновиков. Запустите анализ, и агент предложит готовые немецкие новости на основе каталога.
                    </div>
                  ) : (
                    seoAgentDrafts.map((draft) => (
                      <article key={`${draft.sourceProductId || draft.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{draft.title}</h3>
                            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                              {draft.sourceCategory || 'SEO-Agent'} · {draft.sourceProductName || 'Produkt'}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {draft.sourceSubcategory || 'Ohne Unterkategorie'}
                          </span>
                        </div>

                        {draft.excerpt && <p className="mt-3 text-sm leading-6 text-slate-600">{draft.excerpt}</p>}
                        <div className="mt-3 whitespace-pre-line rounded-xl bg-white p-3 text-sm leading-7 text-slate-700">
                          {draft.body}
                        </div>
                      </article>
                    ))
                  )}
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
  const categories = readCategories()
  return { props: { list, news, products, partners, categories } }
}
