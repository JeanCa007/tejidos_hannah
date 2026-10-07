import type { RouteObject } from "react-router-dom";
import StoreLayout from "@/components/feature/StoreLayout";
import AdminLayout from "@/components/feature/AdminLayout";
import Home from "@/pages/home/page";
import StorePage from "@/pages/store/page";
import ProductDetailPage from "@/pages/store/detail/page";
import CartPage from "@/pages/cart/page";
import CheckoutPage from "@/pages/checkout/page";
import OrderConfirmationPage from "@/pages/pedido/page";
import CoursesPage from "@/pages/courses/page";
import CourseDetailPage from "@/pages/courses/detail/page";
import MatriculaPage from "@/pages/matricula/page";
import PatternsPage from "@/pages/patterns/page";
import PatternDetailPage from "@/pages/patterns/detail/page";
import AgendaPage from "@/pages/agenda/page";
import NosotrosPage from "@/pages/nosotros/page";
import ContactoPage from "@/pages/contacto/page";
import AccountPage from "@/pages/account/page";
import MyOrdersPage from "@/pages/account/pedidos/page";
import MyCoursesPage from "@/pages/account/cursos/page";
import MyPatternsPage from "@/pages/account/patrones/page";
import NotFound from "@/pages/NotFound";
import AdminLoginPage from "@/pages/admin/login/page";
import AdminGuard from "@/pages/admin/AdminGuard";
import AdminDashboard from "@/pages/admin/dashboard/page";
import AdminProductosPage from "@/pages/admin/productos/page";
import AdminPedidosPage from "@/pages/admin/pedidos/page";
import AdminCursosPage from "@/pages/admin/cursos/page";
import AdminMatriculasPage from "@/pages/admin/matriculas/page";
import AdminCitasPage from "@/pages/admin/citas/page";
import AdminPatronesPage from "@/pages/admin/patrones/page";
import AdminClientesPage from "@/pages/admin/clientes/page";
import AdminEnviosPage from "@/pages/admin/envios/page";
import AdminContenidoPage from "@/pages/admin/contenido/page";
import AdminConfiguracionPage from "@/pages/admin/configuracion/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <StoreLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "tienda", element: <StorePage /> },
      { path: "tienda/:id", element: <ProductDetailPage /> },
      { path: "cursos", element: <CoursesPage /> },
      { path: "cursos/:id", element: <CourseDetailPage /> },
      { path: "matricula/:courseId", element: <MatriculaPage /> },
      { path: "patrones", element: <PatternsPage /> },
      { path: "patrones/:id", element: <PatternDetailPage /> },
      { path: "agenda", element: <AgendaPage /> },
      { path: "nosotros", element: <NosotrosPage /> },
      { path: "contacto", element: <ContactoPage /> },
      { path: "carrito", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "pedido/:id", element: <OrderConfirmationPage /> },
      { path: "mi-cuenta", element: <AccountPage /> },
      { path: "mi-cuenta/pedidos", element: <MyOrdersPage /> },
      { path: "mi-cuenta/cursos", element: <MyCoursesPage /> },
      { path: "mi-cuenta/patrones", element: <MyPatternsPage /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "productos", element: <AdminProductosPage /> },
      { path: "pedidos", element: <AdminPedidosPage /> },
      { path: "cursos", element: <AdminCursosPage /> },
      { path: "matriculas", element: <AdminMatriculasPage /> },
      { path: "citas", element: <AdminCitasPage /> },
      { path: "patrones", element: <AdminPatronesPage /> },
      { path: "clientes", element: <AdminClientesPage /> },
      { path: "envios", element: <AdminEnviosPage /> },
      { path: "contenido", element: <AdminContenidoPage /> },
      { path: "configuracion", element: <AdminConfiguracionPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;