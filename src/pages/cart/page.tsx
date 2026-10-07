import { Link } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import CartItemRow from "./components/CartItemRow";

export default function CartPage() {
  const { items, count, subtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <i className="ri-shopping-cart-2-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 max-w-sm text-sm text-foreground-600">
          Explora nuestra tienda y descubre las piezas tejidas a mano que
          tenemos para ti.
        </p>
        <Link
          to="/tienda"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-shopping-bag-3-line text-lg" />
          Ir a la tienda
        </Link>
      </section>
    );
  }

  return (
    <div>
      <header className="flex items-end justify-between gap-4 pb-6 pt-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
            Tus productos
          </span>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
            Carrito
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 rounded-full border border-background-200 px-3.5 py-2 text-xs font-semibold text-foreground-600 transition-colors hover:bg-background-100"
        >
          <i className="ri-delete-bin-6-line" />
          Vaciar
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItemRow key={item.key} item={item} />
          ))}

          <Link
            to="/tienda"
            className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <i className="ri-arrow-left-line" />
            Seguir comprando
          </Link>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-background-200/70 bg-background-100 p-6">
            <h2 className="font-heading text-xl font-semibold text-foreground-950">
              Resumen del pedido
            </h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-foreground-600">
                  Subtotal ({count} {count === 1 ? "artículo" : "artículos"})
                </dt>
                <dd className="font-semibold text-foreground-900">
                  {formatCRC(subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-foreground-600">Envío</dt>
                <dd className="text-xs font-semibold text-secondary-700">
                  Se calcula al finalizar
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-background-200/70 pt-5">
              <span className="font-heading text-lg font-semibold text-foreground-950">
                Total
              </span>
              <span className="font-heading text-2xl font-bold text-primary-600">
                {formatCRC(subtotal)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-4 text-sm font-bold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-lock-2-line text-lg" />
              Finalizar compra
            </Link>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground-500">
              <i className="ri-shield-check-line" />
              Pago seguro · tarjeta o SINPE Móvil
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}