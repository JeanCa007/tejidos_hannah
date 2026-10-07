import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

const FORM_SUBMIT_URL = "https://readdy.ai/api/form/db39030m252sfkho28mg";

const contactInfo = [
  {
    icon: "ri-whatsapp-line",
    label: "WhatsApp",
    value: "+506 8888 8888",
    href: "https://wa.me/50688888888",
  },
  {
    icon: "ri-mail-line",
    label: "Correo",
    value: "hola@htejisdoshannah.com",
    href: "mailto:hola@htejisdoshannah.com",
  },
  {
    icon: "ri-map-pin-line",
    label: "Taller",
    value: "San José, Costa Rica",
    href: "",
  },
  {
    icon: "ri-instagram-line",
    label: "Instagram",
    value: "@tejidoshannah",
    href: "https://instagram.com",
  },
];

type FormStatus = "idle" | "loading" | "success" | "error";

export default function ContactoPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const honeypot = String(formData.get("website_alt") ?? "").trim();
    if (honeypot) {
      setStatus("success");
      return;
    }
    formData.delete("website_alt");

    const body = new URLSearchParams();
    formData.forEach((value, key) => {
      body.append(key, String(value));
    });

    setStatus("loading");
    setError("");

    try {
      const response = await fetch(FORM_SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const responseText = await response.text();
      let parsed: {
        code?: string;
        message?: string;
        meta?: { message?: string; detail?: string };
      } | null = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = null;
      }

      const serverMsg =
        parsed?.meta?.message || parsed?.message || parsed?.meta?.detail || responseText;
      const codeOk = parsed?.code === "OK";
      const isSpam =
        typeof serverMsg === "string" && serverMsg.toLowerCase().includes("spam");

      if (response.ok && codeOk && !isSpam) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setError(
          typeof serverMsg === "string" && serverMsg
            ? serverMsg
            : "No pudimos enviar tu mensaje. Intenta de nuevo."
        );
      }
    } catch {
      setStatus("error");
      setError("Hubo un problema de conexión. Revisa tu internet e intenta de nuevo.");
    }
  };

  return (
    <div>
      <header className="pb-6 pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
          Estamos para ayudarte
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Contáctanos
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          ¿Tienes una idea, una consulta o quieres un pedido personalizado?
          Escríbenos y te respondemos lo antes posible.
        </p>
      </header>

      <Link
        to="/preguntas-frecuentes"
        className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-background-200/70 bg-background-100 p-4 transition-colors hover:bg-background-200"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <i className="ri-question-answer-line text-lg" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground-900">
              ¿Tienes una duda rápida?
            </span>
            <span className="block text-sm text-foreground-600">
              Revisa nuestras preguntas frecuentes sobre envíos, pagos y devoluciones.
            </span>
          </span>
        </span>
        <i className="ri-arrow-right-s-line text-xl text-foreground-500" />
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form
          id="contacto-form"
          data-readdy-form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6 sm:p-8"
        >
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                <i className="ri-checkbox-circle-line text-4xl" />
              </span>
              <h2 className="mt-5 font-heading text-xl font-semibold text-foreground-950">
                ¡Mensaje enviado!
              </h2>
              <p className="mt-2 max-w-sm text-sm text-foreground-600">
                Gracias por escribirnos. Te responderemos a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-5 py-2.5 text-sm font-semibold text-foreground-700 hover:bg-background-100"
              >
                <i className="ri-mail-add-line" />
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact_name" className="text-sm font-semibold text-foreground-800">
                    Nombre completo
                  </label>
                  <input
                    id="contact_name"
                    name="name"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label htmlFor="contact_phone" className="text-sm font-semibold text-foreground-800">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="contact_phone"
                    name="phone"
                    type="tel"
                    placeholder="8888 8888"
                    className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact_email" className="text-sm font-semibold text-foreground-800">
                  Correo electrónico
                </label>
                <input
                  id="contact_email"
                  name="email"
                  type="email"
                  required
                  placeholder="tucorreo@ejemplo.com"
                  className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div>
                <label htmlFor="contact_message" className="text-sm font-semibold text-foreground-800">
                  Mensaje
                </label>
                <textarea
                  id="contact_message"
                  name="message"
                  rows={5}
                  required
                  maxLength={500}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className="mt-2 w-full resize-none rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <input
                type="text"
                name="website_alt"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                readOnly
                className="form-guard-field"
              />

              {status === "error" && error && (
                <p className="flex items-start gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
                  <i className="ri-error-warning-line mt-0.5" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
                  status === "loading"
                    ? "cursor-wait bg-primary-400 text-background-50"
                    : "bg-primary-500 text-background-50 hover:bg-primary-600"
                }`}
              >
                {status === "loading" ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-lg" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line text-lg" />
                    Enviar mensaje
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {contactInfo.map((item) => {
            const content = (
              <div className="flex items-center gap-3 rounded-2xl border border-background-200/70 bg-background-50 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <i className={`${item.icon} text-lg`} />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-foreground-500">
                    {item.label}
                  </span>
                  <span className="block text-sm font-semibold text-foreground-900">
                    {item.value}
                  </span>
                </span>
              </div>
            );
            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="block transition-transform hover:-translate-y-0.5"
              >
                {content}
              </a>
            ) : (
              <div key={item.label}>{content}</div>
            );
          })}

          <div className="rounded-[2rem] border border-background-200/70 bg-background-100 p-5">
            <h2 className="font-heading text-base font-semibold text-foreground-950">
              Horario de atención
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground-600">
              <li className="flex items-center justify-between">
                <span>Lunes a viernes</span>
                <span className="font-semibold text-foreground-800">9:00 - 18:00</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Sábados</span>
                <span className="font-semibold text-foreground-800">9:00 - 13:00</span>
              </li>
            </ul>
            <Link
              to="/agenda"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              <i className="ri-calendar-2-line" />
              Agendar una cita
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}