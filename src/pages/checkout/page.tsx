import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatCRC } from "@/lib/format";
import { fetchShippingZones, createOrder, zoneCost } from "@/lib/orders";
import type { ShippingZone } from "@/lib/storeTypes";
import ZonePicker from "./components/ZonePicker";
import OrderSummary from "./components/OrderSummary";

const paymentMethods = [
  {
    value: "sinpe",
    label: "SINPE Móvil / Transferencia",
    description: "Te enviamos los datos al confirmar el pedido.",
    icon: "ri-smartphone-line",
  },
  {
    value: "contra_entrega",
    label: "Pago contra entrega",
    description: "Pagas en efectivo cuando recibes tu pedido.",
    icon: "ri-hand-coin-line",
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("sinpe");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (profile?.full_name) setFullName((prev) => prev || profile.full_name || "");
    if (profile?.email || user?.email) {
      setEmail((prev) => prev || profile?.email || user?.email || "");
    }
    if (profile?.phone) setPhone((prev) => prev || profile.phone || "");
  }, [profile, user]);

  useEffect(() => {
    let active = true;
    (async () => {
      setZonesLoading(true);
      setZonesError("");
      try {
        const data = await fetchShippingZones();
        if (!active) return;
        setZones(data);
        if (data.length > 0) {
          setZoneId((prev) => prev || data[0].id);
        }
      } catch {
        if (active) {
          setZonesError(
            "No pudimos cargar las zonas de envío. Revisa tu conexión e intenta de nuevo."
          );
        }
      } finally {
        if (active) setZonesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedZone = useMemo(
    () => zones.find((zone) => zone.id === zoneId) ?? null,
    [zones, zoneId]
  );

  const shippingCost = useMemo(
    () => zoneCost(selectedZone, subtotal),
    [selectedZone, subtotal]
  );

  const total = subtotal + shippingCost;
  const isPickup = selectedZone != null && selectedZone.provinces.length === 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (items.length === 0) {
      setFormError("Tu carrito está vacío.");
      return;
    }
    if (!selectedZone) {
      setFormError("Elige una zona de envío para continuar.");
      return;
    }
    if (!isPickup && !address.trim()) {
      setFormError("Escribe la dirección donde quieres recibir tu pedido.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOrder({
        customerName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        shippingAddress: isPickup ? "Retiro en taller" : address.trim(),
        shippingRegion: selectedZone.name,
        shippingCost,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          kind: item.kind,
          name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      clearCart();
      navigate(`/pedido/${created.id}`, { replace: true });
    } catch {
      setFormError(
        "No pudimos crear tu pedido. Revisa tus datos e intenta de nuevo."
      );
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <i className="ri-shopping-cart-2-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          No hay productos para pagar
        </h1>
        <p className="mt-2 max-w-sm text-sm text-foreground-600">
          Agrega algo a tu carrito antes de finalizar la compra.
        </p>
        <Link
          to="/tienda"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-shopping-bag-3-line text-lg" />
          Ir a la tienda
        </Link>
      </section>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 py-4 text-xs text-foreground-500">
        <Link to="/carrito" className="hover:text-primary-600">
          Carrito
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="font-semibold text-foreground-700">Finalizar compra</span>
      </nav>

      <header className="pb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
          Último paso
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Finalizar compra
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          Completa tus datos de envío y elige cómo quieres pagar. Te
          confirmaremos todo por correo o WhatsApp.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6 sm:p-8"
        >
          <div className="space-y-6">
            <section>
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
                <i className="ri-user-3-line text-primary-600" />
                Tus datos
              </h2>
              <div className="mt-4 space-y-5">
                <div>
                  <label htmlFor="full_name" className="text-sm font-semibold text-foreground-800">
                    Nombre completo
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre"
                    className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="text-sm font-semibold text-foreground-800">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm font-semibold text-foreground-800">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="8888 8888"
                      className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-background-200/70 pt-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
                <i className="ri-truck-line text-primary-600" />
                Envío
              </h2>

              {zonesLoading ? (
                <div className="mt-4 flex items-center justify-center rounded-xl bg-background-100 py-6">
                  <i className="ri-loader-4-line animate-spin text-2xl text-primary-500" />
                </div>
              ) : zonesError ? (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-primary-100 px-4 py-5 text-center">
                  <p className="text-sm font-medium text-primary-800">{zonesError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-background-50 hover:bg-primary-600"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-foreground-800">
                    Zona de entrega
                  </p>
                  <ZonePicker
                    zones={zones}
                    selectedId={zoneId}
                    subtotal={subtotal}
                    onSelect={setZoneId}
                  />

                  {!isPickup && (
                    <div className="mt-5">
                      <label htmlFor="address" className="text-sm font-semibold text-foreground-800">
                        Dirección de entrega
                      </label>
                      <textarea
                        id="address"
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Señas exactas, distrito, provincia..."
                        className="mt-2 w-full resize-none rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  )}

                  <div className="mt-5">
                    <label htmlFor="notes" className="text-sm font-semibold text-foreground-800">
                      Notas (opcional)
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      maxLength={500}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="¿Alguna indicación especial?"
                      className="mt-2 w-full resize-none rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="border-t border-background-200/70 pt-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
                <i className="ri-bank-card-line text-primary-600" />
                Método de pago
              </h2>
              <div className="mt-4 space-y-2">
                {paymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? "border-primary-500 bg-primary-50"
                          : "border-background-200 bg-background-50 hover:bg-background-100"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isSelected
                            ? "bg-primary-500 text-background-50"
                            : "bg-background-100 text-foreground-600"
                        }`}
                      >
                        <i className={`${method.icon} text-lg`} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-foreground-900">
                          {method.label}
                        </span>
                        <span className="block text-xs text-foreground-500">
                          {method.description}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? "border-primary-500 bg-primary-500 text-background-50"
                            : "border-background-300 text-transparent"
                        }`}
                      >
                        <i className="ri-check-line text-xs" />
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-foreground-500">
                <i className="ri-information-line mt-0.5" />
                El pago en línea con tarjeta estará disponible muy pronto.
              </p>
            </section>

            {formError && (
              <p className="flex items-start gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
                <i className="ri-error-warning-line mt-0.5" />
                {formError}
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-background-200/70 pt-6 lg:hidden">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
              shippingLabel={selectedZone ? selectedZone.name : ""}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || zonesLoading}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
              submitting || zonesLoading
                ? "cursor-wait bg-primary-400 text-background-50"
                : "bg-primary-500 text-background-50 hover:bg-primary-600"
            }`}
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-lg" />
                Procesando...
              </>
            ) : (
              <>
                <i className="ri-lock-2-line text-lg" />
                Confirmar pedido · {formatCRC(total)}
              </>
            )}
          </button>
        </form>

        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            shippingLabel={selectedZone ? selectedZone.name : ""}
          />
        </aside>
      </div>
    </div>
  );
}