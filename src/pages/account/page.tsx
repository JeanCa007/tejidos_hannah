import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthForm from "@/components/feature/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { fetchAccountCounts, type AccountCounts } from "@/lib/account";
import ProfileEditor from "@/pages/account/components/ProfileEditor";

const accountLinks = [
  { to: "/mi-cuenta/pedidos", key: "orders" as const, label: "Mis pedidos", icon: "ri-shopping-bag-3-line" },
  { to: "/mi-cuenta/cursos", key: "courses" as const, label: "Mis cursos", icon: "ri-graduation-cap-line" },
  { to: "/mi-cuenta/patrones", key: "patterns" as const, label: "Mis patrones", icon: "ri-file-text-line" },
];

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const [counts, setCounts] = useState<AccountCounts | null>(null);

  useEffect(() => {
    if (!user) {
      setCounts(null);
      return;
    }
    let active = true;
    fetchAccountCounts()
      .then((result) => {
        if (active) setCounts(result);
      })
      .catch(() => {
        if (active) setCounts(null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-6">
        <header className="pb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
            Bienvenida
          </span>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground-950">
            Mi cuenta
          </h1>
          <p className="mt-2 text-sm text-foreground-600">
            Entra para ver tus pedidos, tus cursos y tus patrones descargados.
          </p>
        </header>
        <AuthForm variant="customer" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-background-200/70 bg-background-100 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-background-50">
            {(profile?.full_name || user.email || "H").charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground-950">
              Hola, {profile?.full_name || "cliente"}
            </h1>
            <p className="text-sm text-foreground-500">{profile?.email || user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
        >
          <i className="ri-logout-box-r-line" />
          Cerrar sesión
        </button>
      </header>

      {profile?.role === "admin" && (
        <Link
          to="/admin"
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-foreground-900/10 bg-foreground-900 p-5 text-background-50 transition-opacity hover:opacity-95"
        >
          <span className="flex items-center gap-3">
            <i className="ri-admin-line text-2xl" />
            <span>
              <span className="block text-sm font-bold">Panel de administración</span>
              <span className="block text-xs text-background-50/70">
                Administra productos, pedidos, cursos y más.
              </span>
            </span>
          </span>
          <i className="ri-arrow-right-line text-xl" />
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {accountLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 rounded-2xl border border-background-200/70 bg-background-50 p-5 transition-colors hover:bg-background-100"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className={`${link.icon} text-xl`} />
            </span>
            <span className="flex-1 text-sm font-semibold text-foreground-800">
              {link.label}
            </span>
            {counts && (
              <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-primary-500 px-2 text-xs font-bold text-background-50">
                {counts[link.key]}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <ProfileEditor />
      </div>

      <div className="mt-6 rounded-[2rem] border border-background-200/70 bg-background-50 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground-950">
          Todo en un solo lugar
        </h2>
        <p className="mt-1 text-sm text-foreground-600">
          Revisa el estado de tus pedidos, los horarios de tus cursos y
descarga los patrones que compraste o que son gratis.
        </p>
      </div>
    </div>
  );
}