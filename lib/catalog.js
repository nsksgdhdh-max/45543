import { toEnglishSlug } from './product'

const FORM_RULES = [
  { slug: 'kapsula', labels: ['капсулы', 'capsule', 'капсула'] },
  { slug: 'kapli', labels: ['капли', 'drop', 'drops', 'drops', 'град?'] },
  { slug: 'krem', labels: ['крем', 'cream', 'крема'] },
  { slug: 'sprey', labels: ['спрей', 'spray', 'спреи'] },
  { slug: 'gel', labels: ['гель', 'gel', 'гели'] },
]

const FAMILY_RULES = [
  { slug: 'male-health', label: 'Männliche Gesundheit', keywords: ['простат', 'потенц', 'эрект', 'муж', 'андролог', 'тестостерон', 'libido'] },
  { slug: 'vision-hearing', label: 'Sehen und Hören', keywords: ['зрение', 'глаз', 'слух', 'уха', 'аудио', 'офтальм', 'астигм', 'опти', 'vision', 'eye', 'retina', 'optic'] },
  { slug: 'metabolism', label: 'Stoffwechsel und Diabetes', keywords: ['диабет', 'глюкоз', 'сахар', 'метаб', 'поддержка уровня глюкозы', 'инсулин'] },
  { slug: 'heart', label: 'Herz und Blutdruck', keywords: ['гиперто', 'сердц', 'давлен', 'кардио', 'кровообращ', 'кровяно', 'blood pressure'] },
  { slug: 'digestive', label: 'Verdauung und Magen-Darm', keywords: ['жкт', 'желуд', 'пищевар', 'киш', 'гастро', 'digest', 'токсины', 'шлаки', 'кишеч', 'промыва', 'поджелуд'] },
  { slug: 'joints', label: 'Gelenke und Bewegungsapparat', keywords: ['сустав', 'артро', 'хондро', 'остео', 'вальгус', 'кост', 'мышц', 'спин', 'болей в суставах'] },
  { slug: 'weight-loss', label: 'Gewichtsverlust und Detox', keywords: ['похуд', 'снижение веса', 'стройн', 'жир', 'сжигание жира', 'контроль веса', 'массы тела', 'slimming', 'fat burn', 'weight loss'] },
  { slug: 'nerves', label: 'Nervensystem', keywords: ['нейропат', 'нерв', 'псих', 'усталост', 'стресс', 'сон', 'тревож', 'anxiety', 'insomnia'] },
  { slug: 'urinary', label: 'Urogenitalsystem', keywords: ['цистит', 'моче', 'почек', 'инфекц', 'уролог', 'дизур', 'prostate'] },
  { slug: 'venous-health', label: 'Venöse Gesundheit', keywords: ['варикоз', 'веноз', 'вены', 'вен', 'тромб', 'венозное', 'varicose', 'venous', 'vein', 'venous health', 'krampfadern'] },
  { slug: 'skin', label: 'Schönheit und Haut', keywords: ['кожа', 'крем', 'красот', 'дерма', 'акне', 'шелуш', 'эпидермис', 'anti-age', 'rejuvenation', 'beauty', 'skincare', 'cosmetic'] },
  { slug: 'immune', label: 'Immunität und allgemeine Gesundheit', keywords: ['иммун', 'общего', 'общее', 'поддержка организма', 'здоровье', 'антиокс', 'витамин', 'комплекс', 'паразит', 'parasite', 'антипаразитар', 'глист', 'helminth', 'worms'] },
]

const FAMILY_ORDER = FAMILY_RULES.map((rule) => rule.slug)

