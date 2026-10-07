import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { defaultHomeContent } from "@/lib/catalog";
import {
  AdminHeader,
  ErrorBanner,
  LoadingRows,
  TextField,
  TextArea,
  PrimaryButton,
} from "@/pages/admin/components/ui";

interface HomeSettings {
  verse: { text: string; reference: string };
  hero: { eyebrow: string; title: string; subtitle: string };
}

export default function AdminContenidoPage() {
  const [settings, setSettings] = useState<HomeSettings>({
    verse: defaultHomeContent.verse,
    hero: defaultHomeContent.hero,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase.from("site_settings").select("key, value");
      if (dbError) throw dbError;
      const map = new Map<string, unknown>();
      (data ?? []).forEach((row) => {
        const record = row as { key: string; value: unknown };
        map.set(record.key, record.value);
      });
      setSettings({
        verse: (map.get("bible_verse") as HomeSettings["verse"]) ?? defaultHomeContent.verse,
        hero: (map.get("hero") as HomeSettings["hero"]) ?? defaultHomeContent.hero,
      });
    } catch {
      setError("No pudimos cargar el contenido. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const { error: dbError } = await supabase.from("site_settings").upsert(
        [
          { key: "bible_verse", value: settings.verse, updated_at: new Date().toISOString() },
          { key: "hero", value: settings.hero, updated_at: new Date().toISOString() },
        ],
        { onConflict: "key" }
      );
      if (dbError) throw dbError;
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("No pudimos guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Contenido del sitio"
        description="Edita el versículo bíblico y los textos principales de la página de inicio."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingRows />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-background-200/70 bg-background-50 p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
              <i className="ri-book-open-line text-secondary-600" />
              Versículo bíblico
            </h2>
            <div className="mt-4 space-y-4">
              <TextArea
                label="Texto del versículo"
                value={settings.verse.text}
                onChange={(value) => setSettings((prev) => ({ ...prev, verse: { ...prev.verse, text: value } }))}
                rows={3}
              />
              <TextField
                label="Referencia"
                value={settings.verse.reference}
                onChange={(value) => setSettings((prev) => ({ ...prev, verse: { ...prev.verse, reference: value } }))}
                placeholder="Ej. Filipenses 4:13"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-background-200/70 bg-background-50 p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground-950">
              <i className="ri-home-smile-line text-primary-600" />
              Portada (hero)
            </h2>
            <div className="mt-4 space-y-4">
              <TextField
                label="Texto pequeño superior"
                value={settings.hero.eyebrow}
                onChange={(value) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, eyebrow: value } }))}
                placeholder="Hecho a mano en Costa Rica"
              />
              <TextField
                label="Título principal"
                value={settings.hero.title}
                onChange={(value) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, title: value } }))}
                placeholder="Tejidos que abrazan tu hogar"
              />
              <TextArea
                label="Subtítulo"
                value={settings.hero.subtitle}
                onChange={(value) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, subtitle: value } }))}
                rows={3}
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-wrap items-center justify-end gap-3">
            {saved && (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-800">
                <i className="ri-checkbox-circle-fill" />
                Cambios guardados
              </span>
            )}
            <PrimaryButton onClick={save} loading={saving} icon="ri-save-line">
              Guardar contenido
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}