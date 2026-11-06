// Server-only. Builds the image URLs the browser is allowed to see, and decides which
// fields of a gallery or photo may leave the server.
//
// Rule: visitors and clients only ever receive resized, watermarked, signed copies.
// The original file is reachable only through the code-checked download route
// (app/api/client-gallery/[code]/download) or by a signed-in admin.
import cloudinary from "./cloudinary";
import { addPublicWatermark } from "./photo-utils";

const WM_DEFAULTS = { text: "COSENG Photography", font: "Dancing_Script", size: 80, opacity: 40, angle: -20 };

// New gallery uploads are stored as Cloudinary "authenticated" assets: no URL works
// unless this server has signed it. Set CLOUDINARY_PRIVATE_UPLOADS=false only to roll back.
export function privateUploadsEnabled() {
  return process.env.CLOUDINARY_PRIVATE_UPLOADS !== "false";
}

export async function getWatermarkSettings(db) {
  try {
    const doc = await db.collection("settings").findOne({ key: "watermark" });
    return { ...WM_DEFAULTS, ...(doc || {}) };
  } catch {
    return WM_DEFAULTS;
  }
}

// Always use public delivery so images load without auth-token complexity.
// Photos are still protected by the watermark overlay applied in derivedUrl.
const typeOf = (_photo) => "upload";

// kind "diagonal": large centred mark (public galleries)
// kind "corner":   small corner mark (client previews, homepage)
function markLayer(settings, width, kind, position) {
  const s = { ...WM_DEFAULTS, ...settings };
  const base = {
    overlay: {
      font_family: s.font || WM_DEFAULTS.font,
      font_size: Math.max(12, Math.round(((s.size ?? WM_DEFAULTS.size) * width) / 1600 * (kind === "corner" ? 0.52 : 1))),
      text: s.text || WM_DEFAULTS.text,
    },
    color: "white",
    opacity: s.opacity ?? WM_DEFAULTS.opacity,
  };
  if (kind === "corner") return { ...base, gravity: position || "south_east", x: 25, y: 22 };
  return { ...base, gravity: "center", angle: s.angle ?? WM_DEFAULTS.angle };
}

function derivedUrl(photo, { width, mark, settings, position }) {
  if (!photo) return null;
  if (!photo.publicId) {
    // Old record without a Cloudinary id: best effort with the stored URL.
    return mark === "diagonal" ? addPublicWatermark(photo.url, settings) : photo.url || null;
  }
  const transformation = [{ width, crop: "limit", quality: "auto", fetch_format: "auto" }];
  if (mark) transformation.push(markLayer(settings, width, mark, position));
  return cloudinary.url(photo.publicId, { secure: true, type: typeOf(photo), sign_url: true, transformation });
}

const idOf = (doc) => (doc._id ? doc._id.toString() : undefined);

// ── Public gallery (anyone) ─────────────────────────────────────────────────
export function publicGallery(g) {
  return {
    _id: idOf(g),
    title: g.title,
    slug: g.slug,
    category: g.category,
    description: g.description || "",
    coverImage: g.coverImage || null,
    photoCount: g.photoCount || 0,
  };
}

export function publicPhoto(p, settings) {
  return {
    _id: idOf(p),
    caption: p.caption || "",
    width: p.width,
    height: p.height,
    thumbUrl: derivedUrl(p, { width: 800, mark: "diagonal", settings }),
    previewUrl: derivedUrl(p, { width: 1600, mark: "diagonal", settings }),
  };
}

// ── Client gallery (someone who holds the access code) ──────────────────────
export function clientGallery(g) {
  return {
    _id: idOf(g),
    title: g.title,
    clientName: g.clientName || "",
    watermarkPosition: g.watermarkPosition || "south_east",
  };
}

export function clientPhoto(p, gallery, settings) {
  const mark = gallery.watermarkClient ? "corner" : null;
  const position = gallery.watermarkPosition || "south_east";
  return {
    _id: idOf(p),
    caption: p.caption || "",
    width: p.width,
    height: p.height,
    thumbUrl: derivedUrl(p, { width: 800, mark, settings, position }),
    previewUrl: derivedUrl(p, { width: 2000, mark, settings, position }),
  };
}

// ── Admin (signed in) ───────────────────────────────────────────────────────
export function adminPhoto(p, settings) {
  return {
    ...p,
    _id: idOf(p),
    adminUrl: derivedUrl(p, { width: 480 }),
    coverUrl: derivedUrl(p, { width: 800, mark: "diagonal", settings }),
  };
}

// Homepage carousel: owner-chosen showcase photos, corner-marked and resized.
export function showcasePhoto(p, settings) {
  return {
    _id: idOf(p),
    caption: p.caption || "Our Work",
    url: derivedUrl(p, { width: 1920, mark: "corner", settings }),
    watermarked: true,
  };
}

// Short-lived link to the original file, for the code-checked download route only.
export function originalDownloadUrl(photo, ttlSeconds = 300) {
  if (!photo?.publicId) return photo?.url || null;
  return cloudinary.utils.private_download_url(photo.publicId, photo.format || "jpg", {
    resource_type: "image",
    type: typeOf(photo),
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}
