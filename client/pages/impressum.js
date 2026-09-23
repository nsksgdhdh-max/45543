import Head from 'next/head'
import Header from '../components/Header'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function ImpressumPage() {
  const canonicalUrl = `${CANONICAL_BASE}/impressum`

  return (
    <>
      <Head>
        <title>Impressum | ewige-vitalitaet.de</title>
        <meta
          name="description"
          content="Impressum und rechtliche Informationen zu ewige-vitalitaet.de: Verantwortlicher Betreiber, Kontakt, Anschrift und Haftungshinweise."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Impressum</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Rechtliche Informationen und Kontakt
            </h1>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <section>
                <h2 className="text-xl font-bold text-slate-900">Verantwortlich für den Inhalt</h2>
                <div className="mt-4 space-y-2 text-base leading-7 text-slate-700">
                  <p><strong>ewige-vitalitaet.de</strong></p>
                  <p>Inhaber: Geschäftsführung / Betreiber</p>
                  <p>[Adresse]</p>
                  <p>[PLZ, Ort]</p>
                  <p>Deutschland</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">Kontakt</h2>
                <div className="mt-4 space-y-2 text-base leading-7 text-slate-700">
                  <p>E-Mail: info@ewige-vitalitaet.de</p>
                  <p>Telefon: +49 30 000 00 00</p>
                  <p>Kontaktformular: <a href="/contact" className="font-medium text-indigo-600 hover:text-indigo-500">zum Kontakt</a></p>
                  <p>Öffnungszeiten: Mo.–Fr. von 09:00 bis 18:00 Uhr</p>
                </div>
              </section>
            </div>

            <div className="mt-10 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900">Handelsregister / Umsatzsteuer</h2>
                <div className="mt-4 text-base leading-7 text-slate-700">
                  <p>Als Betreiber dieses Shops sind wir für die fachlich richtige Darstellung der jeweiligen Produktinformationen verantwortlich.</p>
                  <p className="mt-3">Umsatzsteuer-ID: DE 000 000 000</p>
                  <p>Handelsregister: nicht öffentlich / je nach Betriebsform eintragungsfähig</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">Verantwortung für Angebote und Inhalte</h2>
                <div className="mt-4 text-base leading-7 text-slate-700">
                  <p>
                    Der Betrieb dieser Webseite dient der Präsentation und Verbreitung von Gesundheits-, Wellness- und Alltagspflege-Produkten.
                    Für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Produktinformationen übernehmen wir mit Sorgfalt
                    die Verantwortung für die auf der Seite veröffentlichten Inhalte, soweit diese durch uns erstellt, überprüft oder gepflegt werden.
                  </p>
                  <p className="mt-3">
                    Bitte beachten Sie: Die auf unserer Plattform dargestellten Informationen ersetzen keine professionelle medizinische Beratung,
                    Diagnostik oder Behandlung. Bei gesundheitlichen Fragen oder Beschwerden wenden Sie sich an einen qualifizierten Arzt,
                    Apotheker oder Facharzt.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">Haftungsausschluss</h2>
                <div className="mt-4 text-base leading-7 text-slate-700">
                  <p>
                    Für die Inhalte externer Links, Partnerseiten oder verlinkter Angebote übernehmen wir keine Gewähr.
                    Sofern wir auf fremde Internetseiten verweisen, übernehmen wir keine Verantwortung für deren Inhalt, Richtigkeit,
                    Aktualität oder Datenschutz.
                  </p>
                  <p className="mt-3">
                    Die auf dieser Website veröffentlichten Texte, Produktbeschreibungen und Hinweise dienen ausschließlich der allgemeinen Information.
                    Eine verbindliche Zusicherung oder medizinische Empfehlung kann daraus nicht abgeleitet werden.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
