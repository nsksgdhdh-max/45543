import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import {
  clearCart,
  readCart,
  removeFromCart,
  updateCartQty,
} from '../lib/cart'

export default function CartPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(readCart())
  }, [])

  const refresh = () => {
    setItems(readCart())
    window.dispatchEvent(new CustomEvent('cart:updated'))
  }

  const getPriceNumber = (price) => {
    const value = String(price || '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '')

    return Number(value) || 0
  }

  const total = items.reduce((sum, item) => {
    const price = getPriceNumber(item.price)
    const qty = Number(item.qty) || 1

    return sum + price * qty
  }, 0)

  const totalItems = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 1),
    0
  )

  const handleDecrease = (item) => {
    const id = item.product_id || item.id
    const qty = Number(item.qty) || 1

    if (qty <= 1) {
      removeFromCart(id)
    } else {
      updateCartQty(id, qty - 1)
    }

    refresh()
  }

  const handleIncrease = (item) => {
    const id = item.product_id || item.id
    const qty = Number(item.qty) || 1

    updateCartQty(id, qty + 1)
    refresh()
  }

  const handleRemove = (item) => {
    removeFromCart(item.product_id || item.id)
    refresh()
  }

  const handleClear = () => {
    clearCart()
    refresh()
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Header />

        <main className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg rounded-[2rem] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-gray-200 sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.7"
                stroke="currentColor"
                className="h-9 w-9 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835L5.03 5.25m0 0h14.72a1.125 1.125 0 0 1 1.086 1.42l-1.5 5.625a1.125 1.125 0 0 1-1.086.835H8.1a2 2 0 0 1-1.97-1.647L5.03 5.25Zm3.75 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1-3 0Z"
                />
              </svg>
            </div>

            <h1 className="mt-6 text-3xl font-black tracking-tight text-gray-900">
              Ваша корзина пуста
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Добавьте понравившиеся товары в корзину, чтобы оформить заказ.
            </p>

            <Link
              href="/categories"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Перейти в каталог
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* Заголовок */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Ваш заказ
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Корзина
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {totalItems}{' '}
              {totalItems === 1
                ? 'товар'
                : totalItems >= 2 && totalItems <= 4
                  ? 'товара'
                  : 'товаров'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673A2.25 2.25 0 0 1 15.916 21.75H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-1.914-.293m-12.542.293c.642-.097 1.285-.184 1.928-.26m7.235-.995V3.75c0-.621-.504-1.125-1.125-1.125h-3c-.621 0-1.125.504-1.125 1.125v.782m6.26 0a48.66 48.66 0 0 0-7.87 0"
              />
            </svg>

            Очистить корзину
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* ТОВАРЫ */}
          <section className="space-y-4">
            {items.map((item) => {
              const id = item.product_id || item.id
              const qty = Number(item.qty) || 1
              const price = getPriceNumber(item.price)
              const itemTotal = price * qty

              return (
                <article
                  key={id}
                  className="group rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:p-5"
                >
                  <div className="flex gap-4 sm:gap-5">

                    {/* Фото */}
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-36 sm:w-36">
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.name || 'Товар'}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-8 w-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2.25 15.75 3-3m0 0 3 3m-3-3V3.75M21.75 8.25l-3 3m0 0-3-3m3 3V20.25"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Информация */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 text-base font-bold leading-6 text-gray-900 sm:text-lg">
                          {item.name}
                        </h2>

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          aria-label="Удалить товар"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Цена */}
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">
                          Цена за 1 шт.
                        </span>

                        <div className="mt-0.5 text-lg font-bold text-gray-900">
                          {item.price || 'Цена по запросу'}
                        </div>
                      </div>

                      {/* Низ карточки */}
                      <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-end sm:justify-between">

                        {/* Количество */}
                        <div>
                          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                            Количество
                          </p>

                          <div className="flex w-fit items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                            <button
                              type="button"
                              onClick={() => handleDecrease(item)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-gray-700 transition hover:bg-white hover:shadow-sm"
                            >
                              −
                            </button>

                            <span className="flex min-w-10 items-center justify-center text-sm font-bold text-gray-900">
                              {qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleIncrease(item)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-gray-700 transition hover:bg-white hover:shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Сумма товара */}
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Сумма
                          </p>

                          <p className="mt-1 text-xl font-black text-indigo-600">
                            {itemTotal.toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>

          {/* ИТОГ */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <h2 className="text-xl font-black text-gray-900">
                Сумма заказа
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Товары
                  </span>

                  <span className="font-semibold text-gray-900">
                    {total.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Доставка
                  </span>

                  <span className="font-semibold text-emerald-600">
                    Рассчитывается при заказе
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-base font-semibold text-gray-700">
                      Итого
                    </span>

                    <span className="text-3xl font-black tracking-tight text-gray-900">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/form"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
              >
                Оформить заказ

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>

              <Link
                href="/categories"
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Продолжить покупки
              </Link>

              <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75m6.75 2.25a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Ваши товары сохранены
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Количество товаров можно изменить прямо в корзине.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
