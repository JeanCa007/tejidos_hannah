import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-50">
        <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}