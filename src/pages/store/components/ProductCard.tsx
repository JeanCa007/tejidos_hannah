import { Link } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import type { Product } from "@/lib/storeTypes";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/tienda/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-background-200/70 bg-background-50 shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden bg-background-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 sm:h-56"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold text-accent-950">
            {product.badge}
          </span>
        )}
        {product.onSale && !product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-primary-500 px-2.5 py-1 text-[10px] font-bold text-background-50">
            Oferta
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-secondary-700">
          {product.categoryName}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground-900">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-foreground-500">
          <i className="ri-star-fill text-accent-500" />
          <span className="font-semibold text-foreground-700">
            {product.rating.toFixed(1)}
          </span>
          <span>· {product.reviewCount} reseñas</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-base font-bold text-primary-600">
            {formatCRC(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-foreground-400 line-through">
              {formatCRC(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}