const FORM_RULES = [
  { slug: 'kapsula', labels: ['капсулы', 'capsule', 'капсула'] },
  { slug: 'kapli', labels: ['капли', 'drop', 'drops', 'drops', 'град?'] },
  { slug: 'krem', labels: ['крем', 'cream', 'крема'] },
  { slug: 'sprey', labels: ['спрей', 'spray', 'спреи'] },
  { slug: 'gel', labels: ['гель', 'gel', 'гели'] },
]

const FAMILY_RULES = [
  { slug: 'male-health', label: 'Мужское здоровье', keywords: ['простат', 'потенц', 'эрект', 'муж', 'андролог', 'тестостерон'] },
  { slug: 'vision-hearing', label: 'Зрение и слух', keywords: ['зрение', 'глаз', 'слух', 'уха', 'аудио', 'офтальм', 'астигм', 'опти'] },
  { slug: 'metabolism', label: 'Метаболизм и диабет', keywords: ['диабет', 'глюкоз', 'сахар', 'метаб', 'поддержка уровня глюкозы', 'вес'] },
  { slug: 'heart', label: 'Сердце и давление', keywords: ['гиперто', 'сердц', 'давлен', 'кардио', 'кровообращ', 'кровяно'] },
  { slug: 'digestive', label: 'ЖКТ и пищеварение', keywords: ['жкт', 'желуд', 'пищевар', 'киш', 'гастро', 'дigest', 'детокс', 'токсины', 'шлаки', 'кишеч', 'паразит', 'промыва'] },
  { slug: 'joints', label: 'Суставы и опорно-двигательная система', keywords: ['сустав', 'артро', 'хондро', 'остео', 'вальгус', 'кост', 'мышц', 'спин', 'болей в суставах'] },
  { slug: 'weight-loss', label: 'Похудение и детокс', keywords: ['похуд', 'детокс', 'снижение веса', 'стройн', 'лимф', 'жир', 'очищение', 'сжигание жира', 'массы тела'] },
  { slug: 'nerves', label: 'Нервная система', keywords: ['нейропат', 'нерв', 'псих', 'усталост', 'стресс', 'сон', 'тревож'] },
  { slug: 'urinary', label: 'Мочеполовая система', keywords: ['цистит', 'моче', 'почек', 'инфекц', 'уролог', 'дизур'] },
  { slug: 'skin', label: 'Красота и кожа', keywords: ['кожа', 'крем', 'красот', 'дерма', 'акне', 'шелуш', 'эпидермис'] },
  { slug: 'immune', label: 'Иммунитет и общее здоровье', keywords: ['иммун', 'общего', 'общее', 'поддержка организма', 'здоровье', 'антиокс', 'витамин', 'комплекс'] },
]

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function getProductText(product) {
  return [
    product?.name,
    product?.subcategory,
    product?.info,
    product?.category,
  ].join(' ')
}

export function inferFormCategory(product) {
  const text = normalizeText(getProductText(product))
  for (const rule of FORM_RULES) {
    if (rule.labels.some((label) => text.includes(label))) {
      return { slug: rule.slug, label: rule.slug === 'kapsula' ? 'Капсулы' : rule.slug === 'kapli' ? 'Капли' : rule.slug === 'krem' ? 'Крем' : rule.slug === 'sprey' ? 'Спрей' : 'Гель' }
    }
  }

  return { slug: 'kapsula', label: 'Капсулы' }
}

export function inferFamilyCategory(product) {
  const text = normalizeText(getProductText(product))
  const match = FAMILY_RULES.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
  return match || { slug: 'immune', label: 'Иммунитет и общее здоровье' }
}

export function inferSubcategoryLabel(product) {
  const text = normalizeText(getProductText(product))
  if (/простат/.test(text)) return 'Простатит и мужское здоровье'
  if (/потенц|эрект|тестостерон/.test(text)) return 'Потенция и либидо'
  if (/нейропат|нерв/.test(text)) return 'Нервная система'
  if (/зрение|глаз|офтальм|зрени/.test(text)) return 'Зрение и глаза'
  if (/слух|уха|ауди/.test(text)) return 'Слух и ушные проблемы'
  if (/сустав|артро|хондро|вальгус/.test(text)) return 'Здоровье суставов'
  if (/гиперто|сердц|давлен|кардио/.test(text)) return 'Сердце и давление'
  if (/диабет|глюкоз|сахар/.test(text)) return 'Диабет и обмен веществ'
  if (/жкт|желуд|пищевар|гастро|кишеч|паразит|детокс|токсины/.test(text)) return 'ЖКТ и очищение'
  if (/похуд|вес|стройн|жир|сжиган/.test(text)) return 'Похудение и контроль веса'
  if (/цистит|моче|почек/.test(text)) return 'Мочеполовая система'
  if (/геморро/.test(text)) return 'Геморрой'
  if (/боли в суставах|боль.*сустав/.test(text)) return 'Боль в суставах'
  if (product?.subcategory) return String(product.subcategory).trim()
  return 'Общее здоровье'
}

export function buildCatalogGroups(products) {
  return Object.values(
    (products || []).reduce((acc, product) => {
      const family = inferFamilyCategory(product)
      const key = family.slug
      if (!acc[key]) {
        acc[key] = {
          slug: key,
          name: family.label,
          count: 0,
          image: product.img || '',
          items: [],
        }
      }
      acc[key].count += 1
      acc[key].image = acc[key].image || product.img || ''
      acc[key].items.push(product)
      return acc
    }, {}),
  ).sort((a, b) => b.count - a.count)
}

export function buildSubcategoryGroups(products) {
  return Object.values(
    (products || []).reduce((acc, product) => {
      const label = inferSubcategoryLabel(product)
      const key = label
      if (!acc[key]) {
        acc[key] = {
          label,
          count: 0,
          image: product.img || '',
          family: inferFamilyCategory(product).slug,
          items: [],
        }
      }
      acc[key].count += 1
      acc[key].image = acc[key].image || product.img || ''
      acc[key].items.push(product)
      return acc
    }, {}),
  ).sort((a, b) => b.count - a.count)
}