const SUBCATEGORY_ALIASES = {
  'увеличение': 'Potenz und Libido',
  'увеличение и эрекция': 'Potenz und Libido',
  'увеличение члена': 'Potenz und Libido',
  'увеличение полового члена': 'Potenz und Libido',
  'эрекция': 'Potenz und Libido',
  'эрекция и увеличение': 'Potenz und Libido',
  'потенция и либидо': 'Potenz und Libido',
  'потенция и мужское здоровье': 'Potenz und Libido',
  'potenciya i libido': 'Potenz und Libido',
  'potentsiya i libido': 'Potenz und Libido',
  'libido and potency': 'Potenz und Libido',
  'male health': 'Prostatitis und Männergesundheit',
  'male health and potency': 'Potenz und Libido',
  'prostatitis': 'Prostatitis und Männergesundheit',
  'простатит и мужское здоровье': 'Prostatitis und Männergesundheit',
  'мужское здоровье': 'Prostatitis und Männergesundheit',
  'простата': 'Prostatitis und Männergesundheit',
  'prostate': 'Prostatitis und Männergesundheit',
  'anivозрастной уход': 'Anti-Aging-Pflege',
  'антивозрастной уход': 'Anti-Aging-Pflege',
  'кожа и красота': 'Anti-Aging-Pflege',
  'beauty and skin': 'Anti-Aging-Pflege',
  'автивозрастной уход': 'Anti-Aging-Pflege',
  'уход за ногами': 'Pflege für die Füße',
  'venous health': 'Pflege für die Füße',
  'венозное здоровье': 'Pflege für die Füße',
}

