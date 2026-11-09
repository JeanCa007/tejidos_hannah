import { useState } from "react";
import { sendNotificationEmail } from "@/lib/email";
import { formatCRC } from "@/lib/format";
import {
  acceptCustomOrderQuote,
  customOrderStatusLabel,
  customOrderStatusTones,
  customOrderStepIndex,
  customOrderTimeline,
  formatNeededBy,
  pieceLabel,
  type CustomOrder,
} from "@/lib/customOrders";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface CustomOrderCardProps {
  order: CustomOrder;
  onAccepted?: (id: string) => void;
}

export default function CustomOrderCard({ order, onAccepted }: CustomOrderCardProps) {
  const cancelled = order.status === "cancelled";
  const stepIndex = customOrderStepIndex(order.status);
  const statusTone = customOrderStatusTones[order.status] ?? "bg-background-100 text-foreground-600";

  const [confirming, setConfirming] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  const canAccept = order.status === "quoted" && order.quoteAmount != null;

  async function handleAccept() {
    setAccepting(true);
    setAcceptError("");
    try {
      await acceptCustomOrderQuote(order.id);
      setAccepted(true);
      setConfirming(false);
      onAccepted?.(order.id);
      sendNotificationEmail("custom_order_accepted", order.id);
    } catch {
      setAcceptError(
        "No pudimos registrar tu aceptación. Intenta de nuevo en un momento o escríbenos por WhatsApp."
      );
    } finally {
      setAccepting(false);
    }
  }

  return (
    <article className="rounded-[1.5rem] border border-background-200/70 bg-background-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground-950">{pieceLabel(order.pieceType)}</p>
          <p className="mt-0.5 text-xs text-foreground-500">
            Solicitado el {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone}`}
        >
          {customOrderStatusLabel(order.status)}
        </span>
      </div>

      {cancelled ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-background-100 px-4 py-3 text-xs font-medium text-foreground-600">
          <i className="ri-close-circle-line mt-0.5 text-base" />
          Esta solicitud fue cancelada. Si quieres retomarla, escríbenos y la revisamos de nuevo.
        </div>
      ) : (
        <ol className="mt-4">
          {customOrderTimeline.map((step, index) => {
            const done = index <= stepIndex;
            const current = index === stepIndex;
            const isLast = index === customOrderTimeline.length - 1;
            return (
              <li key={step.value} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                      done
                        ? current
                          ? "bg-primary-500 text-background-50"
                          : "bg-secondary-500 text-background-50"
                        : "bg-background-100 text-foreground-400"
                    }`}
                  >
                    <i className={step.icon} />
                  </span>
                  {!isLast && (
                    <span
                      className={`my-0.5 min-h-[14px] w-0.5 flex-1 ${
                        index < stepIndex ? "bg-secondary-400" : "bg-background-200"
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`pb-3 pt-1 text-xs ${
                    done ? "font-semibold text-foreground-900" : "text-foreground-400"
                  } ${isLast ? "pb-0" : ""}`}
                >
                  {step.label}
                  {current && (
                    <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                      Ahora
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {order.quoteAmount != null ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-primary-100 px-4 py-3">
          <span className="text-xs font-semibold text-primary-800">Cotización</span>
          <span className="font-heading text-lg font-bold text-primary-700">
            {formatCRC(order.quoteAmount)}
          </span>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-accent-100 px-4 py-3 text-xs font-medium text-accent-900">
          <i className="ri-time-line mt-0.5 text-base" />
          Estamos preparando tu cotización. Te avisamos por correo en 1 o 2 días hábiles.
        </div>
      )}

      {canAccept && (
        <div className="mt-3">
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-check-double-line text-lg" />
              Aceptar cotización
            </button>
          ) : (
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
              <p className="text-xs font-semibold leading-relaxed text-primary-900">
                ¿Confirmas que aceptas esta cotización? Coordinaremos el pago y empezaremos tu pieza.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-xs font-bold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-60"
                >
                  {accepting ? (
                    <i className="ri-loader-4-line animate-spin text-sm" />
                  ) : (
                    <i className="ri-check-line text-sm" />
                  )}
                  Sí, acepto
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={accepting}
                  className="flex-1 rounded-full border border-background-300 bg-background-50 px-4 py-2.5 text-xs font-bold text-foreground-700 transition-colors hover:bg-background-100 disabled:opacity-60"
                >
                  Ahora no
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {acceptError && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] font-medium text-primary-700">
          <i className="ri-error-warning-line mt-0.5" />
          {acceptError}
        </p>
      )}

      {(accepted || order.status === "accepted") && !cancelled && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-secondary-100 px-4 py-3 text-xs font-semibold text-secondary-900">
          <i className="ri-checkbox-circle-line mt-0.5 text-base" />
          ¡Aceptaste esta cotización! Te escribiremos para coordinar el pago y comenzar tu pieza.
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-background-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-400">
            Cantidad
          </p>
          <p className="text-xs font-semibold text-foreground-800">{order.quantity}</p>
        </div>
        <div className="rounded-xl bg-background-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-400">
            Colores
          </p>
          <p className="truncate text-xs font-semibold text-foreground-800">
            {order.colors || "Por definir"}
          </p>
        </div>
        <div className="rounded-xl bg-background-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-400">
            Medidas
          </p>
          <p className="truncate text-xs font-semibold text-foreground-800">
            {order.size || "Por definir"}
          </p>
        </div>
        <div className="rounded-xl bg-background-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-400">
            Para cuándo
          </p>
          <p className="truncate text-xs font-semibold text-foreground-800">
            {order.neededBy ? formatNeededBy(order.neededBy) : "Sin fecha"}
          </p>
        </div>
      </div>

      {order.referenceImages.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          {order.referenceImages.slice(0, 4).map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="h-12 w-12 overflow-hidden rounded-lg border border-background-200"
            >
              <img
                src={url}
                alt="Referencia de tu pedido"
                className="h-full w-full object-cover object-top"
              />
            </a>
          ))}
          <span className="text-[11px] text-foreground-500">
            {order.referenceImages.length}{" "}
            {order.referenceImages.length === 1 ? "referencia" : "referencias"}
          </span>
        </div>
      )}

      {order.adminNotes && (
        <div className="mt-4 rounded-xl border border-background-200/70 bg-background-100 px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-foreground-700">
            <i className="ri-chat-quote-line" />
            Nota del taller
          </p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-foreground-600">
            {order.adminNotes}
          </p>
        </div>
      )}
    </article>
  );
}