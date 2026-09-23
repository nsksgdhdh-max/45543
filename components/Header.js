
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCartCount } from '../lib/cart'

export default function Header() {
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleMobileNavClick = (href) => {
    setMobileMenu(false)

    if (router.asPath !== href) {
      router.push(href)
    }
  }

  useEffect(() => {
    const updateCart = () => {
      setCartCount(getCartCount())
    }

    updateCart()

    window.addEventListener('storage', updateCart)
    window.addEventListener('cart:updated', updateCart)

    return () => {
      window.removeEventListener('storage', updateCart)
      window.removeEventListener('cart:updated', updateCart)
    }
  }, [])

  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        setMobileMenu(false)
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('hashChangeStart', handleRouteChangeStart)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('hashChangeStart', handleRouteChangeStart)
    }
  }, [router.events])

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

         {/* LOGO */}
         <Link
           href="/"
           className="flex shrink-0 items-center gap-2"
         >
           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
             <svg
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24"
               strokeWidth="2"
               stroke="currentColor"
               className="h-5 w-5"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 d="M12 3c2.5 3 6 5.2 6 9a6 6 0 1 1-12 0c0-3.8 3.5-6 6-9Z"
               />
             </svg>
           </div>

           <span className="text-xl font-black tracking-tight text-gray-900">
             Lebens<span className="text-indigo-600">Kraft</span>
           </span>
         </Link>

         {/* DESKTOP NAVIGATION */}
         <div className="hidden items-center gap-1 lg:flex">
           <Link
             href="/"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             Startseite
           </Link>

           <Link
             href="/categories"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             Kategorien
           </Link>

           <Link
             href="/news"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             News
           </Link>

           <Link
             href="/about"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             Über uns
           </Link>

           <Link
             href="/delivery"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             Lieferung
           </Link>

           <Link
             href="/warranty"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             Garantie
           </Link>

           <Link
             href="/contact"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             Kontakte
           </Link>

           <Link
             href="/impressum"
             className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
           >
             Impressum
           </Link>
         </div>

         {/* RIGHT SIDE */}
         <div className="flex items-center gap-2">

           {/* CART */}
           <Link
             href="/cart"
             aria-label={`Warenkorb, Artikel: ${cartCount}`}
             className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
           >
  {/* Иконка корзины */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.8"
    stroke="currentColor"
    className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835L5.03 5.25m0 0h14.72a1.125 1.125 0 0 1 1.086 1.42l-1.5 5.625a1.125 1.125 0 0 1-1.086.835H8.1a2 2 0 0 1-1.97-1.647L5.03 5.25Zm0 0L4.5 11.25m3.75 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    />
  </svg>

  {/* Количество */}
  {cartCount > 0 && (
    <span
      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white"
    >
      {cartCount > 99 ? '99+' : cartCount}
    </span>
  )}
</Link>



            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Menü öffnen"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 lg:hidden"
            >
              {mobileMenu ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenu && (
          <div className="border-t border-gray-100 py-4 lg:hidden">
            <div className="flex flex-col gap-1">

              <button
                type="button"
                onClick={() => handleMobileNavClick('/')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Startseite
              </button>

              <button
                type="button"
                onClick={() => handleMobileNavClick('/categories')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Kategorien
              </button>

              <button
                type="button"
                onClick={() => handleMobileNavClick('/news')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                News
              </button>

              <button
                type="button"
                onClick={() => handleMobileNavClick('/about')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Über uns
              </button>

              <button
                type="button"
                onClick={() => handleMobileNavClick('/delivery')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Lieferung
              </button>

              <button
                type="button"
                onClick={() => handleMobileNavClick('/warranty')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Garantie
              </button>

              <button
                type="button"
                onClick={() => handleMobileNavClick('/contact')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Kontakte
              </button>

              <button
                type="button"
                onClick={() => handleMobileNavClick('/impressum')}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Impressum
              </button>
 
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
