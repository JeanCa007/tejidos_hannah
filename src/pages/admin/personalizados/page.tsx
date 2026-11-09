import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/pages/admin/components/Modal";
import {
  AdminHeader,
  Card,
  EmptyState,
  ErrorBanner,
  GhostButton,
  LoadingRows,
  PrimaryButton,
  SearchInput,
  SelectField,
  StatusBadge,
  TextArea,
  TextField,
} from "@/pages/admin/components/ui";
import { formatCRC } from "@/lib/format";
import { currentSiteUrl, sendNotificationEmail } from "@/lib/email";
import {
  customOrderStatuses,
  daysUntil,
  fetchCustomOrders,
  formatNeededBy,
  isCustomOrderOverdue,
  pieceLabel,
  sortByNeededBy,
  updateCustomOrder,
  type CustomOrder,
} from "@/lib/customOrders";

const filterOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "overdue", label: "Solo atrasadas" },
  ...customOrderStatuses,
];

const sortOptions = [
  { value: "delivery", label: "Por fecha de entrega" },
  { value: "recent", label: "Más recientes" },
];

export default function AdminCustomOrdersPage() {
  const [rows, setRows] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("delivery");
  const [selected, setSelected] = useState<CustomOrder | null>(null);

  const [status, setStatus] = useState("pending");
  const [quote, setQuote] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCustomOrders();
      setRows(data);
    } catch {
      setError(
        "No pudimos cargar las solicitudes personalizadas. Revisa tu conexión e intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openRow = (row: CustomOrder) => {
    setSelected(row);
    setStatus(row.status);
    setQuote(row.quoteAmount == null ? "" : String(row.quoteAmount));
    setNotes(row.adminNotes);
    setSavedMessage("");
  };

  const closeModal = () => {
    setSelected(null);
    setSavedMessage("");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const amount = quote.trim() === "" ? null : Number(quote);
      const nextAmount = amount != null && Number.isFinite(amount) ? amount : null;
      await updateCustomOrder(selected.id, {
        status,
        quoteAmount: nextAmount,
        adminNotes: notes.trim(),
      });
      setRows((prev) =>
        prev.map((row) =>
          row.id === selected.id
            ? {
                ...row,
                status,
                quoteAmount: nextAmount,
                adminNotes: notes.trim(),
              }
            : row
        )
      );

      // Al cotizar por primera vez, se envía la cotización con botón de aceptar.
      const shouldSendQuote =
        status === "quoted" &&
        nextAmount != null &&
        (selected.status !== "quoted" || selected.quoteAmount !== nextAmount);

      if (shouldSendQuote) {
        await sendNotificationEmail("custom_order_quoted", selected.id, {
          siteUrl: currentSiteUrl(),
        });
        setSavedMessage(
          "Cotización guardada y enviada a la clienta por correo, con un botón para aceptarla."
        );
      } else {
        setSavedMessage("Cambios guardados correctamente.");
      }
    } catch {
      setSavedMessage("No pudimos guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (filter === "overdue") {
        if (!isCustomOrderOverdue(row)) return false;
      } else if (filter !== "all" && row.status !== filter) {
        return false;
      }
      if (!term) return true;
      return `${row.customerName} ${row.email} ${row.phone} ${row.description}`
        .toLowerCase()
        .includes(term);
    });
    return sortBy === "delivery" ? sortByNeededBy(matched) : matched;
  }, [rows, search, filter, sortBy]);

  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const overdueCount = rows.filter((row) => isCustomOrderOverdue(row)).length;

  return (
    <div>
      <AdminHeader
        title="Pedidos personalizados"
        description={
          overdueCount > 0
            ? `${overdueCount} solicitud(es) atrasada(s) y ${pendingCount} esperando cotización.`
            : pendingCount > 0
            ? `${pendingCount} solicitud(es) esperando cotización.`
            : "Solicitudes de piezas hechas a la medida de tus clientas."
        }
        action={
          <GhostButton icon="ri-refresh-line" onClick={load}>
            Actualizar
          </GhostButton>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="ri-hand-heart-line"
          title="Todavía no hay solicitudes"
          description="Cuando alguien cotice un pedido personalizado desde la tienda, aparecerá aquí."
        />
      ) : (
        <>
          {overdueCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter(filter === "overdue" ? "all" : "overdue")}
              className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-primary-200 bg-primary-100 px-4 py-3.5 text-left transition-colors hover:bg-primary-200/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-background-50">
                <i className="ri-alarm-warning-line" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-primary-800">
                  {overdueCount} solicitud(es) con la entrega atrasada
                </span>
                <span className="block text-[11px] text-primary-800/80">
                  {filter === "overdue"
                    ? "Toca para ver todas de nuevo."
                    : "La fecha ya pasó. Atiéndelas primero."}
                </span>
              </span>
              <i className="ri-arrow-right-line shrink-0 text-primary-700" />
            </button>
          )}

          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_11rem_13rem]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre, correo o idea..."
            />
            <SelectField value={filter} onChange={setFilter} options={filterOptions} />
            <SelectField value={sortBy} onChange={setSortBy} options={sortOptions} />
          </div>

          <div className="space-y-3">
            {filtered.map((row) => {
              const overdue = isCustomOrderOverdue(row);
              const days = daysUntil(row.neededBy);
              return (
              <button
                key={row.id}
                type="button"
                onClick={() => openRow(row)}
                className={`flex w-full flex-wrap items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  overdue
                    ? "border-primary-300 bg-primary-50 hover:bg-primary-100/70"
                    : "border-background-200/70 bg-background-50 hover:bg-background-100"
                }`}
              >

                <div className="min-w-44 flex-1">
                  <p className="text-sm font-semibold text-foreground-900">
                    {row.customerName}
                  </p>
                  <p className="line-clamp-1 text-xs text-foreground-500">
                    {pieceLabel(row.pieceType)} · {row.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {row.referenceImages.slice(0, 3).map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt="Referencia"
                      className="h-9 w-9 rounded-lg border border-background-200 object-cover object-top"
                    />
                  ))}
                  {row.referenceImages.length > 3 && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-100 text-[11px] font-bold text-foreground-600">
                      +{row.referenceImages.length - 3}
                    </span>
                  )}
                </div>

                <div className="text-xs text-foreground-600">
                  <p className="flex items-center gap-1.5">
                    <i className="ri-user-3-line" />
                    {row.phone}
                  </p>
                  <p
                    className={`mt-1 flex items-center gap-1.5 ${
                      overdue ? "font-semibold text-primary-700" : ""
                    }`}
                  >
                    <i className={overdue ? "ri-alarm-warning-line" : "ri-calendar-line"} />
                    {row.neededBy ? formatNeededBy(row.neededBy) : "Sin fecha"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-foreground-900">
                    {row.quoteAmount != null ? formatCRC(row.quoteAmount) : "Sin cotizar"}
                  </p>
                  <StatusBadge status={row.status} />
                  {days != null &&
                    (overdue ? (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-background-50">
                        <i className="ri-alarm-warning-line" />
                        {Math.abs(days)} d atrasada
                      </span>
                    ) : (
                      <p
                        className={`mt-1 text-[10px] font-bold ${
                          days <= 3 ? "text-accent-700" : "text-foreground-500"
                        }`}
                      >
                        {days === 0 ? "Entrega hoy" : `Faltan ${days} d`}
                      </p>
                    ))}
                </div>

                <i className="ri-arrow-right-s-line text-lg text-foreground-400" />
              </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-background-200/70 bg-background-50 p-6 text-center text-sm text-foreground-500">
                No hay solicitudes con ese filtro.
              </p>
            )}
          </div>
        </>
      )}

      <Modal
        open={Boolean(selected)}
        title="Solicitud personalizada"
        onClose={closeModal}
        size="lg"
        footer={
          <>
            <GhostButton onClick={closeModal}>Cerrar</GhostButton>
            <PrimaryButton onClick={save} loading={saving} icon="ri-save-3-line">
              Guardar cambios
            </PrimaryButton>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <Card className="bg-background-100 p-4">
              <p className="text-sm font-bold text-foreground-900">
                {selected.customerName}
              </p>
              <div className="mt-2 space-y-1 text-xs text-foreground-600">
                <p className="flex items-center gap-1.5">
                  <i className="ri-mail-line" />
                  <a href={`mailto:${selected.email}`} className="hover:text-primary-600">
                    {selected.email}
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <i className="ri-phone-line" />
                  <a
                    href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary-600"
                  >
                    {selected.phone}
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <i className="ri-time-line" />
                  Solicitado el{" "}
                  {new Date(selected.createdAt).toLocaleDateString("es-CR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <p className="text-xs font-semibold text-foreground-500">Pieza</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {pieceLabel(selected.pieceType)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-foreground-500">Cantidad</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {selected.quantity}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-foreground-500">Colores</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {selected.colors || "Por definir"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-foreground-500">Tamaño</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {selected.size || "Por definir"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-foreground-500">Fecha deseada</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {selected.neededBy ? formatNeededBy(selected.neededBy) : "Sin fecha"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-foreground-500">Presupuesto</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {selected.budget != null ? formatCRC(selected.budget) : "No indicado"}
                </p>
              </Card>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground-500">Descripción</p>
              <p className="mt-1 whitespace-pre-line rounded-2xl bg-background-100 p-4 text-sm text-foreground-700">
                {selected.description}
              </p>
            </div>

            {selected.referenceImages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground-500">
                  Imágenes de referencia
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2.5">
                  {selected.referenceImages.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-square overflow-hidden rounded-xl border border-background-200"
                    >
                      <img
                        src={url}
                        alt="Referencia"
                        className="h-full w-full object-cover object-top transition-transform hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Estado"
                value={status}
                onChange={setStatus}
                options={customOrderStatuses}
              />
              <TextField
                label="Monto cotizado (₡)"
                value={quote}
                onChange={setQuote}
                type="number"
                placeholder="Ej: 35000"
              />
            </div>

            {status === "quoted" && quote.trim() !== "" && (
              <p className="flex items-start gap-2 rounded-xl bg-background-100 px-4 py-3 text-[11px] leading-relaxed text-foreground-600">
                <i className="ri-mail-send-line mt-0.5 text-primary-600" />
                <span>
                  Al guardar le enviaremos la cotización a {selected.email} con un
                  botón para que la acepte en un clic.
                </span>
              </p>
            )}

            <TextArea
              label="Notas internas"
              value={notes}
              onChange={setNotes}
              rows={3}
              placeholder="Detalles de la lana, tiempos de entrega, acuerdos..."
            />

            {savedMessage && (
              <p className="flex items-center gap-2 rounded-xl bg-secondary-100 px-4 py-3 text-sm font-medium text-secondary-900">
                <i className="ri-checkbox-circle-line" />
                {savedMessage}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}