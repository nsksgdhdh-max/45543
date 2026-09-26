import { toEnglishSlug } from './product'

function readAiConfig() {
  const mode = String(process.env.OPAI_MODE || 'offline').toLowerCase()
  const baseUrl = String(process.env.OPAI_BASE_URL || 'https://api.z.ai/api/paas/v4').replace(/\/$/, '')
  const apiKey = String(process.env.OPAI_API_KEY || '').trim()
  const cloudModel = String(process.env.OPAI_CLOUD_MODEL || 'glm-4.5-flash').trim()
  const ollamaUrl = String(process.env.OPAI_OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '')
  const model = String(process.env.OPAI_MODEL || 'llama3.1').trim()
  const temperature = Number(process.env.OPAI_TEMPERATURE ?? 0.7)
  const allowRemote = String(process.env.OPAI_ALLOW_REMOTE_CLASSIFICATION || 'false').toLowerCase() === 'true'

  return {
    mode,
    baseUrl,
    apiKey,
    cloudModel,
    ollamaUrl,
    model,
    temperature: Number.isFinite(temperature) ? temperature : 0.7,
    allowRemote,
  }
}

function normalizeProductText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function classifyProductLocally({ name, description, info, fallbackFamily = 'immune', fallbackSubcategory = 'Allgemeine Gesundheit' }) {
  const input = normalizeProductText(`${name || ''} ${description || info || ''}`)
  const familyRules = [
    { key: 'male-health', labels: ['männliche gesundheit', 'male health', 'libido', 'potenz', 'erection', 'prostata', 'prostate', 'sex', 'sexual', 'andropause', 'penis', 'testosterone'] },
    { key: 'vision-hearing', labels: ['sehen', 'augen', 'vision', 'hearing', 'ohren', 'ears', 'hoeren', 'eye', 'eyes'] },
    { key: 'metabolism', labels: ['diabetes', 'stoffwechsel', 'metabolism', 'sugar', 'glucose', 'insulin'] },
    { key: 'heart', labels: ['herz', 'blutdruck', 'blood pressure', 'pressure', 'cardio', 'cholesterol'] },
    { key: 'digestive', labels: ['verdauung', 'magen', 'darm', 'digest', 'gastric', 'stomach', 'bowel'] },
    { key: 'joints', labels: ['gelenk', 'joint', 'arthritis', 'arthrose', 'knie', 'ruecken', 'mobility'] },
    { key: 'weight-loss', labels: ['gewichtsverlust', 'weight loss', 'slimming', 'detox', 'abnehmen', 'fat burner', 'fatburner'] },
    { key: 'nerves', labels: ['nerven', 'nerve', 'stress', 'sleep', 'schlaf', 'anxiety', 'depression'] },
    { key: 'urinary', labels: ['urin', 'urinary', 'prostata', 'blase', 'uro', 'harn'] },
    { key: 'venous-health', labels: ['krampfadern', 'varikose', 'varicose', 'venous', 'venen', 'veins'] },
    { key: 'skin', labels: ['haut', 'skin', 'anti aging', 'anti-aging', 'antiage', 'beauty', 'creme', 'serum', 'cream', 'lotion', 'kosmetik', 'wrinkle', 'aging', 'firming'] },
    { key: 'immune', labels: ['immun', 'immune', 'gesundheit', 'general health', 'support', 'allgemein', 'vitamin', 'fortify'] },
  ]

  for (const rule of familyRules) {
    if (rule.labels.some((label) => input.includes(label))) {
      return {
        familySlug: rule.key,
        familyLabel: resolveKnownFamilyLabel(rule.key),
        subcategoryLabel: resolveCanonicalSubcategoryLabel(rule.key, input, fallbackSubcategory),
        shouldCreateNewCategory: false,
        reason: 'Local keyword classification',
      }
    }
  }

  return {
    familySlug: fallbackFamily,
    familyLabel: resolveKnownFamilyLabel(fallbackFamily),
    subcategoryLabel: resolveCanonicalSubcategoryLabel(fallbackFamily, input, fallbackSubcategory),
    shouldCreateNewCategory: false,
    reason: 'Local keyword fallback',
  }
}

