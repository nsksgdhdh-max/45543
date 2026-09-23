import Head from 'next/head'
import Header from '../components/Header'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function About() {
  const canonicalUrl = `${CANONICAL_BASE}/about`

  return (
    <>
      <Head>
        <title>Über LebensKraft</title>
        <meta name="description" content="Mehr über LebensKraft, unsere Werte, die Auswahl der Produkte und den Service für Gesundheitsprodukte in Deutschland." />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-white text-slate-900">
        <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-sm sm:tracking-[0.18em]">
                Über LebensKraft
              </p>

              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:mt-4 sm:text-4xl lg:text-5xl">
                Vertrauen ist die Grundlage guter Gesundheitsversorgung.
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
                Liebe Kundinnen und Kunden,
              </p>

              <p className="mt-3 text-base leading-7 text-slate-600 sm:mt-4 sm:text-lg sm:leading-8">
                bei LebensKraft möchten wir Ihnen eine einfache und
                zuverlässige Möglichkeit bieten, Gesundheitsprodukte
                übersichtlich zu entdecken und sich über deren Eigenschaften,
                Inhaltsstoffe und Anwendung zu informieren.
              </p>
            </div>
          </div>
        </section>

        {/* Main story */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_0.7fr] lg:gap-12">

            <div className="space-y-8 text-base leading-7 text-slate-600 sm:space-y-10 sm:text-[17px] sm:leading-8">

              <section>
                <h2 className="mb-3 text-xl font-bold text-slate-950 sm:mb-4 sm:text-2xl">
                  Wer wir sind
                </h2>

                <p>
                  LebensKraft ist eine Plattform für Gesundheitsprodukte,
                  Nahrungsergänzungsmittel und ausgewählte Produkte aus dem
                  Bereich Gesundheit und Wohlbefinden.
                </p>

                <p className="mt-4 sm:mt-5">
                  Unser Anspruch ist es, Informationen verständlich und
                  transparent darzustellen. Deshalb legen wir Wert auf
                  nachvollziehbare Produktbeschreibungen, übersichtliche
                  Angaben zu Inhaltsstoffen und eine klare Darstellung der
                  jeweiligen Produkteigenschaften.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-bold text-slate-950 sm:mb-4 sm:text-2xl">
                  Qualität und Transparenz
                </h2>

                <p>
                  Bei der Auswahl unseres Sortiments achten wir auf
                  nachvollziehbare Produktinformationen und die Angaben der
                  jeweiligen Hersteller. Wir möchten, dass Sie vor einer
                  Bestellung möglichst genau wissen, welches Produkt Sie
                  auswählen.
                </p>

                <p className="mt-4 sm:mt-5">
                  Deshalb verzichten wir bewusst auf unnötig übertriebene
                  Versprechen. Gesundheitsprodukte sollten nicht durch
                  spektakuläre Werbeaussagen überzeugen, sondern durch
                  transparente Informationen und eine verantwortungsvolle
                  Präsentation.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-bold text-slate-950 sm:mb-4 sm:text-2xl">
                  Gesundheit ist Vertrauenssache
                </h2>

                <p>
                  Gesundheit ist ein persönliches Thema. Genau deshalb
                  behandeln wir unsere Kunden und ihre Bestellungen mit
                  besonderer Sorgfalt.
                </p>

                <p className="mt-4 sm:mt-5">
                  Wir möchten Ihnen eine angenehme und übersichtliche
                  Einkaufserfahrung bieten – von der Produktauswahl bis zu
                  den Informationen rund um Ihre Bestellung.
                </p>
              </section>
            </div>

            {/* Side information */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:rounded-3xl sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-sm sm:tracking-[0.16em]">
                Unser Anspruch
              </p>

              <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-6">

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 sm:h-10 sm:w-10 sm:text-base">
                    1
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-5 text-slate-950 sm:text-base">
                      Verständliche Informationen
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Klare Angaben zu Produkten und ihren Eigenschaften.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 sm:h-10 sm:w-10 sm:text-base">
                    2
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-5 text-slate-950 sm:text-base">
                      Transparente Auswahl
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Nachvollziehbare Informationen zu unserem Sortiment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 sm:h-10 sm:w-10 sm:text-base">
                    3
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-5 text-slate-950 sm:text-base">
                      Kundenorientierter Service
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Wir möchten Ihre Bestellung so einfach und angenehm wie
                      möglich gestalten.
                    </p>
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">

            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-sm sm:tracking-[0.18em]">
                Dafür stehen wir
              </p>

              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:mt-3 sm:text-3xl">
                Was uns bei LebensKraft wichtig ist
              </h2>
            </div>

            <div className="mt-7 grid gap-4 sm:mt-10 md:grid-cols-3 md:gap-5">

              <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:rounded-2xl sm:p-7">
                <div className="text-xl sm:text-2xl">✓</div>

                <h3 className="mt-3 text-lg font-bold text-slate-950 sm:mt-5 sm:text-xl">
                  Transparenz
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3">
                  Wir möchten Produktinformationen übersichtlich,
                  verständlich und nachvollziehbar darstellen.
                </p>
              </article>

              <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:rounded-2xl sm:p-7">
                <div className="text-xl sm:text-2xl">✓</div>

                <h3 className="mt-3 text-lg font-bold text-slate-950 sm:mt-5 sm:text-xl">
                  Sorgfalt
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3">
                  Wir achten auf eine sorgfältige Präsentation unseres
                  Sortiments und auf vollständige Produktinformationen.
                </p>
              </article>

              <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:rounded-2xl sm:p-7">
                <div className="text-xl sm:text-2xl">✓</div>

                <h3 className="mt-3 text-lg font-bold text-slate-950 sm:mt-5 sm:text-xl">
                  Verantwortung
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3">
                  Gesundheit ist ein sensibles Thema. Deshalb setzen wir auf
                  einen verantwortungsvollen Umgang mit Informationen.
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="rounded-2xl bg-emerald-700 px-5 py-8 text-white sm:rounded-3xl sm:px-10 sm:py-10 lg:px-14 lg:py-14">
            <div className="max-w-3xl">

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 sm:text-sm sm:tracking-[0.18em]">
                LebensKraft
              </p>

              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-3xl lg:text-4xl">
                Gesundheit verdient Vertrauen.
              </h2>

              <p className="mt-4 text-sm leading-6 text-emerald-50 sm:mt-5 sm:text-base sm:leading-7 lg:text-lg">
                Vielen Dank, dass Sie LebensKraft Ihr Vertrauen schenken.
                Unser Ziel ist es, Ihnen eine übersichtliche Plattform mit
                verständlichen Informationen und einem angenehmen
                Einkaufserlebnis zu bieten.
              </p>

              <p className="mt-6 text-base font-semibold sm:mt-8 sm:text-lg">
                Ihr LebensKraft-Team
              </p>

            </div>
          </div>
        </section>
      </main>
    </div>
    </>
  )
}
