import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function ProfileEditor() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq("id", user.id);
      if (updateError) throw updateError;
      await refreshProfile();
      setMessage("Tus datos quedaron guardados.");
    } catch {
      setError("No pudimos guardar tus datos. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-background-200/70 bg-background-50 p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
          <i className="ri-user-settings-line text-lg" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground-950">
            Mis datos
          </h2>
          <p className="text-xs text-foreground-600">
            Actualiza tu nombre y tu teléfono de contacto.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile_name" className="text-sm font-semibold text-foreground-800">
            Nombre completo
          </label>
          <input
            id="profile_name"
            name="full_name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Tu nombre"
            className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div>
          <label htmlFor="profile_phone" className="text-sm font-semibold text-foreground-800">
            Teléfono / WhatsApp
          </label>
          <input
            id="profile_phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="8888 8888"
            className="mt-2 w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      {message && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-secondary-100 px-4 py-3 text-sm font-medium text-secondary-800">
          <i className="ri-checkbox-circle-line" />
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className={`mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors ${
          saving
            ? "cursor-wait bg-primary-400 text-background-50"
            : "bg-primary-500 text-background-50 hover:bg-primary-600"
        }`}
      >
        {saving ? (
          <>
            <i className="ri-loader-4-line animate-spin text-lg" />
            Guardando...
          </>
        ) : (
          <>
            <i className="ri-save-3-line text-lg" />
            Guardar cambios
          </>
        )}
      </button>
    </form>
  );
}