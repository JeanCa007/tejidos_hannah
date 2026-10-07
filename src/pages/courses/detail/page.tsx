import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import { fetchCourseById, fetchCourses } from "@/lib/catalog";
import type { Course } from "@/lib/storeTypes";
import CourseCard from "@/pages/courses/components/CourseCard";
import SessionPicker from "./components/SessionPicker";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [related, setRelated] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [found, all] = await Promise.all([fetchCourseById(id), fetchCourses()]);
      setCourse(found);
      setRelated(all.filter((item) => item.id !== id).slice(0, 3));
      if (found) {
        const available =
          found.sessions.find((session) => session.enrolled < session.capacity) ??
          found.sessions[0];
        setSelected(available?.id ?? "");
      }
    } catch {
      setError("No pudimos cargar este curso. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-emotion-sad-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          {error ? "No pudimos cargar el curso" : "No encontramos este curso"}
        </h1>
        {error ? (
          <button
            type="button"
            onClick={load}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-refresh-line" />
            Reintentar
          </button>
        ) : (
          <Link
            to="/cursos"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-arrow-left-line" />
            Ver todos los cursos
          </Link>
        )}
      </section>
    );
  }

  const selectedSession = course.sessions.find((session) => session.id === selected);

  const handleEnroll = () => {
    if (!selected) return;
    navigate(`/matricula/${course.id}?session=${selected}`);
  };

  return (
    <div>
      <nav className="flex items-center gap-1.5 py-4 text-xs text-foreground-500">
        <Link to="/" className="hover:text-primary-600">Inicio</Link>
        <i className="ri-arrow-right-s-line" />
        <Link to="/cursos" className="hover:text-primary-600">Cursos</Link>
        <i className="ri-arrow-right-s-line" />
        <span className="truncate font-semibold text-foreground-700">{course.title}</span>
      </nav>

      <div className="overflow-hidden rounded-[2rem] border border-background-200/70">
        <img src={course.image} alt={course.title} className="h-64 w-full object-cover object-top sm:h-80 lg:h-96" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary-100 px-3 py-1 text-[11px] font-bold text-secondary-800">{course.level}</span>
              <span className="rounded-full bg-background-100 px-3 py-1 text-[11px] font-bold text-foreground-600">{course.mode}</span>
              <span className="flex items-center gap-1 text-[11px] text-foreground-500">
                <i className="ri-time-line" />
                {course.duration}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground-950 sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-foreground-600">{course.description}</p>
          </div>

          <div className="rounded-[1.5rem] border border-background-200/70 bg-background-100 p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground-950">¿Qué incluye?</h2>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {course.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground-600">
                  <i className="ri-checkbox-circle-fill mt-0.5 text-secondary-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground-950">Horarios disponibles</h2>
            <p className="mt-1 text-sm text-foreground-600">Elige el grupo que mejor te funcione y matrículate.</p>
            <div className="mt-4">
              <SessionPicker sessions={course.sessions} selected={selected} onSelect={setSelected} />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6 shadow-card">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground-500">Precio del curso</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-accent-700">{formatCRC(course.price)}</span>
              {course.comparePrice && (
                <span className="text-sm text-foreground-400 line-through">{formatCRC(course.comparePrice)}</span>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-background-100 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Horario elegido</p>
              {selectedSession ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-foreground-900">{selectedSession.label}</p>
                  <p className="mt-0.5 text-xs text-foreground-500">
                    Inicia el {selectedSession.startDate} · {selectedSession.location}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground-500">Selecciona un horario disponible.</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleEnroll}
              disabled={!selected}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
                selected
                  ? "bg-primary-500 text-background-50 hover:bg-primary-600"
                  : "cursor-not-allowed bg-background-200 text-foreground-500"
              }`}
            >
              <i className="ri-bookmark-3-line text-lg" />
              Matricularme
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground-500">
              <i className="ri-shield-check-line" />
              Cupos limitados · reserva segura
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground-950">
            Otros cursos que te pueden gustar
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {related.map((item) => (
              <CourseCard key={item.id} course={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}