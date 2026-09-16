import Link from 'next/link'
import Header from '../../components/Header'
import { readNews } from '../../lib/news'

export default function NewsDetail({ item }) {
  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <h1 className="text-3xl font-black text-slate-900">Новость не найдена</h1>
            <Link href="/news" className="mt-5 inline-block rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              Вернуться к новостям
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Главная</Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-indigo-600">Новости</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{item.title}</span>
        </nav>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          {item.image && (
            <img src={item.image} alt={item.title} className="h-72 w-full object-cover sm:h-96" />
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {new Date(item.createdAt).toLocaleDateString('ru-RU')}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{item.title}</h1>
            {item.excerpt && <p className="mt-4 text-lg text-slate-600">{item.excerpt}</p>}
            <div className="mt-8 whitespace-pre-line text-base leading-8 text-slate-700">{item.body}</div>
          </div>
        </article>
      </main>
    </div>
  )
}

export async function getStaticPaths() {
  const items = readNews()

  return {
    paths: items.map((item) => ({ params: { id: String(item.id || item.createdAt) } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const items = readNews()
  const item = items.find((entry) => String(entry.id || entry.createdAt) === String(params?.id))

  return {
    props: {
      item: item || null,
    },
  }
}
