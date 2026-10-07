import type { CourseSession } from "@/lib/storeTypes";

interface SessionPickerProps {
  sessions: CourseSession[];
  selected: string;
  onSelect: (sessionId: string) => void;
}

export default function SessionPicker({
  sessions,
  selected,
  onSelect,
}: SessionPickerProps) {
  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const spotsLeft = session.capacity - session.enrolled;
        const full = spotsLeft <= 0;
        const isSelected = selected === session.id;

        return (
          <button
            key={session.id}
            type="button"
            disabled={full}
            onClick={() => onSelect(session.id)}
            className={`w-full rounded-2xl border p-4 text-left transition-colors ${
              full
                ? "cursor-not-allowed border-background-200 bg-background-100 opacity-60"
                : isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-background-200 bg-background-50 hover:border-primary-300 hover:bg-background-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground-900">
                  {session.label}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground-500">
                  <i className="ri-calendar-line" />
                  {session.startDate} — {session.endDate}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground-500">
                  <i className="ri-map-pin-line" />
                  {session.location}
                </p>
              </div>
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? "border-primary-500 bg-primary-500 text-background-50"
                    : "border-background-300 text-transparent"
                }`}
              >
                <i className="ri-check-line text-sm" />
              </span>
            </div>

            <div className="mt-3">
              {full ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-background-200 px-2.5 py-1 text-[11px] font-bold text-foreground-600">
                  <i className="ri-close-circle-line" />
                  Cupo lleno
                </span>
              ) : spotsLeft <= 3 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-bold text-accent-800">
                  <i className="ri-fire-line" />
                  Últimos {spotsLeft} cupos
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-1 text-[11px] font-bold text-secondary-800">
                  <i className="ri-group-line" />
                  {spotsLeft} cupos disponibles
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}