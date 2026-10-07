export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

export interface ProductVariantGroup {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  onSale: boolean;
  categoryId: string | null;
  categoryName: string;
  tag: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
  shortDescription: string;
  description: string;
  details: string[];
  image: string;
  gallery: string[];
  variants: ProductVariantGroup[];
  isActive: boolean;
}

export interface CourseSession {
  id: string;
  courseId: string;
  label: string;
  startAt: string | null;
  endAt: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  location: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  level: string;
  mode: string;
  duration: string;
  image: string;
  shortDescription: string;
  includes: string[];
  isActive: boolean;
  sessions: CourseSession[];
}

export interface Pattern {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "free" | "paid";
  price: number;
  difficulty: string;
  category: string;
  image: string;
  fileUrl: string;
  shortDescription: string;
  includes: string[];
  details: string[];
  isActive: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  provinces: string[];
  cost: number;
  freeThreshold: number | null;
  estimatedDays: string;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingRegion: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Enrollment {
  id: string;
  courseId: string | null;
  courseTitle: string;
  sessionId: string | null;
  sessionLabel: string;
  studentName: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  timeSlot: string;
  notes: string;
  status: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
}