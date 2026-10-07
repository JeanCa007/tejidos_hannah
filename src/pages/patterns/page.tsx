import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPatterns } from "@/lib/catalog";
import type { Pattern } from "@/lib/storeTypes";
import PatternCard from "./components/PatternCard";

type Filter = "all" | "free" | "paid";

const filters: { key: Filter; label: string; icon: string }[] = [
  { key: "all", label: "Todos", icon: "ri-apps-2-line" },
  { key: "free", label: "Gratis", icon: "ri-download-line" },
  { key: "paid", label: "De pago", icon: "ri-shopping-bag-3-line" },
];

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPatterns(await fetchPatterns());
    } catch {
      setError("No pudimos cargar los patrones. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return patterns.filter((pattern) => {
      if (filter !== "all" && pattern.type !== filter) return false;
      if (term) {
        const haystack = `${pattern.title} ${pattern.category} ${pattern.difficulty}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [patterns, filter, search]);

  return (
    <div>
      <header className="pb-6 pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
          Crea tú misma
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Patrones de tejido
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          Descarga patrones gratuitos o compra los más completos y teje tus
          propias obras paso a paso.
        </p>
      </header>

      <div className="space-y-4">
        <div className="relative">
          <i className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-foreground-400 ri-search-line" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar patrones..."
            className="w-full rounded-full border border-background-200 bg-background-50 py-3 pl-11 pr-11 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {search && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground-400 hover:bg-background-100 hover:text-foreground-700"
            >
              <i className="ri-close-line" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                filter === item.key
                  ? "border-primary-500 bg-primary-500 text-background-50"
                  : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
              }`}
            >
              <i className={item.icon} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-50 text-foreground-400">
            <i className="ri-error-warning-line text-2xl" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-foreground-900">
            No pudimos cargar los patrones
          </h2>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-refresh-line" />
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl border border-background-200/70 bg-background-100" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filtered.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-50 text-foreground-400">
            <i className="ri-search-eye-line text-2xl" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-foreground-900">
            No encontramos patrones
          </h2>
          <p className="mt-2 max-w-xs text-sm text-foreground-500">
            Prueba con otra búsqueda o cambia el filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-refresh-line" />
            Ver todo
          </button>
        </div>
      )}
    </div>
  );
}