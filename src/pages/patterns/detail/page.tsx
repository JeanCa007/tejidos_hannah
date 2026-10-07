import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import { fetchPatternById, fetchPatterns, pickRelatedPatterns } from "@/lib/catalog";
import type { Pattern } from "@/lib/storeTypes";
import { useCart } from "@/hooks/useCart";
import PatternCard from "@/pages/patterns/components/PatternCard";

export default function PatternDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [related, setRelated] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [found, all] = await Promise.all([fetchPatternById(id), fetchPatterns()]);
      setPattern(found);
      setRelated(found ? pickRelatedPatterns(found, all) : []);
    } catch {
      setError("No pudimos cargar este patrón. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (error || !pattern) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-emotion-sad-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          {error ? "No pudimos cargar el patrón" : "No encontramos este patrón"}
        </h1>
        {error ? (
          <button
            type="button"
            onClick={load}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-refresh-line" />
            Reintentar
          </button>
        ) : (
          <Link
            to="/patrones"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-arrow-left-line" />
            Ver todos los patrones
          </Link>
        )}
      </section>
    );
  }

  const isFree = pattern.type === "free";

  const handleBuy = () => {
    addItem({
      productId: pattern.id,
      name: `Patrón: ${pattern.title}`,
      price: pattern.price,
      image: pattern.image,
      quantity: 1,
      variantLabel: "Patrón PDF",
      href: `/patrones/${pattern.id}`,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <nav className="flex items-center gap-1.5 py-4 text-xs text-foreground-500">
        <Link to="/" className="hover:text-primary-600">Inicio</Link>
        <i className="ri-arrow-right-s-line" />
        <Link to="/patrones" className="hover:text-primary-600">Patrones</Link>
        <i className="ri-arrow-right-s-line" />
        <span className="truncate font-semibold text-foreground-700">{pattern.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-[2rem] border border-background-200/70 bg-background-100">
          <img src={pattern.image} alt={pattern.title} className="h-72 w-full object-cover object-top sm:h-96" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary-800">
              {pattern.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                isFree ? "bg-secondary-500 text-secondary-50" : "bg-accent-500 text-accent-950"
              }`}
            >
              {isFree ? "Gratis" : "De pago"}
            </span>
          </div>

          <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground-950 sm:text-4xl">
            {pattern.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-foreground-500">
            <i className="ri-bar-chart-line" />
            Nivel {pattern.difficulty}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground-600">{pattern.shortDescription}</p>

          <div className="mt-5 flex items-baseline gap-3">
            {isFree ? (
              <span className="text-2xl font-bold text-secondary-700">Gratis</span>
            ) : (
              <span className="text-3xl font-bold text-primary-600">{formatCRC(pattern.price)}</span>
            )}
          </div>

          <div className="mt-6 border-t border-background-200/70 pt-6">
            {isFree ? (
              pattern.fileUrl ? (
                <a
                  href={pattern.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-6 py-4 text-sm font-bold text-secondary-50 transition-colors hover:bg-secondary-600"
                >
                  <i className="ri-download-line text-lg" />
                  Descargar gratis
                </a>
              ) : (
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-background-200 px-6 py-4 text-sm font-bold text-foreground-500">
                  <i className="ri-time-line text-lg" />
                  Descarga disponible pronto
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={handleBuy}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
                  added ? "bg-secondary-600 text-background-50" : "bg-primary-500 text-background-50 hover:bg-primary-600"
                }`}
              >
                <i className={added ? "ri-check-line text-lg" : "ri-shopping-cart-2-line text-lg"} />
                {added ? "¡Agregado al carrito!" : "Comprar patrón"}
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: "ri-file-text-line", label: "Formato PDF" },
              { icon: "ri-smartphone-line", label: "Descarga digital" },
              { icon: "ri-lock-2-line", label: "Pago seguro" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-background-100 px-2 py-3 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background-50 text-primary-600">
                  <i className={item.icon} />
                </span>
                <span className="text-[11px] font-semibold text-foreground-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground-950">Sobre este patrón</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-600">{pattern.description}</p>
        </div>
        <div className="rounded-[2rem] border border-background-200/70 bg-background-100 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground-950">Qué incluye</h2>
          <ul className="mt-3 space-y-2.5">
            {pattern.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground-600">
                <i className="ri-checkbox-circle-fill mt-0.5 text-secondary-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {pattern.details.map((detail) => (
              <span key={detail} className="rounded-full bg-background-50 px-3 py-1 text-[11px] font-semibold text-foreground-500">
                {detail}
              </span>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground-950">
            Otros patrones que te pueden gustar
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {related.map((item) => (
              <PatternCard key={item.id} pattern={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}