import { useEffect, useRef, useState, type ReactNode } from "react";

/* ---------- Layout ---------- */

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-foreground-500">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-background-200/70 bg-background-50 ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Buttons ---------- */

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  icon,
  className = "",
}: {
  children?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <i className="ri-loader-4-line animate-spin text-lg" />
      ) : (
        icon && <i className={`${icon} text-lg`} />
      )}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  icon,
  className = "",
  type = "button",
}: {
  children?: ReactNode;
  onClick?: () => void;
  icon?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-background-300 bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100 ${className}`}
    >
      {icon && <i className={`${icon} text-lg`} />}
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  onClick,
  tone = "neutral",
}: {
  icon: string;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger" | "primary";
}) {
  const tones = {
    neutral: "text-foreground-500 hover:bg-background-100 hover:text-foreground-800",
    danger: "text-primary-600 hover:bg-primary-100",
    primary: "text-secondary-600 hover:bg-secondary-100",
  };
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${tones[tone]}`}
    >
      <i className={`${icon} text-lg`} />
    </button>
  );
}

/* ---------- Form fields ---------- */

const inputClass =
  "w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground-800">
        {label}
        {required && <span className="text-primary-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 ${inputClass}`}
      />
      {hint && <span className="mt-1 block text-xs text-foreground-400">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground-800">{label}</span>
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 resize-none ${inputClass}`}
      />
    </label>
  );
}

export interface DropdownOption {
  value: string;
  label: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const current = options.find((option) => option.value === value);

  return (
    <div>
      {label && (
        <span className="block text-sm font-semibold text-foreground-800">{label}</span>
      )}
      <div className="relative mt-2" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`flex w-full items-center justify-between gap-2 ${inputClass} text-left`}
        >
          <span className={current ? "text-foreground-900" : "text-foreground-400"}>
            {current?.label ?? placeholder}
          </span>
          <i className={open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-background-200 bg-background-50 py-1 shadow-soft">
            {options.length === 0 && (
              <p className="px-4 py-2 text-sm text-foreground-400">Sin opciones</p>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                  option.value === value
                    ? "bg-primary-100 font-semibold text-primary-700"
                    : "text-foreground-700 hover:bg-background-100"
                }`}
              >
                {option.label}
                {option.value === value && <i className="ri-check-line" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-left"
    >
      <span>
        <span className="block text-sm font-semibold text-foreground-800">{label}</span>
        {description && (
          <span className="block text-xs text-foreground-500">{description}</span>
        )}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary-500" : "bg-background-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background-50 shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ---------- Feedback ---------- */

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-accent-100 text-accent-800" },
  confirmed: { label: "Confirmado", cls: "bg-secondary-100 text-secondary-800" },
  shipped: { label: "Enviado", cls: "bg-primary-100 text-primary-700" },
  delivered: { label: "Entregado", cls: "bg-secondary-500 text-secondary-50" },
  cancelled: { label: "Cancelado", cls: "bg-background-200 text-foreground-600" },
  paid: { label: "Pagado", cls: "bg-secondary-500 text-secondary-50" },
  unpaid: { label: "Sin pagar", cls: "bg-background-200 text-foreground-600" },
  refunded: { label: "Reembolsado", cls: "bg-accent-100 text-accent-800" },
};

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status] ?? {
    label: status || "—",
    cls: "bg-background-200 text-foreground-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${entry.cls}`}>
      {entry.label}
    </span>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-primary-100 px-5 py-4 text-sm font-medium text-primary-800">
      <span className="flex items-center gap-2">
        <i className="ri-error-warning-line" />
        {message}
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-background-50 hover:bg-primary-600"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-background-200/70 bg-background-50 px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-100 text-foreground-400">
        <i className={`${icon} text-2xl`} />
      </span>
      <h2 className="mt-5 font-heading text-lg font-semibold text-foreground-900">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-foreground-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl border border-background-200/70 bg-background-50"
        />
      ))}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <i className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-foreground-400 ri-search-line" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-11`}
      />
      {value && (
        <button
          type="button"
          aria-label="Limpiar"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground-400 hover:bg-background-100"
        >
          <i className="ri-close-line" />
        </button>
      )}
    </div>
  );
}