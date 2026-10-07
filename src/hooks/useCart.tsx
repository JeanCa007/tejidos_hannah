import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItemKind = "product" | "pattern";

export interface CartItem {
  key: string;
  productId: string;
  kind: CartItemKind;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantLabel?: string;
  href?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  lastAddedKey: string | null;
}

const STORAGE_KEY = "tejidos_hannah_cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function buildKey(item: Omit<CartItem, "key">): string {
  return `${item.productId}::${item.variantLabel ?? "base"}`;
}

function readStoredItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as CartItem[]).map((entry) => ({
      ...entry,
      kind: entry.kind === "pattern" ? "pattern" : "product",
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredItems());
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota / privacy mode errors.
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "key">) => {
    const key = buildKey(item);
    setItems((prev) => {
      const existing = prev.find((entry) => entry.key === key);
      if (existing) {
        return prev.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry
        );
      }
      return [...prev, { ...item, key }];
    });
    setLastAddedKey(key);
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((entry) =>
          entry.key === key
            ? { ...entry, quantity: Math.max(1, quantity) }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((entry) => entry.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const count = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, entry) => sum + entry.price * entry.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      lastAddedKey,
    }),
    [items, count, subtotal, addItem, updateQuantity, removeItem, clearCart, lastAddedKey]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}