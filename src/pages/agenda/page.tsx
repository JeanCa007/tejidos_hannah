import { Link } from "react-router-dom";
import BookingCalendar, {
  type BookingCalendarTexts,
  type BookingServiceOption,
} from "@/pages/agenda/components/BookingCalendar";

const TIMESLOTS_API =
  "https://readdy.ai/api/public/calendar/timeslots/60930286-b97f-47cc-b7cb-499bf78986e0.92b1bc6845242e560e4e944f3c94801fb8077936eef2f5d6d1d8acd1ffc4f9b8";

const APPOINTMENTS_API =
  "https://readdy.ai/api/public/calendar/appointments/60930286-b97f-47cc-b7cb-499bf78986e0.92b1bc6845242e560e4e944f3c94801fb8077936eef2f5d6d1d8acd1ffc4f9b8";

const serviceOptions: BookingServiceOption[] = [
  { value: "tejido", label: "Clase personalizada de tejido" },
  { value: "amigurumi", label: "Clase personalizada de amigurumi" },
  { value: "macrame", label: "Clase de macramé" },
  { value: "asesoria", label: "Asesoría de un proyecto" },
];

const texts: BookingCalendarTexts = {
  dayLabels: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  prevMonth: "Mes anterior",
  nextMonth: "Mes siguiente",
  stepLabels: ["Elige el día", "Elige la hora", "Tus datos"],
  selectDateTitle: "Elige el día de tu cita",
  selectDateHint: "Los días resaltados tienen horarios disponibles.",
  selectTimeTitle: "Elige la hora",
  noSlotsForDay: "No hay horarios disponibles para este día. Elige otra fecha.",
  continueLabel: "Continuar",
  backLabel: "Cambiar día",
  reviewTitle: "Confirma tu cita",
  dateLabel: "Fecha",
  timeLabel: "Hora",
  modifyTime: "Cambiar hora",
  nameLabel: "Nombre completo",
  namePlaceholder: "Tu nombre",
  phoneLabel: "Teléfono / WhatsApp",
  phonePlaceholder: "8888 8888",
  serviceLabel: "Tipo de clase",
  notesLabel: "Notas (opcional)",
  notesPlaceholder: "¿Qué te gustaría aprender o trabajar en la clase?",
  submitLabel: "Confirmar cita",
  submittingLabel: "Enviando...",
  successTitle: "¡Cita agendada!",
  successMessage:
    "Gracias, tu cita quedó reservada. Te contactaremos para confirmar los detalles.",
  bookAnother: "Agendar otra cita",
  errorMessage: "No pudimos completar la reserva. Revisa tu conexión e intenta de nuevo.",
  retryLabel: "Reintentar",
  loadingLabel: "Buscando horarios disponibles...",
  slotsAvailableLabel: "Horarios disponibles",
};

export default function AgendaPage() {
  return (
    <div>
      <header className="pb-6 pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
          A tu ritmo
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Agendar una cita
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          Reserva una clase personalizada o una asesoría y elige el día y la hora
          que mejor te funcione.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <BookingCalendar
          timeslotsApi={TIMESLOTS_API}
          appointmentsApi={APPOINTMENTS_API}
          texts={texts}
          serviceOptions={serviceOptions}
        />

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-background-200/70 bg-background-100">
            <img
              src="https://readdy.ai/api/search-image?query=A%20cozy%20craft%20workshop%20table%20with%20yarn%20balls%20and%20crochet%20hooks%2C%20hands%20weaving%2C%20warm%20natural%20light%2C%20cream%20and%20terracotta%20tones%2C%20editorial%20photography%2C%20clean%20simple%20background&width=800&height=600&seq=th-agenda-01&orientation=landscape"
              alt="Taller de Tejidos Hannah"
              className="h-40 w-full object-cover object-top"
            />
            <div className="p-5">
              <h2 className="font-heading text-lg font-semibold text-foreground-950">
                Clases a tu medida
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm text-foreground-600">
                <li className="flex items-start gap-2.5">
                  <i className="ri-time-line mt-0.5 text-accent-600" />
                  Sesiones de 1 a 2 horas
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="ri-user-star-line mt-0.5 text-accent-600" />
                  Atención personalizada
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="ri-map-pin-line mt-0.5 text-accent-600" />
                  Presencial o en línea
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-background-200/70 bg-background-50 p-5">
            <h2 className="font-heading text-base font-semibold text-foreground-950">
              ¿Prefieres escribirnos?
            </h2>
            <p className="mt-1 text-sm text-foreground-600">
              También puedes contactarnos directamente y te ayudamos a elegir.
            </p>
            <Link
              to="/contacto"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
            >
              <i className="ri-message-3-line" />
              Ir a contacto
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}