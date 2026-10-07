import { formatCRC } from "@/lib/format";
import type { ShippingZone } from "@/lib/storeTypes";

interface ZonePickerProps {
  zones: ShippingZone[];
  selectedId: string;
  subtotal: number;
  onSelect: (id: string) => void;
}

export default function ZonePicker({
  zones,
  selectedId,
  subtotal,
  onSelect,
}: ZonePickerProps) {
  return (
    <div className="space-y-2">
      {zones.map((zone) => {
        const isSelected = selectedId === zone.id;
        const isFree = zone.freeThreshold != null && subtotal >= zone.freeThreshold;
        const priceLabel = isFree ? "Gratis" : zone.cost === 0 ? "Gratis" : formatCRC(zone.cost);
        const isPickup = zone.provinces.length === 0;

        return (
          <button
            key={zone.id}
            type="button"
            onClick={() => onSelect(zone.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
              isSelected
                ? "border-primary-500 bg-primary-50"
                : "border-background-200 bg-background-50 hover:bg-background-100"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? "border-primary-500 bg-primary-500 text-background-50"
                    : "border-background-300 text-transparent"
                }`}
              >
                <i className="ri-check-line text-xs" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground-900">
                  {zone.name}
                </span>
                <span className="block text-xs text-foreground-500">
                  {isPickup ? "Coordinar cita" : zone.estimatedDays || "Tiempo por confirmar"}
                </span>
              </span>
            </span>
            <span
              className={`shrink-0 text-sm font-bold ${
                isFree ? "text-secondary-600" : "text-foreground-800"
              }`}
            >
              {priceLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}