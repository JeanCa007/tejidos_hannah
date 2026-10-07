import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sendTestEmail } from "@/lib/email";
import {
  defaultGeneralSettings,
  useSiteSettings,
  type SiteGeneralSettings,
} from "@/hooks/useSiteSettings";
import ImageUploader from "@/pages/admin/components/ImageUploader";
import {
  AdminHeader,
  ErrorBanner,
  LoadingRows,
  TextField,
  PrimaryButton,
} from "@/pages/admin/components/ui";

const LOGO_ICON_OPTIONS = [
  "ri-goblet-line",
  "ri-heart-3-line",
  "ri-leaf-line",
  "ri-hand-heart-line",
  "ri-scissors-line",
  "ri-palette-line",
  "ri-star-line",
  "ri-magic-line",
];

export default function AdminConfiguracionPage() {
  const { refresh: refreshSiteSettings } = useSiteSettings();
  const [settings, setSettings] = useState<SiteGeneralSettings>(defaultGeneralSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

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
        setSettings({
          ...defaultGeneralSettings,
          ...(data.value as Partial<SiteGeneralSettings>),
        });
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

  const set = (field: keyof SiteGeneralSettings, value: string) =>
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
      await refreshSiteSettings();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("No pudimos guardar la configuración. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await sendTestEmail(testTo.trim() || undefined);
    setTestResult(result);
    setTesting(false);
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
            <div className="rounded-2xl border border-background-200/70 bg-background-100/60 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <i className="ri-image-2-line text-lg" />
                </span>
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground-950">Logo</h2>
                  <p className="text-sm text-foreground-600">
                    Personaliza el logo del encabezado, el pie y el panel.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-5">
                <TextField
                  label="Texto del logo"
                  value={settings.logoText}
                  onChange={(value) => set("logoText", value)}
                  placeholder="Tejidos Hannah"
                />

                <div>
                  <span className="block text-sm font-semibold text-foreground-800">
                    Ícono del logo
                  </span>
                  <p className="mt-0.5 text-xs text-foreground-400">
                    Se usa cuando no hay una imagen subida.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LOGO_ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        aria-label={icon}
                        onClick={() => set("logoIcon", icon)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-colors ${
                          settings.logoIcon === icon
                            ? "border-primary-400 bg-primary-100 text-primary-700"
                            : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
                        }`}
                      >
                        <i className={icon} />
                      </button>
                    ))}
                  </div>
                </div>

                <ImageUploader
                  label="Imagen del logo (opcional)"
                  value={settings.logoImageUrl}
                  onChange={(value) => set("logoImageUrl", value)}
                  folder="brand"
                  aspect="wide"
                />

                <div className="rounded-2xl border border-background-200/70 bg-background-50 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground-400">
                    Vista previa
                  </span>
                  <div className="mt-3 flex items-center gap-2">
                    {settings.logoImageUrl ? (
                      <img
                        src={settings.logoImageUrl}
                        alt="Vista previa del logo"
                        className="h-9 w-auto max-w-[180px] object-contain"
                      />
                    ) : (
                      <>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-background-50">
                          <i className={`${settings.logoIcon || "ri-goblet-line"} text-lg`} />
                        </span>
                        <span
                          className="text-xl text-foreground-950"
                          style={{ fontFamily: '"Pacifico", serif' }}
                        >
                          {settings.logoText || "Tejidos Hannah"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

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

      <div className="mt-6 max-w-2xl rounded-2xl border border-background-200/70 bg-background-50 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
            <i className="ri-mail-check-line text-lg" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground-950">
              Probar el correo
            </h2>
            <p className="text-sm text-foreground-600">
              Envía un correo de prueba para verificar que la configuración funciona.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextField
              label="Correo de prueba (opcional)"
              value={testTo}
              onChange={setTestTo}
              type="email"
            />
          </div>
          <button
            type="button"
            onClick={runTest}
            disabled={testing}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
              testing
                ? "cursor-wait bg-primary-400 text-background-50"
                : "bg-foreground-900 text-background-50 hover:bg-foreground-800"
            }`}
          >
            {testing ? (
              <>
                <i className="ri-loader-4-line animate-spin text-lg" />
                Probando...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line text-lg" />
                Probar
              </>
            )}
          </button>
        </div>

        {testResult && (
          <p
            className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              testResult.ok
                ? "bg-secondary-100 text-secondary-800"
                : "bg-primary-100 text-primary-800"
            }`}
          >
            <i
              className={`${
                testResult.ok ? "ri-checkbox-circle-line" : "ri-error-warning-line"
              } mt-0.5`}
            />
            <span>{testResult.message}</span>
          </p>
        )}
      </div>
    </div>
  );
}