function sanitizeJsonText(rawText = '') {
  const text = String(rawText || '').trim()
  if (!text) return null

  const extracted = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  const start = extracted.indexOf('{')
  const end = extracted.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return extracted.slice(start, end + 1)
  }

  return extracted
}

function parseJsonResponse(rawText) {
  const text = sanitizeJsonText(rawText)
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch (error) {
    try {
      const cleaned = text.replace(/([{,]\s*)([A-Za-z0-9_]+)(\s*:)/g, '$1"$2"$3')
      return JSON.parse(cleaned)
    } catch (_innerError) {
      return null
    }
  }
}

function normalizeAiFailureReason(value) {
  const raw = String(value || '').trim()
  if (!raw) return 'AI classification unavailable'

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      const errorMessage = parsed?.error?.message || parsed?.message || parsed?.detail || parsed?.error || ''
      if (errorMessage) return String(errorMessage).trim()
    }
  } catch (_error) {
    // ignore non-JSON bodies and fall through to text parsing below
  }

  const messageMatch = raw.match(/"message"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/)
  if (messageMatch && messageMatch[1]) {
    return messageMatch[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  }

  const fallback = raw.replace(/\s*\{.*\}\s*$/s, '').trim()
  return fallback || 'AI classification unavailable'
}

function normalizeCategorySlug(value, fallback = 'immune') {
  const raw = String(value || '').trim()
  if (!raw) return fallback

  const fromKnown = {
    'male-health': 'male-health',
    'мужское здоровье': 'male-health',
    'male health': 'male-health',
    'vision-hearing': 'vision-hearing',
    'зрение и слух': 'vision-hearing',
    'vision and hearing': 'vision-hearing',
    metabolism: 'metabolism',
    'метаболизм и диабет': 'metabolism',
    'metabolism and diabetes': 'metabolism',
    heart: 'heart',
    'сердце и давление': 'heart',
    'heart and pressure': 'heart',
    digestive: 'digestive',
    'жкт и пищеварение': 'digestive',
    'gastro and digestion': 'digestive',
    joints: 'joints',
    'суставы': 'joints',
    'sustavy': 'joints',
    'weight-loss': 'weight-loss',
    'похудение': 'weight-loss',
    'похудение и детокс': 'weight-loss',
    'slimming': 'weight-loss',
    nerves: 'nerves',
    'нервная система': 'nerves',
    urinary: 'urinary',
    'мочеполовая система': 'urinary',
    'venous-health': 'venous-health',
    'венозное здоровье': 'venous-health',
    'venous health': 'venous-health',
    'varicose veins': 'venous-health',
    'варикоз': 'venous-health',
    'средства от варикоза': 'venous-health',
    skin: 'skin',
    'красота и кожа': 'skin',
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
    'поддержка иммунитета': 'immune',
    'иммунная поддержка': 'immune',
    'immune support': 'immune',
    'general health': 'immune',
    'противопаразитарный': 'immune',
    'антипаразитарный': 'immune',
    'anti-parasitic': 'immune',
    'antiparasitic': 'immune',
  }

  const key = raw.toLowerCase().replace(/[_\-\s]+/g, ' ').trim()
  if (fromKnown[key]) return fromKnown[key]

  const slug = toEnglishSlug(raw).toLowerCase()
  if (Object.keys(fromKnown).includes(slug)) return fromKnown[slug]

  const invalidValues = new Set([
    'kapsula', 'kapli', 'krem', 'sprey', 'gel', 'capsule', 'drops', 'cream', 'spray', 'other',
    'antivozrastnoj-uhod', 'sustavy', 'joints-support', 'health', 'general', 'product'
  ])

  if (invalidValues.has(slug) || invalidValues.has(key)) return fallback

  return slug || fallback
}

