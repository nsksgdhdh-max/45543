import { buildCatalogGroups, inferFamilyCategory, inferSubcategoryLabel, normalizeProductRecord } from './catalog'

function hashString(value) {
  let hash = 0
  const text = String(value || '')
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return hash
}

function pickBySeed(seed, values) {
  if (!Array.isArray(values) || values.length === 0) return ''
  return values[hashString(seed) % values.length]
}

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function formatPrice(product) {
  const target = Array.isArray(product?.target) ? product.target : []
  const de = target.find((item) => String(item.code || '').toUpperCase() === 'DE') || target[0]
  if (!de) return ''
  const price = String(de.price || '').trim()
  const currency = String(de.currency || '').trim()
  return [price, currency].filter(Boolean).join(' ')
}

function categoryLabelFor(product) {
  const family = inferFamilyCategory(product)
  return family?.label || String(product?.category || '').trim() || 'Allgemeine Gesundheit'
}

function hasSourceProduct(newsItem, product) {
  const productIds = [product?.id, product?.product_id].map((value) => String(value || '').trim()).filter(Boolean)
  const newsIds = [
    newsItem?.sourceProductId,
    newsItem?.product_id,
    newsItem?.id,
  ].map((value) => String(value || '').trim()).filter(Boolean)

  return productIds.some((id) => newsIds.includes(id))
}

