import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const APPS_SCRIPT_URL = Deno.env.get("APPS_SCRIPT_URL") ?? "";
const APPS_SCRIPT_SECRET = Deno.env.get("APPS_SCRIPT_SECRET") ?? "";
const EMAIL_FROM_NAME = Deno.env.get("EMAIL_FROM_NAME") ?? "Tejidos Hannah";

// Auth-only client (used ONLY to verify the caller JWT).
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Privileged client (used ONLY for database reads).
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// CORS: the browser sends a preflight OPTIONS request before the real POST.
// Without these headers the request is blocked and the client surfaces
// "Failed to send a request to the Edge Function".
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCRC(value: unknown): string {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(safe);
}

function formatDate(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" });
}

function paymentLabel(method: string): string {
  if (method === "sinpe") return "SINPE Móvil / Transferencia";
  if (method === "contra_entrega") return "Pago contra entrega";
  if (method === "tarjeta") return "Tarjeta (en línea)";
  return method || "Por coordinar";
}

function wrapHtml(title: string, intro: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background-color:#f4ece4;font-family:Arial,Helvetica,sans-serif;color:#3b2f28;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4ece4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background-color:#9a5b3f;padding:28px 32px;">
              <span style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">Tejidos Hannah</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:22px;color:#3b2f28;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#6b5a4e;">${intro}</p>
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#f4ece4;font-size:12px;color:#8a7767;">
              Hecho a mano, con cariño, en Costa Rica. Gracias por apoyar lo artesanal.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendViaAppsScript(to: { email: string; name: string }, subject: string, htmlContent: string) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: APPS_SCRIPT_SECRET,
      to: to.email,
      name: to.name,
      subject,
      html: htmlContent,
      fromName: EMAIL_FROM_NAME,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`apps_script_failed: ${response.status} ${text}`);
  }
  let parsed: { ok?: boolean; error?: string } | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  if (!parsed) {
    throw new Error(
      `apps_script_invalid_response: revisa que la implementación tenga acceso "Cualquier persona". Respuesta: ${text.slice(0, 200)}`,
    );
  }
  if (parsed.ok === false) {
    throw new Error(`apps_script_error: ${parsed.error ?? "unknown"}`);
  }
}

// Resolves the business notification address: explicit secret wins, then the
// store contact email saved in site_settings.
async function resolveBusinessEmail(): Promise<string> {
  const envTo = Deno.env.get("EMAIL_BUSINESS_TO");
  if (envTo && envTo.trim()) return envTo.trim();
  try {
    const { data } = await adminClient
      .from("site_settings")
      .select("value")
      .eq("key", "general")
      .maybeSingle();
    const email = (data?.value as { email?: string } | null)?.email ?? "";
    return String(email).trim();
  } catch {
    return "";
  }
}

