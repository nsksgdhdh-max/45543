import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.5 3 6 5.2 6 9a6 6 0 1 1-12 0c0-3.8 3.5-6 6-9Z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Lebens<span className="text-indigo-400">Kraft</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Здоровье, красота и уверенность в каждом выборе — каталог проверенных товаров для Германии с удобной покупкой и быстрыми заявками.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Навигация</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link href="/categories" className="transition hover:text-white">Категории</Link></li>
              <li><Link href="/offers" className="transition hover:text-white">Офферы</Link></li>
              <li><Link href="/about" className="transition hover:text-white">О нас</Link></li>
              <li><Link href="/delivery" className="transition hover:text-white">Доставка</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Помощь</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link href="/warranty" className="transition hover:text-white">Гарантия</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Контакты</Link></li>
              <li><Link href="/cart" className="transition hover:text-white">Корзина</Link></li>
              <li><Link href="/form" className="transition hover:text-white">Заявка</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Контакты</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>support@lebenskraft.de</li>
              <li>+49 30 000 00 00</li>
              <li>Германия, Берлин</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LebensKraft. Все права защищены.</p>
          <p>Натуральные продукты для вашего здоровья</p>
        </div>
      </div>
    </footer>
  )
}