function buildBodyParagraphs(product, categoryLabel, subcategoryLabel, price) {
  const productName = String(product?.name || '').trim()
  const subcategory = String(subcategoryLabel || '').trim()
  const infoText = String(product?.info || '').replace(/\s+/g, ' ').trim()
  const infoLead = infoText
    ? infoText.split(/[.!?]/).map((part) => part.trim()).filter(Boolean)[0] || infoText.slice(0, 180)
    : ''
  const priceText = price ? `Der Preis liegt aktuell bei ${price}.` : 'Preis und Verfügbarkeit können je nach Anbieter variieren.'
  const categoryLead = subcategory ? `${subcategory} im Bereich ${categoryLabel}` : `${categoryLabel}`
  const intro = [
    `Wer sich für ${categoryLabel} interessiert, sucht meist nicht zuerst nach Werbeversprechen, sondern nach einer klaren Einordnung. Genau dort setzt dieser Artikel an: Er erklärt, wie ${productName} im Sortiment verstanden werden kann, warum das Produkt überhaupt Aufmerksamkeit bekommt und welche Rolle es in der jeweiligen Produktgruppe spielt.`,
    `${productName} ist kein Produkt, das man nur über den Namen lesen sollte. Wichtig sind die Einordnung, die Beschreibung, der Preisrahmen und die Frage, warum es für Leser überhaupt relevant sein könnte. Genau deshalb lohnt sich ein ruhiger, etwas ausführlicher Blick auf dieses Produkt und seinen Platz im Shop.`,
  ]

  const analysis = [
    `Ein genauer Blick auf die Bezeichnung hilft bereits weiter. ${productName} klingt nach einem Produkt, das einen bestimmten Bedarf im Alltag anspricht. Ob jemand nach Unterstützung, Orientierung oder einer passenden Ergänzung sucht: Der erste Schritt ist immer zu verstehen, was das Produkt im Kontext von ${categoryLabel} eigentlich leisten soll.`,
    `Gerade in ${categoryLead} wird ein Produkt oft mit ähnlichen Angeboten verglichen. Leser möchten wissen, ob es sich um eine eher allgemein ausgerichtete Lösung handelt oder ob ein klarer Schwerpunkt erkennbar ist. Die Kategorie, die Unterkategorie und der Produktname zusammen ergeben deshalb ein wichtiges Bild, das man nicht isoliert betrachten sollte.`,
    `Wenn man ${productName} redaktionell bewertet, spielt auch die Sprache eine Rolle. Ein Produkt, das sauber beschrieben ist, wirkt verständlicher und glaubwürdiger. Genau deshalb ist es sinnvoll, nicht nur die technischen Angaben oder das Bild anzuschauen, sondern auch die Art und Weise, wie das Produkt im Shop dargestellt wird.`,
  ]

  const productInfo = [
    infoLead
      ? `Die vorhandene Produktbeschreibung liefert einen ersten Anhaltspunkt: ${infoLead}. Diese Formulierung zeigt bereits, wie das Produkt selbst eingeordnet wird und welche Erwartungen ein Leser beim ersten Blick auf die Seite haben kann. Solche Informationen sind wichtig, weil sie eine Basis für Orientierung schaffen und nicht nur lose Schlagworte liefern.`
      : `${productName} wird im Shop so präsentiert, dass Leser schnell erfassen können, worum es geht. Auch wenn der Text kurz gehalten ist, reicht das oft schon aus, um das Produkt in den passenden Kontext zu setzen und die wichtigsten Fragen der Besucher zu beantworten.`,
    `${priceText} Für viele Leser gehört der Preis zu den ersten Punkten, die beim Vergleichen eine Rolle spielen. Doch der Preis alleine sagt wenig aus. Erst im Zusammenspiel mit Kategorie, Beschreibung, Produktbild und Position im Sortiment entsteht ein wirklich verständlicher Gesamteindruck.`,
    `Ein gutes Produkt braucht nicht zwingend einen komplizierten Text. Wichtiger ist, dass die Formulierung natürlich klingt und den Leser nicht mit künstlichen Phrasen überfordert. ${productName} sollte daher so erklärt werden, dass der Inhalt leicht verständlich bleibt und trotzdem genügend Tiefe bietet, um Vertrauen zu schaffen.`,
  ]

  const categorySection = [
    `In der Kategorie ${categoryLabel} erwarten Besucher meist eine klare Auswahl und keine chaotische Mischung aus ähnlichen Angeboten. Deshalb ist es wichtig, dass ${productName} nicht isoliert wirkt, sondern als Teil einer nachvollziehbaren Struktur. Nur so kann man erkennen, warum das Produkt an genau dieser Stelle im Katalog steht.`,
    `Wenn eine Unterkategorie wie ${subcategory || 'eine passende Unterkategorie'} vorhanden ist, wird die Orientierung noch leichter. Leser können dann schneller erkennen, ob das Produkt eher allgemein, eher spezialisiert oder eher für einen bestimmten Anwendungsbereich gedacht ist. Gerade diese Feinheit macht einen guten Shoptext aus.`,
    `Die redaktionelle Aufgabe besteht deshalb nicht darin, das Produkt künstlich größer erscheinen zu lassen. Viel wichtiger ist eine saubere Beschreibung, die erklärt, wofür das Produkt gedacht ist, wie es einzuordnen ist und warum es für bestimmte Besucher interessant sein kann.`,
  ]

  const comparisonSection = [
    `Im Vergleich zu anderen Produkten im Bereich ${categoryLabel} steht ${productName} vor allem dann gut da, wenn die Positionierung klar bleibt. Leser mögen Texte, die nicht überladen sind. Sie möchten schnell verstehen, worum es geht, und selbst entscheiden, ob das Produkt zu ihrem Bedarf passt.`,
    `Ein ausführlicher Artikel hilft genau dabei. Er beantwortet nicht nur die offensichtliche Frage „Was ist das?“, sondern auch „Warum ist es relevant?“, „Wie unterscheidet es sich von ähnlichen Angeboten?“ und „In welchem Umfeld wird es im Shop sichtbar?“.`,
    `So entsteht aus einem einzelnen Produkt eine Lesegeschichte, die den Suchenden an die Hand nimmt. Diese Art von Text wirkt natürlicher als kurze KI-Notizen, weil sie das Produkt nicht nur nennt, sondern erklärt, einordnet und in Beziehung zu den Erwartungen der Leser setzt.`,
  ]

  const useCaseSection = [
    `Viele Kunden lesen solche Beiträge nicht aus Neugier allein, sondern weil sie eine Entscheidung vorbereiten. Sie möchten vergleichen, sortieren und sich einen Überblick verschaffen. Deshalb sollte ein SEO-Artikel nicht nur schön klingen, sondern auch inhaltlich tragfähig sein.`,
    `Für ${productName} bedeutet das: Der Text soll eine klare Orientierung geben, ohne übertrieben zu klingen. Er soll die wichtigsten Informationen bündeln, ohne den Leser zu verlieren, und gleichzeitig genug Substanz haben, damit er wie ein echter redaktioneller Artikel wirkt.`,
    `Genau diese Mischung macht den Unterschied. Ein zu kurzer Text bleibt oberflächlich, ein zu komplizierter Text verliert die Aufmerksamkeit. Ein guter Mittelweg erklärt die Sache verständlich, ruhig und mit echtem Lesefluss.`,
  ]

  const closing = [
    `Am Ende lässt sich ${productName} am besten als ein Produkt verstehen, das im passenden Umfeld seine Wirkung entfaltet. Wer den Shop durchsucht, braucht keine Schlagworte, sondern einen Text, der Sinn ergibt und Vertrauen schafft.`,
    `Darum sollte ein Artikel über ${productName} nicht nur kurz informieren, sondern die gesamte Einordnung mitdenken: Kategorie, Unterkategorie, Beschreibung, Preis und die allgemeine Rolle im Shop. Genau so entsteht ein nützlicher Beitrag, den man wirklich lesen kann.`,
    `Kurz gesagt: ${productName} verdient eine ausführliche, gut strukturierte Darstellung, die mehr leistet als eine Kurznotiz. Sie hilft Lesern, das Produkt zu verstehen, und macht den Inhalt für SEO gleichzeitig wertvoller.`,
  ]

  return [
    pickBySeed(productName, intro),
    pickBySeed(`${productName}:analysis`, analysis),
    pickBySeed(`${productName}:info`, productInfo),
    pickBySeed(`${productName}:category`, categorySection),
    pickBySeed(`${productName}:compare`, comparisonSection),
    pickBySeed(`${productName}:usecase`, useCaseSection),
    pickBySeed(`${productName}:closing`, closing),
  ]
}

