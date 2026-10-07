import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
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

interface AppointmentRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
  date: string | null;
  time_slot: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
];

const filterOptions = [{ value: "all", label: "Todos los estados" }, ...statusOptions];

export default function AdminCitasPage() {
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<AppointmentRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });
      if (dbError) throw dbError;
      setRows((data ?? []) as AppointmentRow[]);
    } catch {
      setError("No pudimos cargar las citas. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!term) return true;
      return `${row.name ?? ""} ${row.email ?? ""} ${row.service ?? ""}`.toLowerCase().includes(term);
    });
  }, [rows, search, filter]);

  const updateStatus = async (row: AppointmentRow, value: string) => {
    await supabase.from("appointments").update({ status: value }).eq("id", row.id);
    setSelected((prev) => (prev && prev.id === row.id ? { ...prev, status: value } : prev));
    load();
  };

  return (
    <div>
      <AdminHeader
        title="Citas agendadas"
        description="Las solicitudes de clases personalizadas y asesorías."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="ri-calendar-check-line"
          title="Todavía no hay citas"
          description="Las solicitudes de la página de agenda aparecerán aquí."
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, correo o servicio..." />
            <SelectField value={filter} onChange={setFilter} options={filterOptions} />
          </div>

          <div className="space-y-3">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4"
              >
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-semibold text-foreground-900">{row.name ?? "—"}</p>
                  <p className="text-xs text-foreground-500">{row.service ?? ""}</p>
                </div>
                <div className="text-xs text-foreground-600">
                  <p className="flex items-center gap-1.5">
                    <i className="ri-calendar-line" />
                    {row.date ?? "—"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <i className="ri-time-line" />
                    {row.time_slot ?? "—"}
                  </p>
                </div>
                <div className="text-xs text-foreground-500">
                  <p>{row.email ?? ""}</p>
                  <p>{row.phone ?? ""}</p>
                </div>
                <StatusBadge status={row.status} />
                <IconButton icon="ri-edit-line" label="Gestionar" onClick={() => setSelected(row)} />
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-background-200/70 bg-background-50 p-6 text-center text-sm text-foreground-500">
                No hay citas con ese filtro.
              </p>
            )}
          </div>
        </>
      )}

      <Modal open={Boolean(selected)} title="Gestionar cita" onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-background-100 p-4 text-sm">
              <p className="font-semibold text-foreground-900">{selected.name ?? "—"}</p>
              <p className="text-foreground-600">{selected.email ?? ""}</p>
              <p className="text-foreground-600">{selected.phone ?? ""}</p>
              <p className="mt-2 text-foreground-500">{selected.service ?? ""}</p>
              <p className="text-foreground-500">
                {selected.date ?? "—"} · {selected.time_slot ?? "—"}
              </p>
              {selected.notes && (
                <p className="mt-2 rounded-xl bg-background-50 p-3 text-xs text-foreground-600">{selected.notes}</p>
              )}
            </div>

            <SelectField
              label="Estado de la cita"
              value={selected.status}
              onChange={(value) => updateStatus(selected, value)}
              options={statusOptions}
            />

            <div className="flex justify-end">
              <GhostButton onClick={() => setSelected(null)}>Cerrar</GhostButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}