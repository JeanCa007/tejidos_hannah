import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import { fetchOrderById } from "@/lib/orders";
import type { Order } from "@/lib/storeTypes";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  sinpe: "SINPE Móvil / Transferencia",
  contra_entrega: "Pago contra entrega",
  card: "Tarjeta",
};

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const found = await fetchOrderById(id);
      setOrder(found);
    } catch {
      setError("No pudimos cargar tu pedido. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <i className="ri-error-warning-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          Algo salió mal
        </h1>
        <p className="mt-2 max-w-sm text-sm text-foreground-600">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-refresh-line text-lg" />
          Reintentar
        </button>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-file-search-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          No encontramos este pedido
        </h1>
        <Link
          to="/tienda"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-shopping-bag-3-line" />
          Volver a la tienda
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <section className="flex flex-col items-center rounded-[2rem] border border-background-200/70 bg-background-50 p-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
          <i className="ri-checkbox-circle-line text-4xl" />
        </span>
        <h1 className="mt-5 font-heading text-3xl font-semibold text-foreground-950">
          ¡Pedido recibido!
        </h1>
        <p className="mt-2 max-w-md text-sm text-foreground-600">
          Gracias por tu compra. Te contactaremos por correo o WhatsApp para
          coordinar el pago y la entrega.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-background-100 px-4 py-1.5 text-sm font-bold text-foreground-900">
            Pedido {order.orderNumber}
          </span>
          <span className="rounded-full bg-accent-100 px-4 py-1.5 text-xs font-bold text-accent-800">
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-background-200/70 bg-background-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">
            Datos del cliente
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground-900">{order.customerName}</p>
          <p className="text-sm text-foreground-600">{order.email}</p>
          <p className="text-sm text-foreground-600">{order.phone}</p>
        </div>
        <div className="rounded-2xl border border-background-200/70 bg-background-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">
            Entrega
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground-900">{order.shippingRegion}</p>
          <p className="text-sm text-foreground-600">{order.shippingAddress}</p>
          <p className="mt-1 text-sm text-foreground-600">
            Pago: {paymentLabels[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-background-200/70 bg-background-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">
          Productos
        </p>
        <ul className="mt-3 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4">
              <span className="text-sm text-foreground-800">
                {item.name} <span className="text-foreground-400">×{item.quantity}</span>
              </span>
              <span className="text-sm font-semibold text-foreground-900">
                {formatCRC(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-background-200/70 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-foreground-600">Subtotal</dt>
            <dd className="font-semibold text-foreground-900">{formatCRC(order.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-foreground-600">Envío</dt>
            <dd className="font-semibold text-foreground-900">
              {order.shippingCost === 0 ? (
                <span className="text-secondary-600">Gratis</span>
              ) : (
                formatCRC(order.shippingCost)
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-background-200/70 pt-3">
            <dt className="font-heading text-base font-semibold text-foreground-950">Total</dt>
            <dd className="font-heading text-xl font-bold text-primary-600">
              {formatCRC(order.total)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-shopping-bag-3-line" />
          Seguir comprando
        </Link>
        <Link
          to="/mi-cuenta/pedidos"
          className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-6 py-3 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
        >
          <i className="ri-history-line" />
          Mis pedidos
        </Link>
      </div>
    </div>
  );
}