export function buildSeoNewsDraft(product) {
  const normalized = normalizeProductRecord(product)
  const categoryLabel = categoryLabelFor(normalized)
  const subcategoryLabel = normalized.subcategory || inferSubcategoryLabel(normalized)
  const price = formatPrice(normalized)
  const productName = String(normalized.name || '').trim()
  const imageUrl = String(normalized.img || '').trim()
  const seed = `${productName}:${normalized.category || ''}:${normalized.subcategory || ''}`

  const titleVariants = [
    `${productName}: was Leser jetzt wissen möchten`,
    `Ein genauer Blick auf ${productName}`,
    `${categoryLabel}: warum ${productName} im Fokus steht`,
    `${productName} im Überblick: klar, verständlich, aktuell`,
  ]

  const excerptVariants = [
    `${productName} wird häufig gesucht, wenn Kunden nach klaren Infos und einer verständlichen Einordnung in ${categoryLabel} suchen.`,
    `Ein redaktioneller Überblick zu ${productName} und seiner Rolle im Bereich ${categoryLabel}.`,
    `${productName} ist ein Produkt, das man besser versteht, wenn man es im richtigen Sortiment betrachtet.`,
  ]

  const paragraphs = buildBodyParagraphs(normalized, categoryLabel, subcategoryLabel, price)
  let bodyParagraphs = [
    ...paragraphs,
    `Hinweis der Redaktion: Dieser Beitrag soll nur helfen, das Produkt besser einzuordnen. ${productName} wird dabei bewusst sachlich, leserfreundlich und mit einem echten Textfluss beschrieben.`,
  ]

  const fallbackExpansion = [
    `Leser profitieren bei solchen Texten vor allem von Struktur. Wenn ein Produkt sauber erklärt wird, fällt es leichter, sich zu orientieren und ähnliche Angebote miteinander zu vergleichen. Das gilt besonders dann, wenn mehrere Produkte aus derselben Kategorie um Aufmerksamkeit konkurrieren.`,
    `Auch die Tonalität ist wichtig. Ein Text über ${productName} sollte ruhig, glaubwürdig und natürlich wirken. Zu viel Werbesprache stört eher, während ein klar formulierter redaktioneller Text mehr Vertrauen schafft und den Nutzer länger auf der Seite hält.`,
    `Wer die Seite über die Suche erreicht, möchte oft keine Kurzfassung, sondern einen verständlichen Überblick. Deshalb ist eine ausführliche Darstellung sinnvoll: Sie beantwortet Fragen, ordnet das Produkt ein und zeigt, warum es im Sortiment überhaupt relevant ist.`,
  ]

  while (wordCount(bodyParagraphs.join('\n\n')) < 520) {
    bodyParagraphs = bodyParagraphs.concat(fallbackExpansion)
    if (wordCount(bodyParagraphs.join('\n\n')) > 980) break
  }

  const body = bodyParagraphs.join('\n\n')

  return {
    title: pickBySeed(`${seed}:title`, titleVariants),
    excerpt: pickBySeed(`${seed}:excerpt`, excerptVariants),
    body,
    image: imageUrl || '',
    sourceImageUrl: imageUrl || '',
    sourceProductId: String(normalized.id || normalized.product_id || ''),
    sourceProductName: productName,
    sourceCategory: normalized.category || '',
    sourceSubcategory: normalized.subcategory || '',
    seoAgent: true,
  }
}

