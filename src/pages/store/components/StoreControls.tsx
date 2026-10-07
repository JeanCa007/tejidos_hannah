import { useEffect, useRef, useState } from "react";

export type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";

const sortOptions: { key: SortKey; label: string; icon: string }[] = [
  { key: "relevance", label: "Relevancia", icon: "ri-sort-desc" },
  { key: "price-asc", label: "Precio: menor a mayor", icon: "ri-arrow-up-line" },
  { key: "price-desc", label: "Precio: mayor a menor", icon: "ri-arrow-down-line" },
  { key: "rating", label: "Mejor valorados", icon: "ri-star-line" },
];

interface StoreControlsProps {
  search: string;
  onSearch: (value: string) => void;
  sort: SortKey;
  onSort: (value: SortKey) => void;
  onSaleOnly: boolean;
  onToggleSale: () => void;
  count: number;
}

export default function StoreControls({
  search,
  onSearch,
  sort,
  onSort,
  onSaleOnly,
  onToggleSale,
  count,
}: StoreControlsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const current = sortOptions.find((option) => option.key === sort) ?? sortOptions[0];

  return (
    <div className="space-y-3">
      <div className="relative">
        <i className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-foreground-400 ri-search-line" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar bolsos, amigurumis, mantas..."
          className="w-full rounded-full border border-background-200 bg-background-50 py-3 pl-11 pr-11 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        {search && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground-400 hover:bg-background-100 hover:text-foreground-700"
          >
            <i className="ri-close-line" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-foreground-500">
          {count} {count === 1 ? "producto" : "productos"}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSale}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
              onSaleOnly
                ? "border-primary-500 bg-primary-100 text-primary-700"
                : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
            }`}
          >
            <i className="ri-price-tag-3-line" />
            En oferta
          </button>

          <div className="relative" ref={containerRef}>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex items-center gap-1.5 rounded-full border border-background-200 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:bg-background-100"
            >
              <i className={current.icon} />
              <span className="hidden sm:inline">{current.label}</span>
              <span className="sm:hidden">Ordenar</span>
              <i className={open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
            </button>

            {open && (
              <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-background-200 bg-background-50 py-1 shadow-soft">
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      onSort(option.key);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                      option.key === sort
                        ? "bg-primary-100 font-semibold text-primary-700"
                        : "text-foreground-700 hover:bg-background-100"
                    }`}
                  >
                    <i className={option.icon} />
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}