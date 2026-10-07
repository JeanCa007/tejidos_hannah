import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RequireCustomerProps {
  children: ReactNode;
}

export default function RequireCustomer({ children }: RequireCustomerProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <i className="ri-lock-2-line text-3xl" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground-950">
          Inicia sesión para ver esta sección
        </h1>
        <p className="mt-2 max-w-sm text-sm text-foreground-600">
          Necesitas entrar a tu cuenta para ver tu historial de compras,
          matrículas y descargas.
        </p>
        <Link
          to="/mi-cuenta"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-user-3-line text-lg" />
          Ir a mi cuenta
        </Link>
      </section>
    );
  }

  return <>{children}</>;
}