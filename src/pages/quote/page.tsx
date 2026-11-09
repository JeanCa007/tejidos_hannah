import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import { sendNotificationEmail } from "@/lib/email";
import {
  acceptCustomOrderQuoteByToken,
  customOrderStatusLabel,
  fetchCustomOrderQuote,
  formatNeededBy,
  pieceLabel,
  type CustomOrderQuote,
} from "@/lib/customOrders";

type ViewState = "loading" | "ready" | "notfound" | "error";

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
        <i className={`${icon} text-sm`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-500">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground-900">{value}</p>
      </div>
    </div>
  );
}

export default function QuotePage() {
  const { token = "" } = useParams();
  const [view, setView] = useState<ViewState>("loading");
  const [quote, setQuote] = useState<CustomOrderQuote | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setView("notfound");
      return;
    }
    setView("loading");
    try {
      const data = await fetchCustomOrderQuote(token);
      if (!data) {
        setView("notfound");
        return;
      }
      setQuote(data);
      setAccepted(data.status === "accepted" || data.status === "in_progress" || data.status === "completed");
      setView("ready");
    } catch {
      setView("error");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmAccept = async () => {
    setAccepting(true);
    setAcceptError("");
    try {
      await acceptCustomOrderQuoteByToken(token);
      setAccepted(true);
      setConfirming(false);
      // Aviso al taller (mejor esfuerzo: la aceptación ya quedó guardada).
      await sendNotificationEmail("custom_order_accepted", "", { token });
    } catch {
      setAcceptError(
        "No pudimos registrar tu aceptación. Puede que la cotización ya no esté disponible; escríbenos por WhatsApp y lo resolvemos."
      );
      setConfirming(false);
    } finally {
      setAccepting(false);
    }
  };

  if (view === "loading") {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (view === "error") {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-wifi-off-line text-2xl" />
        </span>
        <h1 className="mt-4 font-heading text-xl font-semibold text-foreground-950">
          No pudimos abrir tu cotización
        </h1>
        <p className="mt-1 text-sm text-foreground-600">
          Revisa tu conexión e intenta de nuevo.
        </p>
        <button
          type="button"
          onClick={load}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-refresh-line" />
          Reintentar
        </button>
      </div>
    );
  }

  if (view === "notfound" || !quote) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-file-search-line text-2xl" />
        </span>
        <h1 className="mt-4 font-heading text-xl font-semibold text-foreground-950">
          Esta cotización no está disponible
        </h1>
        <p className="mt-1 text-sm text-foreground-600">
          El enlace puede haber cambiado. Escríbenos y con gusto te enviamos tu
          cotización de nuevo.
        </p>
        <Link
          to="/contacto"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-message-3-line" />
          Contactar al taller
        </Link>
      </div>
    );
  }

  const canAccept = quote.status === "quoted" && quote.quoteAmount != null && !accepted;
  const isCancelled = quote.status === "cancelled";
  const isPending = quote.status === "pending";
  const amount = quote.quoteAmount;

  return (
    <div className="mx-auto max-w-xl py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-foreground-500">
        <Link to="/" className="hover:text-primary-600">
          Inicio
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="font-semibold text-foreground-700">Tu cotización</span>
      </nav>

      <header className="pb-5">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
          Pedido personalizado
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950">
          Hola, {quote.customerName || "gracias por escribirnos"}
        </h1>
        <p className="mt-2 text-sm text-foreground-600">
          Esta es la cotización de tu pieza hecha a mano. Revísala con calma y
          acéptala cuando estés lista.
        </p>
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-background-200/70 bg-background-50">
        <div className="flex items-center justify-between gap-4 bg-primary-500 px-6 py-5 text-background-50">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-background-50/80">
              Monto cotizado
            </p>
            <p className="mt-0.5 font-heading text-2xl font-semibold">
              {amount != null ? formatCRC(amount) : "En preparación"}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background-50/20">
            <i className="ri-price-tag-3-line text-xl" />
          </span>
        </div>

        <div className="px-6 py-4">
          <div className="divide-y divide-background-200/70">
            <DetailRow icon="ri-hand-heart-line" label="Pieza" value={pieceLabel(quote.pieceType)} />
            <DetailRow icon="ri-stack-line" label="Cantidad" value={String(quote.quantity)} />
            <DetailRow
              icon="ri-palette-line"
              label="Colores"
              value={quote.colors || "Por definir contigo"}
            />
            <DetailRow
              icon="ri-ruler-2-line"
              label="Medidas"
              value={quote.size || "Por definir contigo"}
            />
            <DetailRow
              icon="ri-calendar-event-line"
              label="Para cuándo"
              value={quote.neededBy ? formatNeededBy(quote.neededBy) : "Sin fecha definida"}
            />
          </div>

          {quote.description && (
            <div className="mt-4 rounded-2xl bg-background-100 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-500">
                Tu idea
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground-700">
                {quote.description}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-background-200/70 px-6 py-5">
          {accepted && (
            <div className="flex items-start gap-3 rounded-2xl bg-secondary-100 p-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-secondary-50">
                <i className="ri-checkbox-circle-line" />
              </span>
              <div>
                <p className="text-sm font-bold text-secondary-900">
                  ¡Cotización aceptada!
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-secondary-900/80">
                  Gracias por confiar en el taller. Te escribiremos muy pronto para
                  coordinar el pago, los materiales y el inicio de tu pieza.
                </p>
              </div>
            </div>
          )}

          {!accepted && isCancelled && (
            <div className="flex items-start gap-3 rounded-2xl bg-background-100 p-4">
              <i className="ri-information-line mt-0.5 text-foreground-500" />
              <p className="text-sm text-foreground-600">
                Esta solicitud fue cancelada. Si quieres retomarla, escríbenos y con
                gusto la revisamos de nuevo.
              </p>
            </div>
          )}

          {!accepted && isPending && (
            <div className="flex items-start gap-3 rounded-2xl bg-accent-100 p-4">
              <i className="ri-time-line mt-0.5 text-accent-900" />
              <p className="text-sm text-accent-900">
                Estamos preparando tu cotización. Te avisaremos por correo en cuanto
                esté lista.
              </p>
            </div>
          )}

          {canAccept && !confirming && (
            <>
              <button
                type="button"
                onClick={() => {
                  setAcceptError("");
                  setConfirming(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-bold text-background-50 transition-colors hover:bg-primary-600"
              >
                <i className="ri-check-double-line text-lg" />
                Aceptar cotización
              </button>
              <p className="mt-2.5 text-center text-[11px] text-foreground-500">
                Al aceptar, coordinamos el pago y comenzamos tu pieza.
              </p>
            </>
          )}

          {canAccept && confirming && (
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
              <p className="text-sm font-semibold text-foreground-900">
                ¿Confirmas que aceptas esta cotización por{" "}
                {amount != null ? formatCRC(amount) : ""}?
              </p>
              <p className="mt-1 text-xs text-foreground-600">
                Nos pondremos en contacto para coordinar el pago y la entrega.
              </p>
              <div className="mt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={confirmAccept}
                  disabled={accepting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-bold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-60"
                >
                  {accepting ? (
                    <i className="ri-loader-4-line animate-spin" />
                  ) : (
                    <i className="ri-check-line" />
                  )}
                  Sí, acepto
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={accepting}
                  className="flex-1 rounded-full border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100 disabled:opacity-60"
                >
                  Ahora no
                </button>
              </div>
            </div>
          )}

          {acceptError && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-primary-100 px-4 py-3 text-xs font-medium text-primary-800">
              <i className="ri-error-warning-line mt-0.5" />
              {acceptError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-foreground-500">
            <span>Estado actual: {customOrderStatusLabel(quote.status)}</span>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:text-primary-600"
            >
              <i className="ri-whatsapp-line" />
              Hablar con el taller
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-background-100 p-4">
        <i className="ri-shield-check-line mt-0.5 text-secondary-700" />
        <p className="text-[11px] leading-relaxed text-foreground-600">
          Este enlace es personal y solo muestra tu cotización. Si lo compartiste sin
          querer, escríbenos y generamos uno nuevo.
        </p>
      </div>
    </div>
  );
}