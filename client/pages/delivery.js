import Header from '../components/Header'

const faqItems = [
  {
    question: 'Wie funktioniert eine Bestellung bei LebensKraft?',
    answer:
      'Sie wählen ein Produkt aus, senden eine Anfrage und unser Team nimmt anschließend persönlich Kontakt mit Ihnen auf. Danach besprechen wir die Bestellung, die Lieferdetails und alle offenen Fragen, bevor der Kauf finalisiert wird.',
  },
  {
    question: 'Muss ich sofort bezahlen, wenn ich eine Anfrage stelle?',
    answer:
      'Nein. Eine Anfrage ist zunächst nur der erste Schritt. Wir prüfen Ihre Anfrage, beantworten Ihre Fragen und sprechen mit Ihnen, bevor irgendeine Bestellung oder Zahlung verbindlich wird.',
  },
  {
    question: 'Ist die Lieferung kostenlos?',
    answer:
      'Nein, die Lieferung ist in der Regel kostenpflichtig. Die genaue Höhe der Versandkosten wird im Rahmen der persönlichen Beratung mit Ihnen abgestimmt und vor Abschluss der Bestellung mitgeteilt.',
  },
  {
    question: 'Wohin liefern Sie?',
    answer:
      'Wir liefern innerhalb Deutschlands. Die genauen Lieferbedingungen hängen von Ihrem Wohnort und der Bestellung ab und werden mit Ihnen vor dem Abschluss besprochen.',
  },
  {
    question: 'Warum kontaktiert mich Ihr Team vor dem Kauf?',
    answer:
      'Weil Gesundheit ein persönliches Thema ist. Wir möchten sicherstellen, dass Sie das passende Produkt gewählt haben und alle offenen Fragen vor dem Kauf geklärt sind.',
  },
  {
    question: 'Wie lange dauert die Bearbeitung meiner Anfrage?',
    answer:
      'In der Regel erhalten Sie schnell eine Rückmeldung. Die genaue Bearbeitungszeit kann je nach Tageszeit, Produkt und Anzahl der Fragen variieren, aber wir bemühen uns um eine schnelle und persönliche Antwort.',
  },
  {
    question: 'Kann ich auch telefonisch Fragen stellen?',
    answer:
      'Ja, wir sind gern für Sie erreichbar. Wenn Sie Fragen zu einem Produkt oder zur Bestellung haben, können Sie uns gerne kontaktieren und wir klären die Details mit Ihnen.',
  },
  {
    question: 'Welche Informationen brauche ich für eine Anfrage?',
    answer:
      'Normalerweise reichen Ihre Kontaktdaten und die Information zu dem Produkt, das Sie interessieren. Wenn Sie besondere Fragen oder Wünsche haben, können Sie diese ebenfalls mit angeben.',
  },
  {
    question: 'Ist der Kauf dadurch komplizierter?',
    answer:
      'Nicht unbedingt. Der persönliche Kontakt dient dazu, den Prozess transparenter und verständlicher zu machen. So können Sie sicher sein, dass Sie das passende Produkt für Ihre Situation auswählen.',
  },
  {
    question: 'Kann ich mehrere Produkte gleichzeitig anfragen?',
    answer:
      'Ja, das ist grundsätzlich möglich. Wenn Sie mehrere Produkte vergleichen oder verschiedene Optionen prüfen möchten, können Sie uns das gern mitteilen und wir beraten Sie entsprechend.',
  },
  {
    question: 'Sind die Produktinformationen auf der Website verlässlich?',
    answer:
      'Wir legen Wert auf verständliche, klare und nachvollziehbare Informationen. Dadurch möchten wir Ihnen eine fundierte Grundlage für Ihre Auswahl bieten, ohne unklare oder übertriebene Versprechen.',
  },
  {
    question: 'Was bedeutet für Sie Transparenz?',
    answer:
      'Für uns bedeutet Transparenz, dass Produktdetails, Hinweise zur Anwendung und die wichtigsten Informationen verständlich dargestellt werden. Wir vermeiden absichtliche Unklarheiten und geben Ihnen die Grundlage für eine bewusste Entscheidung.',
  },
  {
    question: 'Wer ist LebensKraft?',
    answer:
      'LebensKraft ist ein Gesundheitsshop mit Fokus auf Produkte für Gesundheit, Wohlbefinden und Alltag. Unser Ziel ist es, Produkte klar zu präsentieren und Kunden bei wichtigen Entscheidungen bestmöglich zu unterstützen.',
  },
  {
    question: 'Ist das Angebot nur für bestimmte Kundengruppen?',
    answer:
      'Nein. Unser Sortiment richtet sich an alle Kunden, die sich für Gesundheitsprodukte und natürliche Angebote interessieren. Wenn Sie Fragen zu einem passenden Produkt für Ihre Situation haben, beraten wir Sie gern.',
  },
  {
    question: 'Kann ich vor dem Kauf noch Fragen zu einem Produkt stellen?',
    answer:
      'Ja, genau das ist sogar erwünscht. Wir freuen uns, wenn Sie offen Fragen haben. So können wir Ihnen gezielt weiterhelfen und Ihnen die passende Auswahl empfehlen.',
  },
  {
    question: 'Wie werden meine Daten behandelt?',
    answer:
      'Ihre Daten werden nur für die Bearbeitung Ihrer Anfrage und die Kommunikation mit Ihnen verwendet. Wir achten dabei auf einen verantwortungsvollen und sorgfältigen Umgang mit Ihren Angaben.',
  },
  {
    question: 'Ist die Bestellung verbindlich, sobald ich eine Anfrage sende?',
    answer:
      'Nein. Die Anfrage selbst ist zunächst unverbindlich. Erst nach persönlicher Rücksprache und gemeinsamer Abstimmung wird der weitere Bestellprozess konkret.',
  },
  {
    question: 'Kann ich nach der Anfrage noch einmal Kontakt aufnehmen?',
    answer:
      'Ja, natürlich. Wenn Sie noch Fragen zu einem Produkt, zu Preisen, zur Lieferung oder zu einer bereits gestellten Anfrage haben, melden Sie sich gern erneut bei uns.',
  },
  {
    question: 'Was ist bei Gesundheitsprodukten besonders wichtig?',
    answer:
      'Besonders wichtig sind verständliche Informationen, klare Produktbeschreibungen und eine ehrliche Darstellung der Anwendung. Wir achten darauf, dass Sie die wichtigsten Punkte schnell nachvollziehen können.',
  },
  {
    question: 'Warum sollten ich mit LebensKraft zusammenarbeiten?',
    answer:
      'Weil wir Wert auf Klarheit, Transparenz und persönliche Beratung legen. Für Sie bedeutet das: weniger Verwirrung, verständlichere Informationen und ein sichererer Weg bei der Auswahl eines passenden Produkts.',
  },
]

