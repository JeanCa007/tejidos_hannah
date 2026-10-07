import { Link, NavLink, Outlet } from "react-router-dom";
import { adminNav } from "@/pages/admin/adminNav";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background-100">
      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-background-200/70 bg-background-50 px-4 py-6 lg:flex">
          <Link to="/admin" className="flex items-center gap-2 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground-900 text-background-50">
              <i className="ri-goblet-line text-lg" />
            </span>
            <span className="leading-tight">
              <span
                className="block text-lg text-foreground-950"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                Tejidos Hannah
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-foreground-400">
                Administración
              </span>
            </span>
          </Link>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
            {adminNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-foreground-900 text-background-50"
                      : "text-foreground-600 hover:bg-background-100 hover:text-foreground-900"
                  }`
                }
              >
                <i className={`${item.icon} text-lg`} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 border-t border-background-200/70 pt-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground-600 transition-colors hover:bg-background-100 hover:text-foreground-900"
            >
              <i className="ri-store-2-line text-lg" />
              Ver la tienda
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground-600 transition-colors hover:bg-background-100 hover:text-foreground-900"
            >
              <i className="ri-logout-box-r-line text-lg" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-background-200/70 bg-background-50/90 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
              <div className="flex items-center gap-2 lg:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground-900 text-background-50">
                  <i className="ri-goblet-line" />
                </span>
                <span
                  className="text-base text-foreground-950"
                  style={{ fontFamily: '"Pacifico", serif' }}
                >
                  Tejidos Hannah
                </span>
              </div>
              <span className="hidden text-sm font-semibold text-foreground-500 lg:block">
                Panel de administración
              </span>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-foreground-500 sm:inline">
                  {profile?.email}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-background-50">
                  {(profile?.full_name || profile?.email || "A")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            </div>

            <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-background-200/70 px-3 py-2 lg:hidden">
              {adminNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-foreground-900 text-background-50"
                        : "bg-background-100 text-foreground-600"
                    }`
                  }
                >
                  <i className={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}