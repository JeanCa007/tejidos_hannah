import { Link } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import type { Pattern } from "@/lib/storeTypes";

export default function PatternCard({ pattern }: { pattern: Pattern }) {
  const isFree = pattern.type === "free";
  return (
    <Link
      to={`/patrones/${pattern.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-background-200/70 bg-background-50 shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden bg-background-100">
        <img
          src={pattern.image}
          alt={pattern.title}
          className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 sm:h-56"
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isFree ? "bg-secondary-500 text-secondary-50" : "bg-accent-500 text-accent-950"
          }`}
        >
          {isFree ? "Gratis" : "De pago"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-secondary-700">
          {pattern.category}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground-900">
          {pattern.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-foreground-500">
          <i className="ri-bar-chart-line" />
          <span className="font-semibold text-foreground-700">{pattern.difficulty}</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span
            className={`text-sm font-bold ${
              isFree ? "text-secondary-700" : "text-primary-600"
            }`}
          >
            {isFree ? "Descargar gratis" : formatCRC(pattern.price)}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background-100 text-foreground-600 transition-colors group-hover:bg-primary-500 group-hover:text-background-50">
            <i className={isFree ? "ri-download-line" : "ri-shopping-bag-3-line"} />
          </span>
        </div>
      </div>
    </Link>
  );
}