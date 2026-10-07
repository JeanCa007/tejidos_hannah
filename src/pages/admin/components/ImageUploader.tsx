import { useRef, useState } from "react";
import { uploadImage } from "@/lib/media";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  aspect?: "square" | "wide";
}

export default function ImageUploader({
  label,
  value,
  onChange,
  folder = "general",
  aspect = "square",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch {
      setError("No pudimos subir la imagen. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="block text-sm font-semibold text-foreground-800">{label}</span>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`relative shrink-0 overflow-hidden rounded-2xl border border-background-200 bg-background-100 ${
            aspect === "square" ? "h-32 w-32" : "h-24 w-40"
          }`}
        >
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover object-top" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-foreground-400">
              <i className="ri-image-add-line text-2xl" />
            </span>
          )}
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center bg-background-50/70">
              <i className="ri-loader-4-line animate-spin text-2xl text-primary-500" />
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100 disabled:opacity-60"
            >
              <i className="ri-upload-2-line" />
              Subir imagen
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-semibold text-foreground-600 transition-colors hover:bg-background-100"
              >
                <i className="ri-delete-bin-line" />
                Quitar
              </button>
            )}
          </div>
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="o pega una dirección de imagen (https://...)"
            className="w-full rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {error && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary-700">
              <i className="ri-error-warning-line" />
              {error}
            </p>
          )}
        </div>
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