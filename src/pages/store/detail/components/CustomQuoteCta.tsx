import { Link } from "react-router-dom";

export default function CustomQuoteCta() {
  return (
    <section className="mt-12">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-accent-200 bg-accent-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background-50 text-accent-700">
            <i className="ri-magic-line text-2xl" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold text-foreground-950 sm:text-xl">
              ¿No es justo lo que buscabas?
            </h2>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-foreground-600">
              Cuéntanos cómo imaginas tu pieza: color, tamaño y detalles. Te
              preparamos el precio sin compromiso.
            </p>
          </div>
        </div>
        <Link
          to="/pedido-personalizado"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-semibold text-background-50 shadow-soft transition-colors hover:bg-accent-600 sm:w-auto sm:shrink-0"
        >
          <i className="ri-magic-line text-lg" />
          Cotizar pedido
        </Link>
      </div>
    </section>
  );
}