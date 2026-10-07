import { Link } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import { useCart, type CartItem } from "@/hooks/useCart";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-3.5 shadow-card">
      <Link
        to={item.href ?? "/tienda"}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-background-100"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover object-top"
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground-900">
              {item.name}
            </h3>
            {item.variantLabel && (
              <p className="mt-0.5 text-xs text-foreground-500">
                {item.variantLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Quitar del carrito"
            onClick={() => removeItem(item.key)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground-400 transition-colors hover:bg-background-100 hover:text-primary-600"
          >
            <i className="ri-delete-bin-6-line" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex items-center rounded-full border border-background-200 bg-background-50">
            <button
              type="button"
              aria-label="Restar"
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-600 hover:bg-background-100"
            >
              <i className="ri-subtract-line" />
            </button>
            <span className="w-7 text-center text-sm font-bold text-foreground-900">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Sumar"
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-600 hover:bg-background-100"
            >
              <i className="ri-add-line" />
            </button>
          </div>

          <span className="text-sm font-bold text-primary-600">
            {formatCRC(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}