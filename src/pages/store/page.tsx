import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchProducts } from "@/lib/catalog";
import type { Category, Product } from "@/lib/storeTypes";
import CategoryChips from "./components/CategoryChips";
import StoreControls, { type SortKey } from "./components/StoreControls";
import ProductCard from "./components/ProductCard";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      setError("No pudimos cargar la tienda. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = products.filter((product) => {
      if (category !== "all" && product.categoryId !== category) return false;
      if (onSaleOnly && !product.onSale) return false;
      if (term) {
        const haystack = `${product.name} ${product.shortDescription} ${product.categoryName}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "rating":
        return [...result].sort((a, b) => b.rating - a.rating);
      default:
        return result;
    }
  }, [products, search, category, sort, onSaleOnly]);

  return (
    <div>
      <header className="pb-6 pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
          Hecho a mano
        </span>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950 sm:text-4xl">
          Tienda
        </h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-600">
          Piezas tejidas a mano con amor en Costa Rica. Encuentra el detalle
          perfecto para tu hogar o el regalo ideal.
        </p>
      </header>

      <div className="space-y-4">
        <CategoryChips categories={categories} active={category} onChange={setCategory} />
        <StoreControls
          search={search}
          onSearch={setSearch}
          sort={sort}
          onSort={setSort}
          onSaleOnly={onSaleOnly}
          onToggleSale={() => setOnSaleOnly((value) => !value)}
          count={filtered.length}
        />
      </div>

      {error ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-50 text-foreground-400">
            <i className="ri-error-warning-line text-2xl" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-foreground-900">
            No pudimos cargar la tienda
          </h2>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-refresh-line" />
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl border border-background-200/70 bg-background-100" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div
          className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
          data-product-shop
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-50 text-foreground-400">
            <i className="ri-search-eye-line text-2xl" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-foreground-900">
            No encontramos productos
          </h2>
          <p className="mt-2 max-w-xs text-sm text-foreground-500">
            Prueba con otra búsqueda o quita los filtros para ver toda la tienda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setOnSaleOnly(false);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-refresh-line" />
            Ver todo
          </button>
        </div>
      )}
    </div>
  );
}