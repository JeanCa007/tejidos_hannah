import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/pages/admin/components/Modal";
import { TextField, Toggle, PrimaryButton, GhostButton, IconButton } from "@/pages/admin/components/ui";

interface SessionRow {
  id: string;
  label: string | null;
  start_at: string | null;
  end_at: string | null;
  capacity: number;
  enrolled: number;
  location: string | null;
  is_active: boolean;
}

function toInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function SessionManager({
  courseId,
  courseTitle,
  onChanged,
  onClose,
}: {
  courseId: string;
  courseTitle: string;
  onChanged: () => void;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [capacity, setCapacity] = useState("8");
  const [enrolled, setEnrolled] = useState("0");
  const [location, setLocation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("course_sessions")
      .select("*")
      .eq("course_id", courseId)
      .order("start_at", { ascending: true });
    setRows((data ?? []) as SessionRow[]);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setLabel("");
    setStartAt("");
    setEndAt("");
    setCapacity("8");
    setEnrolled("0");
    setLocation("");
    setIsActive(true);
    setEditOpen(true);
  };

  const openEdit = (row: SessionRow) => {
    setEditingId(row.id);
    setLabel(row.label ?? "");
    setStartAt(toInputValue(row.start_at));
    setEndAt(toInputValue(row.end_at));
    setCapacity(String(row.capacity ?? 8));
    setEnrolled(String(row.enrolled ?? 0));
    setLocation(row.location ?? "");
    setIsActive(row.is_active);
    setEditOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        course_id: courseId,
        label: label.trim(),
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        capacity: Number(capacity) || 0,
        enrolled: Number(enrolled) || 0,
        location: location.trim(),
        is_active: isActive,
      };
      if (editingId) {
        await supabase.from("course_sessions").update(payload).eq("id", editingId);
      } else {
        await supabase.from("course_sessions").insert(payload);
      }
      setEditOpen(false);
      load();
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await supabase.from("course_sessions").delete().eq("id", id);
    load();
    onChanged();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-500">
          Horarios de <strong className="text-foreground-800">{courseTitle}</strong>
        </p>
        <PrimaryButton icon="ri-add-line" onClick={openCreate}>
          Nuevo horario
        </PrimaryButton>
      </div>

      {loading ? (
        <p className="text-sm text-foreground-500">Cargando horarios...</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-background-200/70 bg-background-100 p-5 text-center text-sm text-foreground-500">
          Este curso aún no tiene horarios.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-background-200/70 bg-background-50 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground-900">{row.label || "Horario"}</p>
                <p className="text-xs text-foreground-500">
                  {toInputValue(row.start_at).replace("T", " ")} · {row.location || "Sin lugar"}
                </p>
                <p className="mt-0.5 text-xs text-foreground-400">
                  {row.enrolled}/{row.capacity} cupos
                  {!row.is_active && " · inactivo"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IconButton icon="ri-edit-line" label="Editar" onClick={() => openEdit(row)} />
                <IconButton icon="ri-delete-bin-line" label="Eliminar" tone="danger" onClick={() => remove(row.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <GhostButton onClick={onClose}>Cerrar</GhostButton>
      </div>

      <Modal
        open={editOpen}
        title={editingId ? "Editar horario" : "Nuevo horario"}
        onClose={() => setEditOpen(false)}
      >
        <div className="space-y-4">
          <TextField label="Descripción del horario" value={label} onChange={setLabel} placeholder="Sábados 9:00 a.m. - 11:00 a.m." />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-foreground-800">Inicio</span>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground-800">Fin</span>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(event) => setEndAt(event.target.value)}
                className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Cupos" value={capacity} onChange={setCapacity} type="number" />
            <TextField label="Inscritos" value={enrolled} onChange={setEnrolled} type="number" />
          </div>
          <TextField label="Lugar o enlace" value={location} onChange={setLocation} placeholder="Taller Tejidos Hannah · San José" />
          <Toggle checked={isActive} onChange={setIsActive} label="Disponible" description="Si lo desactivas, no se podrá elegir este horario." />

          <div className="flex justify-end gap-3 pt-1">
            <GhostButton onClick={() => setEditOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
              Guardar
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}