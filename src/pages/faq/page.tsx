import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  id: string;
  label: string;
  icon: string;
  items: FaqItem[];
}

const faqGroups: FaqGroup[] = [
  {
    id: "envios",
    label: "Envíos",
    icon: "ri-truck-line",
    items: [
      {
        q: "¿A dónde hacen envíos?",
        a: "Enviamos a todo Costa Rica. En la zona metropolitana (San José, Heredia, Alajuela y Cartago) entregamos en 1 a 3 días hábiles. Al resto del país llega entre 3 y 5 días hábiles por correo o mensajería.",
      },
      {
        q: "¿Cuánto cuesta el envío?",
        a: "El costo se calcula según la zona. En el checkout eliges tu zona y el sistema te muestra el precio antes de confirmar. En compras grandes el envío puede salir gratis.",
      },
      {
        q: "¿Puedo retirar mi pedido en persona?",
        a: "Sí. Puedes elegir la opción de retiro y coordinamos un punto de entrega en San José. Te avisamos por correo o WhatsApp cuando tu pedido esté listo.",
      },
      {
        q: "¿Cómo sigo mi pedido?",
        a: "Al confirmar tu compra te mandamos un correo con el número de pedido y el detalle. También puedes ver el estado en cualquier momento desde 'Mi cuenta → Mis pedidos'.",
      },
    ],
  },
  {
    id: "pagos",
    label: "Pagos",
    icon: "ri-bank-card-line",
    items: [
      {
        q: "¿Qué formas de pago aceptan?",
        a: "Aceptamos SINPE Móvil, transferencia bancaria y pago contra entrega. Coordinamos contigo por correo o WhatsApp apenas recibimos tu pedido.",
      },
      {
        q: "¿Es seguro pagar con SINPE Móvil?",
        a: "Totalmente. Te enviamos los datos para el depósito y te pedimos el comprobante. Verificamos el pago y luego preparamos tu pedido.",
      },
      {
        q: "¿En cuánto tiempo debo pagar?",
        a: "Recomendamos hacer el pago dentro de las 48 horas siguientes a la compra. Si necesitas más tiempo, escríbenos y lo acomodamos sin problema.",
      },
      {
        q: "¿Emiten factura?",
        a: "Sí, emitimos factura electrónica. Solo indícanos tu nombre o cédula al momento de coordinar el pago.",
      },
    ],
  },
  {
    id: "devoluciones",
    label: "Devoluciones",
    icon: "ri-refund-2-line",
    items: [
      {
        q: "¿Puedo devolver un producto?",
        a: "Sí. Aceptamos devoluciones dentro de los 8 días naturales después de recibir tu pedido, siempre que la pieza esté sin usar, en buen estado y con su empaque original.",
      },
      {
        q: "¿Cómo hago una devolución?",
        a: "Escríbenos por WhatsApp o correo con tu número de pedido y el motivo. Te guiamos paso a paso para el envío o la entrega de la pieza.",
      },
      {
        q: "¿Y si mi pedido llega dañado?",
        a: "Nuestras piezas son hechas a mano y las revisamos antes de enviarlas. Si llega algo en mal estado, mándanos una foto dentro de las primeras 48 horas y te reponemos la pieza sin costo.",
      },
      {
        q: "¿Las piezas personalizadas tienen devolución?",
        a: "Al ser creadas exclusivamente para ti, las piezas a la medida no tienen devolución. Pero si algo no quedó como lo esperabas, escríbenos y buscamos una solución juntos.",
      },
    ],
  },
  {
    id: "cursos",
    label: "Cursos y patrones",
    icon: "ri-graduation-cap-line",
    items: [
      {
        q: "¿Cómo me matriculo en un curso?",
        a: "Entra a 'Cursos', elige el que te guste, escoge un horario disponible y completa el formulario de matrícula. Te confirmamos el cupo por correo o WhatsApp.",
      },
      {
        q: "¿Qué incluye un curso?",
        a: "Todas las clases incluyen los materiales básicos y la guía paso a paso. Para algunos cursos solo necesitas traer tus ganas de aprender.",
      },
      {
        q: "¿Qué pasa si no puedo asistir a una clase?",
        a: "Avísanos con anticipación y te ayudamos a reprogramar en otro horario disponible del mismo curso.",
      },
      {
        q: "¿Los patrones son descargables?",
        a: "Sí. Al comprar un patrón te damos acceso digital con instrucciones detalladas para que lo tejas a tu ritmo. Puedes verlo desde 'Mi cuenta → Mis patrones'.",
      },
    ],
  },
];

const quickLinks = [
  { label: "Contacto", to: "/contacto", icon: "ri-customer-service-2-line" },
  { label: "Agendar cita", to: "/agenda", icon: "ri-calendar-check-line" },
  { label: "Ver la tienda", to: "/tienda", icon: "ri-shopping-bag-3-line" },
];

export default function FaqPage() {
  const [activeGroup, setActiveGroup] = useState<string>("envios");
  const [openItem, setOpenItem] = useState<string | null>("envios-0");

  const group = useMemo(
    () => faqGroups.find((item) => item.id === activeGroup) ?? faqGroups[0],
    [activeGroup]
  );

  const toggle = (key: string) => {
    setOpenItem((prev) => (prev === key ? null : key));
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-background-50">
        <span className="inline-flex items-center gap-2 rounded-full bg-background-50/20 px-3 py-1 text-xs font-semibold">
          <i className="ri-question-answer-line" />
          Centro de ayuda
        </span>
        <h1 className="mt-4 font-heading text-3xl font-semibold">Preguntas frecuentes</h1>
        <p className="mt-2 max-w-lg text-sm text-background-50/85">
          Todo lo que necesitas saber sobre envíos, pagos, devoluciones y nuestros
          cursos. Si no encuentras tu respuesta, escríbenos sin pena.
        </p>
      </section>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {faqGroups.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveGroup(item.id);
              setOpenItem(`${item.id}-0`);
            }}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeGroup === item.id
                ? "bg-primary-500 text-background-50"
                : "bg-background-100 text-foreground-600 hover:bg-background-200"
            }`}
          >
            <i className={item.icon} />
            {item.label}
          </button>
        ))}
      </div>

      <section className="mt-4 space-y-3">
        {group.items.map((item, index) => {
          const key = `${group.id}-${index}`;
          const isOpen = openItem === key;
          return (
            <div
              key={key}
              className="overflow-hidden rounded-2xl border border-background-200/70 bg-background-50"
            >
              <button
                type="button"
                onClick={() => toggle(key)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-foreground-900">{item.q}</span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOpen ? "bg-primary-100 text-primary-700" : "bg-background-100 text-foreground-500"
                  }`}
                >
                  <i className={isOpen ? "ri-subtract-line" : "ri-add-line"} />
                </span>
              </button>
              {isOpen && (
                <p className="border-t border-background-200/70 px-5 py-4 text-sm leading-relaxed text-foreground-600">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-background-200/70 bg-background-100 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground-950">
          ¿Te quedó una duda?
        </h2>
        <p className="mt-1 text-sm text-foreground-600">
          Estamos para ayudarte. Elige un camino y conversemos.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-5 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-200"
            >
              <i className={link.icon} />
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}