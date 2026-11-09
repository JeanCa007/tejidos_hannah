import { useRef, useState } from "react";
import { uploadImage } from "@/lib/media";

const MAX_IMAGES = 4;
const MAX_SIZE = 8 * 1024 * 1024;

interface ReferenceUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function ReferenceUploader({ value, onChange }: ReferenceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const room = MAX_IMAGES - value.length;
    if (room <= 0) {
      setError(`Puedes adjuntar hasta ${MAX_IMAGES} imágenes.`);
      return;
    }

    const selected = Array.from(files).slice(0, room);

    if (selected.some((file) => !file.type.startsWith("image/"))) {
      setError("Solo puedes subir imágenes (JPG, PNG o WEBP).");
      return;
    }
    if (selected.some((file) => file.size > MAX_SIZE)) {
      setError("Cada imagen debe pesar menos de 8 MB.");
      return;
    }

    setError("");
    setUploading(true);
    const uploaded: string[] = [];

    try {
      for (const file of selected) {
        const url = await uploadImage(file, "solicitudes");
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
    } catch {
      if (uploaded.length) onChange([...value, ...uploaded]);
      setError("No pudimos subir las imágenes. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (url: string) => {
    onChange(value.filter((item) => item !== url));
    setError("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground-800">
          Fotos de referencia
        </span>
        <span className="text-xs text-foreground-400">
          {value.length} de {MAX_IMAGES}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {value.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-background-200 bg-background-100"
          >
            <img src={url} alt="Referencia del pedido" className="h-full w-full object-cover object-top" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Quitar imagen"
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background-50/90 text-foreground-700 shadow-sm transition-colors hover:bg-primary-500 hover:text-background-50"
            >
              <i className="ri-close-line" />
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-background-300 bg-background-100 text-foreground-500 transition-colors hover:border-primary-300 hover:bg-primary-50 disabled:opacity-60"
          >
            {uploading ? (
              <i className="ri-loader-4-line animate-spin text-xl text-primary-500" />
            ) : (
              <>
                <i className="ri-camera-line text-xl" />
                <span className="text-[10px] font-semibold">Agregar</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-2.5 text-xs text-foreground-500">
        Puedes subir fotos de Pinterest, de una prenda que te guste o del color de
        la lana. Nos ayudan a entender tu idea.
      </p>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-primary-700">
          <i className="ri-error-warning-line mt-0.5" />
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}