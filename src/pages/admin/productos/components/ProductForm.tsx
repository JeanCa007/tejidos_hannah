import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/storeTypes";
import { TextField, TextArea, SelectField, Toggle, PrimaryButton, GhostButton } from "@/pages/admin/components/ui";
import ImageUploader from "@/pages/admin/components/ImageUploader";
import GalleryEditor from "@/pages/admin/components/GalleryEditor";

export interface ProductRow {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  stock: number;
  category_id: string | null;
  tag: string | null;
  image_url: string | null;
  gallery: unknown;
  variants: unknown;
  details: unknown;
  rating: number | null;
  review_count: number | null;
  is_active: boolean;
}

interface VariantDraft {
  name: string;
  optionsText: string;
}

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

interface ProductFormProps {
  product?: ProductRow | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductForm({ product, categories, onClose, onSaved }: ProductFormProps) {
  const editing = Boolean(product?.id);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [comparePrice, setComparePrice] = useState(
    product?.compare_price != null ? String(product.compare_price) : ""
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [shortDescription, setShortDescription] = useState(product?.short_description ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [image, setImage] = useState(product?.image_url ?? "");
  const [gallery, setGallery] = useState<string[]>(asStringArray(product?.gallery));
  const [detailsText, setDetailsText] = useState(asStringArray(product?.details).join("\n"));
  const [rating, setRating] = useState(product?.rating != null ? String(product.rating) : "5");
  const [reviewCount, setReviewCount] = useState(
    product?.review_count != null ? String(product.review_count) : "0"
  );
  const [isActive, setIsActive] = useState(product ? product.is_active : true);
  const [variants, setVariants] = useState<VariantDraft[]>(() => {
    const raw = Array.isArray(product?.variants) ? (product?.variants as VariantDraft[]) : [];
    return raw.map((group) => ({
      name: String(group.name ?? ""),
      optionsText: asStringArray((group as { options?: unknown }).options).join(", "),
    }));
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryOptions = [
    { value: "", label: "Sin categoría" },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];

  const save = async () => {
    if (!name.trim()) {
      setError("Escribe el nombre del producto.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      slug: toSlug(name),
      description: description.trim(),
      short_description: shortDescription.trim(),
      price: Number(price) || 0,
      compare_price: comparePrice.trim() ? Number(comparePrice) : null,
      stock: Number(stock) || 0,
      category_id: categoryId || null,
      tag: tag.trim() || null,
      image_url: image.trim() || null,
      gallery,
      variants: variants
        .filter((group) => group.name.trim() && group.optionsText.trim())
        .map((group) => ({
          name: group.name.trim(),
          options: group.optionsText
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean),
        })),
      details: detailsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      rating: Number(rating) || 5,
      review_count: Number(reviewCount) || 0,
      is_active: isActive,
    };

    try {
      const { error: dbError } = editing
        ? await supabase.from("products").update(payload).eq("id", product?.id)
        : await supabase.from("products").insert(payload);
      if (dbError) throw dbError;
      onSaved();
    } catch {
      setError("No pudimos guardar el producto. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <TextField label="Nombre del producto" value={name} onChange={setName} required placeholder="Ej. Bolso Aurora" />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Precio (₡)" value={price} onChange={setPrice} type="number" required placeholder="18500" />
        <TextField
          label="Precio anterior (₡)"
          value={comparePrice}
          onChange={setComparePrice}
          type="number"
          placeholder="Opcional, para mostrar oferta"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Inventario (unidades)" value={stock} onChange={setStock} type="number" />
        <SelectField label="Categoría" value={categoryId} onChange={setCategoryId} options={categoryOptions} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField label="Etiqueta" value={tag} onChange={setTag} placeholder="Ej. Más vendido" />
        <TextField label="Calificación" value={rating} onChange={setRating} type="number" />
        <TextField label="Reseñas" value={reviewCount} onChange={setReviewCount} type="number" />
      </div>

      <TextArea
        label="Descripción corta"
        value={shortDescription}
        onChange={setShortDescription}
        rows={2}
        placeholder="Aparece en las tarjetas del catálogo"
      />
      <TextArea label="Descripción completa" value={description} onChange={setDescription} rows={4} />
      <TextArea
        label="Detalles (uno por línea)"
        value={detailsText}
        onChange={setDetailsText}
        rows={4}
        placeholder={"Medidas: 30 cm x 24 cm\nHilo de algodón premium"}
      />

      <ImageUploader label="Imagen principal" value={image} onChange={setImage} folder="productos" />
      <GalleryEditor images={gallery} onChange={setGallery} folder="productos" />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground-800">Variantes</span>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, { name: "", optionsText: "" }])}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            <i className="ri-add-line" />
            Agregar variante
          </button>
        </div>
        <div className="mt-2 space-y-3">
          {variants.length === 0 && (
            <p className="text-xs text-foreground-400">
              Sin variantes. Ej. Color, Tamaño.
            </p>
          )}
          {variants.map((group, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
              <input
                type="text"
                value={group.name}
                placeholder="Nombre (Color)"
                onChange={(event) =>
                  setVariants((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, name: event.target.value } : item))
                  )
                }
                className="rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
              />
              <input
                type="text"
                value={group.optionsText}
                placeholder="Opciones separadas por coma (Rojo, Azul)"
                onChange={(event) =>
                  setVariants((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, optionsText: event.target.value } : item))
                  )
                }
                className="rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Quitar variante"
                onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                className="flex h-10 w-10 items-center justify-center rounded-full text-primary-600 hover:bg-primary-100"
              >
                <i className="ri-delete-bin-line" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Toggle
        checked={isActive}
        onChange={setIsActive}
        label="Visible en la tienda"
        description="Si lo desactivas, no aparecerá en el catálogo público."
      />

      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <GhostButton onClick={onClose}>Cancelar</GhostButton>
        <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
          {editing ? "Guardar cambios" : "Crear producto"}
        </PrimaryButton>
      </div>
    </div>
  );
}