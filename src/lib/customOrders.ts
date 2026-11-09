import { supabase } from "@/lib/supabase";

export interface CustomOrder {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  pieceType: string;
  description: string;
  colors: string;
  size: string;
  quantity: number;
  budget: number | null;
  neededBy: string;
  referenceImages: string[];
  status: string;
  quoteAmount: number | null;
  adminNotes: string;
  createdAt: string;
}

export interface CustomOrderInput {
  userId?: string | null;
  customerName: string;
  email: string;
  phone: string;
  pieceType: string;
  description: string;
  colors: string;
  size: string;
  quantity: number;
  budget: number | null;
  neededBy: string;
  referenceImages: string[];
}

export interface PieceOption {
  value: string;
  label: string;
  icon: string;
}

export const customOrderPieces: PieceOption[] = [
  { value: "manta", label: "Manta o colcha", icon: "ri-moon-clear-line" },
  { value: "amigurumi", label: "Amigurumi", icon: "ri-emotion-happy-line" },
  { value: "bolso", label: "Bolso o cartera", icon: "ri-shopping-bag-line" },
  { value: "bebe", label: "Ropa de bebé", icon: "ri-heart-2-line" },
  { value: "decoracion", label: "Decoración", icon: "ri-home-smile-line" },
  { value: "otro", label: "Otra idea", icon: "ri-lightbulb-line" },
];

export const customOrderStatuses = [
  { value: "pending", label: "Pendiente" },
  { value: "quoted", label: "Cotizada" },
  { value: "accepted", label: "Aceptada" },
  { value: "in_progress", label: "En proceso" },
  { value: "completed", label: "Entregada" },
  { value: "cancelled", label: "Cancelada" },
];

/** Pasos que ve la clienta en su seguimiento (sin contar cancelada). */
export const customOrderTimeline = [
  { value: "pending", label: "Solicitud recibida", icon: "ri-inbox-line" },
  { value: "quoted", label: "Cotización enviada", icon: "ri-price-tag-3-line" },
  { value: "accepted", label: "Cotización aceptada", icon: "ri-thumb-up-line" },
  { value: "in_progress", label: "Tejiendo tu pieza", icon: "ri-scissors-cut-line" },
  { value: "completed", label: "Entregada", icon: "ri-checkbox-circle-line" },
];

/** Índice del paso actual dentro de la línea de tiempo. */
export function customOrderStepIndex(status: string): number {
  const index = customOrderTimeline.findIndex((step) => step.value === status);
  return index === -1 ? 0 : index;
}

export const customOrderStatusTones: Record<string, string> = {
  pending: "bg-accent-100 text-accent-900",
  quoted: "bg-primary-100 text-primary-800",
  accepted: "bg-secondary-100 text-secondary-900",
  in_progress: "bg-primary-100 text-primary-800",
  completed: "bg-secondary-500 text-secondary-50",
  cancelled: "bg-background-200 text-foreground-600",
};

export function pieceLabel(value: string): string {
  return customOrderPieces.find((piece) => piece.value === value)?.label ?? "Pedido especial";
}

