const LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  unpaid: "Sin pagar",
  paid: "Pagado",
  refunded: "Reembolsado",
};

const TONES: Record<string, string> = {
  pending: "bg-accent-100 text-accent-900",
  confirmed: "bg-secondary-100 text-secondary-900",
  shipped: "bg-primary-100 text-primary-800",
  delivered: "bg-secondary-500 text-secondary-50",
  cancelled: "bg-background-200 text-foreground-600",
  unpaid: "bg-accent-100 text-accent-900",
  paid: "bg-secondary-500 text-secondary-50",
  refunded: "bg-background-200 text-foreground-600",
};

interface StatusPillProps {
  status: string;
}

export default function StatusPill({ status }: StatusPillProps) {
  const label = LABELS[status] ?? status;
  const tone = TONES[status] ?? "bg-background-100 text-foreground-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}
    >
      {label}
    </span>
  );
}