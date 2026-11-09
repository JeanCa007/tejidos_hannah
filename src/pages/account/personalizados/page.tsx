import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyCustomOrders, type CustomOrder } from "@/lib/customOrders";
import RequireCustomer from "@/pages/account/components/RequireCustomer";
import CustomOrderCard from "@/pages/account/components/CustomOrderCard";

function MyCustomOrdersContent() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyCustomOrders();
      setOrders(data);
    } catch {
      setError("No pudimos cargar tus solicitudes. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccepted = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: "accepted" } : order))
    );
  }, []);

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
          <i className="ri-hand-heart-line text-2xl" />
        </span>
        <p className="max-w-sm text-sm text-foreground-600">
          Todavía no tienes pedidos personalizados. ¿Te imaginas una pieza hecha solo para ti?
        </p>
        <Link
          to="/pedido-personalizado"
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-edit-line" />
          Cotizar una pieza
        </Link>
      </div>
    );
  }

  const pending = orders.filter((order) => order.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl bg-background-100 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700">
          <i className="ri-hand-heart-line" />
        </span>
        <p className="text-xs text-foreground-600">
          {pending > 0
            ? `${pending} solicitud(es) esperando cotización del taller.`
            : "Todas tus solicitudes están al día."}
        </p>
      </div>

      {orders.map((order) => (
        <CustomOrderCard key={order.id} order={order} onAccepted={handleAccepted} />
      ))}

      <Link
        to="/pedido-personalizado"
        className="flex items-center justify-center gap-2 rounded-full border border-background-300 bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
      >
        <i className="ri-add-line text-lg" />
        Solicitar otra pieza personalizada
      </Link>
    </div>
  );
}

export default function MyCustomOrdersPage() {
  return (
    <div className="py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-foreground-500">
        <Link to="/mi-cuenta" className="hover:text-primary-600">
          Mi cuenta
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="font-semibold text-foreground-700">Mis personalizados</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground-950">
          Mis pedidos personalizados
        </h1>
        <p className="mt-1 text-sm text-foreground-600">
          Sigue el estado de tu cotización paso a paso.
        </p>
      </header>

      <RequireCustomer>
        <MyCustomOrdersContent />
      </RequireCustomer>
    </div>
  );
}