function resolveCanonicalSubcategoryLabel(familySlug, text, fallbackSubcategory = '') {
  const normalized = normalizeProductText(text)

  switch (String(familySlug || '').trim()) {
    case 'male-health':
      return /(prostat|prostate|male health|андролог|мужск)/i.test(normalized)
        ? 'Prostatitis und Männergesundheit'
        : 'Potenz und Libido'
    case 'vision-hearing':
      return 'Hören und Gleichgewicht'
    case 'metabolism':
      return /(diabet|glucose|glukose|sugar|insulin|metab)/i.test(normalized)
        ? 'Stoffwechsel und Diabetes'
        : 'Gewichtsmanagement'
    case 'heart':
      return /(blood pressure|pressure|hypert|heart|cardio|circulation|давлен|сердц)/i.test(normalized)
        ? 'Herz und Blutdruck'
        : 'Kreislauf und Energie'
    case 'digestive':
      return /(digest|gut|stomach|gastro|желуд|киш|пищевар)/i.test(normalized)
        ? 'Verdauung und Magen-Darm'
        : 'Darmsanierung'
    case 'joints':
      return /(joint|arthritis|bone|back|spine|muscle|сустав|мышц|спин|артро|хондро)/i.test(normalized)
        ? 'Gelenke und Bewegungsapparat'
        : 'Muskel und Rücken'
    case 'weight-loss':
      return /(weight loss|slim|slimming|fat|burn|похуд|жир|стройн)/i.test(normalized)
        ? 'Gewichtsverlust und Detox'
        : 'Appetit und Stoffwechsel'
    case 'nerves':
      return /(stress|sleep|anxiety|insomnia|nerve|сон|стресс|тревож|нерв)/i.test(normalized)
        ? 'Stress und Schlaf'
        : 'Nervensystem'
    case 'urinary':
      return /(prostate|urinary|kidney|bladder|cystitis|моче|почек|уролог|цистит)/i.test(normalized)
        ? 'Prostata und Harnwege'
        : 'Urogenitalsystem'
    case 'venous-health':
      return /(varicose|vein|venous|krampfadern|вены|веноз)/i.test(normalized)
        ? 'Venöse Gesundheit'
        : 'Pflege für die Füße'
    case 'skin':
      return /(anti[- ]?age|beauty|skin|cosmetic|skincare|кожа|дерма|крем|wrinkle)/i.test(normalized)
        ? 'Anti-Aging-Pflege'
        : 'Schönheit und Haut'
    case 'immune':
      return /(detox|parasite|immune|vitamin|general health|общего|здоровье|антиокс|паразит)/i.test(normalized)
        ? 'Immunität und allgemeine Gesundheit'
        : 'Detox und allgemeine Vitalität'
    default:
      return fallbackSubcategory || 'Allgemeine Gesundheit'
  }
}

function resolveKnownFamilyLabel(fallbackFamily) {
  const lookup = {
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
  }

  return lookup[String(fallbackFamily || '').trim().toLowerCase()] || String(fallbackFamily || 'Immunität und allgemeine Gesundheit').trim() || 'Immunität und allgemeine Gesundheit'
}

