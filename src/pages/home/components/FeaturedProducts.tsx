import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/catalog";
import type { Product } from "@/lib/storeTypes";
import { formatCRC } from "@/lib/format";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((items) => {
        if (active) setProducts(items.slice(0, 6));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-8 lg:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Hecho a mano</span>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
            Productos destacados
          </h2>
        </div>
        <Link
          to="/tienda"
          className="hidden items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 sm:inline-flex"
        >
          Ver todo
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" data-product-shop>
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/tienda/${product.id}`}
            className="group overflow-hidden rounded-2xl border border-background-200/70 bg-background-50 shadow-card transition-transform hover:-translate-y-1"
          >
            <div className="relative overflow-hidden bg-background-100">
              <img
                src={product.image}
                alt={product.name}
                className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 sm:h-52"
              />
              {product.tag && (
                <span className="absolute left-2 top-2 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold text-accent-950">
                  {product.tag}
                </span>
              )}
            </div>
            <div className="p-3.5">
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground-900">{product.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-bold text-primary-600">{formatCRC(product.price)}</span>
                {product.comparePrice && (
                  <span className="text-xs text-foreground-400 line-through">{formatCRC(product.comparePrice)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/tienda"
        className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-primary-600 sm:hidden"
      >
        Ver todos los productos
        <i className="ri-arrow-right-line" />
      </Link>
    </section>
  );
}