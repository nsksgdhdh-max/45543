import Link from 'next/link'
import Header from '../components/Header'
import { readNews } from '../lib/news'

export default function News({ items }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">News</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Новости и обновления</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            Пока нет новостей.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Link href={`/news/${encodeURIComponent(item.id || item.createdAt)}`} key={item.id || item.createdAt} className="group block overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-slate-100 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    News
                  </div>
                )}

                <div className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">{item.title}</h2>
                  {item.excerpt && <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>}
                  <div className="mt-4 text-sm font-semibold text-indigo-600">Читать полностью →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export async function getStaticProps() {
  return {
    props: {
      items: readNews(),
    },
  }
}
