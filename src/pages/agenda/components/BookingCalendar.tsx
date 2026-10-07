import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

export interface BookingTimeSlot {
  start_time: string;
  end_time: string;
}

export interface BookingServiceOption {
  value: string;
  label: string;
}

export interface BookingCalendarTexts {
  dayLabels: string[];
  monthNames: string[];
  prevMonth: string;
  nextMonth: string;
  stepLabels: string[];
  selectDateTitle: string;
  selectDateHint: string;
  selectTimeTitle: string;
  noSlotsForDay: string;
  continueLabel: string;
  backLabel: string;
  reviewTitle: string;
  dateLabel: string;
  timeLabel: string;
  modifyTime: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  serviceLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successTitle: string;
  successMessage: string;
  bookAnother: string;
  errorMessage: string;
  retryLabel: string;
  loadingLabel: string;
  slotsAvailableLabel: string;
}

export interface BookingCalendarProps {
  timeslotsApi: string;
  appointmentsApi: string;
  texts: BookingCalendarTexts;
  serviceOptions?: BookingServiceOption[];
  containerStyle?: CSSProperties;
}

interface CalendarCell {
  day: number;
  key: string;
  weekdayIndex: number;
}

const pad = (value: number) => String(value).padStart(2, "0");

function parseKey(key: string) {
  const [rawYear, rawMonth, rawDay] = key.split("-").map(Number);
  return {
    year: Number.isFinite(rawYear) ? rawYear : 1970,
    month: (Number.isFinite(rawMonth) ? rawMonth : 1) - 1,
    day: Number.isFinite(rawDay) ? rawDay : 1,
  };
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function todayKey() {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatTime(value: string) {
  const part = value.split(" ")[1] ?? "";
  return part.slice(0, 5);
}

export default function BookingCalendar({
  timeslotsApi,
  appointmentsApi,
  texts,
  serviceOptions = [],
  containerStyle,
}: BookingCalendarProps) {
  const [slots, setSlots] = useState<BookingTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<BookingTimeSlot | null>(null);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: serviceOptions[0]?.value ?? "",
    notes: "",
  });

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(timeslotsApi);
      const json = await response.json();
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.timeslots)
        ? json.timeslots
        : [];
      setSlots(list as BookingTimeSlot[]);
    } catch {
      setLoadError(texts.errorMessage);
    } finally {
      setLoading(false);
    }
  }, [timeslotsApi, texts.errorMessage]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((slot) => {
      const raw = slot?.start_time ?? "";
      const key = raw.split(" ")[0];
      if (key) set.add(key);
    });
    return Array.from(set).sort();
  }, [slots]);

  useEffect(() => {
    if (loading || availableDates.length === 0) return;
    const today = todayKey();
    const upcoming = availableDates.filter((date) => date >= today);
    const closest = upcoming.length > 0 ? upcoming[0] : availableDates[availableDates.length - 1];
    const target = parseKey(closest);

    setSelectedDate((prev) => (prev && availableDates.includes(prev) ? prev : closest));

    setView((prev) => {
      if (prev) {
        const monthHasAvailability = availableDates.some((date) => {
          const parsed = parseKey(date);
          return parsed.year === prev.year && parsed.month === prev.month;
        });
        if (monthHasAvailability) return prev;
      }
      return { year: target.year, month: target.month };
    });
  }, [availableDates, loading]);

  const cells = useMemo(() => {
    if (!view) return [];
    const firstWeekday = new Date(view.year, view.month, 1).getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const result: (CalendarCell | null)[] = [];
    for (let i = 0; i < firstWeekday; i += 1) result.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push({
        day,
        key: dateKey(view.year, view.month, day),
        weekdayIndex: new Date(view.year, view.month, day).getDay(),
      });
    }
    return result;
  }, [view]);

  const daySlots = useMemo(
    () => slots.filter((slot) => (slot?.start_time ?? "").split(" ")[0] === selectedDate),
    [slots, selectedDate],
  );

  const shiftMonth = (delta: number) => {
    setView((prev) => {
      if (!prev) return prev;
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const chooseDate = (key: string) => {
    setSelectedDate(key);
    setSelectedSlot(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const extensions: Record<string, string> = {};
      const serviceLabel = serviceOptions.find((option) => option.value === form.service)?.label ?? form.service;
      if (serviceLabel) extensions.service = serviceLabel;

      const payload = {
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        notes: JSON.stringify({ text: form.notes.trim(), extensions }),
      };

      const response = await fetch(appointmentsApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("request_failed");

      await loadSlots();
      setSuccess(true);
      setSelectedSlot(null);
      setSelectedDate("");
      setStep(0);
      setForm({
        name: "",
        phone: "",
        service: serviceOptions[0]?.value ?? "",
        notes: "",
      });
    } catch {
      setSubmitError(texts.errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        style={containerStyle}
        className="flex flex-col items-center justify-center rounded-[2rem] border border-background-200/70 bg-background-50 p-8 text-center"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
          <i className="ri-calendar-check-line text-4xl" />
        </span>
        <h2 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          {texts.successTitle}
        </h2>
        <p className="mt-2 max-w-md text-sm text-foreground-600">{texts.successMessage}</p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-add-line text-lg" />
          {texts.bookAnother}
        </button>
      </div>
    );
  }

  return (
    <div
      style={containerStyle}
      className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6 sm:p-8"
    >
      <ol className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold">
        {texts.stepLabels.map((label, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <li key={`step-${index}`} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.6875rem] ${
                  active
                    ? "bg-primary-500 text-background-50"
                    : done
                    ? "bg-primary-100 text-primary-700"
                    : "bg-background-200 text-foreground-500"
                }`}
              >
                {done ? <i className="ri-check-line" /> : index + 1}
              </span>
              <span className={active ? "text-foreground-900" : "text-foreground-500"}>{label}</span>
              {index < texts.stepLabels.length - 1 && (
                <span className="text-foreground-300">
                  <i className="ri-arrow-right-s-line" />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-foreground-500">
          <i className="ri-loader-4-line animate-spin text-2xl text-primary-500" />
          {texts.loadingLabel}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <i className="ri-error-warning-line text-3xl text-primary-500" />
          <p className="max-w-sm text-sm text-foreground-600">{loadError}</p>
          <button
            type="button"
            onClick={loadSlots}
            className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-5 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
          >
            <i className="ri-refresh-line" />
            {texts.retryLabel}
          </button>
        </div>
      ) : step === 0 ? (
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground-950">
                {texts.selectDateTitle}
              </h2>
              <p className="mt-1 text-sm text-foreground-600">{texts.selectDateHint}</p>
            </div>
            {selectedDate && (
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1.5 text-xs font-bold text-accent-900 sm:inline-flex">
                <i className="ri-calendar-event-line" />
                {selectedDate}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              aria-label={texts.prevMonth}
              onClick={() => shiftMonth(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-background-200 bg-background-50 text-foreground-600 transition-colors hover:bg-background-100"
            >
              <i className="ri-arrow-left-s-line text-lg" />
            </button>
            <p className="font-heading text-base font-semibold capitalize text-foreground-900">
              {view ? `${texts.monthNames[view.month]} ${view.year}` : ""}
            </p>
            <button
              type="button"
              aria-label={texts.nextMonth}
              onClick={() => shiftMonth(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-background-200 bg-background-50 text-foreground-600 transition-colors hover:bg-background-100"
            >
              <i className="ri-arrow-right-s-line text-lg" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {cells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="h-14" />;
              const isAvailable = availableDates.includes(cell.key);
              const isSelected = selectedDate === cell.key;
              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => chooseDate(cell.key)}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs transition-colors ${
                    isSelected
                      ? "border-primary-500 bg-primary-500 text-background-50"
                      : isAvailable
                      ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : "cursor-not-allowed border-transparent bg-background-100 text-foreground-300"
                  }`}
                >
                  <span
                    className={`text-[0.5625rem] uppercase tracking-wide ${
                      isSelected ? "text-background-50/80" : isAvailable ? "text-primary-500" : "text-foreground-300"
                    }`}
                  >
                    {texts.dayLabels[cell.weekdayIndex]}
                  </span>
                  <span className="text-sm font-bold">{cell.day}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!selectedDate}
            onClick={() => setStep(1)}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
              selectedDate
                ? "bg-primary-500 text-background-50 hover:bg-primary-600"
                : "cursor-not-allowed bg-background-200 text-foreground-400"
            }`}
          >
            {texts.continueLabel}
            <i className="ri-arrow-right-line text-lg" />
          </button>
        </div>
      ) : step === 1 ? (
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground-950">
                {texts.selectTimeTitle}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground-600">
                <i className="ri-calendar-line" />
                {selectedDate}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-4 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:bg-background-100"
            >
              <i className="ri-arrow-left-s-line" />
              {texts.backLabel}
            </button>
          </div>

          {daySlots.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-background-200/70 bg-background-100 p-6 text-center text-sm text-foreground-500">
              {texts.noSlotsForDay}
            </p>
          ) : (
            <>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-foreground-500">
                {texts.slotsAvailableLabel}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {daySlots.map((slot) => {
                  const isSelected =
                    selectedSlot?.start_time === slot.start_time && selectedSlot?.end_time === slot.end_time;
                  return (
                    <button
                      key={`${slot.start_time}-${slot.end_time}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                        isSelected
                          ? "border-primary-500 bg-primary-500 text-background-50"
                          : "border-background-200 bg-background-50 text-foreground-700 hover:bg-background-100"
                      }`}
                    >
                      <i className="ri-time-line" />
                      {formatTime(slot.start_time)}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(2)}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
                  selectedSlot
                    ? "bg-primary-500 text-background-50 hover:bg-primary-600"
                    : "cursor-not-allowed bg-background-200 text-foreground-400"
                }`}
              >
                {texts.continueLabel}
                <i className="ri-arrow-right-line text-lg" />
              </button>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground-950">
              {texts.reviewTitle}
            </h2>
          </div>

          <div className="rounded-2xl border border-secondary-200 bg-secondary-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-foreground-800">
                  <i className="ri-calendar-line text-secondary-600" />
                  <span className="font-semibold">{texts.dateLabel}:</span> {selectedDate}
                </p>
                {selectedSlot && (
                  <p className="flex items-center gap-2 text-foreground-800">
                    <i className="ri-time-line text-secondary-600" />
                    <span className="font-semibold">{texts.timeLabel}:</span>{" "}
                    {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-secondary-300 bg-background-50 px-4 py-2 text-xs font-semibold text-secondary-800 transition-colors hover:bg-secondary-100"
              >
                <i className="ri-edit-line" />
                {texts.modifyTime}
              </button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="booking_name" className="text-sm font-semibold text-foreground-800">
                {texts.nameLabel}
              </label>
              <input
                id="booking_name"
                name="customer_name"
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder={texts.namePlaceholder}
                className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label htmlFor="booking_phone" className="text-sm font-semibold text-foreground-800">
                {texts.phoneLabel}
              </label>
              <input
                id="booking_phone"
                name="customer_phone"
                type="tel"
                required
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder={texts.phonePlaceholder}
                className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          {serviceOptions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground-800">{texts.serviceLabel}</p>
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {serviceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, service: option.value }))}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      form.service === option.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background-100">
                      <i className={option.value === "amigurumi" ? "ri-bear-smile-line" : "ri-hand-heart-line"} />
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="booking_notes" className="text-sm font-semibold text-foreground-800">
              {texts.notesLabel}
            </label>
            <textarea
              id="booking_notes"
              name="notes"
              rows={3}
              maxLength={500}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder={texts.notesPlaceholder}
              className="mt-2 w-full resize-none rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {submitError && (
            <p className="flex items-start gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
              <i className="ri-error-warning-line mt-0.5" />
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
              submitting
                ? "cursor-wait bg-primary-400 text-background-50"
                : "bg-primary-500 text-background-50 hover:bg-primary-600"
            }`}
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-lg" />
                {texts.submittingLabel}
              </>
            ) : (
              <>
                <i className="ri-calendar-2-line text-lg" />
                {texts.submitLabel}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}