import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Header from '../components/Header'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function FormPage() {
  const router = useRouter()

  const { product_id, name, price, img, partner_id } = router.query

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(false)
  const canonicalUrl = `${CANONICAL_BASE}/form`

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setMsg(null)
    setError(false)

    try {
      const fd = new FormData(e.target)
      const body = Object.fromEntries(fd.entries())

      const r = await fetch('/api/submit-order', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const j = await r.json()

      if (r.ok) {
        setMsg(
          'Ihre Anfrage wurde erfolgreich gesendet. Wir melden uns für die Bestätigung.'
        )

        e.target.reset()
      } else {
        setError(true)
        setMsg(
          j?.message ||
            j?.error ||
            'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'
        )
      }
    } catch (err) {
      setError(true)
      setMsg('Verbindungsfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Bestellung — LebensKraft</title>
        <meta name="description" content="Bestellformular für den Kauf eines Produkts bei LebensKraft." />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Header />

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Верх страницы */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Bestellung
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            Bestellung abschließen
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Bitte geben Sie Ihre Kontaktdaten ein. Wir melden uns mit Ihnen, um die Bestellung zu bestätigen.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* ФОРМА */}
          <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Kontaktdaten
                </h2>

                <p className="text-sm text-gray-500">
                  Bitte geben Sie Ihre Kontaktdaten an
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">

              {/* Скрытые поля */}
              <input
                type="hidden"
                name="product_id"
                value={product_id || ''}
              />

              <input
                type="hidden"
                name="partner_id"
                value={partner_id || 'metacpa_default'}
              />

              <input
                type="hidden"
                name="ref"
                value="993341"
              />

              <input
                type="hidden"
                name="langCode"
                value="DE"
              />

              <input
                type="hidden"
                name="product_name"
                value={name || ''}
              />

              <input
                type="hidden"
                name="product_price"
                value={price || ''}
              />

              <input
                type="hidden"
                name="product_img"
                value={img || ''}
              />

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Geben Sie Ihren Namen ein"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Telefon */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Telefon
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+49 123 456789"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Кнопка */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Wird gesendet...
                  </>
                ) : (
                  <>
                    Bestellung senden

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-gray-400">
                Durch Klicken auf die Schaltfläche senden Sie eine Anfrage zur Bestellung.
              </p>
            </form>

            {/* Сообщение */}
            {msg && (
              <div
                className={`mt-5 rounded-2xl border p-4 ${
                  error
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {error ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m0 3.75h.007v.008H12v-.008ZM10.29 3.86 2.82 17.11A1.875 1.875 0 0 0 4.45 20h15.1a1.875 1.875 0 0 0 1.63-2.89L13.71 3.86a1.875 1.875 0 0 0-3.42 0Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </div>

                  <p className="text-sm font-medium leading-6">
                    {msg}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ТОВАР */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-gray-200">

              <div className="border-b border-gray-100 px-5 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  Ihre Bestellung
                </p>
              </div>

              {name ? (
                <>
                  {/* Bild */}
                  <div className="aspect-square bg-gray-100">
                    {img ? (
                      <img
                        src={img}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Kein Bild
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="p-5">
                    <h2 className="text-lg font-bold leading-6 text-gray-900">
                      {name}
                    </h2>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <span className="text-sm text-gray-500">
                        Preis
                      </span>

                      <span className="text-2xl font-black text-indigo-600">
                        {price || 'Auf Anfrage'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.7"
                      stroke="currentColor"
                      className="h-7 w-7 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    Das Produkt wird automatisch der Anfrage hinzugefügt.
                  </p>
                </div>
              )}
            </div>

            {/* Инфо */}
            <div className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="space-y-4">

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75m6.75 2.25a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Schnelle Bestellung
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Füllen Sie nur zwei Pflichtfelder aus.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-1.516-.968-2.864-2.413-3.358l-1.218-.416a2.25 2.25 0 0 0-2.656.9l-.477.716a17.9 17.9 0 0 1-5.356-5.356l.716-.477a2.25 2.25 0 0 0 .9-2.656l-.416-1.218A3.571 3.571 0 0 0 6.472 5.25H5.1a2.25 2.25 0 0 0-2.25 2.25v-.75Z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Wir melden uns bei Ihnen
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Nach Erhalt der Anfrage klären wir die Bestelldetails mit Ihnen.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </>
  )
}
