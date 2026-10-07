import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface StatCard {
  label: string;
  icon: string;
  value: number;
  to: string;
  accent: "primary" | "accent" | "secondary";
}

const accentClasses: Record<StatCard["accent"], string> = {
  primary: "bg-primary-100 text-primary-700",
  accent: "bg-accent-100 text-accent-700",
  secondary: "bg-secondary-100 text-secondary-700",
};

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        products,
        orders,
        courses,
        enrollments,
        appointments,
        patterns,
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("patterns").select("*", { count: "exact", head: true }),
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

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
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