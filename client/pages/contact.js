import { useState } from 'react'
import Header from '../components/Header'

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', comment: '' })
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
        throw new Error(result?.error || 'Не удалось отправить заявку')
      }

      setForm({ name: '', phone: '', comment: '' })
      setStatus({ type: 'success', message: 'Заявка отправлена. Мы увидим её в админке.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Ошибка отправки' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Контакты</h1>
          <p className="mt-2 text-gray-600">Свяжитесь с нами, и мы ответим в ближайшее время.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Имя</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                type="text"
                placeholder="Ваше имя"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none transition focus:border-indigo-300 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Телефон</span>
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
              <span className="mb-1 block text-sm font-medium text-gray-700">Комментарий</span>
              <textarea
                value={form.comment}
                onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                rows={5}
                placeholder="Напишите, как мы можем помочь"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
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
  )
}
