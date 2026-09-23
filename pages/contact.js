import Head from 'next/head'
import { useState } from 'react'
import Header from '../components/Header'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', comment: '' })
  const canonicalUrl = `${CANONICAL_BASE}/contact`
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Anfrage konnte nicht gesendet werden')
      }

      setForm({ name: '', phone: '', comment: '' })
      setStatus({ type: 'success', message: 'Ihre Anfrage wurde gesendet. Wir prüfen sie im Adminbereich.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Fehler beim Senden' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Kontakt — LebensKraft</title>
        <meta name="description" content="Kontaktieren Sie LebensKraft für Beratung zu Produkten, Bestellungen und Lieferfragen in Deutschland." />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Kontakt</h1>
          <p className="mt-2 text-gray-600">Kontaktieren Sie uns; wir antworten Ihnen so schnell wie möglich.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                type="text"
                placeholder="Ihr Name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none transition focus:border-indigo-300 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Telefon</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                placeholder="+49 ..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none transition focus:border-indigo-300 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Kommentar</span>
              <textarea
                value={form.comment}
                onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                rows={5}
                placeholder="Schreiben Sie uns, wie wir helfen können"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {loading ? 'Wird gesendet...' : 'Anfrage senden'}
            </button>
          </form>

          {status.message && (
            <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {status.message}
            </p>
          )}
        </div>
      </main>
    </div>
    </>
  )
}
