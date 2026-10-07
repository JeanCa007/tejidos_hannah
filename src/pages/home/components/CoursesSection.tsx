import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCourses } from "@/lib/catalog";
import type { Course } from "@/lib/storeTypes";
import { formatCRC } from "@/lib/format";

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    let active = true;
    fetchCourses()
      .then((items) => {
        if (active) setCourses(items.slice(0, 3));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (courses.length === 0) return null;

  return (
    <section className="py-8 lg:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Aprende con nosotros</span>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
            Cursos de manualidades
          </h2>
        </div>
        <Link
          to="/cursos"
          className="hidden items-center gap-1 text-sm font-semibold text-accent-700 hover:text-accent-800 sm:inline-flex"
        >
          Ver todos
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/cursos/${course.id}`}
            className="group overflow-hidden rounded-2xl border border-background-200/70 bg-background-50 shadow-card transition-transform hover:-translate-y-1"
          >
            <div className="relative overflow-hidden bg-background-100">
              <img
                src={course.image}
                alt={course.title}
                className="h-44 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-background-50/90 px-2.5 py-1 text-[10px] font-bold text-secondary-800">
                {course.mode}
              </span>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[10px] font-bold text-secondary-800">
                  {course.level}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-foreground-500">
                  <i className="ri-time-line" />
                  {course.duration}
                </span>
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold text-foreground-900">{course.title}</h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-base font-bold text-accent-700">{formatCRC(course.price)}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                  Ver curso
                  <i className="ri-arrow-right-line" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}