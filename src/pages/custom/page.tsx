import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { formatCRC } from "@/lib/format";
import { sendNotificationEmail } from "@/lib/email";
import {
  createCustomOrder,
  customOrderPieces,
  pieceLabel,
} from "@/lib/customOrders";
import ReferenceUploader from "./components/ReferenceUploader";

const colorOptions = [
  "Crema",
  "Beige",
  "Terracota",
  "Rosa palo",
  "Verde salvia",
  "Mostaza",
  "Azul cielo",
  "Gris perla",
  "Blanco",
  "Negro",
];

const steps = [
  {
    icon: "ri-edit-line",
    title: "Cuéntanos tu idea",
    text: "Describe la pieza, el color y el tamaño que imaginas.",
  },
  {
    icon: "ri-image-add-line",
    title: "Súbenos referencias",
    text: "Fotos o capturas que nos ayuden a ver lo que quieres.",
  },
  {
    icon: "ri-mail-check-line",
    title: "Recibe tu cotización",
    text: "Te escribimos con precio y tiempo en 1 o 2 días hábiles.",
  },
];

export default function CustomOrderPage() {
  const { user, profile } = useAuth();

  const [name, setName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [pieceType, setPieceType] = useState("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [budget, setBudget] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const colorList = colors
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const toggleColor = (color: string) => {
    const next = colorList.includes(color)
      ? colorList.filter((item) => item !== color)
      : [...colorList, color];
    setColors(next.join(", "));
  };

  const resetForm = () => {
    setPieceType("");
    setDescription("");
    setColors("");
    setSize("");
    setQuantity(1);
    setBudget("");
    setNeededBy("");
    setImages([]);
    setError("");
    setStatus("idle");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !description.trim()) {
      setError("Completa tu nombre, correo, teléfono y la descripción de tu idea.");
      return;
    }
    if (description.trim().length < 15) {
      setError("Cuéntanos un poco más de tu idea (al menos una frase completa).");
      return;
    }

    setStatus("sending");
    try {
      const newId = await createCustomOrder({
        userId: user?.id ?? null,
        customerName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        pieceType,
        description: description.trim(),
        colors: colors.trim(),
        size: size.trim(),
        quantity,
        budget: budget ? Number(budget) : null,
        neededBy,
        referenceImages: images,
      });
      setStatus("success");
      if (newId) {
        void sendNotificationEmail("custom_order", newId);
      }
    } catch {
      setStatus("idle");
      setError(
        "No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-background-200/70 bg-background-50 p-7 text-center sm:p-10">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
            <i className="ri-checkbox-circle-line text-4xl" />
          </span>
          <h1 className="mt-5 font-heading text-2xl font-semibold text-foreground-950">
            ¡Recibimos tu idea!
          </h1>
          <p className="mt-3 text-sm text-foreground-600">
            Gracias {name.split(" ")[0]}. Vamos a revisar cada detalle y te
            escribimos a <span className="font-semibold text-foreground-800">{email}</span> con
            la cotización en 1 o 2 días hábiles.
          </p>

          <div className="mt-6 space-y-2.5 rounded-2xl bg-background-100 p-4 text-left text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground-500">Pieza</span>
              <span className="font-semibold text-foreground-800">
                {pieceType ? pieceLabel(pieceType) : "Por definir"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground-500">Cantidad</span>
              <span className="font-semibold text-foreground-800">{quantity}</span>
            </div>
            {colors && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-foreground-500">Colores</span>
                <span className="text-right font-semibold text-foreground-800">{colors}</span>
              </div>
            )}
            {size && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-foreground-500">Tamaño</span>
                <span className="text-right font-semibold text-foreground-800">{size}</span>
              </div>
            )}
            {images.length > 0 && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground-500">Referencias</span>
                <span className="font-semibold text-foreground-800">
                  {images.length} {images.length === 1 ? "imagen" : "imágenes"}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-add-line text-lg" />
              Enviar otra solicitud
            </button>
            <Link
              to="/tienda"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-background-300 bg-background-50 px-6 py-3.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
            >
              <i className="ri-shopping-bag-3-line text-lg" />
              Ver la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="pb-6 pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
          Hecho a tu medida
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Cotiza tu pedido personalizado
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          ¿Sueñas con una manta, un amigurumi o un bolso especial? Cuéntanos cómo lo
          imaginas, súbenos fotos de referencia y te preparamos una cotización sin
          compromiso.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-3 gap-2.5">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-background-200/70 bg-background-50 p-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className={`${step.icon} text-base`} />
            </span>
            <p className="mt-2 text-[11px] font-bold text-foreground-900">
              {index + 1}. {step.title}
            </p>
            <p className="mt-1 hidden text-[11px] leading-snug text-foreground-500 sm:block">
              {step.text}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-background-200/70 bg-background-50 p-5 sm:p-8"
        >
          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                1
              </span>
              Tu idea
            </h2>

            <p className="mt-4 text-sm font-semibold text-foreground-800">¿Qué quieres tejer?</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {customOrderPieces.map((piece) => {
                const active = pieceType === piece.value;
                return (
                  <button
                    key={piece.value}
                    type="button"
                    onClick={() => setPieceType(piece.value)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition-colors ${
                      active
                        ? "border-primary-400 bg-primary-100 text-primary-800"
                        : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
                    }`}
                  >
                    <i className={`${piece.icon} text-lg`} />
                    {piece.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="custom_description" className="text-sm font-semibold text-foreground-800">
                  Describe tu pedido <span className="text-primary-500">*</span>
                </label>
                <span className="text-xs text-foreground-400">{description.length}/600</span>
              </div>
              <textarea
                id="custom_description"
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 600))}
                rows={5}
                required
                placeholder="Ejemplo: quiero una manta tejida para regalo de bebé, en tonos crema y mostaza, con textura de punto y un borde de conejitos..."
                className="mt-2 w-full resize-none rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </section>

          <div className="my-7 border-t border-background-200/70" />

          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                2
              </span>
              Detalles
            </h2>

            <div className="mt-4">
              <span className="text-sm font-semibold text-foreground-800">Colores que te gustan</span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const active = colorList.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "border-secondary-400 bg-secondary-100 text-secondary-900"
                          : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
                      }`}
                    >
                      {active && <i className="ri-check-line text-sm" />}
                      {color}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={colors}
                onChange={(event) => setColors(event.target.value)}
                placeholder="O escribe los tonos que prefieres..."
                className="mt-2.5 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="custom_size" className="text-sm font-semibold text-foreground-800">
                  Tamaño o medidas
                </label>
                <input
                  id="custom_size"
                  type="text"
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                  placeholder="Ej: 100 x 120 cm, talla 2 años"
                  className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label htmlFor="custom_date" className="text-sm font-semibold text-foreground-800">
                  ¿Para cuándo lo necesitas?
                </label>
                <input
                  id="custom_date"
                  type="date"
                  min={today}
                  value={neededBy}
                  onChange={(event) => setNeededBy(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <span className="text-sm font-semibold text-foreground-800">Cantidad</span>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-background-200 bg-background-50 px-3 py-2">
                  <button
                    type="button"
                    aria-label="Quitar una unidad"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-background-100 text-foreground-700 transition-colors hover:bg-background-200"
                  >
                    <i className="ri-subtract-line" />
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-foreground-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Agregar una unidad"
                    onClick={() => setQuantity((value) => Math.min(50, value + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-background-50 transition-colors hover:bg-primary-600"
                  >
                    <i className="ri-add-line" />
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="custom_budget" className="text-sm font-semibold text-foreground-800">
                  Presupuesto aproximado (₡)
                </label>
                <input
                  id="custom_budget"
                  type="number"
                  min={0}
                  step={1000}
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="Opcional"
                  className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                {budget && Number(budget) > 0 && (
                  <p className="mt-1.5 text-xs text-foreground-500">
                    Aproximado: {formatCRC(Number(budget))}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="my-7 border-t border-background-200/70" />

          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                3
              </span>
              Fotos de referencia
            </h2>
            <div className="mt-4">
              <ReferenceUploader value={images} onChange={setImages} />
            </div>
          </section>

          <div className="my-7 border-t border-background-200/70" />

          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                4
              </span>
              Tus datos
            </h2>

            <div className="mt-4 space-y-5">
              <div>
                <label htmlFor="custom_name" className="text-sm font-semibold text-foreground-800">
                  Nombre completo <span className="text-primary-500">*</span>
                </label>
                <input
                  id="custom_name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="custom_email" className="text-sm font-semibold text-foreground-800">
                    Correo electrónico <span className="text-primary-500">*</span>
                  </label>
                  <input
                    id="custom_email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label htmlFor="custom_phone" className="text-sm font-semibold text-foreground-800">
                    Teléfono / WhatsApp <span className="text-primary-500">*</span>
                  </label>
                  <input
                    id="custom_phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="8888 8888"
                    className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
                <i className="ri-error-warning-line mt-0.5" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
                status === "sending"
                  ? "cursor-wait bg-primary-400 text-background-50"
                  : "bg-primary-500 text-background-50 hover:bg-primary-600"
              }`}
            >
              {status === "sending" ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-lg" />
                  Enviando tu idea...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line text-lg" />
                  Solicitar cotización
                </>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-foreground-400">
              Sin compromiso. Te respondemos con precio y tiempo estimado.
            </p>
          </section>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-background-200/70 bg-background-100">
            <img
              src="https://readdy.ai/api/search-image?query=A%20warm%20flat%20lay%20of%20pastel%20yarn%20skeins%2C%20wooden%20crochet%20hooks%20and%20a%20half%20finished%20crochet%20blanket%20on%20a%20cream%20linen%20surface%2C%20soft%20natural%20daylight%2C%20artisanal%20handmade%20aesthetic%2C%20editorial%20photography%20with%20gentle%20shadows&width=800&height=600&seq=th-custom-01&orientation=landscape"
              alt="Materiales de tejido para un pedido personalizado"
              className="h-40 w-full object-cover object-top"
            />
            <div className="p-5">
              <h2 className="font-heading text-lg font-semibold text-foreground-950">
                Cada pieza es única
              </h2>
              <p className="mt-1.5 text-sm text-foreground-600">
                Elegimos juntas la lana, el tono y el acabado. Nada se repite, todo se
                hace pensando en ti.
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-foreground-600">
                <li className="flex items-start gap-2.5">
                  <i className="ri-time-line mt-0.5 text-accent-600" />
                  Tiempo según el tamaño de la pieza
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="ri-palette-line mt-0.5 text-accent-600" />
                  Combinación de colores a tu gusto
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="ri-truck-line mt-0.5 text-accent-600" />
                  Envío a todo Costa Rica
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-background-200/70 bg-background-50 p-5">
            <h2 className="font-heading text-base font-semibold text-foreground-950">
              ¿Prefieres escribirnos?
            </h2>
            <p className="mt-1 text-sm text-foreground-600">
              Cuéntanos tu idea por WhatsApp y te ayudamos a definirla.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <a
                href="https://wa.me/50688888888"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-secondary-600"
              >
                <i className="ri-whatsapp-line text-lg" />
                Escribir por WhatsApp
              </a>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-background-300 bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
              >
                <i className="ri-message-3-line text-lg" />
                Ir a contacto
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}