export function customOrderStatusLabel(value: string): string {
  return customOrderStatuses.find((status) => status.value === value)?.label ?? value;
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asImages(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function mapCustomOrder(row: Record<string, unknown>): CustomOrder {
  return {
    id: String(row.id),
    customerName: String(row.customer_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    pieceType: String(row.piece_type ?? ""),
    description: String(row.description ?? ""),
    colors: String(row.colors ?? ""),
    size: String(row.size ?? ""),
    quantity: asNumber(row.quantity) || 1,
    budget: row.budget == null ? null : asNumber(row.budget),
    neededBy: row.needed_by ? String(row.needed_by) : "",
    referenceImages: asImages(row.reference_images),
    status: String(row.status ?? "pending"),
    quoteAmount: row.quote_amount == null ? null : asNumber(row.quote_amount),
    adminNotes: String(row.admin_notes ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function createCustomOrder(input: CustomOrderInput): Promise<string> {
  const { data, error } = await supabase.rpc("create_custom_order", {
    payload: {
      customer_name: input.customerName,
      email: input.email,
      phone: input.phone,
      piece_type: input.pieceType,
      description: input.description,
      colors: input.colors,
      size: input.size,
      quantity: input.quantity,
      budget: input.budget == null ? "" : String(input.budget),
      needed_by: input.neededBy,
      reference_images: input.referenceImages,
    },
  });
  if (error) throw error;
  return data ? String(data) : "";
}

/**
 * Solicitudes de la clienta con sesión iniciada.
 * Las reglas de acceso ya limitan las filas a su propio usuario.
 */
export async function fetchMyCustomOrders(): Promise<CustomOrder[]> {
  const { data, error } = await supabase
    .from("custom_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapCustomOrder(row as Record<string, unknown>));
}

export async function fetchCustomOrders(): Promise<CustomOrder[]> {
  const { data, error } = await supabase
    .from("custom_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapCustomOrder(row as Record<string, unknown>));
}

export async function updateCustomOrder(
  id: string,
  patch: { status?: string; quoteAmount?: number | null; adminNotes?: string }
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.quoteAmount !== undefined) payload.quote_amount = patch.quoteAmount;
  if (patch.adminNotes !== undefined) payload.admin_notes = patch.adminNotes;

  const { error } = await supabase.from("custom_orders").update(payload).eq("id", id);
  if (error) throw error;
}

export function formatNeededBy(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Días que faltan para la fecha de entrega (negativo = atrasada). */
export function daysUntil(value: string): number | null {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  const noon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  return Math.round((date.getTime() - noon.getTime()) / 86400000);
}

/**
 * La clienta acepta la cotización enviada por el taller.
 * El backend valida que la solicitud sea suya y que ya tenga precio.
 */
export async function acceptCustomOrderQuote(id: string): Promise<void> {
  const { error } = await supabase.rpc("accept_custom_order_quote", { order_id: id });
  if (error) throw error;
}

export interface CustomOrderQuote {
  customerName: string;
  pieceType: string;
  quantity: number;
  colors: string;
  size: string;
  neededBy: string;
  quoteAmount: number | null;
  status: string;
  description: string;
}

/**
 * Cotización pública a la que apunta el enlace del correo.
 * El token es único por solicitud y no expone datos internos del taller.
 */
export async function fetchCustomOrderQuote(
  token: string
): Promise<CustomOrderQuote | null> {
  const { data, error } = await supabase.rpc("get_custom_order_quote", {
    p_token: token,
  });
  if (error) throw error;
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    customerName: String(row.customer_name ?? ""),
    pieceType: String(row.piece_type ?? ""),
    quantity: asNumber(row.quantity) || 1,
    colors: String(row.colors ?? ""),
    size: String(row.size ?? ""),
    neededBy: row.needed_by ? String(row.needed_by).slice(0, 10) : "",
    quoteAmount: row.quote_amount == null ? null : asNumber(row.quote_amount),
    status: String(row.status ?? ""),
    description: String(row.description ?? ""),
  };
}

/** Acepta la cotización desde el enlace del correo, sin necesidad de sesión. */
export async function acceptCustomOrderQuoteByToken(token: string): Promise<void> {
  const { error } = await supabase.rpc("accept_custom_order_quote_by_token", {
    p_token: token,
  });
  if (error) throw error;
}

/** Estados en los que la pieza sigue en curso (y una fecha pasada significa atraso). */
export const activeCustomOrderStatuses = [
  "pending",
  "quoted",
  "accepted",
  "in_progress",
];

/** ¿La solicitud está atrasada? Solo cuenta si sigue activa y ya pasó la fecha. */
export function isCustomOrderOverdue(order: CustomOrder): boolean {
  if (!activeCustomOrderStatuses.includes(order.status)) return false;
  const days = daysUntil(order.neededBy);
  return days != null && days < 0;
}

/**
 * Ordena por fecha de entrega: primero lo más atrasado y próximo,
 * y al final las solicitudes que todavía no tienen fecha.
 */
export function sortByNeededBy(list: CustomOrder[]): CustomOrder[] {
  return [...list].sort((a, b) => {
    const aDate = a.neededBy ? new Date(`${a.neededBy.slice(0, 10)}T12:00:00`).getTime() : null;
    const bDate = b.neededBy ? new Date(`${b.neededBy.slice(0, 10)}T12:00:00`).getTime() : null;
    if (aDate == null && bDate == null) return 0;
    if (aDate == null) return 1;
    if (bDate == null) return -1;
    return aDate - bDate;
  });
}