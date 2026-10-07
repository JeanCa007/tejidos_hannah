import { Link, NavLink } from "react-router-dom";
import { primaryNav } from "./navConfig";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function StoreHeader() {
  const { count } = useCart();
  const { isAdmin } = useAuth();
  return (
    <header className="fixed top-0 left-0 z-40 w-full border-b border-background-200/70 bg-background-50/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-background-50">
            <i className="ri-goblet-line text-lg" />
          </span>
          <span
            className="text-xl text-foreground-950"
            style={{ fontFamily: '"Pacifico", serif' }}
          >
            Tejidos Hannah
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-700"
                    : "text-foreground-600 hover:bg-background-100 hover:text-foreground-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex h-10 items-center gap-2 rounded-full bg-foreground-900 px-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-foreground-800"
            >
              <i className="ri-admin-line text-lg" />
              <span className="hidden sm:inline">Panel</span>
            </Link>
          )}
          <Link
            to="/tienda"
            aria-label="Buscar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-100 hover:text-foreground-900"
          >
            <i className="ri-search-line text-xl" />
          </Link>
          <Link
            to="/mi-cuenta"
            aria-label="Mi cuenta"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-100 hover:text-foreground-900"
          >
            <i className="ri-user-3-line text-xl" />
          </Link>
          <Link
            to="/carrito"
            aria-label="Carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-100 hover:text-foreground-900"
          >
            <i className="ri-shopping-cart-2-line text-xl" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-accent-950">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}