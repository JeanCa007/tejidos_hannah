import { supabase } from "@/lib/supabase";

export const MEDIA_BUCKET = "media";

function sanitizeName(name: string, defaultExt = "jpg"): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : defaultExt;
  const cleanBase =
    base
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "archivo";
  const cleanExt = ext.replace(/[^a-z0-9]/g, "") || defaultExt;
  return `${cleanBase}-${Date.now()}.${cleanExt}`;
}

function sanitizeFolder(folder: string, fallback = "general"): string {
  return (
    folder
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

/**
 * Uploads an image to the public "media" storage bucket and returns its
 * public URL. Folder must be a lowercase slug like "productos" or "cursos".
 */
export async function uploadImage(file: File, folder = "general"): Promise<string> {
  const path = `${sanitizeFolder(folder)}/${sanitizeName(file.name, "jpg")}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads a document (PDF) to the public "media" storage bucket and returns
 * its public URL.
 */
export async function uploadDocument(file: File, folder = "patrones"): Promise<string> {
  const path = `${sanitizeFolder(folder, "documentos")}/${sanitizeName(file.name, "pdf")}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/pdf",
  });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}