export function generateSeoNewsDrafts({ products = [], news = [], limit = 3, categorySlug = 'all' } = {}) {
  const normalizedProducts = (products || [])
    .map((product) => normalizeProductRecord(product))
    .filter((product) => String(product.name || '').trim())

  const existingNews = Array.isArray(news) ? news : []
  const coveredProductIds = new Set(
    existingNews
      .filter((item) => item && (item.sourceProductId || item.sourceProductName))
      .map((item) => String(item.sourceProductId || '').trim())
      .filter(Boolean),
  )

  let candidates = normalizedProducts.filter((product) => !coveredProductIds.has(String(product.id || product.product_id || '').trim()))

  if (categorySlug && categorySlug !== 'all') {
    candidates = candidates.filter((product) => String(product.category || '').trim() === String(categorySlug).trim())
  }

  candidates.sort((a, b) => {
    const scoreA = (Number(a.top) || 0) * 4 + (Number(a.main_offer) || 0) * 3 + (String(a.name || '').length > 0 ? 1 : 0)
    const scoreB = (Number(b.top) || 0) * 4 + (Number(b.main_offer) || 0) * 3 + (String(b.name || '').length > 0 ? 1 : 0)
    if (scoreB !== scoreA) return scoreB - scoreA
    return String(a.name || '').localeCompare(String(b.name || ''), 'de')
  })

  const drafts = []
  for (const product of candidates) {
    if (drafts.length >= limit) break
    const draft = buildSeoNewsDraft(product)
    if (!draft.title || !draft.body) continue
    const titleExists = existingNews.some((item) => String(item.title || '').trim().toLowerCase() === String(draft.title || '').trim().toLowerCase())
    if (titleExists) continue
    drafts.push(draft)
  }

  const categories = buildCatalogGroups(normalizedProducts)
  const topCategories = categories.slice(0, 5).map((category) => ({
    slug: category.slug,
    label: category.name,
    count: category.count,
  }))

  return {
    drafts,
    analysis: {
      productCount: normalizedProducts.length,
      availableCount: candidates.length,
      existingNewsCount: existingNews.length,
      topCategories,
    },
  }
}
