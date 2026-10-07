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

interface EnrollmentRow {
  id: string;
  course_id: string | null;
  session_id: string | null;
  student_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  payment_status: string;
  created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
];

const paymentOptions = [
  { value: "unpaid", label: "Sin pagar" },
  { value: "paid", label: "Pagado" },
];

const filterOptions = [{ value: "all", label: "Todos los estados" }, ...statusOptions];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminMatriculasPage() {
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [courseMap, setCourseMap] = useState<Map<string, string>>(new Map());
  const [sessionMap, setSessionMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<EnrollmentRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [enrollRes, coursesRes, sessionsRes] = await Promise.all([
        supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
        supabase.from("courses").select("id, title"),
        supabase.from("course_sessions").select("id, label"),
      ]);
      if (enrollRes.error) throw enrollRes.error;
      setRows((enrollRes.data ?? []) as EnrollmentRow[]);

      const courseNames = new Map<string, string>();
      (coursesRes.data ?? []).forEach((row) => {
        courseNames.set(String((row as { id: string }).id), String((row as { title: string }).title));
      });
      setCourseMap(courseNames);

      const sessionNames = new Map<string, string>();
      (sessionsRes.data ?? []).forEach((row) => {
        sessionNames.set(String((row as { id: string }).id), String((row as { label: string }).label ?? ""));
      });
      setSessionMap(sessionNames);
    } catch {
      setError("No pudimos cargar las matrículas. Revisa tu conexión e intenta de nuevo.");
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
      return `${row.student_name ?? ""} ${row.email ?? ""}`.toLowerCase().includes(term);
    });
  }, [rows, search, filter]);

  const updateStatus = async (row: EnrollmentRow, field: "status" | "payment_status", value: string) => {
    await supabase.from("enrollments").update({ [field]: value }).eq("id", row.id);
    setSelected((prev) => (prev && prev.id === row.id ? { ...prev, [field]: value } : prev));
    load();
  };

  return (
    <div>
      <AdminHeader
        title="Matrículas"
        description="Las inscripciones a tus cursos, con su horario elegido."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="ri-bookmark-3-line"
          title="Todavía no hay matrículas"
          description="Cuando alguien se inscriba a un curso, aparecerá aquí."
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por estudiante o correo..." />
            <SelectField value={filter} onChange={setFilter} options={filterOptions} />
          </div>

          <div className="space-y-3">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4"
              >
                <div className="min-w-44 flex-1">
                  <p className="text-sm font-semibold text-foreground-900">{row.student_name ?? "—"}</p>
                  <p className="text-xs text-foreground-500">
                    {row.course_id ? courseMap.get(row.course_id) ?? "Curso" : "Curso"}
                  </p>
                  <p className="text-xs text-foreground-400">
                    {row.session_id ? sessionMap.get(row.session_id) ?? "" : ""}
                  </p>
                </div>
                <div className="text-xs text-foreground-500">
                  <p>{row.email ?? ""}</p>
                  <p>{row.phone ?? ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} />
                  <StatusBadge status={row.payment_status} />
                </div>
                <span className="text-xs text-foreground-400">{formatDate(row.created_at)}</span>
                <IconButton icon="ri-edit-line" label="Gestionar" onClick={() => setSelected(row)} />
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-background-200/70 bg-background-50 p-6 text-center text-sm text-foreground-500">
                No hay matrículas con ese filtro.
              </p>
            )}
          </div>
        </>
      )}

      <Modal open={Boolean(selected)} title="Gestionar matrícula" onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-background-100 p-4 text-sm">
              <p className="font-semibold text-foreground-900">{selected.student_name ?? "—"}</p>
              <p className="text-foreground-600">{selected.email ?? ""}</p>
              <p className="text-foreground-600">{selected.phone ?? ""}</p>
              <p className="mt-2 text-foreground-500">
                {selected.course_id ? courseMap.get(selected.course_id) ?? "Curso" : "Curso"}
                {selected.session_id ? ` · ${sessionMap.get(selected.session_id) ?? ""}` : ""}
              </p>
            </div>

            <SelectField
              label="Estado de la matrícula"
              value={selected.status}
              onChange={(value) => updateStatus(selected, "status", value)}
              options={statusOptions}
            />
            <SelectField
              label="Estado del pago"
              value={selected.payment_status}
              onChange={(value) => updateStatus(selected, "payment_status", value)}
              options={paymentOptions}
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