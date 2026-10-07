import { supabase } from "@/lib/supabase";
import type { Enrollment, Order, OrderItem, Pattern } from "@/lib/storeTypes";

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as unknown[]).map((item) => String(item)) : [];
}

function formatDay(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", { day: "numeric", month: "long" });
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

/**
 * Returns the orders that belong to the signed-in customer.
 * Row Level Security already restricts rows to the current user.
 */
export async function fetchMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as Record<string, unknown>[];
  if (rows.length === 0) return [];

  const orderIds = rows.map((row) => String(row.id));
  const { data: itemData, error: itemError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);
  if (itemError) throw itemError;

  const itemsByOrder = new Map<string, OrderItem[]>();
  (itemData ?? []).forEach((raw) => {
    const record = raw as Record<string, unknown>;
    const orderId = String(record.order_id);
    const list = itemsByOrder.get(orderId) ?? [];
    list.push(mapOrderItem(record));
    itemsByOrder.set(orderId, list);
  });

  return rows.map((row) => ({
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
    items: itemsByOrder.get(String(row.id)) ?? [],
  }));
}

/**
 * Returns the course enrollments of the signed-in customer.
 */
export async function fetchMyEnrollments(): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as Record<string, unknown>[];
  if (rows.length === 0) return [];

  const courseIds = Array.from(
    new Set(rows.map((row) => row.course_id).filter(Boolean).map((value) => String(value)))
  );
  const sessionIds = Array.from(
    new Set(rows.map((row) => row.session_id).filter(Boolean).map((value) => String(value)))
  );

  const [courseRes, sessionRes] = await Promise.all([
    courseIds.length > 0
      ? supabase.from("courses").select("id, title").in("id", courseIds)
      : Promise.resolve({ data: [], error: null }),
    sessionIds.length > 0
      ? supabase.from("course_sessions").select("id, label, start_at, end_at, location").in("id", sessionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const courseMap = new Map<string, string>();
  (courseRes.data ?? []).forEach((raw) => {
    const record = raw as { id: string; title: string };
    courseMap.set(String(record.id), String(record.title ?? ""));
  });

  const sessionMap = new Map<string, { label: string; days: string; location: string }>();
  (sessionRes.data ?? []).forEach((raw) => {
    const record = raw as Record<string, unknown>;
    const start = record.start_at ? String(record.start_at) : null;
    const end = record.end_at ? String(record.end_at) : null;
    const startDay = formatDay(start);
    const endDay = formatDay(end);
    const days = startDay && endDay && startDay !== endDay ? `${startDay} – ${endDay}` : startDay;
    sessionMap.set(String(record.id), {
      label: String(record.label ?? ""),
      days,
      location: String(record.location ?? ""),
    });
  });

  return rows.map((row) => {
    const courseId = row.course_id ? String(row.course_id) : null;
    const sessionId = row.session_id ? String(row.session_id) : null;
    const session = sessionId ? sessionMap.get(sessionId) : undefined;
    const scheduleLabel = session
      ? [session.label, session.days].filter(Boolean).join(" · ")
      : "";
    return {
      id: String(row.id),
      courseId,
      courseTitle: courseId ? courseMap.get(courseId) ?? "" : "",
      sessionId,
      sessionLabel: scheduleLabel || session?.location || "",
      studentName: String(row.student_name ?? ""),
      email: String(row.email ?? ""),
      phone: String(row.phone ?? ""),
      status: String(row.status ?? "pending"),
      paymentStatus: String(row.payment_status ?? "unpaid"),
      createdAt: String(row.created_at ?? ""),
    };
  });
}

function mapPatternRow(row: Record<string, unknown>): Pattern {
  const price = asNumber(row.price);
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    type: row.type === "paid" ? "paid" : "free",
    price,
    difficulty: String(row.difficulty ?? ""),
    category: String(row.category ?? ""),
    image: String(row.image_url ?? ""),
    fileUrl: String(row.file_url ?? ""),
    shortDescription: String(row.short_description ?? ""),
    includes: asStringArray(row.includes),
    details: asStringArray(row.details),
    isActive: row.is_active !== false,
  };
}

/**
 * Returns the paid patterns the signed-in customer has purchased.
 */
export async function fetchMyPatterns(): Promise<Pattern[]> {
  const { data, error } = await supabase
    .from("pattern_purchases")
    .select("pattern_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const ids = Array.from(
    new Set(
      (data ?? [])
        .map((raw) => (raw as { pattern_id: string | null }).pattern_id)
        .filter(Boolean)
        .map((value) => String(value))
    )
  );
  if (ids.length === 0) return [];

  const { data: patternData, error: patternError } = await supabase
    .from("patterns")
    .select("*")
    .in("id", ids);
  if (patternError) throw patternError;

  const patternMap = new Map<string, Pattern>();
  (patternData ?? []).forEach((raw) => {
    const record = raw as Record<string, unknown>;
    patternMap.set(String(record.id), mapPatternRow(record));
  });

  return ids
    .map((id) => patternMap.get(id))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
}

export interface AccountCounts {
  orders: number;
  courses: number;
  patterns: number;
}

/**
 * Returns quick counts for the signed-in customer's account dashboard.
 * Row Level Security restricts each count to the current user's own rows.
 */
export async function fetchAccountCounts(): Promise<AccountCounts> {
  const [orders, courses, patterns] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("id", { count: "exact", head: true }),
    supabase.from("pattern_purchases").select("id", { count: "exact", head: true }),
  ]);
  return {
    orders: orders.count ?? 0,
    courses: courses.count ?? 0,
    patterns: patterns.count ?? 0,
  };
}

export interface CreateEnrollmentInput {
  courseId: string;
  sessionId: string | null;
  studentName: string;
  email: string;
  phone: string;
  notes: string;
}

/**
 * Creates a real enrollment record for the current user.
 */
export async function createEnrollment(input: CreateEnrollmentInput): Promise<string> {
  const payload = {
    course_id: input.courseId,
    session_id: input.sessionId ?? "",
    student_name: input.studentName,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
  };
  const { data, error } = await supabase.rpc("create_enrollment", { payload });
  if (error) throw error;
  const result = (data ?? {}) as Record<string, unknown>;
  return String(result.id ?? "");
}