import { supabase } from "@/lib/supabase";
import type {
  Category,
  Course,
  CourseSession,
  Pattern,
  Product,
} from "@/lib/storeTypes";

export interface HomeContent {
  verse: { text: string; reference: string };
  hero: { eyebrow: string; title: string; subtitle: string };
  trust: { icon: string; title: string; description: string }[];
}

export const defaultHomeContent: HomeContent = {
  verse: {
    text: "Todo lo puedo en Cristo que me fortalece.",
    reference: "Filipenses 4:13",
  },
  hero: {
    eyebrow: "Hecho a mano en Costa Rica",
    title: "Tejidos que abrazan tu hogar",
    subtitle:
      "Piezas únicas tejidas con amor, cursos para aprender el arte del tejido y patrones listos para crear tus propias obras.",
  },
  trust: [
    { icon: "ri-truck-line", title: "Envío a todo Costa Rica", description: "Recibe en la puerta de tu casa" },
    { icon: "ri-heart-3-line", title: "100% hecho a mano", description: "Cada pieza es única e irrepetible" },
    { icon: "ri-shield-check-line", title: "Compra segura", description: "Pago con tarjeta o SINPE Móvil" },
    { icon: "ri-graduation-cap-line", title: "Aprende con nosotros", description: "Cursos presenciales y en línea" },
  ],
};

export const heroImage =
  "https://readdy.ai/api/search-image?query=Cozy%20handmade%20crochet%20yarn%20baskets%20and%20knitted%20blankets%20on%20a%20warm%20wooden%20table%2C%20soft%20natural%20light%2C%20artisanal%20craft%20aesthetic%2C%20cream%20and%20terracotta%20tones%2C%20editorial%20product%20photography%20with%20soft%20shadows%20and%20organic%20composition&width=1200&height=900&seq=th-hero-01&orientation=landscape";

export const FALLBACK_PRODUCT_IMAGE =
  "https://readdy.ai/api/search-image?query=A%20handmade%20cream%20crochet%20item%20on%20a%20light%20neutral%20surface%2C%20minimal%20clean%20product%20photography%2C%20soft%20daylight%2C%20warm%20tones%2C%20centered%20composition%20on%20a%20simple%20background&width=800&height=800&seq=th-fallback-01&orientation=squarish";

function formatDay(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", { day: "numeric", month: "long" });
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    icon: String(row.icon ?? "ri-price-tag-3-line"),
    sortOrder: asNumber(row.sort_order),
  };
}

function mapProduct(
  row: Record<string, unknown>,
  categoryMap: Map<string, string>
): Product {
  const price = asNumber(row.price);
  const comparePrice = row.compare_price == null ? null : asNumber(row.compare_price);
  const categoryId = row.category_id ? String(row.category_id) : null;
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    price,
    comparePrice,
    onSale: comparePrice != null && comparePrice > price,
    categoryId,
    categoryName: categoryId ? categoryMap.get(categoryId) ?? "" : "",
    tag: row.tag ? String(row.tag) : null,
    rating: asNumber(row.rating, 5),
    reviewCount: asNumber(row.review_count),
    stock: asNumber(row.stock),
    shortDescription: String(row.short_description ?? row.description ?? ""),
    description: String(row.description ?? ""),
    details: asArray<string>(row.details),
    image: String(row.image_url ?? "") || FALLBACK_PRODUCT_IMAGE,
    gallery: asArray<string>(row.gallery),
    variants: asArray<Product["variants"][number]>(row.variants),
    isActive: row.is_active !== false,
  };
}

function mapSession(
  row: Record<string, unknown>,
  courseId: string
): CourseSession {
  return {
    id: String(row.id),
    courseId,
    label: String(row.label ?? ""),
    startAt: row.start_at ? String(row.start_at) : null,
    endAt: row.end_at ? String(row.end_at) : null,
    startDate: formatDay(row.start_at ? String(row.start_at) : null),
    endDate: formatDay(row.end_at ? String(row.end_at) : null),
    capacity: asNumber(row.capacity),
    enrolled: asNumber(row.enrolled),
    location: String(row.location ?? ""),
    isActive: row.is_active !== false,
  };
}

function mapCourse(
  row: Record<string, unknown>,
  sessions: CourseSession[]
): Course {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    price: asNumber(row.price),
    comparePrice: row.compare_price == null ? null : asNumber(row.compare_price),
    level: String(row.level ?? ""),
    mode: String(row.mode ?? ""),
    duration: String(row.duration ?? ""),
    image: String(row.image_url ?? "") || FALLBACK_PRODUCT_IMAGE,
    shortDescription: String(row.short_description ?? ""),
    includes: asArray<string>(row.includes),
    isActive: row.is_active !== false,
    sessions,
  };
}