export default function Delivery() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm">
                Bestellung & Lieferung
              </p>

              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Persönliche Beratung vor jeder Bestellung
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Bei LebensKraft steht nicht der schnelle Abschluss im
                Vordergrund. Wenn Sie eine Anfrage zu einem Produkt stellen,
                nimmt unser Team persönlich Kontakt mit Ihnen auf, um offene
                Fragen zu klären und Sie vor dem Kauf zu beraten.
              </p>
            </div>
          </div>
        </section>

        {/* Ablauf */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm">
              So funktioniert es
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Von der Anfrage bis zur Lieferung
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Unser Bestellablauf ist bewusst persönlich gestaltet. So können
              wir Ihre Fragen vor dem Kauf besprechen und die nächsten Schritte
              gemeinsam abstimmen.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {/* 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  1
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Produkt auswählen
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Sie informieren sich über unser Sortiment und wählen das
                    Produkt aus, zu dem Sie eine Anfrage stellen möchten.
                  </p>
                </div>
              </div>
            </div>

            {/* 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  2
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Anfrage senden
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Sie hinterlassen Ihre Kontaktdaten und senden uns Ihre
                    Anfrage über die dafür vorgesehene Funktion.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  3
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Persönliche Beratung
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Unser Team nimmt Kontakt mit Ihnen auf, beantwortet Ihre
                    Fragen und bespricht gemeinsam mit Ihnen die nächsten
                    Schritte.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  4
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Bestellung und Lieferung
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Nach der Beratung werden die weiteren Bedingungen der
                    Bestellung mit Ihnen abgestimmt. Anschließend wird die
                    Lieferung organisiert.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beratung */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm">
                  Persönlicher Kontakt
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Wir sprechen mit Ihnen, bevor Sie kaufen
                </h2>

                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                  <p>
                    Bei LebensKraft erfolgt der Kauf nicht einfach über eine
                    automatische Online-Zahlung.
                  </p>

                  <p>
                    Nach Ihrer Anfrage meldet sich unser Team persönlich bei
                    Ihnen. Dabei können offene Fragen zum Produkt, zur
                    Bestellung und zur Lieferung besprochen werden.
                  </p>

                  <p>
                    Erst anschließend werden die weiteren Schritte gemeinsam
                    mit Ihnen abgestimmt.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
                  💬
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Persönliche Beratung
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Unser Team kontaktiert Sie nach Ihrer Anfrage und bespricht
                  die Bestellung persönlich mit Ihnen.
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-emerald-700">
                    Ihre Anfrage ist zunächst unverbindlich.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Versandkosten */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700">
                €
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Versandkosten
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Die Lieferung ist kostenpflichtig
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  Für die Lieferung Ihrer Bestellung fallen Versandkosten an.
                  Die konkreten Kosten werden im Rahmen der persönlichen
                  Abstimmung vor Abschluss der Bestellung mit Ihnen besprochen.
                </p>

                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">
                    Wichtig:
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Es erfolgt keine automatische kostenlose Lieferung. Die
                    Versandkosten sind Bestandteil der individuellen
                    Bestellabstimmung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liefergebiet */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm">
                Liefergebiet
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Lieferung innerhalb Deutschlands
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Die Lieferung erfolgt innerhalb Deutschlands. Die konkreten
                Möglichkeiten und Bedingungen werden vor Abschluss der
                Bestellung mit Ihnen abgestimmt.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <p className="text-2xl font-bold text-emerald-700">01</p>

                <h3 className="mt-3 font-bold text-slate-950">
                  Deutschlandweit
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Lieferungen an verfügbare Adressen innerhalb Deutschlands.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <p className="text-2xl font-bold text-emerald-700">02</p>

                <h3 className="mt-3 font-bold text-slate-950">
                  Persönliche Abstimmung
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Die Lieferdetails werden mit unserem Team besprochen.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <p className="text-2xl font-bold text-emerald-700">03</p>

                <h3 className="mt-3 font-bold text-slate-950">
                  Kostenpflichtiger Versand
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Die Versandkosten werden vor Abschluss der Bestellung
                  mitgeteilt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm">
              Häufige Fragen
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Fragen zu Bestellung und Lieferung
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {faqItems.map((item, index) => (
              <details key={index} className="group rounded-2xl border border-slate-200 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-slate-950 sm:p-6">
                  <span>{item.question}</span>

                  <span className="shrink-0 text-xl font-normal text-emerald-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-6 text-slate-600 sm:px-6 sm:pb-6">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Abschluss */}
        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <div className="rounded-3xl bg-emerald-700 px-6 py-9 text-white sm:px-10 sm:py-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 sm:text-sm">
                LebensKraft
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Ihre Fragen sind uns wichtig.
              </h2>

              <p className="mt-4 text-sm leading-6 text-emerald-50 sm:text-base sm:leading-7">
                Stellen Sie Ihre Anfrage und unser Team meldet sich persönlich
                bei Ihnen, um die weiteren Schritte gemeinsam zu besprechen.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
