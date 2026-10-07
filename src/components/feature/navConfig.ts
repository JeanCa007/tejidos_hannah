export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const primaryNav: NavItem[] = [
  { label: "Inicio", path: "/", icon: "ri-home-5-line" },
  { label: "Tienda", path: "/tienda", icon: "ri-shopping-bag-3-line" },
  { label: "Cursos", path: "/cursos", icon: "ri-graduation-cap-line" },
  { label: "Patrones", path: "/patrones", icon: "ri-file-text-line" },
  { label: "Nosotros", path: "/nosotros", icon: "ri-heart-3-line" },
];

export const bottomNav: NavItem[] = [
  { label: "Inicio", path: "/", icon: "ri-home-5-line" },
  { label: "Tienda", path: "/tienda", icon: "ri-shopping-bag-3-line" },
  { label: "Cursos", path: "/cursos", icon: "ri-graduation-cap-line" },
  { label: "Patrones", path: "/patrones", icon: "ri-file-text-line" },
  { label: "Carrito", path: "/carrito", icon: "ri-shopping-cart-2-line" },
];