export function mapPattern(row: Record<string, unknown>): Pattern {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    type: row.type === "paid" ? "paid" : "free",
    price: asNumber(row.price),
    difficulty: String(row.difficulty ?? ""),
    category: String(row.category ?? ""),
    image: String(row.image_url ?? "") || FALLBACK_PRODUCT_IMAGE,
    fileUrl: String(row.file_url ?? ""),
    shortDescription: String(row.short_description ?? ""),
    includes: asArray<string>(row.includes),
    details: asArray<string>(row.details),
    isActive: row.is_active !== false,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function fetchProducts(): Promise<Product[]> {
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase.from("categories").select("id, name"),
  ]);
  if (productsRes.error) throw productsRes.error;
  const categoryMap = new Map<string, string>();
  (categoriesRes.data ?? []).forEach((row) => {
    categoryMap.set(String((row as { id: string }).id), String((row as { name: string }).name));
  });
  return (productsRes.data ?? []).map((row) =>
    mapProduct(row as Record<string, unknown>, categoryMap)
  );
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const [productRes, categoriesRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name"),
  ]);
  if (productRes.error) throw productRes.error;
  if (!productRes.data) return null;
  const categoryMap = new Map<string, string>();
  (categoriesRes.data ?? []).forEach((row) => {
    categoryMap.set(String((row as { id: string }).id), String((row as { name: string }).name));
  });
  return mapProduct(productRes.data as Record<string, unknown>, categoryMap);
}

export function pickRelated(current: Product, all: Product[], limit = 4): Product[] {
  const same = all.filter(
    (item) => item.categoryId === current.categoryId && item.id !== current.id
  );
  const others = all.filter(
    (item) => item.categoryId !== current.categoryId && item.id !== current.id
  );
  return [...same, ...others].slice(0, limit);
}

export async function fetchCourses(): Promise<Course[]> {
  const [coursesRes, sessionsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase.from("course_sessions").select("*").eq("is_active", true),
  ]);
  if (coursesRes.error) throw coursesRes.error;
  const sessionsByCourse = new Map<string, CourseSession[]>();
  (sessionsRes.data ?? []).forEach((row) => {
    const record = row as Record<string, unknown>;
    const courseId = String(record.course_id);
    const list = sessionsByCourse.get(courseId) ?? [];
    list.push(mapSession(record, courseId));
    sessionsByCourse.set(courseId, list);
  });
  return (coursesRes.data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    return mapCourse(record, sessionsByCourse.get(String(record.id)) ?? []);
  });
}

export async function fetchCourseById(id: string): Promise<Course | null> {
  const [courseRes, sessionsRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase.from("course_sessions").select("*").eq("course_id", id),
  ]);
  if (courseRes.error) throw courseRes.error;
  if (!courseRes.data) return null;
  const sessions = (sessionsRes.data ?? []).map((row) =>
    mapSession(row as Record<string, unknown>, id)
  );
  return mapCourse(courseRes.data as Record<string, unknown>, sessions);
}

export async function fetchPatterns(): Promise<Pattern[]> {
  const { data, error } = await supabase
    .from("patterns")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapPattern(row as Record<string, unknown>));
}

export async function fetchPatternById(id: string): Promise<Pattern | null> {
  const { data, error } = await supabase
    .from("patterns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapPattern(data as Record<string, unknown>);
}

export function pickRelatedPatterns(current: Pattern, all: Pattern[], limit = 3): Pattern[] {
  const same = all.filter(
    (item) => item.category === current.category && item.id !== current.id
  );
  const others = all.filter(
    (item) => item.category !== current.category && item.id !== current.id
  );
  return [...same, ...others].slice(0, limit);
}

export async function fetchHomeContent(): Promise<HomeContent> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");
  if (error) throw error;

  const map = new Map<string, unknown>();
  (data ?? []).forEach((row) => {
    const record = row as { key: string; value: unknown };
    map.set(record.key, record.value);
  });

  const verse = (map.get("bible_verse") as HomeContent["verse"]) ?? defaultHomeContent.verse;
  const hero = (map.get("hero") as HomeContent["hero"]) ?? defaultHomeContent.hero;
  const trust = (map.get("trust") as HomeContent["trust"]) ?? defaultHomeContent.trust;

  return {
    verse: verse ?? defaultHomeContent.verse,
    hero: hero ?? defaultHomeContent.hero,
    trust: Array.isArray(trust) ? trust : defaultHomeContent.trust,
  };
}