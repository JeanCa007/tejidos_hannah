import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  customOrderStatusLabel,
  customOrderStatusTones,
  daysUntil,
  formatNeededBy,
  pieceLabel,
} from "@/lib/customOrders";

interface StatCard {
  label: string;
  icon: string;
  value: number;
  to: string;
  accent: "primary" | "accent" | "secondary";
}

interface UpcomingOrder {
  id: string;
  customerName: string;
  pieceType: string;
  neededBy: string;
  status: string;
}

const accentClasses: Record<StatCard["accent"], string> = {
  primary: "bg-primary-100 text-primary-700",
  accent: "bg-accent-100 text-accent-700",
  secondary: "bg-secondary-100 text-secondary-700",
};

function deliveryBadge(days: number | null): { label: string; tone: string } {
  if (days == null) {
    return { label: "Pedir fecha", tone: "bg-accent-100 text-accent-900" };
  }
  if (days < 0) {
    return {
      label: `${Math.abs(days)} d atrasada`,
      tone: "bg-primary-500 text-background-50",
    };
  }
  if (days === 0) {
    return { label: "Hoy", tone: "bg-accent-500 text-background-50" };
  }
  if (days <= 3) {
    return { label: `En ${days} d`, tone: "bg-accent-100 text-accent-900" };
  }
  return { label: `En ${days} d`, tone: "bg-background-100 text-foreground-600" };
}

