import Footer from '../components/Footer'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
    </div>
  )
}
