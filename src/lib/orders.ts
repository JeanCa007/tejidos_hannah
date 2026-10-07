import { supabase } from "@/lib/supabase";
import type { Order, OrderItem, ShippingZone } from "@/lib/storeTypes";

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as unknown[]).map((item) => String(item)) : [];
}

function mapZone(row: Record<string, unknown>): ShippingZone {
  const threshold = row.free_threshold;
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    provinces: asStringArray(row.provinces),
    cost: asNumber(row.cost),
    freeThreshold: threshold == null ? null : asNumber(threshold),
    estimatedDays: String(row.estimated_days ?? ""),
    isActive: row.is_active !== false,
  };
}

export async function fetchShippingZones(): Promise<ShippingZone[]> {
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("is_active", true)
    .order("cost", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapZone(row as Record<string, unknown>));
}

export function zoneCost(zone: ShippingZone | null, subtotal: number): number {
  if (!zone) return 0;
  if (zone.freeThreshold != null && subtotal >= zone.freeThreshold) return 0;
  return zone.cost;
}

export interface CreateOrderItemInput {
  productId: string;
  kind?: "product" | "pattern";
  name: string;
  price: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingRegion: string;
  shippingCost: number;
  paymentMethod: string;
  items: CreateOrderItemInput[];
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const payload = {
    customer_name: input.customerName,
    email: input.email,
    phone: input.phone,
    shipping_address: input.shippingAddress,
    shipping_region: input.shippingRegion,
    shipping_cost: input.shippingCost,
    payment_method: input.paymentMethod,
    items: input.items.map((item) => ({
      product_id: item.productId,
      kind: item.kind ?? "product",
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  };

  const { data, error } = await supabase.rpc("create_order", { payload });
  if (error) throw error;
  const result = (data ?? {}) as Record<string, unknown>;

  return {
    id: String(result.id ?? ""),
    orderNumber: String(result.order_number ?? ""),
    subtotal: asNumber(result.subtotal),
    shippingCost: asNumber(result.shipping_cost),
    total: asNumber(result.total),
  };
}

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: String(row.id),
    productId: row.product_id ? String(row.product_id) : null,
    name: String(row.name ?? ""),
    price: asNumber(row.price),
    quantity: asNumber(row.quantity, 1),
  };
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc("get_order", { p_order_id: id });
  if (error) throw error;
  if (!data) return null;

  const result = data as { order?: Record<string, unknown>; items?: unknown };
  if (!result.order) return null;
  const row = result.order;
  const items = Array.isArray(result.items)
    ? (result.items as Record<string, unknown>[]).map(mapOrderItem)
    : [];

  return {
    id: String(row.id),
    orderNumber: String(row.order_number ?? ""),
    customerName: String(row.customer_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    shippingAddress: String(row.shipping_address ?? ""),
    shippingRegion: String(row.shipping_region ?? ""),
    subtotal: asNumber(row.subtotal),
    shippingCost: asNumber(row.shipping_cost),
    total: asNumber(row.total),
    status: String(row.status ?? "pending"),
    paymentMethod: String(row.payment_method ?? ""),
    paymentStatus: String(row.payment_status ?? "unpaid"),
    createdAt: String(row.created_at ?? ""),
    items,
  };
}