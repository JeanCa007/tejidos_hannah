import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCRC } from "@/lib/format";
import Modal from "@/pages/admin/components/Modal";
import {
  AdminHeader,
  ErrorBanner,
  EmptyState,
  LoadingRows,
  SearchInput,
  SelectField,
  StatusBadge,
  GhostButton,
  IconButton,
} from "@/pages/admin/components/ui";

interface OrderItemRow {
  id: string;
  product_id: string | null;
  name: string | null;
  price: number;
  quantity: number;
}

interface OrderRow {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  shipping_address: string | null;
  shipping_region: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const paymentOptions = [
  { value: "unpaid", label: "Sin pagar" },
  { value: "paid", label: "Pagado" },
  { value: "refunded", label: "Reembolsado" },
];

const filterStatuses = [{ value: "all", label: "Todos los estados" }, ...statusOptions];

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (dbError) throw dbError;
      const rows = (data ?? []) as OrderRow[];
      setOrders(rows);

      if (rows.length > 0) {
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", rows.map((row) => row.id));
        setItems((itemRows ?? []) as OrderItemRow[]);
      } else {
        setItems([]);
      }
    } catch {
      setError("No pudimos cargar los pedidos. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!term) return true;
      return `${order.order_number ?? ""} ${order.customer_name ?? ""} ${order.email ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [orders, search, filter]);

  const itemsFor = (orderId: string) => items.filter((item) => (item as unknown as { order_id: string }).order_id === orderId);

  const updateField = async (
    order: OrderRow,
    field: "status" | "payment_status",
    value: string
  ) => {
    await supabase.from("orders").update({ [field]: value }).eq("id", order.id);
    setSelected((prev) => (prev && prev.id === order.id ? { ...prev, [field]: value } : prev));
    load();
  };

  return (
    <div>
      <AdminHeader
        title="Pedidos"
        description="Revisa las compras de tus clientas y actualiza su estado."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="ri-shopping-cart-2-line"
          title="Todavía no hay pedidos"
          description="Cuando alguien compre en la tienda, su pedido aparecerá aquí."
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número, cliente o correo..." />
            <SelectField value={filter} onChange={setFilter} options={filterStatuses} />
          </div>

          <div className="space-y-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelected(order)}
                className="flex w-full flex-wrap items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4 text-left transition-colors hover:bg-background-100"
              >
                <div className="min-w-32">
                  <p className="text-sm font-bold text-foreground-900">
                    {order.order_number ?? order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-foreground-500">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground-800">{order.customer_name ?? "—"}</p>
                  <p className="text-xs text-foreground-500">{order.email ?? ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.payment_status} />
                </div>
                <div className="w-24 text-right text-sm font-bold text-primary-600">
                  {formatCRC(order.total)}
                </div>
                <IconButton icon="ri-arrow-right-s-line" label="Ver detalle" onClick={() => setSelected(order)} />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-background-200/70 bg-background-50 p-6 text-center text-sm text-foreground-500">
                No hay pedidos con ese filtro.
              </p>
            )}
          </div>
        </>
      )}

      <Modal open={Boolean(selected)} title="Detalle del pedido" onClose={() => setSelected(null)} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-background-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Cliente</p>
                <p className="mt-1 text-sm font-semibold text-foreground-900">{selected.customer_name ?? "—"}</p>
                <p className="text-sm text-foreground-600">{selected.email ?? ""}</p>
                <p className="text-sm text-foreground-600">{selected.phone ?? ""}</p>
              </div>
              <div className="rounded-2xl bg-background-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Envío</p>
                <p className="mt-1 text-sm text-foreground-600">{selected.shipping_address ?? "—"}</p>
                <p className="text-sm text-foreground-600">{selected.shipping_region ?? ""}</p>
                <p className="mt-1 text-sm text-foreground-600">
                  Pago: {selected.payment_method ?? "—"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Productos</p>
              <div className="mt-2 space-y-2">
                {itemsFor(selected.id).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-background-200/70 bg-background-50 px-4 py-3"
                  >
                    <span className="text-sm text-foreground-800">
                      {item.name ?? "Producto"} <span className="text-foreground-400">x{item.quantity}</span>
                    </span>
                    <span className="text-sm font-semibold text-foreground-900">
                      {formatCRC(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                {itemsFor(selected.id).length === 0 && (
                  <p className="text-sm text-foreground-500">Este pedido no tiene productos registrados.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-background-100 p-4 text-sm">
              <div className="flex justify-between text-foreground-600">
                <span>Subtotal</span>
                <span>{formatCRC(selected.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between text-foreground-600">
                <span>Envío</span>
                <span>{formatCRC(selected.shipping_cost)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-background-200/70 pt-2 text-base font-bold text-foreground-950">
                <span>Total</span>
                <span>{formatCRC(selected.total)}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Estado del pedido"
                value={selected.status}
                onChange={(value) => updateField(selected, "status", value)}
                options={statusOptions}
              />
              <SelectField
                label="Estado del pago"
                value={selected.payment_status}
                onChange={(value) => updateField(selected, "payment_status", value)}
                options={paymentOptions}
              />
            </div>

            <div className="flex justify-end">
              <GhostButton onClick={() => setSelected(null)}>Cerrar</GhostButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}