async function buildOrderEmail(orderId: string, businessEmail: string) {
  const { data: order } = await adminClient
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const { data: items } = await adminClient
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const rows = (items ?? [])
    .map((item) => {
      const record = item as Record<string, unknown>;
      const quantity = Number(record.quantity ?? 1);
      const price = Number(record.price ?? 0);
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#3b2f28;">${escapeHtml(record.name)} <span style="color:#8a7767;">x${quantity}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#3b2f28;text-align:right;">${formatCRC(price * quantity)}</td>
      </tr>`;
    })
    .join("");

  const orderNumber = escapeHtml(order.order_number);
  const isPickup = String(order.shipping_address ?? "").toLowerCase().includes("retiro");

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr><td style="padding:4px 0;font-size:14px;color:#6b5a4e;">Subtotal</td><td style="padding:4px 0;font-size:14px;color:#3b2f28;text-align:right;">${formatCRC(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#6b5a4e;">Envío (${escapeHtml(order.shipping_region)})</td><td style="padding:4px 0;font-size:14px;color:#3b2f28;text-align:right;">${Number(order.shipping_cost) > 0 ? formatCRC(order.shipping_cost) : "Gratis"}</td></tr>
      <tr><td style="padding:8px 0;font-size:16px;font-weight:bold;color:#3b2f28;border-top:1px solid #ddd;">Total</td><td style="padding:8px 0;font-size:16px;font-weight:bold;color:#9a5b3f;text-align:right;border-top:1px solid #ddd;">${formatCRC(order.total)}</td></tr>
    </table>
    <div style="margin-top:24px;padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Número de pedido:</strong> ${orderNumber}</p>
      <p style="margin:0 0 6px;"><strong>Estado:</strong> ${escapeHtml(order.status)}</p>
      <p style="margin:0 0 6px;"><strong>Entrega:</strong> ${escapeHtml(order.shipping_region)}</p>
      <p style="margin:0 0 6px;"><strong>${isPickup ? "Retiro" : "Dirección"}:</strong> ${escapeHtml(order.shipping_address)}</p>
      <p style="margin:0;"><strong>Método de pago:</strong> ${escapeHtml(paymentLabel(String(order.payment_method)))}
      ${String(order.payment_status) === "paid" ? " (pagado)" : " (pendiente de coordinar)"}</p>
    </div>
    <p style="margin:24px 0 0;font-size:14px;color:#6b5a4e;">Te contactaremos para coordinar el pago y la entrega. Si tienes alguna duda, responde a este correo.</p>
  `;

  const businessContent = `
    <div style="margin-top:16px;padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Cliente:</strong> ${escapeHtml(order.customer_name)}</p>
      <p style="margin:0 0 6px;"><strong>Correo:</strong> ${escapeHtml(order.email)}</p>
      <p style="margin:0 0 6px;"><strong>Teléfono:</strong> ${escapeHtml(order.phone)}</p>
      <p style="margin:0 0 6px;"><strong>Entrega:</strong> ${escapeHtml(order.shipping_region)} — ${escapeHtml(order.shipping_address)}</p>
      <p style="margin:0 0 6px;"><strong>Método de pago:</strong> ${escapeHtml(paymentLabel(String(order.payment_method)))}</p>
      <p style="margin:0;"><strong>Total:</strong> ${formatCRC(order.total)}</p>
    </div>
    <p style="margin:16px 0 0;font-size:14px;color:#6b5a4e;">Responde a <strong>${escapeHtml(order.email)}</strong> o escríbele al <strong>${escapeHtml(order.phone)}</strong> para coordinar.</p>
  `;

  return {
    to: { email: String(order.email ?? ""), name: String(order.customer_name ?? "") },
    subject: `Tu pedido ${order.order_number} fue recibido — Tejidos Hannah`,
    html: wrapHtml(
      "¡Recibimos tu pedido!",
      `Gracias por tu compra, ${escapeHtml(order.customer_name)}. Aquí está el detalle:`,
      content,
    ),
    business: businessEmail
      ? {
          to: { email: businessEmail, name: EMAIL_FROM_NAME },
          subject: `Nuevo pedido ${order.order_number} — ${order.customer_name}`,
          html: wrapHtml(
            "Nuevo pedido recibido",
            "Entró un pedido nuevo en la tienda. Aquí están los datos para coordinar:",
            content + businessContent,
          ),
        }
      : null,
    userId: order.user_id ? String(order.user_id) : null,
  };
}

async function buildEnrollmentEmail(enrollmentId: string, businessEmail: string) {
  const { data: enrollment } = await adminClient
    .from("enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (!enrollment) return null;

  let courseTitle = "";
  if (enrollment.course_id) {
    const { data: course } = await adminClient
      .from("courses")
      .select("title")
      .eq("id", enrollment.course_id)
      .maybeSingle();
    courseTitle = String((course as { title?: string } | null)?.title ?? "");
  }

  let sessionLabel = "";
  if (enrollment.session_id) {
    const { data: session } = await adminClient
      .from("course_sessions")
      .select("label, start_at")
      .eq("id", enrollment.session_id)
      .maybeSingle();
    const record = session as { label?: string; start_at?: string } | null;
    sessionLabel = [record?.label, formatDate(record?.start_at)].filter(Boolean).join(" · ");
  }

  const content = `
    <div style="margin-top:16px;padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Curso:</strong> ${escapeHtml(courseTitle || "Curso")}</p>
      ${sessionLabel ? `<p style="margin:0 0 6px;"><strong>Horario:</strong> ${escapeHtml(sessionLabel)}</p>` : ""}
      <p style="margin:0 0 6px;"><strong>Estado:</strong> ${escapeHtml(enrollment.status)}</p>
      <p style="margin:0;"><strong>Pago:</strong> ${String(enrollment.payment_status) === "paid" ? "Pagado" : "Pendiente de coordinar"}</p>
    </div>
    <p style="margin:24px 0 0;font-size:14px;color:#6b5a4e;">Te contactaremos para confirmar tu cupo y los detalles de pago. Si tienes alguna duda, responde a este correo.</p>
  `;

  const businessContent = `
    <div style="margin-top:16px;padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Estudiante:</strong> ${escapeHtml(enrollment.student_name)}</p>
      <p style="margin:0 0 6px;"><strong>Correo:</strong> ${escapeHtml(enrollment.email)}</p>
      <p style="margin:0 0 6px;"><strong>Teléfono:</strong> ${escapeHtml(enrollment.phone)}</p>
      <p style="margin:0 0 6px;"><strong>Curso:</strong> ${escapeHtml(courseTitle || "Curso")}</p>
      ${sessionLabel ? `<p style="margin:0 0 6px;"><strong>Horario:</strong> ${escapeHtml(sessionLabel)}</p>` : ""}
      <p style="margin:0;"><strong>Pago:</strong> ${String(enrollment.payment_status) === "paid" ? "Pagado" : "Pendiente de coordinar"}</p>
    </div>
    <p style="margin:16px 0 0;font-size:14px;color:#6b5a4e;">Responde a <strong>${escapeHtml(enrollment.email)}</strong> o escríbele al <strong>${escapeHtml(enrollment.phone)}</strong> para confirmar el cupo.</p>
  `;

  return {
    to: { email: String(enrollment.email ?? ""), name: String(enrollment.student_name ?? "") },
    subject: `Tu matrícula en ${courseTitle || "el curso"} fue recibida — Tejidos Hannah`,
    html: wrapHtml(
      "¡Recibimos tu matrícula!",
      `Gracias por inscribirte, ${escapeHtml(enrollment.student_name)}. Aquí está el detalle:`,
      content,
    ),
    business: businessEmail
      ? {
          to: { email: businessEmail, name: EMAIL_FROM_NAME },
          subject: `Nueva matrícula: ${courseTitle || "Curso"} — ${enrollment.student_name}`,
          html: wrapHtml(
            "Nueva matrícula recibida",
            "Se inscribió una persona nueva en un curso. Aquí están los datos:",
            content + businessContent,
          ),
        }
      : null,
    userId: enrollment.user_id ? String(enrollment.user_id) : null,
  };
}

const CUSTOM_PIECE_LABELS: Record<string, string> = {
  manta: "Manta o colcha",
  amigurumi: "Amigurumi",
  bolso: "Bolso o cartera",
  bebe: "Ropa de bebé",
  decoracion: "Decoración",
  otro: "Otra idea",
};

async function buildCustomOrderEmail(orderId: string, businessEmail: string) {
  const { data: order } = await adminClient
    .from("custom_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const record = order as Record<string, unknown>;
  const images = Array.isArray(record.reference_images)
    ? (record.reference_images as unknown[]).filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const piece =
    CUSTOM_PIECE_LABELS[String(record.piece_type ?? "")] ?? "Pieza personalizada";
  const budget =
    record.budget == null || String(record.budget) === "" ? "" : formatCRC(record.budget);
  const neededBy = formatDate(record.needed_by);
  const description = escapeHtml(record.description).replace(/\n/g, "<br />");
  const customerName = String(record.customer_name ?? "");

  const summary = `
    <div style="margin-top:16px;padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Tipo de pieza:</strong> ${escapeHtml(piece)}</p>
      <p style="margin:0 0 6px;"><strong>Cantidad:</strong> ${escapeHtml(record.quantity ?? 1)}</p>
      ${record.colors ? `<p style="margin:0 0 6px;"><strong>Colores:</strong> ${escapeHtml(record.colors)}</p>` : ""}
      ${record.size ? `<p style="margin:0 0 6px;"><strong>Medidas:</strong> ${escapeHtml(record.size)}</p>` : ""}
      ${neededBy ? `<p style="margin:0 0 6px;"><strong>Para cuándo:</strong> ${escapeHtml(neededBy)}</p>` : ""}
      ${budget ? `<p style="margin:0;"><strong>Presupuesto:</strong> ${escapeHtml(budget)}</p>` : ""}
    </div>
    <div style="margin-top:16px;">
      <p style="margin:0 0 6px;font-size:14px;color:#6b5a4e;"><strong>Su idea:</strong></p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#3b2f28;">${description}</p>
    </div>
    ${images.length > 0 ? `<p style="margin:16px 0 0;font-size:13px;color:#8a7767;">Adjuntó ${images.length} imagen(es) de referencia.</p>` : ""}
  `;

  const businessContent = `
    <div style="margin-top:16px;padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Cliente:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin:0 0 6px;"><strong>Correo:</strong> ${escapeHtml(record.email)}</p>
      <p style="margin:0;"><strong>Teléfono / WhatsApp:</strong> ${escapeHtml(record.phone)}</p>
    </div>
    ${images.length > 0 ? `<p style="margin:16px 0 0;font-size:14px;color:#3b2f28;"><strong>Referencias:</strong></p>${images.map((url) => `<p style="margin:4px 0;font-size:13px;"><a href="${escapeHtml(url)}" style="color:#9a5b3f;">${escapeHtml(url)}</a></p>`).join("")}` : ""}
    <p style="margin:16px 0 0;font-size:14px;color:#6b5a4e;">Responde a <strong>${escapeHtml(record.email)}</strong> o escríbele al <strong>${escapeHtml(record.phone)}</strong> para cotizar.</p>
  `;

  return {
    to: { email: String(record.email ?? ""), name: customerName },
    subject: "Recibimos tu solicitud de pedido personalizado — Tejidos Hannah",
    html: wrapHtml(
      "¡Recibimos tu idea!",
      `Gracias ${escapeHtml(customerName)}. Estamos revisando cada detalle y te escribimos con la cotización en 1 o 2 días hábiles.`,
      summary,
    ),
    business: businessEmail
      ? {
          to: { email: businessEmail, name: EMAIL_FROM_NAME },
          subject: `Nueva solicitud personalizada: ${piece} — ${customerName}`,
          html: wrapHtml(
            "Nueva solicitud de pedido personalizado",
            "Entró una solicitud nueva al taller. Revisa los detalles y prepárala con calma:",
            summary + businessContent,
          ),
        }
      : null,
    userId: record.user_id ? String(record.user_id) : null,
  };
}

function resolveSiteUrl(raw: unknown): string {
  const value = String(raw ?? "").trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(value)) return value;
  const env = (Deno.env.get("SITE_URL") ?? "").trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(env)) return env;
  return "";
}

/** Correo con la cotización y un botón para aceptarla en un clic. */
async function buildCustomOrderQuotedEmail(orderId: string, siteUrl: string) {
  const { data: order } = await adminClient
    .from("custom_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const record = order as Record<string, unknown>;
  if (record.quote_amount == null) return null;

  const piece =
    CUSTOM_PIECE_LABELS[String(record.piece_type ?? "")] ?? "Pieza personalizada";
  const customerName = String(record.customer_name ?? "");
  const token = record.accept_token ? String(record.accept_token) : "";
  const link = siteUrl && token ? `${siteUrl}/cotizacion/${token}` : "";
  const neededBy = formatDate(record.needed_by);

  const content = `
    <p style="margin:0 0 6px;font-size:13px;color:#8a7767;">Monto cotizado</p>
    <p style="margin:0 0 20px;font-size:30px;font-weight:bold;color:#9a5b3f;">${formatCRC(record.quote_amount)}</p>
    <div style="padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Pieza:</strong> ${escapeHtml(piece)}</p>
      <p style="margin:0 0 6px;"><strong>Cantidad:</strong> ${escapeHtml(record.quantity ?? 1)}</p>
      ${record.colors ? `<p style="margin:0 0 6px;"><strong>Colores:</strong> ${escapeHtml(record.colors)}</p>` : ""}
      ${record.size ? `<p style="margin:0 0 6px;"><strong>Medidas:</strong> ${escapeHtml(record.size)}</p>` : ""}
      ${neededBy ? `<p style="margin:0;"><strong>Para cuándo:</strong> ${escapeHtml(neededBy)}</p>` : ""}
    </div>
    ${
      link
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 0;"><tr><td style="border-radius:999px;background-color:#9a5b3f;"><a href="${link}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">Aceptar cotización</a></td></tr></table>
          <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#8a7767;">Si el botón no abre, copia este enlace en tu navegador:<br /><a href="${link}" style="color:#9a5b3f;word-break:break-all;">${link}</a></p>`
        : ""
    }
    <p style="margin:24px 0 0;font-size:14px;color:#6b5a4e;">Si quieres ajustar colores, medidas o tiempos, respóndenos a este correo y lo revisamos con gusto.</p>
  `;

  return {
    to: { email: String(record.email ?? ""), name: customerName },
    subject: `Tu cotización está lista: ${piece} — Tejidos Hannah`,
    html: wrapHtml(
      "¡Tu cotización está lista!",
      `Hola ${escapeHtml(customerName)}, revisamos tu idea con calma y preparamos esta propuesta para ti.`,
      content,
    ),
    business: null,
    userId: record.user_id ? String(record.user_id) : null,
  };
}

async function buildCustomOrderAcceptedEmail(orderId: string, businessEmail: string) {
  const { data: order } = await adminClient
    .from("custom_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const record = order as Record<string, unknown>;
  const piece =
    CUSTOM_PIECE_LABELS[String(record.piece_type ?? "")] ?? "Pieza personalizada";
  const customerName = String(record.customer_name ?? "");
  const neededBy = formatDate(record.needed_by);

  const content = `
    <div style="margin-top:16px;padding:16px;background-color:#f9f4ef;border-radius:12px;font-size:14px;line-height:1.7;color:#3b2f28;">
      <p style="margin:0 0 6px;"><strong>Cliente:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin:0 0 6px;"><strong>Correo:</strong> ${escapeHtml(record.email)}</p>
      <p style="margin:0 0 6px;"><strong>Teléfono / WhatsApp:</strong> ${escapeHtml(record.phone)}</p>
      <p style="margin:0 0 6px;"><strong>Pieza:</strong> ${escapeHtml(piece)}</p>
      <p style="margin:0 0 6px;"><strong>Cantidad:</strong> ${escapeHtml(record.quantity ?? 1)}</p>
      ${record.colors ? `<p style="margin:0 0 6px;"><strong>Colores:</strong> ${escapeHtml(record.colors)}</p>` : ""}
      ${record.size ? `<p style="margin:0 0 6px;"><strong>Medidas:</strong> ${escapeHtml(record.size)}</p>` : ""}
      ${neededBy ? `<p style="margin:0 0 6px;"><strong>Para cuándo:</strong> ${escapeHtml(neededBy)}</p>` : ""}
      <p style="margin:0;"><strong>Monto cotizado:</strong> ${formatCRC(record.quote_amount)}</p>
    </div>
    <p style="margin:16px 0 0;font-size:14px;color:#6b5a4e;">La clienta aceptó la cotización. Escríbele a <strong>${escapeHtml(record.email)}</strong> o al <strong>${escapeHtml(record.phone)}</strong> para coordinar el pago y el inicio de la pieza.</p>
  `;

  return {
    to: { email: businessEmail, name: EMAIL_FROM_NAME },
    subject: `Cotización aceptada: ${piece} — ${customerName}`,
    html: wrapHtml(
      "¡Tu clienta aceptó la cotización!",
      "Ya puedes coordinar el pago y comenzar a tejer la pieza.",
      content,
    ),
    business: null,
    userId: record.user_id ? String(record.user_id) : null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  let payload: {
    type?: string;
    id?: string;
    to?: string;
    token?: string;
    siteUrl?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const type = payload?.type;
  let id = payload?.id;
  const linkToken = typeof payload?.token === "string" ? payload.token.trim() : "";

  // Aceptación desde el enlace del correo: no hay sesión iniciada, así que el
  // token único de la solicitud es lo que identifica al pedido.
  if (type === "custom_order_accepted" && (!id || !UUID_RE.test(id))) {
    if (UUID_RE.test(linkToken)) {
      const { data: byToken } = await adminClient
        .from("custom_orders")
        .select("id")
        .eq("accept_token", linkToken)
        .maybeSingle();
      id = byToken?.id ? String(byToken.id) : "";
    }
  }

  // Verify the caller JWT (optional: guests have no user, which is allowed).
  let callerId: string | null = null;
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (token) {
    try {
      const { data } = await authClient.auth.getUser(token);
      callerId = data?.user?.id ?? null;
    } catch {
      callerId = null;
    }
  }

  // Diagnostic mode: admins can send a test email and see the raw result.
  if (type === "test") {
    if (!callerId) return json({ error: "unauthorized" }, 401);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .maybeSingle();
    if ((profile as { role?: string } | null)?.role !== "admin") {
      return json({ error: "forbidden" }, 403);
    }
    if (!APPS_SCRIPT_URL) {
      return json({ error: "email_not_configured", detail: "Falta el secreto APPS_SCRIPT_URL en Supabase." }, 500);
    }
    if (!APPS_SCRIPT_SECRET) {
      return json({ error: "email_not_configured", detail: "Falta el secreto APPS_SCRIPT_SECRET en Supabase." }, 500);
    }
    const testTo = (payload?.to ?? "").trim() || (await resolveBusinessEmail());
    if (!testTo) {
      return json({ error: "no_recipient", detail: "No hay correo destino. Guarda tu correo en Configuración o agrega EMAIL_BUSINESS_TO." }, 422);
    }
    try {
      await sendViaAppsScript(
        { email: testTo, name: EMAIL_FROM_NAME },
        "Prueba de correo — Tejidos Hannah",
        wrapHtml(
          "Correo de prueba",
          "Si estás leyendo esto, el puente de correo con Google funciona perfecto.",
          `<p style="margin:0;font-size:14px;color:#3b2f28;">Enviado a: ${escapeHtml(testTo)}</p>`,
        ),
      );
      return json({ ok: true, sentTo: testTo });
    } catch (error) {
      return json({ error: "send_failed", detail: String(error) }, 502);
    }
  }

  // Solo el taller puede enviar la cotización a una clienta.
  if (type === "custom_order_quoted") {
    if (!callerId) return json({ error: "unauthorized" }, 401);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .maybeSingle();
    if ((profile as { role?: string } | null)?.role !== "admin") {
      return json({ error: "forbidden" }, 403);
    }
  }

  if (
    (type !== "order" &&
      type !== "enrollment" &&
      type !== "custom_order" &&
      type !== "custom_order_quoted" &&
      type !== "custom_order_accepted") ||
    !id ||
    !UUID_RE.test(id)
  ) {
    return json({ error: "invalid_params" }, 400);
  }

  if (!APPS_SCRIPT_URL) {
    return json({ error: "email_not_configured" }, 500);
  }

  try {
    const businessEmail = await resolveBusinessEmail();
    const built = type === "order"
      ? await buildOrderEmail(id, businessEmail)
      : type === "enrollment"
      ? await buildEnrollmentEmail(id, businessEmail)
      : type === "custom_order_quoted"
      ? await buildCustomOrderQuotedEmail(id, resolveSiteUrl(payload?.siteUrl))
      : type === "custom_order_accepted"
      ? await buildCustomOrderAcceptedEmail(id, businessEmail)
      : await buildCustomOrderEmail(id, businessEmail);

    if (!built) return json({ error: "not_found" }, 404);

    // Ownership guard: never let a caller trigger an email for another user's record.
    // La cotización la dispara el taller y la aceptación puede llegar desde el
    // enlace del correo, así que solo esas dos se validan distinto.
    if (type !== "custom_order_quoted" && built.userId && built.userId !== callerId) {
      let tokenOk = false;
      if (type === "custom_order_accepted" && UUID_RE.test(linkToken)) {
        const { data: row } = await adminClient
          .from("custom_orders")
          .select("accept_token")
          .eq("id", id)
          .maybeSingle();
        tokenOk =
          Boolean((row as { accept_token?: string } | null)?.accept_token) &&
          String((row as { accept_token?: string } | null)?.accept_token) === linkToken;
      }
      if (!tokenOk) return json({ error: "forbidden" }, 403);
    }
    if (!built.to.email) {
      return json({ error: "no_recipient" }, 422);
    }

    await sendViaAppsScript(built.to, built.subject, built.html);

    // Best-effort copy to the business inbox; never blocks the customer email.
    if (built.business && built.business.to.email) {
      try {
        await sendViaAppsScript(
          built.business.to,
          built.business.subject,
          built.business.html,
        );
      } catch {
        // Ignore business copy failures.
      }
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: "send_failed", detail: String(error) }, 502);
  }
});
