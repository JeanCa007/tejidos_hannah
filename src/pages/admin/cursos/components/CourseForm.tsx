import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { TextField, TextArea, SelectField, Toggle, PrimaryButton, GhostButton } from "@/pages/admin/components/ui";
import ImageUploader from "@/pages/admin/components/ImageUploader";

export interface CourseRow {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  level: string | null;
  mode: string | null;
  duration: string | null;
  image_url: string | null;
  short_description: string | null;
  includes: unknown;
  is_active: boolean;
}

const levelOptions = [
  { value: "Básico", label: "Básico" },
  { value: "Intermedio", label: "Intermedio" },
  { value: "Avanzado", label: "Avanzado" },
];

const modeOptions = [
  { value: "Presencial", label: "Presencial" },
  { value: "En línea", label: "En línea" },
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

export default function CourseForm({
  course,
  onClose,
  onSaved,
}: {
  course?: CourseRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(course?.id);
  const [title, setTitle] = useState(course?.title ?? "");
  const [price, setPrice] = useState(course ? String(course.price) : "");
  const [comparePrice, setComparePrice] = useState(
    course?.compare_price != null ? String(course.compare_price) : ""
  );
  const [level, setLevel] = useState(course?.level ?? "Básico");
  const [mode, setMode] = useState(course?.mode ?? "Presencial");
  const [duration, setDuration] = useState(course?.duration ?? "");
  const [image, setImage] = useState(course?.image_url ?? "");
  const [shortDescription, setShortDescription] = useState(course?.short_description ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [includesText, setIncludesText] = useState(asStringArray(course?.includes).join("\n"));
  const [isActive, setIsActive] = useState(course ? course.is_active : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!title.trim()) {
      setError("Escribe el nombre del curso.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      slug: toSlug(title),
      description: description.trim(),
      short_description: shortDescription.trim(),
      price: Number(price) || 0,
      compare_price: comparePrice.trim() ? Number(comparePrice) : null,
      level,
      mode,
      duration: duration.trim(),
      image_url: image.trim() || null,
      includes: includesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      is_active: isActive,
    };

    try {
      const { error: dbError } = editing
        ? await supabase.from("courses").update(payload).eq("id", course?.id)
        : await supabase.from("courses").insert(payload);
      if (dbError) throw dbError;
      onSaved();
    } catch {
      setError("No pudimos guardar el curso. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <TextField label="Nombre del curso" value={title} onChange={setTitle} required placeholder="Ej. Amigurumi desde cero" />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Precio (₡)" value={price} onChange={setPrice} type="number" required />
        <TextField label="Precio anterior (₡)" value={comparePrice} onChange={setComparePrice} type="number" placeholder="Opcional" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField label="Nivel" value={level} onChange={setLevel} options={levelOptions} />
        <SelectField label="Modalidad" value={mode} onChange={setMode} options={modeOptions} />
        <TextField label="Duración" value={duration} onChange={setDuration} placeholder="Ej. 6 semanas" />
      </div>
      <TextArea label="Descripción corta" value={shortDescription} onChange={setShortDescription} rows={2} />
      <TextArea label="Descripción completa" value={description} onChange={setDescription} rows={4} />
      <TextArea
        label="Qué incluye (uno por línea)"
        value={includesText}
        onChange={setIncludesText}
        rows={4}
        placeholder={"Materiales incluidos\nCertificado de participación"}
      />
      <ImageUploader label="Imagen del curso" value={image} onChange={setImage} folder="cursos" aspect="wide" />
      <Toggle checked={isActive} onChange={setIsActive} label="Visible en la web" description="Si lo desactivas, no se mostrará en la página de cursos." />

      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <GhostButton onClick={onClose}>Cancelar</GhostButton>
        <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
          {editing ? "Guardar cambios" : "Crear curso"}
        </PrimaryButton>
      </div>
    </div>
  );
}