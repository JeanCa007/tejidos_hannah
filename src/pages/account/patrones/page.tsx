import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyPatterns } from "@/lib/account";
import { fetchPatterns } from "@/lib/catalog";
import type { Pattern } from "@/lib/storeTypes";
import RequireCustomer from "@/pages/account/components/RequireCustomer";

interface DownloadCardProps {
  pattern: Pattern;
  owned: boolean;
}

function DownloadCard({ pattern, owned }: DownloadCardProps) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-background-200/70 bg-background-50">
      <div className="flex gap-4 p-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background-100">
          <img
            src={pattern.image}
            alt={pattern.title}
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-800">
              {pattern.category}
            </span>
            {owned && (
              <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold text-primary-800">
                Comprado
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-1 text-sm font-bold text-foreground-950">
            {pattern.title}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-foreground-500">
            {pattern.shortDescription}
          </p>
        </div>
      </div>
      <div className="border-t border-background-200/70 p-4">
        {pattern.fileUrl ? (
          <a
            href={pattern.fileUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-download-line text-lg" />
            Descargar PDF
          </a>
        ) : (
          <span className="flex w-full items-center justify-center gap-2 rounded-full bg-background-200 px-5 py-3 text-sm font-bold text-foreground-500">
            <i className="ri-time-line text-lg" />
            Disponible pronto
          </span>
        )}
      </div>
    </div>
  );
}

function PatternsContent() {
  const [owned, setOwned] = useState<Pattern[]>([]);
  const [free, setFree] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [purchased, all] = await Promise.all([fetchMyPatterns(), fetchPatterns()]);
      setOwned(purchased);
      const ownedIds = new Set(purchased.map((item) => item.id));
      setFree(all.filter((item) => item.type === "free" && !ownedIds.has(item.id)));
    } catch {
      setError("No pudimos cargar tus patrones. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-background-200/70 bg-background-50 p-10 text-center">
        <i className="ri-error-warning-line text-3xl text-primary-500" />
        <p className="max-w-sm text-sm text-foreground-600">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-refresh-line" />
          Reintentar
        </button>
      </div>
    );
  }

  if (owned.length === 0 && free.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-background-200/70 bg-background-50 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-file-text-line text-2xl" />
        </span>
        <p className="text-sm text-foreground-600">Todavía no tienes patrones.</p>
        <Link
          to="/patrones"
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-file-text-line" />
          Ver patrones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {owned.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
            <i className="ri-lock-unlock-line text-primary-600" />
            Tus descargas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {owned.map((pattern) => (
              <DownloadCard key={pattern.id} pattern={pattern} owned />
            ))}
          </div>
        </section>
      )}

      {free.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
            <i className="ri-gift-line text-secondary-600" />
            Patrones gratis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {free.map((pattern) => (
              <DownloadCard key={pattern.id} pattern={pattern} owned={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function MyPatternsPage() {
  return (
    <div className="py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-foreground-500">
        <Link to="/mi-cuenta" className="hover:text-primary-600">
          Mi cuenta
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="font-semibold text-foreground-700">Mis patrones</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground-950">
          Mis patrones
        </h1>
        <p className="mt-1 text-sm text-foreground-600">
          Los patrones que has comprado y los gratuitos listos para descargar.
        </p>
      </header>

      <RequireCustomer>
        <PatternsContent />
      </RequireCustomer>
    </div>
  );
}