import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCRC } from "@/lib/format";
import { fetchProductById, fetchProducts, pickRelated } from "@/lib/catalog";
import type { Product } from "@/lib/storeTypes";
import ProductCard from "@/pages/store/components/ProductCard";
import ProductGallery from "./components/ProductGallery";
import ProductPurchasePanel from "./components/ProductPurchasePanel";

const benefits = [
  { icon: "ri-truck-line", label: "Envío a todo Costa Rica" },
  { icon: "ri-heart-3-line", label: "Hecho a mano" },
  { icon: "ri-shield-check-line", label: "Compra segura" },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [found, all] = await Promise.all([fetchProductById(id), fetchProducts()]);
      setProduct(found);
      setRelated(found ? pickRelated(found, all) : []);
    } catch {
      setError("No pudimos cargar este producto. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-error-warning-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          No pudimos cargar el producto
        </h1>
        <button
          type="button"
          onClick={load}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-refresh-line" />
          Reintentar
        </button>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-emotion-sad-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          No encontramos este producto
        </h1>
        <p className="mt-2 max-w-sm text-sm text-foreground-600">
          Puede que ya no esté disponible. Mira el resto de nuestra tienda.
        </p>
        <Link
          to="/tienda"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-arrow-left-line" />
          Volver a la tienda
        </Link>
      </section>
    );
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div>
      <nav className="flex items-center gap-1.5 py-4 text-xs text-foreground-500">
        <Link to="/" className="hover:text-primary-600">
          Inicio
        </Link>
        <i className="ri-arrow-right-s-line" />
        <Link to="/tienda" className="hover:text-primary-600">
          Tienda
        </Link>
        <i className="ri-arrow-right-s-line" />
        <span className="truncate font-semibold text-foreground-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={[product.image, ...product.gallery]} name={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary-800">
              {product.categoryName}
            </span>
            {product.tag && (
              <span className="rounded-full bg-accent-100 px-3 py-1 text-[11px] font-bold text-accent-800">
                {product.tag}
              </span>
            )}
          </div>

          <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground-950 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-foreground-500">
            <span className="flex items-center gap-0.5 text-accent-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <i key={index} className={index < Math.round(product.rating) ? "ri-star-fill" : "ri-star-line"} />
              ))}
            </span>
            <span className="font-semibold text-foreground-700">{product.rating.toFixed(1)}</span>
            <span>· {product.reviewCount} reseñas</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-600">{formatCRC(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-base text-foreground-400 line-through">
                  {formatCRC(product.comparePrice)}
                </span>
                <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground-600">
            {product.shortDescription}
          </p>

          <div className="mt-6 border-t border-background-200/70 pt-6">
            <ProductPurchasePanel key={product.id} product={product} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.label}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-background-100 px-2 py-3 text-center"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background-50 text-primary-600">
                  <i className={benefit.icon} />
                </span>
                <span className="text-[11px] font-semibold text-foreground-600">{benefit.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground-950">Descripción</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-600">{product.description}</p>
        </div>
        <div className="rounded-[2rem] border border-background-200/70 bg-background-100 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground-950">Detalles</h2>
          <ul className="mt-3 space-y-2.5">
            {product.details.map((detail) => (
              <li key={detail} className="flex items-start gap-2.5 text-sm text-foreground-600">
                <i className="ri-checkbox-circle-fill mt-0.5 text-secondary-500" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground-950">
            También te puede gustar
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6" data-product-shop>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}