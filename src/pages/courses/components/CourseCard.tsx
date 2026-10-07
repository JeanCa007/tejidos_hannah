import { Link } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import type { Course } from "@/lib/storeTypes";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      to={`/cursos/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-background-200/70 bg-background-50 shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden bg-background-100">
        <img
          src={course.image}
          alt={course.title}
          className="h-44 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background-50/90 px-2.5 py-1 text-[10px] font-bold text-secondary-800 backdrop-blur-sm">
          {course.mode}
        </span>
        {course.comparePrice && (
          <span className="absolute right-3 top-3 rounded-full bg-primary-500 px-2.5 py-1 text-[10px] font-bold text-background-50">
            Oferta
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[10px] font-bold text-secondary-800">
            {course.level}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-foreground-500">
            <i className="ri-time-line" />
            {course.duration}
          </span>
        </div>

        <h3 className="mt-3 font-heading text-lg font-semibold text-foreground-900">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground-500">
          {course.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-accent-700">
              {formatCRC(course.price)}
            </span>
            {course.comparePrice && (
              <span className="text-xs text-foreground-400 line-through">
                {formatCRC(course.comparePrice)}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            Ver curso
            <i className="ri-arrow-right-line" />
          </span>
        </div>
      </div>
    </Link>
  );
}