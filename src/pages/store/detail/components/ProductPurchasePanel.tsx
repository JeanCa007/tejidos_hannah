import { useState } from "react";
import { formatCRC } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/lib/storeTypes";

interface ProductPurchasePanelProps {
  product: Product;
}

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    product.variants.reduce<Record<string, string>>((acc, group) => {
      acc[group.name] = group.options[0];
      return acc;
    }, {})
  );

  const variantLabel = product.variants
    .map((group) => selected[group.name])
    .filter(Boolean)
    .join(" · ");

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      variantLabel: variantLabel || undefined,
      href: `/tienda/${product.id}`,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const lowStock = product.stock <= 5;

  return (
    <div className="space-y-5">
      {product.variants.map((group) => (
        <div key={group.name}>
          <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">
            {group.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [group.name]: option }))
                }
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selected[group.name] === option
                    ? "border-primary-500 bg-primary-100 text-primary-700"
                    : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">
            Cantidad
          </p>
          <div className="mt-2 flex items-center rounded-full border border-background-200 bg-background-50">
            <button
              type="button"
              aria-label="Restar"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-600 hover:bg-background-100"
            >
              <i className="ri-subtract-line" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-foreground-900">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Sumar"
              onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-600 hover:bg-background-100"
            >
              <i className="ri-add-line" />
            </button>
          </div>
        </div>

        <div className="pt-5">
          {lowStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-800">
              <i className="ri-fire-line" />
              ¡Solo quedan {product.stock}!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-3 py-1.5 text-xs font-semibold text-secondary-800">
              <i className="ri-checkbox-circle-line" />
              Disponible
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleAdd}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
            added
              ? "bg-secondary-600 text-background-50"
              : "bg-primary-500 text-background-50 hover:bg-primary-600"
          }`}
        >
          <i className={added ? "ri-check-line text-lg" : "ri-shopping-cart-2-line text-lg"} />
          {added ? "¡Agregado al carrito!" : "Agregar al carrito"}
        </button>
        <div className="flex items-center justify-center gap-2 rounded-full bg-background-100 px-5 py-4">
          <span className="text-xs text-foreground-500">Precio</span>
          <span className="text-lg font-bold text-primary-600">
            {formatCRC(product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}