function dateBadge(value: string): { day: string; month: string } {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "" };
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString("es-CR", { month: "short" }).replace(".", ""),
  };
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [pendingCustom, setPendingCustom] = useState(0);
  const [upcoming, setUpcoming] = useState<UpcomingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        products,
        orders,
        customPending,
        courses,
        enrollments,
        appointments,
        patterns,
        upcomingCustom,
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("custom_orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("patterns").select("*", { count: "exact", head: true }),
        supabase
          .from("custom_orders")
          .select("id, customer_name, piece_type, needed_by, status")
          .in("status", ["pending", "quoted", "accepted", "in_progress"])
          .order("needed_by", { ascending: true, nullsFirst: false })
          .limit(6),
      ]);

      const firstError = [
        products,
        orders,
        courses,
        enrollments,
        appointments,
        patterns,
      ].find((result) => result.error);
      if (firstError?.error) throw firstError.error;

      setPendingCustom(customPending.count ?? 0);

      const upcomingRows = (upcomingCustom.data ?? []) as unknown as Array<
        Record<string, unknown>
      >;
      setUpcoming(
        upcomingRows.map((row) => ({
          id: String(row.id),
          customerName: String(row.customer_name ?? ""),
          pieceType: String(row.piece_type ?? ""),
          neededBy: row.needed_by ? String(row.needed_by) : "",
          status: String(row.status ?? "pending"),
        }))
      );

      setStats([
        {
          label: "Productos",
          icon: "ri-shopping-bag-3-line",
          value: products.count ?? 0,
          to: "/admin/productos",
          accent: "primary",
        },
        {
          label: "Pedidos",
          icon: "ri-shopping-cart-2-line",
          value: orders.count ?? 0,
          to: "/admin/pedidos",
          accent: "accent",
        },
        {
          label: "Por cotizar",
          icon: "ri-hand-heart-line",
          value: customPending.count ?? 0,
          to: "/admin/personalizados",
          accent: "accent",
        },
        {
          label: "Matrículas",
          icon: "ri-bookmark-3-line",
          value: enrollments.count ?? 0,
          to: "/admin/matriculas",
          accent: "secondary",
        },
        {
          label: "Citas agendadas",
          icon: "ri-calendar-check-line",
          value: appointments.count ?? 0,
          to: "/admin/citas",
          accent: "accent",
        },
        {
          label: "Cursos",
          icon: "ri-graduation-cap-line",
          value: courses.count ?? 0,
          to: "/admin/cursos",
          accent: "secondary",
        },
        {
          label: "Patrones",
          icon: "ri-file-text-line",
          value: patterns.count ?? 0,
          to: "/admin/patrones",
          accent: "primary",
        },
      ]);
    } catch {
      setError("No pudimos cargar el resumen. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <header className="pb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
          Tu negocio de un vistazo
        </span>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
          Hola, {profile?.full_name || "administradora"}
        </h1>
        <p className="mt-1 text-sm text-foreground-500">
          Este es el resumen general de Tejidos Hannah.
        </p>
      </header>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-primary-100 px-5 py-4 text-sm font-medium text-primary-800">
          <span className="flex items-center gap-2">
            <i className="ri-error-warning-line" />
            {error}
          </span>
          <button
            type="button"
            onClick={load}
            className="shrink-0 rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-background-50 hover:bg-primary-600"
          >
            Reintentar
          </button>
        </div>
      )}

      {pendingCustom > 0 && (
        <Link
          to="/admin/personalizados"
          className="mb-5 flex items-center gap-4 rounded-2xl bg-primary-500 p-5 text-background-50 transition-colors hover:bg-primary-600"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background-50/20">
            <i className="ri-hand-heart-line text-xl" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">
              {pendingCustom} solicitud(es) esperando cotización
            </span>
            <span className="block text-xs text-background-50/80">
              Abre los pedidos personalizados y envía el precio a tu clienta.
            </span>
          </span>
          <i className="ri-arrow-right-line text-xl" />
        </Link>
      )}

      {!loading && upcoming.length > 0 && (
        <section className="mb-5 rounded-[2rem] border border-background-200/70 bg-background-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className="ri-calendar-schedule-line" />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground-950">
                  Entregas próximas
                </h2>
                <p className="text-[11px] text-foreground-500">
                  Por fecha de entrega · incluye las que aún no tienen fecha
                </p>
              </div>
            </div>
            <Link
              to="/admin/personalizados"
              className="shrink-0 text-xs font-bold text-primary-700 transition-colors hover:text-primary-600"
            >
              Ver todas
            </Link>
          </div>

          <ul className="mt-4 space-y-2.5">
            {upcoming.map((item) => {
              const days = daysUntil(item.neededBy);
              const badge = deliveryBadge(days);
              const date = dateBadge(item.neededBy);
              const tone =
                customOrderStatusTones[item.status] ?? "bg-background-100 text-foreground-600";
              return (
                <li key={item.id}>
                  <Link
                    to="/admin/personalizados"
                    className="flex items-center gap-3 rounded-2xl bg-background-100 px-3 py-2.5 transition-colors hover:bg-background-200/60"
                  >
                    {item.neededBy ? (
                      <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-background-50 leading-none">
                        <span className="text-base font-bold text-foreground-950">
                          {date.day}
                        </span>
                        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-foreground-500">
                          {date.month}
                        </span>
                      </span>
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                        <i className="ri-calendar-2-line" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground-900">
                        {pieceLabel(item.pieceType)}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-[11px] text-foreground-500">
                          {item.customerName || "Sin nombre"}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tone}`}
                        >
                          {customOrderStatusLabel(item.status)}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.tone}`}
                    >
                      {badge.label}
                    </span>
                  </Link>
                  <span className="sr-only">{formatNeededBy(item.neededBy)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-background-200/70 bg-background-50"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className="flex items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-5 transition-colors hover:bg-background-100"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${accentClasses[stat.accent]}`}
              >
                <i className={`${stat.icon} text-xl`} />
              </span>
              <span>
                <span className="block text-2xl font-bold text-foreground-950">
                  {stat.value}
                </span>
                <span className="block text-xs font-semibold text-foreground-500">
                  {stat.label}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground-950">
            Qué sigue
          </h2>
          <ul className="mt-3 space-y-3 text-sm text-foreground-600">
            <li className="flex items-start gap-3">
              <i className="ri-shopping-bag-3-line mt-0.5 text-primary-600" />
              Conectar la tienda y el inventario a la base de datos.
            </li>
            <li className="flex items-start gap-3">
              <i className="ri-truck-line mt-0.5 text-primary-600" />
              Configurar las zonas y costos de envío.
            </li>
            <li className="flex items-start gap-3">
              <i className="ri-secure-payment-line mt-0.5 text-primary-600" />
              Habilitar el checkout y los pagos.
            </li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-background-200/70 bg-background-100 p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground-950">
            Estado del sistema
          </h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-foreground-600">Base de datos</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-800">
                <i className="ri-checkbox-circle-fill" />
                Conectada
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-foreground-600">Acceso y roles</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-800">
                <i className="ri-checkbox-circle-fill" />
                Activos
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-foreground-600">Pagina pública</span>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-3 py-1 text-xs font-bold text-foreground-700"
              >
                <i className="ri-external-link-line" />
                Ver tienda
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}