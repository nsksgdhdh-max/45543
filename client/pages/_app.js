import Head from 'next/head'
import Footer from '../components/Footer'
import { buildWebsiteSchema } from '../lib/schema'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  const websiteSchema = buildWebsiteSchema()

  return (
    <>
      <Head>
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="googlebot" content="index,follow,max-image-preview:large" />
        <meta name="geo.region" content="DE-BE" />
        <meta name="geo.placename" content="Berlin, Germany" />
        <meta name="geo.position" content="52.520008;13.404954" />
        <meta name="ICBM" content="52.520008, 13.404954" />
        <meta name="language" content="de-DE" />
        <meta name="content-language" content="de-DE" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Component {...pageProps} />
          </div>
          <Footer />
        </div>
      </div>
    </>
  )
}
