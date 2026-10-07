import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/storeTypes";
import Modal from "@/pages/admin/components/Modal";
import { PrimaryButton, GhostButton, TextField, SelectField, IconButton } from "@/pages/admin/components/ui";

const iconOptions = [
  { value: "ri-price-tag-3-line", label: "Etiqueta" },
  { value: "ri-handbag-line", label: "Bolso" },
  { value: "ri-bear-smile-line", label: "Osito" },
  { value: "ri-hand-heart-line", label: "Corazón en mano" },
  { value: "ri-emotion-happy-line", label: "Bebé" },
  { value: "ri-home-smile-line", label: "Hogar" },
  { value: "ri-gift-line", label: "Regalo" },
  { value: "ri-plant-line", label: "Planta" },
];

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryManager({
  categories,
  onChanged,
}: {
  categories: Category[];
  onChanged: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(iconOptions[0].value);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setIcon(iconOptions[0].value);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setIcon(category.icon || iconOptions[0].value);
    setModalOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await supabase.from("categories").update({ name: name.trim(), icon }).eq("id", editingId);
      } else {
        await supabase.from("categories").insert({
          name: name.trim(),
          slug: toSlug(name),
          icon,
          sort_order: categories.length + 1,
        });
      }
      setModalOpen(false);
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    onChanged();
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-5">
        <p className="text-sm text-foreground-500">
          {categories.length} categorías. Se usan para organizar la tienda.
        </p>
        <PrimaryButton onClick={openCreate} icon="ri-add-line">
          Nueva categoría
        </PrimaryButton>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                <i className={`${category.icon || "ri-price-tag-3-line"} text-xl`} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground-900">{category.name}</p>
                <p className="text-xs text-foreground-400">/{category.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <IconButton icon="ri-edit-line" label="Editar" onClick={() => openEdit(category)} />
              <IconButton icon="ri-delete-bin-line" label="Eliminar" tone="danger" onClick={() => remove(category.id)} />
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="rounded-2xl border border-background-200/70 bg-background-50 p-6 text-center text-sm text-foreground-500">
            Aún no hay categorías.
          </p>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? "Editar categoría" : "Nueva categoría"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <GhostButton onClick={() => setModalOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
              Guardar
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-5">
          <TextField label="Nombre" value={name} onChange={setName} required placeholder="Ej. Bolsos" />
          <SelectField label="Ícono" value={icon} onChange={setIcon} options={iconOptions} />
        </div>
      </Modal>
    </div>
  );
}