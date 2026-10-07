import { formatCRC } from "@/lib/format";
import type { CartItem } from "@/hooks/useCart";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingLabel: string;
}

export default function OrderSummary({
  items,
  subtotal,
  shippingCost,
  total,
  shippingLabel,
}: OrderSummaryProps) {
  return (
    <div className="rounded-[2rem] border border-background-200/70 bg-background-100 p-6">
      <h2 className="font-heading text-xl font-semibold text-foreground-950">
        Resumen del pedido
      </h2>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background-50">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-foreground-900">
                {item.name}
              </p>
              <p className="text-xs text-foreground-500">
                {item.quantity} × {formatCRC(item.price)}
                {item.variantLabel ? ` · ${item.variantLabel}` : ""}
              </p>
            </div>
            <span className="text-sm font-bold text-foreground-900">
              {formatCRC(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 border-t border-background-200/70 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-foreground-600">Subtotal</dt>
          <dd className="font-semibold text-foreground-900">{formatCRC(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-foreground-600">Envío</dt>
          <dd className="font-semibold text-foreground-900">
            {shippingLabel === "" ? (
              <span className="text-xs font-normal text-foreground-500">
                Elige la zona
              </span>
            ) : shippingCost === 0 ? (
              <span className="text-secondary-600">Gratis</span>
            ) : (
              formatCRC(shippingCost)
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-background-200/70 pt-5">
        <span className="font-heading text-lg font-semibold text-foreground-950">
          Total
        </span>
        <span className="font-heading text-2xl font-bold text-primary-600">
          {formatCRC(total)}
        </span>
      </div>
    </div>
  );
}