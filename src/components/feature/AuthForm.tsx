import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  variant?: "customer" | "admin";
  defaultEmail?: string;
  requireAdmin?: boolean;
}

export default function AuthForm({
  variant = "customer",
  defaultEmail = "",
  requireAdmin = false,
}: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setNotice("");

    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setStatus("idle");
      setError(
        signInError.toLowerCase().includes("invalid")
          ? "Correo o contraseña incorrectos."
          : signInError
      );
      return;
    }

    const { data: authUser } = await supabase.auth.getUser();
    const uid = authUser.user?.id;

    let role = "customer";
    if (uid) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .maybeSingle();
      role = data?.role ?? "customer";
    }

    // Un solo acceso: si la cuenta es administradora, va al panel.
    if (role === "admin") {
      setStatus("idle");
      navigate("/admin");
      return;
    }

    if (requireAdmin) {
      await supabase.auth.signOut();
      setStatus("idle");
      setError("Esta cuenta no tiene permisos de administrador.");
      return;
    }

    setStatus("idle");
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setNotice("");

    if (password.length < 6) {
      setStatus("idle");
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { error: signUpError, needsConfirmation } = await signUp(
      email.trim(),
      password,
      fullName.trim()
    );

    setStatus("idle");

    if (signUpError) {
      setError(
        signUpError.toLowerCase().includes("already")
          ? "Ese correo ya está registrado. Inicia sesión."
          : signUpError
      );
      return;
    }

    if (needsConfirmation) {
      setNotice(
        "¡Cuenta creada! Revisa tu correo para confirmarla y luego inicia sesión."
      );
      setMode("login");
      return;
    }

    setNotice("¡Listo! Tu cuenta quedó creada.");
  };

  const isAdmin = variant === "admin";

  return (
    <div className="w-full rounded-[2rem] border border-background-200/70 bg-background-50 p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            isAdmin ? "bg-foreground-900 text-background-50" : "bg-primary-500 text-background-50"
          }`}
        >
          <i className={isAdmin ? "ri-admin-line text-xl" : "ri-user-3-line text-xl"} />
        </span>
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground-950">
            {isAdmin ? "Panel de administración" : "Mi cuenta"}
          </h1>
          <p className="text-xs text-foreground-500">
            {mode === "login"
              ? "Ingresa con tu correo y contraseña."
              : "Crea tu cuenta en un minuto."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-background-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
            setNotice("");
          }}
          className={`rounded-full py-2 text-sm font-semibold transition-colors ${
            mode === "login"
              ? "bg-background-50 text-foreground-900 shadow-card"
              : "text-foreground-500 hover:text-foreground-800"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
            setNotice("");
          }}
          className={`rounded-full py-2 text-sm font-semibold transition-colors ${
            mode === "signup"
              ? "bg-background-50 text-foreground-900 shadow-card"
              : "text-foreground-500 hover:text-foreground-800"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form
        onSubmit={mode === "login" ? handleLogin : handleSignup}
        className="mt-5 space-y-4"
      >
        {mode === "signup" && (
          <div>
            <label htmlFor="auth_full_name" className="text-sm font-semibold text-foreground-800">
              Nombre completo
            </label>
            <input
              id="auth_full_name"
              name="full_name"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Tu nombre"
              className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth_email" className="text-sm font-semibold text-foreground-800">
            Correo electrónico
          </label>
          <input
            id="auth_email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div>
          <label htmlFor="auth_password" className="text-sm font-semibold text-foreground-800">
            Contraseña
          </label>
          <div className="relative mt-2">
            <input
              id="auth_password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-background-200 bg-background-50 py-3 pl-4 pr-12 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground-400 hover:bg-background-100 hover:text-foreground-700"
            >
              <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
            </button>
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
            <i className="ri-error-warning-line mt-0.5" />
            {error}
          </p>
        )}

        {notice && (
          <p className="flex items-start gap-2 rounded-xl bg-secondary-100 px-4 py-3 text-sm font-medium text-secondary-800">
            <i className="ri-mail-check-line mt-0.5" />
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-colors ${
            status === "loading"
              ? "cursor-wait bg-primary-400 text-background-50"
              : isAdmin
                ? "bg-foreground-900 text-background-50 hover:bg-foreground-800"
                : "bg-primary-500 text-background-50 hover:bg-primary-600"
          }`}
        >
          {status === "loading" ? (
            <>
              <i className="ri-loader-4-line animate-spin text-lg" />
              Procesando...
            </>
          ) : mode === "login" ? (
            <>
              <i className="ri-login-box-line text-lg" />
              Iniciar sesión
            </>
          ) : (
            <>
              <i className="ri-user-add-line text-lg" />
              Crear mi cuenta
            </>
          )}
        </button>
      </form>

      {isAdmin && mode === "login" && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-background-100 px-4 py-3 text-xs text-foreground-500">
          <i className="ri-information-line mt-0.5" />
          ¿Es la primera vez? Usa la pestaña «Crear cuenta» con tu correo de
          administradora. Tu cuenta tendrá acceso al panel automáticamente.
        </p>
      )}
    </div>
  );
}