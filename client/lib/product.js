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

export function buildProductUrl(product, categorySlug = '') {
  const slug = toEnglishSlug(product?.name || '')

  if (categorySlug) {
    return slug ? `/categories/${toEnglishSlug(categorySlug)}/${slug}` : '/categories'
  }

  return slug ? `/product/${slug}` : '/product'
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

  return raw
}
