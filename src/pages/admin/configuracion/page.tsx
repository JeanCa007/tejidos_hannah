import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AdminHeader,
  ErrorBanner,
  LoadingRows,
  TextField,
  PrimaryButton,
} from "@/pages/admin/components/ui";

interface GeneralSettings {
  storeName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
}

const defaults: GeneralSettings = {
  storeName: "Tejidos Hannah",
  email: "hola@tejidoshannah.com",
  phone: "+506 8888 8888",
  whatsapp: "+506 8888 8888",
  address: "San José, Costa Rica",
  instagram: "https://instagram.com/tejidoshannah",
  facebook: "https://facebook.com/tejidoshannah",
};

export default function AdminConfiguracionPage() {
  const [settings, setSettings] = useState<GeneralSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "general")
        .maybeSingle();
      if (dbError) throw dbError;
      if (data?.value) {
        setSettings({ ...defaults, ...(data.value as Partial<GeneralSettings>) });
      }
    } catch {
      setError("No pudimos cargar la configuración. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (field: keyof GeneralSettings, value: string) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const { error: dbError } = await supabase
        .from("site_settings")
        .upsert(
          [{ key: "general", value: settings, updated_at: new Date().toISOString() }],
          { onConflict: "key" }
        );
      if (dbError) throw dbError;
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("No pudimos guardar la configuración. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Configuración general"
        description="Datos de contacto y de tu tienda."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : (
        <div className="max-w-2xl rounded-2xl border border-background-200/70 bg-background-50 p-6">
          <div className="space-y-5">
            <TextField label="Nombre de la tienda" value={settings.storeName} onChange={(value) => set("storeName", value)} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Correo de contacto" value={settings.email} onChange={(value) => set("email", value)} type="email" />
              <TextField label="Teléfono" value={settings.phone} onChange={(value) => set("phone", value)} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="WhatsApp" value={settings.whatsapp} onChange={(value) => set("whatsapp", value)} />
              <TextField label="Dirección" value={settings.address} onChange={(value) => set("address", value)} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Instagram" value={settings.instagram} onChange={(value) => set("instagram", value)} />
              <TextField label="Facebook" value={settings.facebook} onChange={(value) => set("facebook", value)} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {saved && (
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-800">
                  <i className="ri-checkbox-circle-fill" />
                  Guardado
                </span>
              )}
              <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
                Guardar configuración
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}