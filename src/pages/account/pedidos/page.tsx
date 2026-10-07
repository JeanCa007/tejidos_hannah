import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "@/lib/account";
import { formatCRC } from "@/lib/format";
import type { Order } from "@/lib/storeTypes";
import RequireCustomer from "@/pages/account/components/RequireCustomer";
import StatusPill from "@/pages/account/components/StatusPill";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch {
      setError("No pudimos cargar tus pedidos. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-background-200/70 bg-background-50 p-10 text-center">
        <i className="ri-error-warning-line text-3xl text-primary-500" />
        <p className="max-w-sm text-sm text-foreground-600">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-refresh-line" />
          Reintentar
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-background-200/70 bg-background-50 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-shopping-bag-3-line text-2xl" />
        </span>
        <p className="text-sm text-foreground-600">Todavía no tienes pedidos.</p>
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-shopping-bag-3-line" />
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-[1.5rem] border border-background-200/70 bg-background-50 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-foreground-950">
                {order.orderNumber || order.id.slice(0, 8)}
              </p>
              <p className="text-xs text-foreground-500">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={order.status} />
              <StatusPill status={order.paymentStatus} />
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 text-sm text-foreground-600"
              >
                <span>
                  {item.name}
                  <span className="text-foreground-400"> ×{item.quantity}</span>
                </span>
                <span className="font-semibold text-foreground-800">
                  {formatCRC(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-background-200/70 pt-4">
            <span className="text-sm text-foreground-600">Total</span>
            <span className="font-heading text-lg font-bold text-primary-600">
              {formatCRC(order.total)}
            </span>
          </div>

          <Link
            to={`/pedido/${order.id}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Ver detalle del pedido
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <div className="py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-foreground-500">
        <Link to="/mi-cuenta" className="hover:text-primary-600">
          Mi cuenta
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="font-semibold text-foreground-700">Mis pedidos</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground-950">
          Mis pedidos
        </h1>
        <p className="mt-1 text-sm text-foreground-600">
          El historial de tus compras y su estado.
        </p>
      </header>

      <RequireCustomer>
        <OrdersContent />
      </RequireCustomer>
    </div>
  );
}