function normalizeSubcategoryCandidate(value = '') {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const normalizedKey = raw
    .toLowerCase()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return SUBCATEGORY_ALIASES[normalizedKey] || raw
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function productFamilyFromCategoryString(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  const known = {
    'male-health': 'male-health',
    'мужское здоровье': 'male-health',
    'männliche gesundheit': 'male-health',
    'male health': 'male-health',
    'prostatitis': 'male-health',
    'простатит': 'male-health',
    'простатита': 'male-health',
    'vision-hearing': 'vision-hearing',
    'зрение и слух': 'vision-hearing',
    'sehen und hören': 'vision-hearing',
    'vision and hearing': 'vision-hearing',
    metabolism: 'metabolism',
    'метаболизм и диабет': 'metabolism',
    'stoffwechsel und diabetes': 'metabolism',
    'metabolism and diabetes': 'metabolism',
    heart: 'heart',
    'сердце и давление': 'heart',
    'herz und blutdruck': 'heart',
    'heart and pressure': 'heart',
    digestive: 'digestive',
    'жкт и пищеварение': 'digestive',
    'verdauung und magen-darm': 'digestive',
    'gastro and digestion': 'digestive',
    joints: 'joints',
    'суставы': 'joints',
    'gelenke und bewegungsapparat': 'joints',
    'sustavy': 'joints',
    'weight-loss': 'weight-loss',
    'похудение': 'weight-loss',
    'gewichtsverlust und detox': 'weight-loss',
    'slimming': 'weight-loss',
    nerves: 'nerves',
    'нервная система': 'nerves',
    'nervensystem': 'nerves',
    urinary: 'urinary',
    'мочеполовая система': 'urinary',
    'urogenitalsystem': 'urinary',
    'venous-health': 'venous-health',
    'венозное здоровье': 'venous-health',
    'venöse gesundheit': 'venous-health',
    'venous health': 'venous-health',
    'varicose veins': 'venous-health',
    'варикоз': 'venous-health',
    'средства от варикоза': 'venous-health',
    skin: 'skin',
    'красота и кожа': 'skin',
    'schönheit und haut': 'skin',
    'кожа': 'skin',
    'антивозрастной уход': 'skin',
    'антивозрастной': 'skin',
    'anti-age care': 'skin',
    'anti age care': 'skin',
    'anti-age': 'skin',
    'antivozrastnoj-uhod': 'skin',
    'beauty and skin': 'skin',
    immune: 'immune',
    'иммунитет и общее здоровье': 'immune',
    'immunität und allgemeine gesundheit': 'immune',
    'general health': 'immune',
  }

  const key = raw.toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (known[key]) return known[key]

  const directSlug = toEnglishSlug(raw)
  if (directSlug && known[directSlug]) return known[directSlug]

  const aliases = ['male-health', 'vision-hearing', 'metabolism', 'heart', 'digestive', 'joints', 'weight-loss', 'nerves', 'urinary', 'skin', 'immune']
  if (aliases.includes(directSlug)) return directSlug

  return ''
}

function getProductText(product) {
  return [
    product?.name,
    product?.subcategory,
    product?.info,
    product?.category,
    product?.ai_classification?.family_label,
    product?.ai_classification?.subcategory_label,
  ].join(' ')
}

function getExplicitFamilyOverride(product) {
  const text = normalizeText(getProductText(product))

  const cosmeticSignals = /(косметическ|cosmetic|skincare|beauty|skin care|anti[- ]?age|rejuvenation|омолаживающ|морщин|collagen|hyaluronic|peptides|крем.*кож|кожа.*крем|уход.*кож|кож.*уход|cream.*skin|skin.*cream|serum|lotion|body care|anti[- ]?age cream|skin ageing)/i
  if (cosmeticSignals.test(text)) {
    return 'skin'
  }

  if (/(паразит|parasite|антипаразитар|глист|helminth|worms|antiparasit)/i.test(text)) {
    return 'immune'
  }

  if (/простат|потенц|эрект|тестостерон|libido|androlog|male health/i.test(text)) {
    return 'male-health'
  }

  if (/зрение|глаз|слух|офтальм|retina|vision|eye|optic|audi|opti/i.test(text)) {
    return 'vision-hearing'
  }

  if (/(варикоз|varicose|venous|vein|veins|веноз|вены|антиварикоз|anti[- ]?varicose|krampfadern)/i.test(text)) {
    return 'venous-health'
  }

  if (/(похуд|снижение веса|стройн|жир|slimming|fat burn|weight loss|burn fat)/i.test(text)) {
    return 'weight-loss'
  }

  if (/(детокс|detox|очищение|cleanse|toxins|токсины)/i.test(text)) {
    return 'immune'
  }

  if (/нейропат|нерв|стресс|сон|тревож|anxiety|insomnia|mental health|brain/i.test(text)) {
    return 'nerves'
  }

  return null
}

export function inferFormCategory(product) {
  const text = normalizeText(getProductText(product))
  for (const rule of FORM_RULES) {
    if (rule.labels.some((label) => text.includes(label))) {
      return { slug: rule.slug, label: rule.slug === 'kapsula' ? 'Капсулы' : rule.slug === 'kapli' ? 'Капли' : rule.slug === 'krem' ? 'Крем' : rule.slug === 'sprey' ? 'Спрей' : 'Гель' }
    }
  }

  return { slug: 'kapsula', label: 'Kapseln' }
}

export function inferFamilyCategory(product) {
  const override = getExplicitFamilyOverride(product)
  if (override) {
    const match = FAMILY_RULES.find((rule) => rule.slug === override)
    return match || { slug: override, label: override === 'skin' ? 'Schönheit und Haut' : override === 'vision-hearing' ? 'Sehen und Hören' : override === 'male-health' ? 'Männliche Gesundheit' : override === 'weight-loss' ? 'Gewichtsverlust und Detox' : override === 'venous-health' ? 'Venöse Gesundheit' : override === 'nerves' ? 'Nervensystem' : 'Immunität und allgemeine Gesundheit' }
  }

  const directCategory = product?.category || product?.ai_classification?.family_label || ''
  const explicitFamily = productFamilyFromCategoryString(directCategory)
  if (explicitFamily) {
    const explicitMatch = FAMILY_RULES.find((rule) => rule.slug === explicitFamily)
    if (explicitMatch) return explicitMatch

    const fallbackLabel = {
      'male-health': 'Männliche Gesundheit',
      'vision-hearing': 'Sehen und Hören',
      metabolism: 'Stoffwechsel und Diabetes',
      heart: 'Herz und Blutdruck',
      digestive: 'Verdauung und Magen-Darm',
      joints: 'Gelenke und Bewegungsapparat',
      'weight-loss': 'Gewichtsverlust und Detox',
      nerves: 'Nervensystem',
      urinary: 'Urogenitalsystem',
      'venous-health': 'Venöse Gesundheit',
      skin: 'Schönheit und Haut',
      immune: 'Immunität und allgemeine Gesundheit',
    }[explicitFamily] || String(directCategory || 'Immunität und allgemeine Gesundheit').trim()

    return {
      slug: explicitFamily,
      label: fallbackLabel || 'Immunität und allgemeine Gesundheit',
    }
  }

  const text = normalizeText(getProductText(product))
  const match = FAMILY_RULES.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
  return match || { slug: 'immune', label: 'Immunität und allgemeine Gesundheit' }
}

export function inferSubcategoryLabel(product) {
  const text = normalizeText(getProductText(product))

  if (/(варикоз|varicose|веноз|вены|venous|vein|veins|антиварикоз|anti[- ]?varicose|krampfadern|уход.*ног|ноги)/i.test(text)) return 'Pflege für die Füße'
  if (/омолаживающ|rejuvenation|anti[- ]?age|antiage|морщин|collagen|hyaluronic|peptides|крем.*кож|кожа.*крем|anti[- ]?age cream|skin ageing/i.test(text)) return 'Anti-Aging-Pflege'
  if (/зрение|глаз|слух|офтальм|vision|eye|retina|audi|optic|опти/i.test(text)) return 'Sehen und Augen'
  if (/простат|потенц|эрект|тестостерон|libido|male health|men health|androlog|увеличение.*члена|увеличение.*полового/i.test(text)) return 'Potenz und Libido'
  if (/(паразит|parasite|антипаразитар|глист|helminth|worms|antiparasit)/i.test(text)) return 'Immununterstützung'

  const rawSubcategory = product?.subcategory || product?.ai_classification?.subcategory_label || ''
  if (rawSubcategory && String(rawSubcategory).trim()) {
    const candidate = normalizeSubcategoryCandidate(String(rawSubcategory).trim())
    if (/(варикоз|varicose|venous|vein|вены|антиварикоз|krampfadern|уход.*ног)/i.test(candidate)) return 'Pflege für die Füße'
    if (/простат|male health|prostate|potency|libido|эрект|тестостерон|увеличение.*эрекция|увеличение.*члена/i.test(candidate)) return 'Potenz und Libido'
    if (/антивозраст|rejuvenation|крем.*кож|anti[- ]?age|ageing|antiage|кожа.*крем|уход.*кож/i.test(candidate)) return 'Anti-Aging-Pflege'
    if (/(паразит|parasite|антипаразитар|глист)/i.test(candidate)) return 'Immununterstützung'
    if (/кожа|дерма|крем|beauty/i.test(candidate)) return 'Anti-Aging-Pflege'
    if (/потенц|эрект|тестостерон|libido|увеличение и эрекция|potency/i.test(candidate)) return 'Potenz und Libido'
    if (/простатит.*мужское.*здоровье|simple.*male.*health|male.*health/i.test(candidate)) return 'Prostatitis und Männergesundheit'
    return candidate
  }

  if (/потенц|эрект|тестостерон|libido|увеличение.*члена|увеличение.*полового/i.test(text)) return 'Potenz und Libido'
  if (/нейропат|нерв/.test(text)) return 'Nervensystem'
  if (/слух|уха|ауди/.test(text)) return 'Sehen und Hören'
  if (/сустав|артро|хондро|вальгус/.test(text)) return 'Gesundheit der Gelenke'
  if (/гиперто|сердц|давлен|кардио/.test(text)) return 'Herz und Blutdruck'
  if (/диабет|глюкоз|сахар/.test(text)) return 'Diabetes und Stoffwechsel'
  if (/жкт|желуд|пищевар|гастро|кишеч|токсины|шлаки/.test(text)) return 'Verdauung und Reinigung'
  if (/похуд|вес|стройн|жир|сжиган/.test(text)) return 'Gewichtsverlust und Gewichtsmanagement'
  if (/цистит|моче|почек/.test(text)) return 'Urogenitalsystem'
  if (/геморро/.test(text)) return 'Hämorrhoiden'
  if (/боли в суставах|боль.*сустав/.test(text)) return 'Gelenkschmerzen'
  if (/антивозраст|rejuvenation| anti[- ]?age |aging|крем.*кож/i.test(text)) return 'Anti-Aging-Pflege'
  if (product?.subcategory) return normalizeSubcategoryCandidate(String(product.subcategory).trim()) || 'Allgemeine Gesundheit'
  return 'Allgemeine Gesundheit'
}

export function buildSubcategoryRouteSlug(value = '') {
  return toEnglishSlug(String(value ?? '').trim())
}

export function matchesSubcategoryRoute(product, routeValue = '') {
  const route = String(routeValue ?? '').trim()
  if (!route) return false

  const label = inferSubcategoryLabel(product)
  return (
    label === route ||
    buildSubcategoryRouteSlug(label) === route ||
    buildSubcategoryRouteSlug(product?.subcategory || product?.ai_classification?.subcategory_label || '') === route
  )
}

export function filterProductsByQuery(products = [], query = '') {
  const normalizedQuery = String(query ?? '').trim().toLowerCase()
  if (!normalizedQuery) return Array.isArray(products) ? products : []

  const searchable = Array.isArray(products) ? products : []
  return searchable.filter((product) => {
    const haystack = [
      product?.name,
      product?.category,
      product?.subcategory,
      product?.family,
      product?.info,
      product?.description,
      product?.short_description,
      product?.ai_classification?.family_label,
      product?.ai_classification?.subcategory_label,
      product?.manufacturer,
      product?.quantity,
      product?.form,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function normalizeProductRecord(product = {}) {
  const cleaned = { ...(product || {}) }
  const family = inferFamilyCategory(cleaned)
  const familySlug = family?.slug || 'immune'
  cleaned.category = familySlug
  cleaned.subcategory = inferSubcategoryLabel(cleaned)

  if (cleaned.ai_classification && typeof cleaned.ai_classification === 'object') {
    cleaned.ai_classification = {
      ...cleaned.ai_classification,
      family_label: family?.label || cleaned.ai_classification.family_label || familySlug,
      subcategory_label: cleaned.subcategory,
      reason: cleaned.ai_classification.reason || 'normalized',
      created_new_category: Boolean(cleaned.ai_classification.created_new_category) && cleaned.ai_classification.created_new_category_name ? true : false,
      created_new_category_name: cleaned.ai_classification.created_new_category_name || null,
    }
  }

  return cleaned
}

export function buildCatalogGroups(products) {
  const groups = Object.values(
    (products || []).reduce((acc, product) => {
      const normalized = normalizeProductRecord(product)
      const family = inferFamilyCategory(normalized)
      const key = family.slug
      if (!acc[key]) {
        acc[key] = {
          slug: key,
          name: family.label,
          count: 0,
          image: normalized.img || '',
          items: [],
        }
      }
      acc[key].count += 1
      acc[key].image = acc[key].image || normalized.img || ''
      acc[key].items.push(normalized)
      return acc
    }, {}),
  )

  return groups.sort((a, b) => {
    const orderDiff = (FAMILY_ORDER.indexOf(a.slug) === -1 ? Infinity : FAMILY_ORDER.indexOf(a.slug)) - (FAMILY_ORDER.indexOf(b.slug) === -1 ? Infinity : FAMILY_ORDER.indexOf(b.slug))
    if (orderDiff !== 0) return orderDiff
    return b.count - a.count
  })
}

export function buildSubcategoryGroups(products) {
  const groups = Object.values(
    (products || []).reduce((acc, product) => {
      const normalized = normalizeProductRecord(product)
      const label = inferSubcategoryLabel(normalized)
      const key = label
      const family = inferFamilyCategory(normalized).slug
      if (!acc[key]) {
        acc[key] = {
          label,
          count: 0,
          image: normalized.img || '',
          family,
          items: [],
        }
      }
      acc[key].count += 1
      acc[key].image = acc[key].image || normalized.img || ''
      acc[key].items.push(normalized)
      return acc
    }, {}),
  )

  return groups.sort((a, b) => {
    const familyDiff = (FAMILY_ORDER.indexOf(a.family) === -1 ? Infinity : FAMILY_ORDER.indexOf(a.family)) - (FAMILY_ORDER.indexOf(b.family) === -1 ? Infinity : FAMILY_ORDER.indexOf(b.family))
    if (familyDiff !== 0) return familyDiff
    return b.count - a.count
  })
}
