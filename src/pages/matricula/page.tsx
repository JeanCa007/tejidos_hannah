import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchCourseById } from "@/lib/catalog";
import { createEnrollment } from "@/lib/account";
import { sendNotificationEmail } from "@/lib/email";
import type { Course } from "@/lib/storeTypes";
import { formatCRC } from "@/lib/format";

type FormStatus = "idle" | "loading" | "success" | "error";

export default function MatriculaPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const preselect = searchParams.get("session") ?? "";
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }
      try {
        const found = await fetchCourseById(courseId);
        if (!active) return;
        setCourse(found);
        if (found) {
          const chosen =
            preselect && found.sessions.some((session) => session.id === preselect)
              ? preselect
              : "";
          const available =
            found.sessions.find((session) => session.enrolled < session.capacity) ??
            found.sessions[0];
          setSelectedSession(chosen || available?.id || "");
        }
      } catch {
        if (active) setError("");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId, preselect]);

  const scheduleLabel = useMemo(() => {
    if (!course || !selectedSession) return "";
    return course.sessions.find((session) => session.id === selectedSession)?.label ?? "";
  }, [course, selectedSession]);

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (!course) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-emotion-sad-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          No encontramos este curso
        </h1>
        <Link
          to="/cursos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-arrow-left-line" />
          Ver todos los cursos
        </Link>
      </section>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Read the payload from the real form element so browser autofill is included.
    const formData = new FormData(form);
    const studentName = String(formData.get("student_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    setStatus("loading");
    setError("");

    try {
      const enrollmentId = await createEnrollment({
        courseId: course.id,
        sessionId: selectedSession || null,
        studentName,
        email,
        phone,
        notes,
      });
      void sendNotificationEmail("enrollment", enrollmentId);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError(
        "No pudimos registrar tu matrícula. Revisa tus datos e intenta de nuevo."
      );
    }
  };

  if (status === "success") {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
          <i className="ri-checkbox-circle-line text-4xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          ¡Matrícula enviada!
        </h1>
        <p className="mt-2 max-w-md text-sm text-foreground-600">
          Gracias por inscribirte en <strong>{course.title}</strong>. Te
          contactaremos pronto para confirmar tu cupo y los detalles de pago.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/cursos"
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-graduation-cap-line" />
            Ver más cursos
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-6 py-3 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
          >
            <i className="ri-home-5-line" />
            Ir al inicio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 py-4 text-xs text-foreground-500">
        <Link to="/cursos" className="hover:text-primary-600">
          Cursos
        </Link>
        <i className="ri-arrow-right-s-line" />
        <Link to={`/cursos/${course.id}`} className="hover:text-primary-600">
          {course.title}
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="font-semibold text-foreground-700">Matrícula</span>
      </nav>

      <header className="pb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
          Último paso
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Matrícula de curso
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          Completa tus datos y elige tu horario. Te confirmaremos el cupo por
          correo o WhatsApp.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form
          id="matricula-form"
          data-readdy-form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6 sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="student_name"
                className="text-sm font-semibold text-foreground-800"
              >
                Nombre completo
              </label>
              <input
                id="student_name"
                name="student_name"
                type="text"
                required
                placeholder="Tu nombre"
                className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground-800"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tucorreo@ejemplo.com"
                  className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-foreground-800"
                >
                  Teléfono / WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="8888 8888"
                  className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground-800">
                Horario
              </p>
              <div className="mt-2 space-y-2">
                {course.sessions.map((session) => {
                  const full = session.enrolled >= session.capacity;
                  const isSelected = selectedSession === session.id;
                  return (
                    <button
                      key={session.id}
                      type="button"
                      disabled={full}
                      onClick={() => setSelectedSession(session.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        full
                          ? "cursor-not-allowed border-background-200 bg-background-100 text-foreground-400"
                          : isSelected
                            ? "border-primary-500 bg-primary-50 font-semibold text-primary-700"
                            : "border-background-200 bg-background-50 text-foreground-700 hover:bg-background-100"
                      }`}
                    >
                      <span>
                        {session.label}
                        <span className="ml-1 text-xs font-normal text-foreground-500">
                          · inicia {session.startDate}
                        </span>
                      </span>
                      {full ? (
                        <span className="shrink-0 text-[11px] font-bold">Lleno</span>
                      ) : (
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-primary-500 bg-primary-500 text-background-50"
                              : "border-background-300 text-transparent"
                          }`}
                        >
                          <i className="ri-check-line text-xs" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="schedule" value={scheduleLabel} readOnly />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="text-sm font-semibold text-foreground-800"
              >
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={500}
                placeholder="¿Algo que debamos saber?"
                className="mt-2 w-full resize-none rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <input type="hidden" name="course" value={course.title} readOnly />
            <input type="hidden" name="course_id" value={course.id} readOnly />

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
                  <i className="ri-bookmark-3-line text-lg" />
                  Enviar matrícula
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-background-200/70 bg-background-100">
            <img
              src={course.image}
              alt={course.title}
              className="h-40 w-full object-cover object-top"
            />
            <div className="p-5">
              <h2 className="font-heading text-lg font-semibold text-foreground-950">
                {course.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground-500">
                <span className="rounded-full bg-background-50 px-2.5 py-1 font-bold text-secondary-800">
                  {course.level}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line" />
                  {course.duration}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-background-200/70 pt-4">
                <span className="text-sm text-foreground-600">Precio</span>
                <span className="text-lg font-bold text-accent-700">
                  {formatCRC(course.price)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}