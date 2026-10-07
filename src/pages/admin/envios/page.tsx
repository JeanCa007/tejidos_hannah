import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCRC } from "@/lib/format";
import Modal from "@/pages/admin/components/Modal";
import {
  AdminHeader,
  ErrorBanner,
  EmptyState,
  LoadingRows,
  PrimaryButton,
  GhostButton,
  IconButton,
  TextField,
  Toggle,
} from "@/pages/admin/components/ui";

interface ZoneRow {
  id: string;
  name: string;
  provinces: unknown;
  cost: number;
  free_threshold: number | null;
  estimated_days: string | null;
  is_active: boolean;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export default function AdminEnviosPage() {
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [provincesText, setProvincesText] = useState("");
  const [cost, setCost] = useState("0");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<ZoneRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("shipping_zones")
        .select("*")
        .order("name", { ascending: true });
      if (dbError) throw dbError;
      setZones((data ?? []) as ZoneRow[]);
    } catch {
      setError("No pudimos cargar las zonas de envío. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setProvincesText("");
    setCost("0");
    setFreeThreshold("");
    setEstimatedDays("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (zone: ZoneRow) => {
    setEditingId(zone.id);
    setName(zone.name);
    setProvincesText(asStringArray(zone.provinces).join(", "));
    setCost(String(zone.cost));
    setFreeThreshold(zone.free_threshold != null ? String(zone.free_threshold) : "");
    setEstimatedDays(zone.estimated_days ?? "");
    setIsActive(zone.is_active);
    setModalOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        provinces: provincesText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        cost: Number(cost) || 0,
        free_threshold: freeThreshold.trim() ? Number(freeThreshold) : null,
        estimated_days: estimatedDays.trim(),
        is_active: isActive,
      };
      if (editingId) {
        await supabase.from("shipping_zones").update(payload).eq("id", editingId);
      } else {
        await supabase.from("shipping_zones").insert(payload);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await supabase.from("shipping_zones").delete().eq("id", toDelete.id);
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Configuración de envíos"
        description="Define zonas, costos y envío gratis por monto."
        action={
          <PrimaryButton icon="ri-add-line" onClick={openCreate}>
            Nueva zona
          </PrimaryButton>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : zones.length === 0 ? (
        <EmptyState
          icon="ri-truck-line"
          title="Todavía no hay zonas"
          description="Crea tus zonas de envío para calcular costos en el checkout."
          action={
            <PrimaryButton icon="ri-add-line" onClick={openCreate}>
              Nueva zona
            </PrimaryButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => {
            const provinces = asStringArray(zone.provinces);
            return (
              <div
                key={zone.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <i className="ri-truck-line text-xl" />
                </span>
                <div className="min-w-44 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground-900">{zone.name}</p>
                    {!zone.is_active && (
                      <span className="rounded-full bg-background-200 px-2 py-0.5 text-[10px] font-bold text-foreground-600">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-foreground-500">
                    {provinces.length > 0 ? provinces.join(", ") : "Sin provincias"}
                  </p>
                  <p className="text-xs text-foreground-400">{zone.estimated_days || ""}</p>
                </div>
                <div className="text-right text-xs text-foreground-500">
                  <p className="text-sm font-bold text-foreground-900">
                    {zone.cost === 0 ? "Gratis" : formatCRC(zone.cost)}
                  </p>
                  {zone.free_threshold ? (
                    <p>Gratis desde {formatCRC(zone.free_threshold)}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <IconButton icon="ri-edit-line" label="Editar" onClick={() => openEdit(zone)} />
                  <IconButton icon="ri-delete-bin-line" label="Eliminar" tone="danger" onClick={() => setToDelete(zone)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} title={editingId ? "Editar zona" : "Nueva zona"} onClose={() => setModalOpen(false)}>
        <div className="space-y-5">
          <TextField label="Nombre de la zona" value={name} onChange={setName} required placeholder="Ej. San José y GAM" />
          <TextField
            label="Provincias (separadas por coma)"
            value={provincesText}
            onChange={setProvincesText}
            placeholder="San José, Heredia, Cartago"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Costo de envío (₡)" value={cost} onChange={setCost} type="number" />
            <TextField
              label="Envío gratis desde (₡)"
              value={freeThreshold}
              onChange={setFreeThreshold}
              type="number"
              placeholder="Opcional"
            />
          </div>
          <TextField label="Tiempo estimado" value={estimatedDays} onChange={setEstimatedDays} placeholder="Ej. 1-2 días hábiles" />
          <Toggle checked={isActive} onChange={setIsActive} label="Zona activa" description="Disponible para calcular envíos." />

          <div className="flex justify-end gap-3">
            <GhostButton onClick={() => setModalOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
              Guardar
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        title="Eliminar zona"
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
          ¿Seguro que quieres eliminar <strong>{toDelete?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}