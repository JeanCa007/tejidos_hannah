import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyEnrollments } from "@/lib/account";
import type { Enrollment } from "@/lib/storeTypes";
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

function EnrollmentsContent() {
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyEnrollments();
      setRows(data);
    } catch {
      setError("No pudimos cargar tus cursos. Revisa tu conexión e intenta de nuevo.");
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

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-background-200/70 bg-background-50 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-graduation-cap-line text-2xl" />
        </span>
        <p className="text-sm text-foreground-600">Aún no tienes cursos matriculados.</p>
        <Link
          to="/cursos"
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-graduation-cap-line" />
          Ver cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div
          key={row.id}
          className="rounded-[1.5rem] border border-background-200/70 bg-background-50 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                <i className="ri-graduation-cap-line text-xl" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground-950">
                  {row.courseTitle || "Curso"}
                </p>
                {row.sessionLabel && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground-500">
                    <i className="ri-calendar-line" />
                    {row.sessionLabel}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-foreground-400">
                  Matriculado el {formatDate(row.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={row.status} />
              <StatusPill status={row.paymentStatus} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyCoursesPage() {
  return (
    <div className="py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-foreground-500">
        <Link to="/mi-cuenta" className="hover:text-primary-600">
          Mi cuenta
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="font-semibold text-foreground-700">Mis cursos</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground-950">
          Mis cursos
        </h1>
        <p className="mt-1 text-sm text-foreground-600">
          Tus matrículas y los horarios de tus cursos en un solo lugar.
        </p>
      </header>

      <RequireCustomer>
        <EnrollmentsContent />
      </RequireCustomer>
    </div>
  );
}