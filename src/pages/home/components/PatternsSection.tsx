import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPatterns } from "@/lib/catalog";
import type { Pattern } from "@/lib/storeTypes";
import { formatCRC } from "@/lib/format";

export default function PatternsSection() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  useEffect(() => {
    let active = true;
    fetchPatterns()
      .then((items) => {
        if (active) setPatterns(items.slice(0, 4));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (patterns.length === 0) return null;

  return (
    <section className="py-8 lg:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Crea tú misma</span>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
            Patrones de tejido
          </h2>
        </div>
        <Link
          to="/patrones"
          className="hidden items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 sm:inline-flex"
        >
          Ver todos
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {patterns.map((pattern) => (
          <Link
            key={pattern.id}
            to={`/patrones/${pattern.id}`}
            className="group overflow-hidden rounded-2xl border border-background-200/70 bg-background-50 shadow-card transition-transform hover:-translate-y-1"
          >
            <div className="relative overflow-hidden bg-background-100">
              <img
                src={pattern.image}
                alt={pattern.title}
                className="h-36 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 sm:h-44"
              />
              <span
                className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  pattern.type === "free" ? "bg-secondary-500 text-secondary-50" : "bg-accent-500 text-accent-950"
                }`}
              >
                {pattern.type === "free" ? "Gratis" : "De pago"}
              </span>
            </div>
            <div className="p-3.5">
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground-900">{pattern.title}</h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-foreground-500">
                  <i className="ri-bar-chart-line" />
                  {pattern.difficulty}
                </span>
                <span className={`text-sm font-bold ${pattern.type === "free" ? "text-secondary-700" : "text-primary-600"}`}>
                  {pattern.type === "free" ? "Descargar" : formatCRC(pattern.price)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}