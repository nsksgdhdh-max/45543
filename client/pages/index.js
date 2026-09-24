import Head from 'next/head'
import Header from '../components/Header'
import Link from 'next/link'
import { useRouter } from 'next/router'
import products from '../data/specific_products.json'
import { addToCartAndGo } from '../lib/cart'
import { buildCatalogGroups } from '../lib/catalog'
import { readNews } from '../lib/news'
import { buildProductUrl, resolveProductImage } from '../lib/product'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const categoryLabels = {
  kapsula: 'Kapseln',
  kapli: 'Tropfen',
  krem: 'Creme',
  sprey: 'Spray',
  gel: 'Gel',
  other: 'Sonstige',
}

function priceForDE(item) {
  const target = Array.isArray(item.target) ? item.target : []
  const de = target.find((x) => String(x.code || '').toUpperCase() === 'DE') || target[0]
  if (!de) return 'Preis auf Anfrage'
  return `${de.price || ''} ${de.currency || ''}`.trim()
}

const categories = buildCatalogGroups(products)
const rankedCategories = [...categories].sort((a, b) => (b.count || 0) - (a.count || 0) || String(a.name).localeCompare(String(b.name)))
const visibleCategoryCards = [
  ...rankedCategories.filter((category) => category.slug === 'skin'),
  ...rankedCategories.filter((category) => category.slug !== 'skin').slice(0, 7),
]

const featuredBase = (products || []).filter((item) => Number(item.top) === 1)
const featured = (featuredBase.length ? featuredBase : (products || [])).map((item) => ({
  ...item,
  displayPrice: priceForDE(item),
}))
const heroOffer = (products || []).find((item) => Number(item.main_offer) === 1)
  || (products || []).find((item) => Number(item.top) === 1)
  || (products || [])[0]
const heroOfferPrice = heroOffer ? priceForDE(heroOffer) : 'Preis auf Anfrage'
const heroIsNew = Number(heroOffer?.main_offer) === 1 || Number(heroOffer?.new) === 1

