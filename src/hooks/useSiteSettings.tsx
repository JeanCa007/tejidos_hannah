import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export interface SiteGeneralSettings {
  storeName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  logoText: string;
  logoIcon: string;
  logoImageUrl: string;
}

export const defaultGeneralSettings: SiteGeneralSettings = {
  storeName: "Tejidos Hannah",
  email: "hola@tejidoshannah.com",
  phone: "+506 8888 8888",
  whatsapp: "+506 8888 8888",
  address: "San José, Costa Rica",
  instagram: "https://instagram.com/tejidoshannah",
  facebook: "https://facebook.com/tejidoshannah",
  logoText: "Tejidos Hannah",
  logoIcon: "ri-goblet-line",
  logoImageUrl: "",
};

interface SiteSettingsContextValue {
  settings: SiteGeneralSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: defaultGeneralSettings,
  loading: false,
  refresh: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteGeneralSettings>(defaultGeneralSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "general")
        .maybeSingle();
      if (error) throw error;
      if (data?.value) {
        setSettings({
          ...defaultGeneralSettings,
          ...(data.value as Partial<SiteGeneralSettings>),
        });
      }
    } catch {
      // Keep sensible defaults so the site always renders a logo.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}