export async function classifyProductWithAi({
  name,
  description,
  info,
  categoryHints = [],
  fallbackFamily = 'immune',
  fallbackSubcategory = 'Allgemeine Gesundheit',
}) {
  const config = readAiConfig()
  const text = `${name || ''}\n${description || info || ''}`.trim()
  const hints = (categoryHints || []).filter(Boolean).slice(0, 8)

  if (!text) {
    return {
      familySlug: fallbackFamily,
      familyLabel: resolveKnownFamilyLabel(fallbackFamily),
      subcategoryLabel: fallbackSubcategory,
      shouldCreateNewCategory: false,
      reason: 'No product text',
    }
  }

  if (config.mode === 'cloud' && (!config.apiKey || !config.allowRemote)) {
    return {
      ...classifyProductLocally({ name, description, info, fallbackFamily, fallbackSubcategory }),
      reason: !config.apiKey ? 'No AI API key configured' : 'Remote AI classification disabled in local mode',
    }
  }

  const localResult = classifyProductLocally({ name, description, info, fallbackFamily, fallbackSubcategory })
  if (config.mode !== 'cloud' || !config.allowRemote) {
    return localResult
  }

  const systemPrompt = 'You are a product classification engine for a German-language health e-commerce store. Return valid JSON only, no markdown code fence. Your job is to determine the best category and subcategory. If the product does not fit the existing categories, you may create a new category and subcategory. Keep the output German-friendly and concise.'

  const payload = {
    model: config.mode === 'cloud' ? config.cloudModel : config.model,
    temperature: config.temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: JSON.stringify({
          product_name: name || '',
          description: description || info || '',
          category_hints: hints,
          existing_families: ['Männliche Gesundheit', 'Sehen und Hören', 'Stoffwechsel und Diabetes', 'Herz und Blutdruck', 'Verdauung und Magen-Darm', 'Gelenke und Bewegungsapparat', 'Gewichtsverlust und Detox', 'Nervensystem', 'Urogenitalsystem', 'Venöse Gesundheit', 'Schönheit und Haut', 'Immunität und allgemeine Gesundheit'],
          fallback_family: fallbackFamily,
          fallback_subcategory: fallbackSubcategory,
          response_format: {
            family_label: 'string',
            family_slug: 'string',
            subcategory_label: 'string',
            create_new_category: 'boolean',
            new_category_label: 'string or null',
            new_category_slug: 'string or null',
            reason: 'string',
          },
        }),
      },
    ],
  }

  try {
    const endpoint = config.mode === 'cloud'
      ? `${config.baseUrl}/chat/completions`
      : `${config.ollamaUrl}/api/chat`


    const headers = config.mode === 'cloud'
      ? {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        }
      : { 'Content-Type': 'application/json' }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const rawError = await response.text()
      throw new Error(normalizeAiFailureReason(rawError) || 'AI category analysis failed')
    }

    const json = await response.json()
    const rawContent = config.mode === 'cloud'
      ? json?.choices?.[0]?.message?.content
      : json?.message?.content

    const parsed = parseJsonResponse(rawContent) || {}

    const familyLabel = String(parsed.family_label || parsed.familyLabel || resolveKnownFamilyLabel(fallbackFamily) || 'Immunität und allgemeine Gesundheit').trim()
    const familySlug = normalizeCategorySlug(parsed.family_slug || parsed.familySlug || familyLabel, fallbackFamily)
    const subcategoryLabel = resolveCanonicalSubcategoryLabel(
      shouldCreateNewCategory && newCategorySlug ? newCategorySlug : familySlug,
      parsed.subcategory_label || parsed.subcategoryLabel || fallbackSubcategory || 'Allgemeine Gesundheit',
      fallbackSubcategory || 'Allgemeine Gesundheit',
    )
    const shouldCreateNewCategory = Boolean(parsed.create_new_category || parsed.createNewCategory)
    const newCategoryLabel = String(parsed.new_category_label || parsed.newCategoryLabel || '').trim()
    const newCategorySlug = normalizeCategorySlug(parsed.new_category_slug || parsed.newCategorySlug || newCategoryLabel || familyLabel, familySlug)

    return {
      familySlug: shouldCreateNewCategory && newCategorySlug ? newCategorySlug : familySlug,
      familyLabel: shouldCreateNewCategory && newCategoryLabel ? newCategoryLabel : familyLabel,
      subcategoryLabel: subcategoryLabel || 'Allgemeine Gesundheit',
      shouldCreateNewCategory,
      newCategorySlug: shouldCreateNewCategory ? newCategorySlug : null,
      newCategoryLabel: shouldCreateNewCategory ? newCategoryLabel || familyLabel : null,
      reason: String(parsed.reason || 'Classified by AI').trim(),
    }
  } catch (error) {
    return {
      familySlug: fallbackFamily,
      familyLabel: resolveKnownFamilyLabel(fallbackFamily),
      subcategoryLabel: resolveCanonicalSubcategoryLabel(fallbackFamily, name || description || info || '', fallbackSubcategory || 'Allgemeine Gesundheit'),
      shouldCreateNewCategory: false,
      reason: String(error?.message || 'AI fallback used'),
    }
  }
}
