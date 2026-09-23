import Head from 'next/head'
import fs from 'fs'
import path from 'path'
import Header from '../components/Header'
import Link from 'next/link'

const CANONICAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function SpecialOffers({ products }) {
  const canonicalUrl = `${CANONICAL_BASE}/special-offers`

  return (
    <>
      <Head>
        <title>Ausgewählte Produkte — LebensKraft</title>
        <meta name="description" content="Ausgewählte Produkte und Empfehlungen von LebensKraft." />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div>
        <Header />
      <main className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Ausgewählte Produkte</h1>
        <p className="text-sm text-gray-600 mt-1">Geladen: {products.length}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {products.map((o) => (
            <div key={o.product_id || o.id} className="bg-white border rounded-lg overflow-hidden flex flex-col">
              <div className="h-40 flex items-center justify-center bg-gray-50">
                <img loading="lazy" src={o.img || ''} alt={o.name || ''} className="max-w-full max-h-36 object-contain" onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/260x160?text=${encodeURIComponent(o.category||o.name||'item')}` }} />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold">{o.name}</h3>
                <div className="text-sm text-gray-600 flex-1">{o.info || o.description}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold text-indigo-600">{(o.price || o.cost) ? `${o.price || o.cost} ${o.currency || ''}` : ''}</div>
                  <Link href={{ pathname: '/form', query: { product_id: o.product_id || o.id, partner_id: o.partner_id || 'metacpa_default', name: o.name, price: o.price || o.cost, img: o.img } }} className="bg-indigo-600 text-white px-4 py-2 rounded">Kaufen</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
    </>
  )
}

export async function getServerSideProps() {
  const file = path.join(process.cwd(), 'data', 'specific_products.json');
  let products = [];
  try {
    const raw = fs.readFileSync(file, 'utf8');
    products = JSON.parse(raw || '[]');
  } catch (e) {
    products = [];
  }
  return { props: { products } };
}
