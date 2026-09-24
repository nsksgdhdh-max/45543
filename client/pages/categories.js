import Head from 'next/head'
import Header from '../components/Header'
import Link from 'next/link'
import products from '../data/specific_products.json'
import { buildCatalogGroups } from '../lib/catalog'
import { resolveProductImage } from '../lib/product'
import { buildCollectionPageSchemaFromProducts } from '../lib/schema'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const categories = buildCatalogGroups(products)

function buildCatalogSeoBlock() {
  return (
    <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
      <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
        Gesundheitsprodukte für Alltag, Vitalität und Wohlbefinden
      </h2>

      <div className="mt-6 space-y-6 text-base leading-8 text-slate-700">
        <p>
          Auf unserer Produktseite finden Sie eine gezielte Auswahl an hochwertigen
          Gesundheits- und Wellnessartikeln, die für den täglichen Gebrauch entwickelt wurden.
          Ob Sie nach einer täglichen Unterstützung für Ihre Gesundheit, einem bewussteren
          Lebensstil oder einer praktischen Lösung für den Alltag suchen – in unserem Katalog
          ist die passende Kategorie schnell auffindbar. Jede Produktgruppe wurde klar sortiert,
          damit Sie sich schnell orientieren und einfach das gewünschte Produkt entdecken können.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black text-slate-900">Praxisnah und einfach verständlich</h3>
            <p className="mt-3">
              Die Kategorien sind bewusst übersichtlich aufgebaut und helfen dabei, Produkte nach
              ihrem Nutzen, ihrer Anwendung oder ihrem Gesundheitsziel zu finden. So bleiben Sie
              schnell bei den relevanten Themen, ohne lange nach passenden Angeboten suchen zu müssen.
              Das spart Zeit und macht die Auswahl deutlich angenehmer.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Qualität, Nutzen und Vertrauen</h3>
            <p className="mt-3">
              Unser Sortiment verbindet bewährte Formeln, moderne Produktentwicklung und eine klare
              Produktdarstellung. Dabei liegt der Fokus auf verständlichen Informationen, transparenten
              Preisen und einer Auswahl, die für viele Lebenssituationen relevant ist. So können Sie
              leichter entscheiden, welches Produkt zu Ihren Bedürfnissen passt.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-black text-slate-900">Warum die richtige Kategorie wichtig ist</h4>
        <p>
          Wer gezielt nach Produkten für bestimmte Themen sucht, findet schneller das passende Angebot.
          In unseren Kategorien werden ähnliche Produkte zusammengefasst, damit Sie die Unterschiede
          leichter erkennen und die Auswahl besser einschätzen können. Das ist besonders hilfreich,
          wenn Sie eine bestimmte Funktion, ein gewünschtes Gesundheitsziel oder eine spezifische
          Anwendung im Blick haben. Eine klare Struktur verbessert nicht nur die Orientierung, sondern
          auch die Kaufentscheidung.
        </p>

        <h4 className="text-lg font-black text-slate-900">Eine Auswahl für Ihren Alltag</h4>
        <p>
          Bei der Zusammenstellung des Sortiments stehen Alltagstauglichkeit, Qualität und Zweckmäßigkeit
          im Vordergrund. Viele Kunden suchen nach Produkten, die zuverlässig, unkompliziert und gut
          verständlich im Einsatz sind. Genau dafür wurden die Kategorien auf unserer Seite bewusst so
          aufgebaut, dass sich verschiedene Themengebiete leicht vergleichen und bewerten lassen. So
          entsteht eine Produktübersicht, die nicht nur informativ, sondern auch praktisch nutzbar ist.
        </p>
      </div>
    </section>
  )
}

export default function Categories() {
  const canonicalUrl = `${CANONICAL_BASE}/categories`

  return (
    <>
      <Head>
        <title>Produktkatalog — LebensKraft</title>
        <meta name="description" content="Produktkatalog von LebensKraft. Auswahl an Kategorien und Produkten für Gesundheit, Schönheit und Alltagswohlbefinden." />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildCollectionPageSchemaFromProducts({
                name: 'Produktkategorien',
                description: 'Produktkatalog von Ewige Vitalität mit Kategorien und Gesundheitsprodukten für Alltag, Vitalität und Wohlbefinden.',
                url: canonicalUrl,
                products: categories.flatMap((category) =>
                  (category.items || []).slice(0, 3).map((item) => ({
                    name: item.name,
                    url: `${CANONICAL_BASE}/categories/${category.slug}`,
                    image: resolveProductImage(item.img),
                    price: item.target?.[0]?.price || '0',
                  })),
                ),
                breadcrumbs: [
                  { name: 'Startseite', url: `${CANONICAL_BASE}/` },
                  { name: 'Katalog', url: canonicalUrl },
                ],
              }),
            ),
          }}
        />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <nav className="mb-4 flex items-center justify-start gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-indigo-600">Startseite</Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Katalog</span>
          </nav>

          <div className="text-center">
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Produktkategorien
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Eine Auswahl an Gesundheits- und Wellnesslösungen, sortiert nach Produktfunktion und Nutzen.
            </p>
          </div>
        </div>

        <section className="mb-12">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Kategorien</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Hauptkategorien</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-32px_rgba(79,70,229,0.35)]"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={resolveProductImage(category.image)}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = '/img/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 backdrop-blur-sm">
                    {category.count} Produkte
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bereich</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {buildCatalogSeoBlock()}

      </main>
    </div>
    </>
  )
}
