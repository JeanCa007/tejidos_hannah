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
  PrimaryButton,
  GhostButton,
  IconButton,
} from "@/pages/admin/components/ui";
import PatternForm, { type PatternRow } from "./components/PatternForm";

export default function AdminPatronesPage() {
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PatternRow | null>(null);
  const [toDelete, setToDelete] = useState<PatternRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("patterns")
        .select("*")
        .order("created_at", { ascending: false });
      if (dbError) throw dbError;
      setPatterns((data ?? []) as PatternRow[]);
    } catch {
      setError("No pudimos cargar los patrones. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patterns;
    return patterns.filter((pattern) =>
      `${pattern.title} ${pattern.category ?? ""}`.toLowerCase().includes(term)
    );
  }, [patterns, search]);

  const toggleActive = async (pattern: PatternRow) => {
    await supabase.from("patterns").update({ is_active: !pattern.is_active }).eq("id", pattern.id);
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await supabase.from("patterns").delete().eq("id", toDelete.id);
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Patrones"
        description="Administra patrones gratuitos y de pago."
        action={
          <PrimaryButton
            icon="ri-add-line"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Nuevo patrón
          </PrimaryButton>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : patterns.length === 0 ? (
        <EmptyState
          icon="ri-file-text-line"
          title="Todavía no tienes patrones"
          description="Crea tu primer patrón para ofrecerlo en la web."
          action={
            <PrimaryButton icon="ri-add-line" onClick={() => { setEditing(null); setFormOpen(true); }}>
              Nuevo patrón
            </PrimaryButton>
          }
        />
      ) : (
        <div className="space-y-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar patrón..." />
          {filtered.map((pattern) => (
            <div
              key={pattern.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-background-200 bg-background-100">
                {pattern.image_url ? (
                  <img src={pattern.image_url} alt={pattern.title} className="h-full w-full object-cover object-top" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-foreground-400">
                    <i className="ri-image-line" />
                  </span>
                )}
              </div>

              <div className="min-w-40 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground-900">{pattern.title}</p>
                  {!pattern.is_active && (
                    <span className="rounded-full bg-background-200 px-2 py-0.5 text-[10px] font-bold text-foreground-600">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-foreground-500">
                  {pattern.category || "Sin categoría"} · {pattern.difficulty || ""}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  pattern.type === "free"
                    ? "bg-secondary-100 text-secondary-800"
                    : "bg-accent-100 text-accent-800"
                }`}
              >
                {pattern.type === "free" ? "Gratis" : formatCRC(pattern.price)}
              </span>

              <div className="flex items-center gap-1">
                <IconButton
                  icon={pattern.is_active ? "ri-eye-line" : "ri-eye-off-line"}
                  label={pattern.is_active ? "Ocultar" : "Mostrar"}
                  onClick={() => toggleActive(pattern)}
                />
                <IconButton icon="ri-edit-line" label="Editar" onClick={() => { setEditing(pattern); setFormOpen(true); }} />
                <IconButton icon="ri-delete-bin-line" label="Eliminar" tone="danger" onClick={() => setToDelete(pattern)} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-background-200/70 bg-background-50 p-6 text-center text-sm text-foreground-500">
              No hay patrones con esa búsqueda.
            </p>
          )}
        </div>
      )}

      <Modal open={formOpen} title={editing ? "Editar patrón" : "Nuevo patrón"} onClose={() => setFormOpen(false)} size="lg">
        <PatternForm
          pattern={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        title="Eliminar patrón"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <GhostButton onClick={() => setToDelete(null)}>Cancelar</GhostButton>
            <PrimaryButton onClick={confirmDelete} loading={deleting} icon="ri-delete-bin-line">
              Sí, eliminar
            </PrimaryButton>
          </>
        }
      >
        <p className="text-sm text-foreground-600">
          ¿Seguro que quieres eliminar <strong>{toDelete?.title}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}