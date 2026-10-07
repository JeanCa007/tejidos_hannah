import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AdminHeader,
  ErrorBanner,
  EmptyState,
  LoadingRows,
  SearchInput,
} from "@/pages/admin/components/ui";

interface CustomerRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminClientesPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (dbError) throw dbError;
      setRows((data ?? []) as CustomerRow[]);
    } catch {
      setError("No pudimos cargar los clientes. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      `${row.full_name ?? ""} ${row.email ?? ""}`.toLowerCase().includes(term)
    );
  }, [rows, search]);

  return (
    <div>
      <AdminHeader
        title="Clientes"
        description="Las personas registradas en tu tienda."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="ri-user-3-line"
          title="Todavía no hay clientes"
          description="Cuando alguien cree una cuenta, aparecerá aquí."
        />
      ) : (
        <>
          <div className="mb-4 max-w-md">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o correo..." />
          </div>

          <div className="overflow-hidden rounded-2xl border border-background-200/70 bg-background-50">
            {filtered.map((row, index) => (
              <div
                key={row.id}
                className={`flex flex-wrap items-center gap-4 px-4 py-4 ${
                  index > 0 ? "border-t border-background-200/70" : ""
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-background-50">
                  {(row.full_name || row.email || "C").charAt(0).toUpperCase()}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground-900">
                    {row.full_name || "Cliente"}
                  </p>
                  <p className="text-xs text-foreground-500">{row.email ?? ""}</p>
                </div>
                <p className="text-xs text-foreground-500">{row.phone ?? ""}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    row.role === "admin"
                      ? "bg-foreground-900 text-background-50"
                      : "bg-secondary-100 text-secondary-800"
                  }`}
                >
                  {row.role === "admin" ? "Administradora" : "Cliente"}
                </span>
                <span className="text-xs text-foreground-400">{formatDate(row.created_at)}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="p-6 text-center text-sm text-foreground-500">
                No hay clientes con esa búsqueda.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}