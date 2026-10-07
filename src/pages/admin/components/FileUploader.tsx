import { useRef, useState } from "react";
import { uploadDocument } from "@/lib/media";

interface FileUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
}

function fileNameFromUrl(url: string): string {
  try {
    const clean = url.split("?")[0];
    return decodeURIComponent(clean.split("/").pop() ?? "archivo");
  } catch {
    return "archivo";
  }
}

export default function FileUploader({
  label,
  value,
  onChange,
  folder = "patrones",
  hint,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = await uploadDocument(file, folder);
      onChange(url);
    } catch {
      setError("No pudimos subir el PDF. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="block text-sm font-semibold text-foreground-800">{label}</span>
      <div className="mt-2 rounded-2xl border border-background-200 bg-background-50 p-4">
        {value ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <i className="ri-file-pdf-2-line text-xl" />
            </span>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground-800 hover:text-primary-600"
            >
              {fileNameFromUrl(value)}
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-600 transition-colors hover:bg-background-100"
            >
              <i className="ri-delete-bin-line" />
              Quitar
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background-100 text-foreground-400">
              <i className="ri-file-upload-line text-xl" />
            </span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100 disabled:opacity-60"
            >
              {loading ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <i className="ri-upload-2-line" />
              )}
              Subir PDF
            </button>
            <span className="text-xs text-foreground-500">Aún no has subido ningún archivo.</span>
          </div>
        )}

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="o pega una dirección del PDF (https://...)"
          className="mt-3 w-full rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />

        {hint && <p className="mt-2 text-xs text-foreground-400">{hint}</p>}
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-700">
            <i className="ri-error-warning-line" />
            {error}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}