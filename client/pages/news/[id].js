import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import { readNews } from '../../lib/news'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function NewsDetail({ item }) {
  const canonicalUrl = item ? `${CANONICAL_BASE}/news/${encodeURIComponent(item.slug || item.id || item.createdAt)}` : `${CANONICAL_BASE}/news`

  if (!item) {
    return (
      <>
        <Head>
          <title>Beitrag nicht gefunden — LebensKraft</title>
          <link rel="canonical" href={canonicalUrl} />
        </Head>

        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <h1 className="text-3xl font-black text-slate-900">Beitrag nicht gefunden</h1>
            <Link href="/news" className="mt-5 inline-block rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              Zurück zu den News
            </Link>
          </div>
        </main>
      </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{item.title}</title>
        <meta name="description" content={item.excerpt || item.title} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Startseite</Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-indigo-600">News</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{item.title}</span>
        </nav>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          {item.image && (
            <img src={item.image} alt={item.title} className="h-72 w-full object-cover sm:h-96" />
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{item.title}</h1>
            {item.excerpt && <p className="mt-4 text-lg text-slate-600">{item.excerpt}</p>}
            <div className="mt-8 whitespace-pre-line text-base leading-8 text-slate-700">{item.body}</div>
          </div>
        </article>
      </main>
    </div>
    </>
  )
}

export async function getServerSideProps({ params }) {
  const items = readNews()
  const matchValue = String(params?.id || '').trim().toLowerCase()
  const item = items.find((entry) => {
    const candidates = [entry.slug, entry.id, entry.createdAt]
    return candidates.some((value) => String(value || '').trim().toLowerCase() === matchValue)
  })

  return {
    props: {
      item: item || null,
    },
  }
}