const homepageFaq = [
  { question: 'Wie funktioniert eine Bestellung bei LebensKraft?', answer: 'Sie wählen ein Produkt aus, senden eine Anfrage und unser Team nimmt anschließend persönlich Kontakt mit Ihnen auf. Danach besprechen wir die Bestellung, die Lieferdetails und alle offenen Fragen, bevor der Kauf finalisiert wird.' },
  { question: 'Muss ich sofort bezahlen, wenn ich eine Anfrage stelle?', answer: 'Nein. Eine Anfrage ist zunächst nur der erste Schritt. Wir prüfen Ihre Anfrage, beantworten Ihre Fragen und sprechen mit Ihnen, bevor irgendeine Bestellung oder Zahlung verbindlich wird.' },
  { question: 'Ist die Lieferung kostenlos?', answer: 'Nein, die Lieferung ist in der Regel kostenpflichtig. Die genaue Höhe der Versandkosten wird im Rahmen der persönlichen Beratung mit Ihnen abgestimmt und vor Abschluss der Bestellung mitgeteilt.' },
  { question: 'Wohin liefern Sie?', answer: 'Wir liefern innerhalb Deutschlands. Die genauen Lieferbedingungen hängen von Ihrem Wohnort und der Bestellung ab und werden mit Ihnen vor dem Abschluss besprochen.' },
  { question: 'Warum kontaktiert mich Ihr Team vor dem Kauf?', answer: 'Weil Gesundheit ein persönliches Thema ist. Wir möchten sicherstellen, dass Sie das passende Produkt gewählt haben und alle offenen Fragen vor dem Kauf geklärt sind.' },
  { question: 'Wie lange dauert die Bearbeitung meiner Anfrage?', answer: 'In der Regel erhalten Sie schnell eine Rückmeldung. Die genaue Bearbeitungszeit kann je nach Tageszeit, Produkt und Anzahl der Fragen variieren, aber wir bemühen uns um eine schnelle und persönliche Antwort.' },
  { question: 'Kann ich auch telefonisch Fragen stellen?', answer: 'Ja, wir sind gern für Sie erreichbar. Wenn Sie Fragen zu einem Produkt oder zur Bestellung haben, können Sie uns gerne kontaktieren und wir klären die Details mit Ihnen.' },
  { question: 'Welche Informationen brauche ich für eine Anfrage?', answer: 'Normalerweise reichen Ihre Kontaktdaten und die Information zu dem Produkt, das Sie interessieren. Wenn Sie besondere Fragen oder Wünsche haben, können Sie diese ebenfalls mit angeben.' },
  { question: 'Ist der Kauf dadurch komplizierter?', answer: 'Nicht unbedingt. Der persönliche Kontakt dient dazu, den Prozess transparenter und verständlicher zu machen. So können Sie sicher sein, dass Sie das passende Produkt für Ihre Situation auswählen.' },
  { question: 'Kann ich mehrere Produkte gleichzeitig anfragen?', answer: 'Ja, das ist grundsätzlich möglich. Wenn Sie mehrere Produkte vergleichen oder verschiedene Optionen prüfen möchten, können Sie uns das gern mitteilen und wir beraten Sie entsprechend.' },
  { question: 'Sind die Produktinformationen auf der Website verlässlich?', answer: 'Wir legen Wert auf verständliche, klare und nachvollziehbare Informationen. Dadurch möchten wir Ihnen eine fundierte Grundlage für Ihre Auswahl bieten, ohne unklare oder übertriebene Versprechen.' },
  { question: 'Was bedeutet für Sie Transparenz?', answer: 'Für uns bedeutet Transparenz, dass Produktdetails, Hinweise zur Anwendung und die wichtigsten Informationen verständlich dargestellt werden. Wir vermeiden absichtliche Unklarheiten und geben Ihnen die Grundlage für eine bewusste Entscheidung.' },
  { question: 'Wer ist LebensKraft?', answer: 'LebensKraft ist ein Gesundheitsshop mit Fokus auf Produkte für Gesundheit, Wohlbefinden und Alltag. Unser Ziel ist es, Produkte klar zu präsentieren und Kunden bei wichtigen Entscheidungen bestmöglich zu unterstützen.' },
  { question: 'Ist das Angebot nur für bestimmte Kundengruppen?', answer: 'Nein. Unser Sortiment richtet sich an alle Kunden, die sich für Gesundheitsprodukte und natürliche Angebote interessieren. Wenn Sie Fragen zu einem passenden Produkt für Ihre Situation haben, beraten wir Sie gern.' },
  { question: 'Kann ich vor dem Kauf noch Fragen zu einem Produkt stellen?', answer: 'Ja, genau das ist sogar erwünscht. Wir freuen uns, wenn Sie offen Fragen haben. So können wir Ihnen gezielt weiterhelfen und Ihnen die passende Auswahl empfehlen.' },
  { question: 'Wie werden meine Daten behandelt?', answer: 'Ihre Daten werden nur für die Bearbeitung Ihrer Anfrage und die Kommunikation mit Ihnen verwendet. Wir achten dabei auf einen verantwortungsvollen und sorgfältigen Umgang mit Ihren Angaben.' },
  { question: 'Ist die Bestellung verbindlich, sobald ich eine Anfrage sende?', answer: 'Nein. Die Anfrage selbst ist zunächst unverbindlich. Erst nach persönlicher Rücksprache und gemeinsamer Abstimmung wird der weitere Bestellprozess konkret.' },
  { question: 'Kann ich nach der Anfrage noch einmal Kontakt aufnehmen?', answer: 'Ja, natürlich. Wenn Sie noch Fragen zu einem Produkt, zu Preisen, zur Lieferung oder zu einer bereits gestellten Anfrage haben, melden Sie sich gern erneut bei uns.' },
  { question: 'Was ist bei Gesundheitsprodukten besonders wichtig?', answer: 'Besonders wichtig sind verständliche Informationen, klare Produktbeschreibungen und eine ehrliche Darstellung der Anwendung. Wir achten darauf, dass Sie die wichtigsten Punkte schnell nachvollziehen können.' },
  { question: 'Warum sollten ich mit LebensKraft zusammenarbeiten?', answer: 'Weil wir Wert auf Klarheit, Transparenz und persönliche Beratung legen. Für Sie bedeutet das: weniger Verwirrung, verständlichere Informationen und ein sichererer Weg bei der Auswahl eines passenden Produkts.' },
]

