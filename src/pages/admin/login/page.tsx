import { Link, Navigate } from "react-router-dom";
import AuthForm from "@/components/feature/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const { user, profile, loading } = useAuth();

  if (!loading && user && profile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            className="text-3xl text-foreground-950"
            style={{ fontFamily: '"Pacifico", serif' }}
          >
            Tejidos Hannah
          </span>
          <span className="mt-2 rounded-full bg-foreground-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-background-50">
            Acceso privado
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <i className="ri-loader-4-line animate-spin text-3xl text-foreground-500" />
          </div>
        ) : (
          <AuthForm
            variant="admin"
            requireAdmin
            defaultEmail="admin@tejidoshannah.com"
          />
        )}

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-foreground-500 transition-colors hover:text-foreground-800"
        >
          <i className="ri-arrow-left-line" />
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}