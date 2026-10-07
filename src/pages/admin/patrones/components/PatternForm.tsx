import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { TextField, TextArea, SelectField, Toggle, PrimaryButton, GhostButton } from "@/pages/admin/components/ui";
import ImageUploader from "@/pages/admin/components/ImageUploader";
import FileUploader from "@/pages/admin/components/FileUploader";

export interface PatternRow {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  type: string;
  price: number;
  difficulty: string | null;
  category: string | null;
  image_url: string | null;
  file_url: string | null;
  short_description: string | null;
  includes: unknown;
  details: unknown;
  is_active: boolean;
}

const typeOptions = [
  { value: "free", label: "Gratis" },
  { value: "paid", label: "De pago" },
];

const difficultyOptions = [
  { value: "Fácil", label: "Fácil" },
  { value: "Intermedio", label: "Intermedio" },
  { value: "Avanzado", label: "Avanzado" },
];

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PatternForm({
  pattern,
  onClose,
  onSaved,
}: {
  pattern?: PatternRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(pattern?.id);
  const [title, setTitle] = useState(pattern?.title ?? "");
  const [type, setType] = useState(pattern?.type === "paid" ? "paid" : "free");
  const [price, setPrice] = useState(pattern ? String(pattern.price) : "0");
  const [difficulty, setDifficulty] = useState(pattern?.difficulty ?? "Fácil");
  const [category, setCategory] = useState(pattern?.category ?? "");
  const [image, setImage] = useState(pattern?.image_url ?? "");
  const [fileUrl, setFileUrl] = useState(pattern?.file_url ?? "");
  const [shortDescription, setShortDescription] = useState(pattern?.short_description ?? "");
  const [description, setDescription] = useState(pattern?.description ?? "");
  const [includesText, setIncludesText] = useState(asStringArray(pattern?.includes).join("\n"));
  const [detailsText, setDetailsText] = useState(asStringArray(pattern?.details).join("\n"));
  const [isActive, setIsActive] = useState(pattern ? pattern.is_active : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!title.trim()) {
      setError("Escribe el nombre del patrón.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      slug: toSlug(title),
      description: description.trim(),
      short_description: shortDescription.trim(),
      type,
      price: type === "paid" ? Number(price) || 0 : 0,
      difficulty,
      category: category.trim(),
      image_url: image.trim() || null,
      file_url: fileUrl.trim() || null,
      includes: includesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      details: detailsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      is_active: isActive,
    };

    try {
      const { error: dbError } = editing
        ? await supabase.from("patterns").update(payload).eq("id", pattern?.id)
        : await supabase.from("patterns").insert(payload);
      if (dbError) throw dbError;
      onSaved();
    } catch {
      setError("No pudimos guardar el patrón. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <TextField label="Nombre del patrón" value={title} onChange={setTitle} required placeholder="Ej. Amigurumi Conejito" />
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField label="Tipo" value={type} onChange={setType} options={typeOptions} />
        <TextField
          label="Precio (₡)"
          value={price}
          onChange={setPrice}
          type="number"
          hint={type === "free" ? "Los patrones gratis no usan precio" : undefined}
        />
        <SelectField label="Dificultad" value={difficulty} onChange={setDifficulty} options={difficultyOptions} />
      </div>
      <TextField label="Categoría" value={category} onChange={setCategory} placeholder="Ej. Amigurumis" />
      <TextArea label="Descripción corta" value={shortDescription} onChange={setShortDescription} rows={2} />
      <TextArea label="Descripción completa" value={description} onChange={setDescription} rows={4} />
      <TextArea
        label="Qué incluye (uno por línea)"
        value={includesText}
        onChange={setIncludesText}
        rows={3}
        placeholder={"Instrucciones paso a paso\nFotos de referencia"}
      />
      <TextArea
        label="Detalles (uno por línea)"
        value={detailsText}
        onChange={setDetailsText}
        rows={3}
        placeholder={"Nivel: Fácil\n8 páginas\nFormato PDF"}
      />
      <ImageUploader label="Imagen del patrón" value={image} onChange={setImage} folder="patrones" />
      <FileUploader
        label="Archivo PDF del patrón"
        value={fileUrl}
        onChange={setFileUrl}
        folder="patrones"
        hint="Sube el PDF con las instrucciones. Los patrones gratis se descargan directo desde la web."
      />
      <Toggle checked={isActive} onChange={setIsActive} label="Visible en la web" description="Si lo desactivas, no se mostrará en la página de patrones." />

      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <GhostButton onClick={onClose}>Cancelar</GhostButton>
        <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
          {editing ? "Guardar cambios" : "Crear patrón"}
        </PrimaryButton>
      </div>
    </div>
  );
}