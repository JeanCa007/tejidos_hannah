export interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
}

export const adminNav: AdminNavItem[] = [
  { label: "Resumen", path: "/admin", icon: "ri-dashboard-line" },
  { label: "Productos", path: "/admin/productos", icon: "ri-shopping-bag-3-line" },
  { label: "Pedidos", path: "/admin/pedidos", icon: "ri-shopping-cart-2-line" },
  { label: "Cursos", path: "/admin/cursos", icon: "ri-graduation-cap-line" },
  { label: "Matrículas", path: "/admin/matriculas", icon: "ri-bookmark-3-line" },
  { label: "Citas", path: "/admin/citas", icon: "ri-calendar-check-line" },
  { label: "Patrones", path: "/admin/patrones", icon: "ri-file-text-line" },
  { label: "Clientes", path: "/admin/clientes", icon: "ri-user-3-line" },
  { label: "Envíos", path: "/admin/envios", icon: "ri-truck-line" },
  { label: "Contenido", path: "/admin/contenido", icon: "ri-edit-2-line" },
  { label: "Configuración", path: "/admin/configuracion", icon: "ri-settings-3-line" },
];