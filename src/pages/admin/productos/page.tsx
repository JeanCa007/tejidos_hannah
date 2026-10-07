import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCategories } from "@/lib/catalog";
import { formatCRC } from "@/lib/format";
import type { Category } from "@/lib/storeTypes";
import Modal from "@/pages/admin/components/Modal";
import {
  AdminHeader,
  ErrorBanner,
  EmptyState,
  LoadingRows,
  SearchInput,
  PrimaryButton,
  GhostButton,
  IconButton,
} from "@/pages/admin/components/ui";
import ProductForm, { type ProductRow } from "./components/ProductForm";
import CategoryManager from "./components/CategoryManager";

type Tab = "productos" | "categorias";

export default function AdminProductosPage() {
  const [tab, setTab] = useState<Tab>("productos");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [toDelete, setToDelete] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, cats] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        fetchCategories(),
      ]);
      if (productsRes.error) throw productsRes.error;
      setProducts((productsRes.data ?? []) as ProductRow[]);
      setCategories(cats);
    } catch {
      setError("No pudimos cargar los productos. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryName = useCallback(
    (id: string | null) => categories.find((category) => category.id === id)?.name ?? "Sin categoría",
    [categories]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.name} ${categoryName(product.category_id)}`.toLowerCase().includes(term)
    );
  }, [products, search, categoryName]);

  const toggleActive = async (product: ProductRow) => {
    await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id);
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await supabase.from("products").delete().eq("id", toDelete.id);
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Productos e inventario"
        description="Crea, edita y organiza tu catálogo con fotos, precios y existencias."
        action={
          tab === "productos" ? (
            <PrimaryButton
              icon="ri-add-line"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Nuevo producto
            </PrimaryButton>
          ) : undefined
        }
      />

      <div className="mb-5 inline-flex rounded-full border border-background-200 bg-background-50 p-1">
        {([
          { key: "productos", label: "Productos", icon: "ri-shopping-bag-3-line" },
          { key: "categorias", label: "Categorías", icon: "ri-apps-2-line" },
        ] as { key: Tab; label: string; icon: string }[]).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.key ? "bg-primary-500 text-background-50" : "text-foreground-600 hover:bg-background-100"
            }`}
          >
            <i className={item.icon} />
            {item.label}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {tab === "categorias" ? (
        <CategoryManager categories={categories} onChanged={load} />
      ) : loading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="ri-shopping-bag-3-line"
          title={products.length === 0 ? "Todavía no tienes productos" : "Sin resultados"}
          description={
            products.length === 0
              ? "Crea tu primer producto para que aparezca en la tienda."
              : "Prueba con otra búsqueda."
          }
          action={
            products.length === 0 ? (
              <PrimaryButton icon="ri-add-line" onClick={() => { setEditing(null); setFormOpen(true); }}>
                Nuevo producto
              </PrimaryButton>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar producto..." />
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-background-200 bg-background-100">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-top" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-foreground-400">
                    <i className="ri-image-line" />
                  </span>
                )}
              </div>

              <div className="min-w-40 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground-900">{product.name}</p>
                  {!product.is_active && (
                    <span className="rounded-full bg-background-200 px-2 py-0.5 text-[10px] font-bold text-foreground-600">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-foreground-500">{categoryName(product.category_id)}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-primary-600">{formatCRC(product.price)}</p>
                <p className="text-xs text-foreground-500">{product.stock} en stock</p>
              </div>

              <div className="flex items-center gap-1">
                <IconButton
                  icon={product.is_active ? "ri-eye-line" : "ri-eye-off-line"}
                  label={product.is_active ? "Ocultar" : "Mostrar"}
                  tone="primary"
                  onClick={() => toggleActive(product)}
                />
                <IconButton
                  icon="ri-edit-line"
                  label="Editar"
                  onClick={() => {
                    setEditing(product);
                    setFormOpen(true);
                  }}
                />
                <IconButton icon="ri-delete-bin-line" label="Eliminar" tone="danger" onClick={() => setToDelete(product)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        title={editing ? "Editar producto" : "Nuevo producto"}
        onClose={() => setFormOpen(false)}
        size="lg"
      >
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        title="Eliminar producto"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <GhostButton onClick={() => setToDelete(null)}>Cancelar</GhostButton>
            <PrimaryButton onClick={confirmDelete} loading={deleting} icon="ri-delete-bin-line">
              Sí, eliminar
            </PrimaryButton>
          </>
        }
      >
        <p className="text-sm text-foreground-600">
          ¿Seguro que quieres eliminar <strong>{toDelete?.name}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}