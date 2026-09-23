import Head from 'next/head'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { addToCartAndGo } from '../lib/cart'
import { buildProductUrl, resolveProductImage } from '../lib/product'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function OffersPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setData({ error: String(e) }))
  }, [])

  function priceForDE(offer) {
    const t = offer.target || []
    const de = t.find((x) => (x.code || '').toUpperCase() === 'DE' || (String(x.geo_name || '').toLowerCase().includes('герм')))
    if (de) return `${de.price || ''} ${de.currency || ''}`
    return ''
  }

  const canonicalUrl = `${CANONICAL_BASE}/offers`

  return (
    <>
      <Head>
        <title>Offers — LebensKraft</title>
        <meta name="description" content="Aktuelle Angebote und Produkte bei LebensKraft für Deutschland." />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div>
        <Header />
      <main className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Nutra-Angebote — Deutschland (ohne Landingpage)</h1>

        {!data && <p>Lädt...</p>}
        {data && data.error && <p className="error">Fehler: {data.error}</p>}

        {data && !data.error && (
          <>
            <p className="mt-2 text-sm text-gray-600">Gefunden: {data.count}</p>

            {/* category filters */}
            <div style={{marginTop:10,marginBottom:10}}>
              {['all', ...Array.from(new Set((data.offers||[]).map((x)=>x.category || 'other')))].map((c) => (
                <button key={c} onClick={() => setCategory(c)} style={{marginRight:8, padding:'6px 10px', background: category===c? 'var(--accent)' : '#f3f3f3', color: category===c? '#fff' : '#333', borderRadius:6, border:'none'}}>
                  {c === 'all' ? 'Alle' : c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {data.offers.filter(o => category === 'all' || (o.category || 'other') === category).map((o) => (
                <div
                  key={o.id || o.product_id}
                  onClick={() => router.push(buildProductUrl(o))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      router.push(buildProductUrl(o))
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="bg-white border rounded-lg overflow-hidden flex flex-col cursor-pointer"
                >
                  <div className="h-40 flex items-center justify-center bg-gray-50">
                    <img
                      loading="lazy"
                      src={resolveProductImage(o.img)}
                      alt={o.name}
                      className="max-w-full max-h-36 object-contain"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/img/placeholder.svg'
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold">{o.name}</h3>
                    <div className="text-xs text-gray-500 mb-2">{o.category}</div>
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="text-lg font-bold text-indigo-600">{priceForDE(o)}</div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            addToCartAndGo({ ...o, price: priceForDE(o), displayPrice: priceForDE(o) })
                          }}
                          className="flex-1 rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                          In den Warenkorb
                        </button>
                        <Link href={buildProductUrl(o)} className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={(event) => event.stopPropagation()}>Mehr erfahren</Link>
                      </div>
                      <Link href={{ pathname: '/form', query: { product_id: o.product_id, partner_id: o.partner_id || 'metacpa_default', name: o.name, price: priceForDE(o), img: o.img } }} className="rounded-full bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800" onClick={(event) => event.stopPropagation()}>Kaufen</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
    </>
  )
}
