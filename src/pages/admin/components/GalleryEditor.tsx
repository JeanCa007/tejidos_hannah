import { useRef, useState } from "react";
import { uploadImage } from "@/lib/media";

interface GalleryEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
}

export default function GalleryEditor({
  images,
  onChange,
  folder = "general",
}: GalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange([...images, url]);
    } catch {
      // Silently ignore; the main uploader surfaces errors.
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput("");
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <span className="block text-sm font-semibold text-foreground-800">
        Galería de imágenes
      </span>
      <p className="mt-0.5 text-xs text-foreground-400">
        Además de la imagen principal. Puedes subir varias fotos del producto.
      </p>

      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-background-200 bg-background-100"
          >
            <img src={image} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover object-top" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Quitar imagen"
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-foreground-950/70 text-background-50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <i className="ri-close-line" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-background-300 bg-background-50 text-foreground-500 transition-colors hover:bg-background-100 disabled:opacity-60"
        >
          {loading ? (
            <i className="ri-loader-4-line animate-spin text-xl" />
          ) : (
            <>
              <i className="ri-add-line text-xl" />
              <span className="text-[11px] font-semibold">Agregar</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          placeholder="Pega una dirección de imagen y presiona Agregar"
          className="flex-1 rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <button
          type="button"
          onClick={addUrl}
          className="rounded-full border border-background-300 bg-background-50 px-4 py-2 text-xs font-bold text-foreground-700 hover:bg-background-100"
        >
          Agregar
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}