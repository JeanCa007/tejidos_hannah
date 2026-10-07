import { supabase } from "@/lib/supabase";

export type NotificationEmailType = "order" | "enrollment";

/**
 * Sends a transactional notification email from the backend (Google Apps Script bridge).
 * Best-effort: never throws, so it cannot break the purchase/enrollment flow.
 */
export async function sendNotificationEmail(
  type: NotificationEmailType,
  id: string
): Promise<void> {
  if (!id) return;
  try {
    await supabase.functions.invoke("send-email", { body: { type, id } });
  } catch {
    // Emails are a nice-to-have; the record is already saved.
  }
}

export interface TestEmailResult {
  ok: boolean;
  message: string;
}

/**
 * Sends a diagnostic test email and returns a human-readable result.
 * Used from the admin panel to verify the Google Apps Script bridge.
 */
export async function sendTestEmail(to?: string): Promise<TestEmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: { type: "test", to: to ?? "" },
    });

    if (error) {
      let detail = error.message ?? "La función no respondió.";
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        try {
          const body = (await ctx.json()) as { error?: string; detail?: string };
          detail = [body?.error, body?.detail].filter(Boolean).join(" — ") || detail;
        } catch {
          // Keep the default message.
        }
      }
      return { ok: false, message: detail };
    }

    const result = (data ?? {}) as {
      ok?: boolean;
      sentTo?: string;
      error?: string;
      detail?: string;
    };
    if (result.ok) {
      return { ok: true, message: `Correo de prueba enviado a ${result.sentTo}.` };
    }
    return {
      ok: false,
      message: [result.error, result.detail].filter(Boolean).join(" — ") || "Error desconocido.",
    };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
}