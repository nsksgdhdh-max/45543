import Head from 'next/head'
import Header from '../components/Header'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function DatenschutzPage() {
  const canonicalUrl = `${CANONICAL_BASE}/datenschutz`

  return (
    <>
      <Head>
        <title>Datenschutzerklärung | ewige-vitalitaet.de</title>
        <meta
          name="description"
          content="Datenschutzerklärung von ewige-vitalitaet.de: Informationen zur Erhebung, Verarbeitung und Nutzung personenbezogener Daten auf unserer Website."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Datenschutzerklärung</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Datenschutzerklärung
            </h1>

            <div className="mt-8 space-y-8 text-base leading-7 text-slate-700">
              <section>
                <h2 className="text-xl font-bold text-slate-900">1. Verantwortlicher</h2>
                <p className="mt-3">
                  Verantwortlich für die Datenverarbeitung auf dieser Website ist:
                </p>
                <p className="mt-3">
                  ewige-vitalitaet.de<br />
                  [Name des Inhabers / Firmenname]<br />
                  [Adresse]<br />
                  [PLZ, Ort, Land]<br />
                  E-Mail: post@ewige-vitalitaet.de<br />
                  Telefon: [Telefonnummer]
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
                <p className="mt-3">
                  Wir verarbeiten personenbezogene Daten nur, soweit dies für die Bereitstellung und den Betrieb unserer Website sowie für die Inanspruchnahme unserer Leistungen erforderlich ist. Dazu gehören insbesondere Kontaktanfragen, Bestellungen, Kaufanfragen, Kundenkommunikation und technische Daten zur Sicherung der Website.
                </p>
                <p className="mt-3">
                  Zu den von uns verarbeiteten Daten gehören unter anderem: Name, Anschrift, E-Mail-Adresse, Telefonnummer, Bestell- und Rechnungsdaten, Standortdaten (falls ausdrücklich angegeben), IP-Adresse und technische Zugriffs- und Protokolldaten.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">3. Zwecke der Verarbeitung</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Bearbeitung und Abwicklung von Bestellungen und Anfragen</li>
                  <li>Beantwortung von Kontaktaufnahmen per E-Mail, Telefon oder Kontaktformular</li>
                  <li>Erfüllung vertraglicher und gesetzlicher Verpflichtungen</li>
                  <li>Sicherstellung der technischen Funktionsfähigkeit und Sicherheit der Website</li>
                  <li>Vermeidung von Missbrauch, Betrug und Sicherheitsvorfällen</li>
                  <li>Marketing und Werbezwecke, soweit rechtlich zulässig</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">4. Rechtsgrundlagen</h2>
                <p className="mt-3">
                  Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / vorvertragliche Maßnahmen), Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Verpflichtungen), Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen) sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), soweit eine Einwilligung vorliegt.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">5. Kontaktformular und Anfragen</h2>
                <p className="mt-3">
                  Wenn Sie uns über das Kontaktformular, per E-Mail oder telefonisch kontaktieren, verarbeiten wir die von Ihnen mitgeteilten personenbezogenen Daten ausschließlich zur Beantwortung Ihrer Anfrage und zur Bearbeitung Ihres Anliegen. Die Daten werden nur so lange gespeichert, wie dies für die Beantwortung und Abwicklung Ihrer Anfrage erforderlich ist.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">6. Bestellungen und Kaufanfragen</h2>
                <p className="mt-3">
                  Zur Abwicklung von Bestellungen und Kaufanfragen verarbeiten wir die von Ihnen angegebenen Daten, insbesondere Name, Anschrift, E-Mail-Adresse, Telefonnummer sowie Zahlungs- und Bestelldaten. Diese Daten werden nur für die Abwicklung der Bestellung verwendet und nicht weiter verbreitet, außer an die zur Leistungserbringung notwendigen Dienstleister, z. B. Versandunternehmen, Zahlungsanbieter oder Hosting-Unternehmen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">7. Cookies und Analyse-Tools</h2>
                <p className="mt-3">
                  Unsere Website kann Cookies einsetzen, um die Nutzung der Website zu optimieren und technisch notwendige Funktionen bereitzustellen. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.
                </p>
                <p className="mt-3">
                  Technisch notwendige Cookies werden ohne Ihre Einwilligung gesetzt. Für weitere Cookies, insbesondere Analyse- oder Werbe-Cookies, benötigen wir Ihre Einwilligung, sofern dies rechtlich erforderlich ist. Falls auf der Website Analyse-Tools wie Google Analytics oder ähnliche Dienste verwendet werden, informieren wir Sie gesondert durch eine Cookie-Einwilligung und geben dort die jeweiligen Datenschutzinformationen an.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">8. Weitergabe von Daten</h2>
                <p className="mt-3">
                  Wir geben personenbezogene Daten nur weiter, wenn dies zur Erfüllung eines Vertrags, zur rechtlichen Verpflichtung oder zur Wahrung unserer berechtigten Interessen erforderlich ist. Dabei können Dienstleister, Versandunternehmen, Zahlungsanbieter, Hosting-Anbieter oder IT-Dienstleister beteiligt sein.
                </p>
                <p className="mt-3">
                  Eine Weitergabe an Dritte zu Werbezwecken erfolgt nur mit Ihrer ausdrücklichen Einwilligung oder soweit dies gesetzlich zulässig ist.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">9. Speicherung und Löschung</h2>
                <p className="mt-3">
                  Wir speichern personenbezogene Daten nur so lange, wie dies für den jeweiligen Zweck erforderlich ist oder gesetzlich vorgeschrieben ist. Danach werden die Daten gelöscht bzw. anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">10. Ihre Rechte</h2>
                <p className="mt-3">Sie haben das Recht:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Auskunft über Ihre gespeicherten personenbezogenen Daten zu erhalten</li>
                  <li>Berichtigung unrichtiger Daten zu verlangen</li>
                  <li>Löschung Ihrer Daten zu verlangen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen</li>
                  <li>Einschränkung der Verarbeitung zu verlangen</li>
                  <li>Widerspruch gegen die Verarbeitung einzulegen</li>
                  <li>Datenübertragung zu verlangen</li>
                  <li>Widerruf erteilter Einwilligungen jederzeit zu erklären</li>
                </ul>
                <p className="mt-3">
                  Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte per E-Mail an post@ewige-vitalitaet.de.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">11. Beschwerderecht</h2>
                <p className="mt-3">
                  Sie haben das Recht, sich bei der zuständigen Datenschutzbehörde zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die Datenschutzvorschriften verstößt.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">12. Sicherheit</h2>
                <p className="mt-3">
                  Wir treffen geeignete technische und organisatorische Maßnahmen, um Ihre Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Die Kommunikation zwischen Website und Nutzer erfolgt dabei idealerweise verschlüsselt über HTTPS.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">13. Aktualität dieser Datenschutzerklärung</h2>
                <p className="mt-3">
                  Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden. Die jeweils aktuelle Fassung ist auf dieser Website jederzeit abrufbar.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
