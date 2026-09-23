const CYRILLIC_TO_LATIN = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ё: 'E',
  Ж: 'Zh',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'H',
  Ц: 'Ts',
  Ч: 'Ch',
  Ш: 'Sh',
  Щ: 'Shch',
  Ъ: '',
  Ы: 'Y',
  Ь: '',
  Э: 'E',
  Ю: 'Yu',
  Я: 'Ya',
}

export function toEnglishSlug(value = '') {
  if (!value) return ''

  let result = ''
  for (const char of String(value)) {
    result += CYRILLIC_TO_LATIN[char] || char
  }

  return result
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[0-9]/g, ' ')
    .replace(/[^a-zA-Z\s-]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getProductIdFromParam(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const match = raw.match(/(\d+)(?:\/)?$/)
  if (match) return match[1]

  const stripped = raw.replace(/-+$/, '')
  const legacyMatch = stripped.match(/-(\d+)$/)
  if (legacyMatch) return legacyMatch[1]

  return ''
}

function inferCategorySlugFromProduct(product) {
  const rawCategory = String(product?.category || product?.family_slug || product?.family || '').trim()
  const rawName = String(product?.name || '').trim()
  const combined = `${rawCategory} ${rawName}`.toLowerCase()

  if (!combined) return ''

  const aliases = {
    'male-health': ['male-health', 'мужское здоровье', 'male health', 'простат', 'потенц', 'эрект', 'тестостерон', 'libido', 'андролог'],
    'vision-hearing': ['vision-hearing', 'зрение и слух', 'vision and hearing', 'зрение', 'слух', 'глаз', 'офтальм', 'retina', 'eye', 'optic', 'audi'],
    'metabolism': ['metabolism', 'метаболизм и диабет', 'metabolism and diabetes', 'диабет', 'глюкоз', 'сахар', 'метаб'],
    'heart': ['heart', 'сердце и давление', 'heart and pressure', 'сердце', 'давлен', 'кардио', 'гиперто'],
    'digestive': ['digestive', 'жкт и пищеварение', 'gastro and digestion', 'желуд', 'пищевар', 'киш', 'гастро', 'digest'],
    'joints': ['joints', 'суставы', 'артро', 'хондро', 'остео', 'мышц', 'спин'],
    'weight-loss': ['weight-loss', 'похудение и детокс', 'slimming', 'похуд', 'детокс', 'снижение веса', 'жир', 'fat burn', 'weight loss'],
    'nerves': ['nerves', 'нервная система', 'нерв', 'стресс', 'сон', 'тревож', 'insomnia', 'anxiety'],
    'urinary': ['urinary', 'мочеполовая система', 'цистит', 'моче', 'почек', 'уролог', 'prostate'],
    'venous-health': ['venous-health', 'венозное здоровье', 'venous health', 'варикоз', 'веноз', 'вены', 'varix', 'venous', 'vein'],
    'skin': ['skin', 'красота и кожа', 'beauty and skin', 'антивозраст', 'кожа', 'крем', 'cosmetic', 'skincare', 'anti-age'],
    'immune': ['immune', 'иммунитет и общее здоровье', 'general health', 'иммун', 'общего', 'общее', 'паразит', 'antiparasit', 'helminth', 'worms'],
  }

  for (const [slug, values] of Object.entries(aliases)) {
    if (values.some((value) => combined.includes(String(value).toLowerCase()))) {
      return slug
    }
  }

  return ''
}

export function buildProductUrl(product, categorySlug = '') {
  const slug = toEnglishSlug(product?.name || '')
  const resolvedCategory = categorySlug || inferCategorySlugFromProduct(product)

  if (resolvedCategory) {
    return slug ? `/categories/${toEnglishSlug(resolvedCategory)}/${slug}` : '/categories'
  }

  return slug ? `/product/${slug}` : '/product'
}

function applySeoTemplate(template, product, price = '') {
  const name = String(product?.name || 'Produkt').trim()
  const productId = String(product?.product_id || product?.id || '').trim()
  const country = 'Deutschland'
  const normalizedPrice = String(price || '').trim()

  const rendered = String(template || '')
    .replace(/\{name\}/gi, name)
    .replace(/\{product_name\}/gi, name)
    .replace(/\{id\}/gi, '')
    .replace(/\{product_id\}/gi, '')
    .replace(/\{price\}/gi, normalizedPrice)
    .replace(/\{country\}/gi, country)
    .replace(/\{germany\}/gi, country)
    .replace(/\{delivery\}/gi, 'Lieferung 3-7 Tage')
    .replace(/\{guarantee\}/gi, 'Garantie')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return rendered
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function fitSeoMetaText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text

  const safeLimit = Math.max(0, maxLength - 3)
  let trimmed = text.slice(0, safeLimit).trimEnd()
  const lastSpace = trimmed.lastIndexOf(' ')

  if (lastSpace > Math.max(8, Math.floor(safeLimit * 0.6))) {
    trimmed = trimmed.slice(0, lastSpace).trimEnd()
  }

  return `${trimmed || text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

export function buildProductSeo(product, price = '') {
  const name = String(product?.name || 'Produkt').trim()
  const rawInfo = String(product?.info || '').trim()
  const infoText = rawInfo ? rawInfo.replace(/\s+/g, ' ').replace(/\r/g, ' ').trim() : ''

  const descriptionSeed = infoText
    ? /[.!?]/.test(infoText)
      ? infoText.split(/[.!?]/).map((part) => part.trim()).filter(Boolean)[0] || infoText.slice(0, 220)
      : infoText.slice(0, 220)
    : `${name} ist ein Produkt, das für den Alltag und eine bewusste Selbstversorgung genutzt wird.`

  const safeText = descriptionSeed.length > 220 ? `${descriptionSeed.slice(0, 220).trim()}...` : descriptionSeed

  const productContext = /kaps|tablette|spray|gel|creme|öl|pulver|lösung|sirup|paste|supplement/i.test(`${name} ${infoText}`)
    ? 'Die Produktform ist für eine regelmäßige Anwendung im Alltag praktisch und unkompliziert.'
    : 'Das Produkt ist für eine einfache und regelmäßige Anwendung im Alltag gedacht.'

  const audience = /prostata|potenz|erektion|libido|male|testosteron|sexual/i.test(`${name} ${infoText}`)
    ? 'Geeignet für Menschen, die im Alltag mehr Komfort, Selbstvertrauen und eine verständliche Routine suchen.'
    : /sicht|gehör|auge|vision|eye|optic|audi/i.test(`${name} ${infoText}`)
      ? 'Geeignet für Menschen, die ihre Tagesroutine entspannt halten und eine bewusste Unterstützung im Alltag schätzen.'
      : /gelenk|arthro|knorpel|joint|bone|muskel|rücken/i.test(`${name} ${infoText}`)
        ? 'Geeignet für Menschen, die Bewegung, Komfort und Alltagssicherheit bewusster fördern möchten.'
        : 'Geeignet für Menschen, die eine einfache und verständliche Ergänzung in ihren Alltag integrieren möchten.'

  const avoidText = /schwanger|still|allerg|chronisch|medikament|arzt|facharzt|spezialist/i.test(`${name} ${infoText}`)
    ? 'Besonders wichtig sind individuelle Verträglichkeit, chronische Erkrankungen, Medikamenteneinnahmen und die Rücksprache mit einem Arzt oder Spezialisten.'
    : 'Bei individueller Unverträglichkeit oder Unsicherheit zur Anwendung ist eine Rücksprache mit einem Facharzt oder Apotheker sinnvoll.'

  const instructions = `Die Dosierung und die Anwendung sollten stets gemäß Packungsbeilage oder Gebrauchsanweisung erfolgen. In der Regel wird das Produkt zu einer festen Zeit im Alltag eingenommen, damit die Routine einfach beibehalten werden kann. Wichtig ist, die empfohlene Dosis nicht zu überschreiten, andere Mittel nur nach Rücksprache zu kombinieren und ausreichend Wasser zu trinken.`

  const sections = [
    {
      level: 'h2',
      heading: `Worauf es bei ${name} ankommt`,
      text: `${safeText} ${name} wurde so gestaltet, dass es unkompliziert in den Alltag passt. ${productContext} Gerade für Menschen, die Wert auf eine klare Routine und eine verständliche Anwendung legen, ist das ein wichtiger Vorteil.`
    },
    {
      level: 'h3',
      heading: `So wird ${name} in der Regel verwendet`,
      text: `${instructions} Wenn eine Dosis vergessen wurde, sollte nicht einfach die nächste Dosis verdoppelt werden. Regelmäßigkeit ist hier wichtiger als ein abruptes Umschalten des Rhythmus. So bleibt die Anwendung einfacher und angenehmer.`
    },
    {
      level: 'h3',
      heading: 'Für wen ist das Produkt geeignet',
      text: `${audience} Ein gut passendes Produkt sollte zur individuellen Lebensweise und zu den eigenen Zielen im Alltag passen. Gerade dann wirkt eine einfache Routine besonders angenehm und nachhaltig.`
    },
    {
      level: 'h3',
      heading: 'Wann sollte man vorsichtig sein',
      text: `${avoidText} Das gilt besonders bei Allergien, bereits vorhandenen Beschwerden, chronischen Erkrankungen oder bei der Kombination mit anderen Medikamenten. So lässt sich die Anwendung sicherer und verantwortungsvoller gestalten.`
    },
    {
      level: 'h4',
      heading: 'Worauf man bei der Auswahl achten sollte',
      text: `Bei der Auswahl von ${name} ist nicht nur der Preis relevant, sondern auch die Zusammensetzung, die Form des Produkts, die Gebrauchsanweisung und die persönliche Verträglichkeit. ${price ? `Preis: ${price}.` : ''} Viele Menschen wählen Produkte, die sich leicht in den Alltag integrieren lassen und zugleich verständlich angewendet werden können.`
    },
  ]

  const intro = `${name} ist ein Produkt, das für eine verständliche und komfortable Unterstützung im Alltag genutzt wird.`
  const keywords = [name, `${name} kaufen`, `${name} preis`, `${name} bewertungen`, 'Gesundheit', 'Alltagsupport', 'Anwendungshinweise', `${infoText ? infoText.slice(0, 80) : name}`].filter(Boolean).join(', ')

  const titleTemplate = product?.seo_title_template || product?.title_template || 'Kaufen {name} Deutschland'
  const descriptionTemplate = product?.seo_description_template || product?.description_template || '{name}. Kaufen jetzt. Preis ab {price}. Für eine einfache Routine im Alltag. Qualitativ geprüft. Garantie. Lieferung 3-7 Tage.'

  const templateTitle = applySeoTemplate(titleTemplate, product, price)
  const templateDescription = applySeoTemplate(descriptionTemplate, product, price)
  const title = fitSeoMetaText(templateTitle, 60)

  const fallbackDescription = `${name}. Kaufen jetzt. Preis ab ${price || '49 EUR'}. Für eine einfache Routine im Alltag. Qualitativ geprüft. Garantie. Lieferung 3-7 Tage.`
  const descriptionBase = templateDescription && templateDescription.length >= 120
    ? templateDescription
    : fallbackDescription

  let description = descriptionBase.trim()
  while (description.length < 145) {
    description += ' Für eine einfache Routine im Alltag. Qualitativ geprüft.'
  }
  if (description.length > 150) {
    description = `${description.slice(0, 147).trimEnd()}...`
  }

  return {
    title,
    description,
    keywords,
    intro,
    sections,
  }
}

export function resolveProductImage(value, fallback = '/img/placeholder.svg') {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback

  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw
  }

  if (raw.startsWith('/')) return raw
  if (raw.startsWith('./')) return `/${raw.replace(/^\.\//, '')}`
  if (raw.startsWith('img/')) return `/${raw}`
  if (/^[A-Za-z0-9_.-]+\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) {
    return `/img/${raw}`
  }

  return raw
}