export default function Home({ news = [] }) {
  const router = useRouter()
  const canonicalUrl = `${CANONICAL_BASE}/`

  return (
    <>
      <Head>
        <title>Ewige Vitalität — Gesundheit, Schönheit und Wohlbefinden</title>
        <meta name="description" content="Ewige Vitalität ist ein Gesundheits-Shop mit Produkten für Gesundheit, Wohlbefinden und Alltag in Deutschland." />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
        <Header />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 sm:text-xs">
              LebensKraft
            </span>

            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:mt-6 sm:text-4xl lg:text-5xl">
              Ihr Shop für Gesundheit, Schönheit und Wohlbefinden in Deutschland
            </h1>

            <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              Entdecken Sie geprüfte Produkte aus unserem Sortiment, vergleichen Sie Kategorien einfach und kaufen Sie schnell und bequem.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-2xl font-black text-slate-900">3–7 Tage</div>
                <div className="text-sm text-slate-500">Lieferung</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-2xl font-black text-slate-900">🚚</div>
                <div className="text-sm text-slate-500">Schneller Versand</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] sm:p-5">
            <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
              <img src={heroOffer?.img} alt={heroOffer?.name} className="h-[260px] w-full object-cover sm:h-[320px]" />
            </div>

            <div className="mt-5 flex items-start justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">Beliebtes Produkt</p>
                  {heroIsNew && (
                    <span className="inline-flex rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                      New
                    </span>
                  )}
                </div>
                <span className="mt-2 block text-xl font-bold text-slate-900 sm:text-2xl">{heroOffer?.name}</span>
              </div>
              <div className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow-sm sm:text-sm">
                {heroOfferPrice}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {heroOffer?.info || 'Natürliche Formel zur Unterstützung von Gesundheit und Alltag.'}
            </p>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 sm:text-sm">Verfügbar in Deutschland</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => heroOffer && addToCartAndGo({ ...heroOffer, price: heroOfferPrice })}
                  className="rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 sm:px-5 sm:text-sm"
                >
                  In den Warenkorb
                </button>
                <button
                  type="button"
                  onClick={() => heroOffer && router.push(buildProductUrl(heroOffer))}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:px-5 sm:text-sm"
                >
                  Mehr erfahren
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-4 shadow-sm sm:mt-20 sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Transparenz, Fachwissen und Vertrauen</h2>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm leading-6 text-slate-600 shadow-sm">
              Unsere Inhalte sollen verständlich, sachlich und nachvollziehbar sein – damit Sie mit mehr Klarheit entscheiden können.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl">✅</div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">Verlässliche Information</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Klare Produktbeschreibungen ohne übertriebene Versprechen.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl">🧭</div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">Nachvollziehbare Auswahl</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Kategorien und Hinweise helfen dabei, die richtigen Produkte leichter zu finden.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl">⚖️</div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">Gesundheit mit Verantwortung</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Wir weisen auf die Grenzen allgemeiner Informationen hin und empfehlen fachkundige Beratung.</p>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">Categories</p>
              <span className="mt-2 block text-2xl font-black text-slate-900 sm:text-3xl">Kategorien</span>
            </div>
            <Link href="/categories" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:text-sm">
              Alle Kategorien
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
            {visibleCategoryCards.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-52">
                  <img src={resolveProductImage(category.image)} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = '/img/placeholder.svg'
                  }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/10 to-transparent" />
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="sr-only">{category.name}</span>
                    <span className="text-xs font-semibold text-indigo-600 sm:text-sm">Mehr</span>
                  </div>
                  <span className="block text-xl font-bold text-slate-900 sm:text-2xl">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-slate-50 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] sm:mt-20 sm:p-6 lg:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">Fragen & Antworten</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Häufig gestellte Fragen</h2>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3 text-sm leading-6 text-slate-600 shadow-sm sm:p-4">
              Antworten zu Bestellung, Lieferung, Transparenz und Sicherheit – klar, verständlich und ohne unnötige Hürden.
            </div>
          </div>

          <div className="space-y-3">
            {homepageFaq.map((item, index) => (
              <details key={index} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 font-semibold text-slate-900 sm:px-5 sm:py-4">
                  <span className="text-sm sm:text-base">{item.question}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-normal text-emerald-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:px-5 sm:py-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-slate-200 bg-slate-900 p-4 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.75)] sm:mt-20 sm:p-8">
          <div className="mb-4 max-w-2xl sm:mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300 sm:text-xs">Finden Sie die Lösung</p>
            <h2 className="mt-2 text-xl font-black leading-tight sm:text-3xl">Praktische Empfehlungen für unterschiedliche Bedürfnisse</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-5">
              <h3 className="text-lg font-bold text-white sm:text-2xl">Metabolismus und Diabetes</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:mt-3 sm:leading-7">Entdecken Sie passende Lösungen und finden Sie schnell die richtige Auswahl für Ihren Alltag.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-5">
              <h3 className="text-lg font-bold text-white sm:text-2xl">Männliche Gesundheit</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:mt-3 sm:leading-7">Erfahren Sie mehr über bewährte Produkte und entdecken Sie passende Empfehlungen zu Ihren Bedürfnissen.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-5">
              <h3 className="text-lg font-bold text-white sm:text-2xl">Verdauung und Magen</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:mt-3 sm:leading-7">Wählen Sie gezielt Produkte aus, die für Ihre Gesundheit und Ihr Wohlbefinden sinnvoll sind.</p>
            </div>
          </div>
        </section>

    

        {news.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Aktuelles</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">Neuigkeiten</h2>
              </div>
              <Link href="/news" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Alle News
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {news.map((item) => (
                <Link
                  key={item.slug || item.id || item.createdAt}
                  href={`/news/${encodeURIComponent(item.slug || item.id || item.createdAt)}`}
                  className="group block overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  aria-label={`News lesen: ${item.title}`}
                >
                  <article className="h-full">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-slate-100 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">News</div>
                    )}
                    <div className="p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                      <h3 className="mt-3 text-2xl font-bold text-slate-900 transition group-hover:text-indigo-600">{item.title}</h3>
                      {item.excerpt && <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>}
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                        Weiterlesen
                        <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}



        <section className="mt-20">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Top Produkte</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Beliebte Produkte</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((item) => (
              <Link
                key={item.product_id || item.id}
                href={buildProductUrl(item)}
                className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative flex h-52 items-center justify-center bg-slate-100">
                  <img
                    src={resolveProductImage(item.img)}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = '/img/placeholder.svg'
                    }}
                  />
                  {Number(item.top) === 1 && (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-950 shadow-sm">
                      Top
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{categoryLabels[item.category] || item.category || 'Produkt'}</p>
                    <span className="mt-2 block text-sm font-bold leading-5 text-slate-900 transition group-hover:text-indigo-600 sm:text-base">{item.name}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Preis</span>
                      <span className="text-base font-black tracking-[-0.03em] text-slate-900 sm:text-lg">
                        {item.displayPrice?.replace(/\s+([A-Za-z]{3,})$/, ' $1') || item.displayPrice}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        addToCartAndGo({ ...item, price: item.displayPrice })
                      }}
                      aria-label={`In den Warenkorb: ${item.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:h-11 sm:w-11"
                    >
                      🛒
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
  <Link href="/categories" className="block text-lg font-black text-slate-900 transition hover:text-blue-600">
    Beliebte Kategorien
  </Link>

  <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {categories.slice(0, 8).map((category) => (
      <Link
        key={category.slug}
        href={`/categories/${category.slug}`}
        className="text-sm font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700"
      >
        {category.name}
      </Link>
    ))}
  </div>
</div>
        </section>
      </main>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      news: readNews().slice(0, 3),
    },
  }
}
