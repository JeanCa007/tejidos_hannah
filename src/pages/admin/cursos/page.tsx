import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCRC } from "@/lib/format";
import Modal from "@/pages/admin/components/Modal";
import {
  AdminHeader,
  ErrorBanner,
  EmptyState,
  LoadingRows,
  SearchInput,
  PrimaryButton,
  GhostButton,
  IconButton,
} from "@/pages/admin/components/ui";
import CourseForm, { type CourseRow } from "./components/CourseForm";
import SessionManager from "./components/SessionManager";

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [sessionsFor, setSessionsFor] = useState<CourseRow | null>(null);
  const [toDelete, setToDelete] = useState<CourseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [coursesRes, sessionsRes] = await Promise.all([
        supabase.from("courses").select("*").order("created_at", { ascending: false }),
        supabase.from("course_sessions").select("id, course_id"),
      ]);
      if (coursesRes.error) throw coursesRes.error;
      setCourses((coursesRes.data ?? []) as CourseRow[]);
      const counts = new Map<string, number>();
      (sessionsRes.data ?? []).forEach((row) => {
        const id = String((row as { course_id: string }).course_id);
        counts.set(id, (counts.get(id) ?? 0) + 1);
      });
      setSessionCounts(counts);
    } catch {
      setError("No pudimos cargar los cursos. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((course) => course.title.toLowerCase().includes(term));
  }, [courses, search]);

  const toggleActive = async (course: CourseRow) => {
    await supabase.from("courses").update({ is_active: !course.is_active }).eq("id", course.id);
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await supabase.from("courses").delete().eq("id", toDelete.id);
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Cursos y horarios"
        description="Crea cursos, define sus grupos y controla los cupos."
        action={
          <PrimaryButton
            icon="ri-add-line"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Nuevo curso
          </PrimaryButton>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : courses.length === 0 ? (
        <EmptyState
          icon="ri-graduation-cap-line"
          title="Todavía no tienes cursos"
          description="Crea tu primer curso para ofrecerlo en la web."
          action={
            <PrimaryButton icon="ri-add-line" onClick={() => { setEditing(null); setFormOpen(true); }}>
              Nuevo curso
            </PrimaryButton>
          }
        />
      ) : (
        <div className="space-y-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar curso..." />
          {filtered.map((course) => (
            <div
              key={course.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4"
            >
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-background-200 bg-background-100">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="h-full w-full object-cover object-top" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-foreground-400">
                    <i className="ri-image-line" />
                  </span>
                )}
              </div>

              <div className="min-w-44 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground-900">{course.title}</p>
                  {!course.is_active && (
                    <span className="rounded-full bg-background-200 px-2 py-0.5 text-[10px] font-bold text-foreground-600">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-foreground-500">
                  {course.level} · {course.mode} · {sessionCounts.get(course.id) ?? 0} horarios
                </p>
              </div>

              <p className="text-sm font-bold text-accent-700">{formatCRC(course.price)}</p>

              <div className="flex items-center gap-1">
                <IconButton icon="ri-calendar-schedule-line" label="Horarios" tone="primary" onClick={() => setSessionsFor(course)} />
                <IconButton
                  icon={course.is_active ? "ri-eye-line" : "ri-eye-off-line"}
                  label={course.is_active ? "Ocultar" : "Mostrar"}
                  onClick={() => toggleActive(course)}
                />
                <IconButton icon="ri-edit-line" label="Editar" onClick={() => { setEditing(course); setFormOpen(true); }} />
                <IconButton icon="ri-delete-bin-line" label="Eliminar" tone="danger" onClick={() => setToDelete(course)} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-background-200/70 bg-background-50 p-6 text-center text-sm text-foreground-500">
              No hay cursos con esa búsqueda.
            </p>
          )}
        </div>
      )}

      <Modal open={formOpen} title={editing ? "Editar curso" : "Nuevo curso"} onClose={() => setFormOpen(false)} size="lg">
        <CourseForm
          course={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      </Modal>

      <Modal open={Boolean(sessionsFor)} title="Horarios del curso" onClose={() => setSessionsFor(null)} size="lg">
        {sessionsFor && (
          <SessionManager
            courseId={sessionsFor.id}
            courseTitle={sessionsFor.title}
            onChanged={load}
            onClose={() => setSessionsFor(null)}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        title="Eliminar curso"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <GhostButton onClick={() => setToDelete(null)}>Cancelar</GhostButton>
            <PrimaryButton onClick={confirmDelete} loading={deleting} icon="ri-delete-bin-line">
              Sí, eliminar
            </PrimaryButton>
          </>
        }
      >
        <p className="text-sm text-foreground-600">
          ¿Seguro que quieres eliminar <strong>{toDelete?.title}</strong>? También se eliminarán sus horarios.
        </p>
      </Modal>
    </div>
  );
}