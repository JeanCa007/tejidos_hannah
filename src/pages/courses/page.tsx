import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCourses } from "@/lib/catalog";
import type { Course } from "@/lib/storeTypes";
import CourseCard from "./components/CourseCard";

const levels = ["Todos", "Básico", "Intermedio", "Avanzado"];

const perks = [
  { icon: "ri-user-star-line", label: "Grupos pequeños" },
  { icon: "ri-palette-line", label: "Materiales incluidos" },
  { icon: "ri-award-line", label: "Certificado" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [level, setLevel] = useState("Todos");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCourses(await fetchCourses());
    } catch {
      setError("No pudimos cargar los cursos. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => (level === "Todos" ? courses : courses.filter((course) => course.level === level)),
    [courses, level]
  );

  return (
    <div>
      <header className="pb-6 pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
          Aprende con nosotros
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Cursos de manualidades
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          Clases presenciales y en línea para que aprendas a tejer y bordar a tu
          ritmo, con acompañamiento de principio a fin.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {perks.map((perk) => (
            <span
              key={perk.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-3 py-1.5 text-xs font-semibold text-foreground-600"
            >
              <i className={`${perk.icon} text-secondary-600`} />
              {perk.label}
            </span>
          ))}
        </div>
      </header>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {levels.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLevel(item)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              level === item
                ? "border-accent-500 bg-accent-500 text-accent-950"
                : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-50 text-foreground-400">
            <i className="ri-error-warning-line text-2xl" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-foreground-900">
            No pudimos cargar los cursos
          </h2>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-refresh-line" />
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-2xl border border-background-200/70 bg-background-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-10 rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-16 text-center">
              <h2 className="font-heading text-xl font-semibold text-foreground-900">
                Pronto abriremos más horarios
              </h2>
              <p className="mt-2 text-sm text-foreground-500">
                Escríbenos y te avisamos en cuanto salga un grupo de este nivel.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}