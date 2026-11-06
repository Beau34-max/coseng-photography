// Client-safe Cloudinary URL helpers — no SDK dependency

const WM_DEFAULTS = {
  text: "COSENG Photography",
  font: "Dancing_Script",
  size: 80,
  opacity: 40,
  angle: -20,
};

// Cloudinary URL text overlays require spaces encoded as underscores, not %20
function cloudinaryText(str) {
  return str.replace(/\s+/g, "_");
}

// Corner watermark — used in carousel and client previews
// position: south_east | south_west | south | north_east | north_west
export function addWatermark(url, position = "south_east", settings = {}) {
  if (!url || !url.includes("/upload/")) return url;
  const text    = cloudinaryText(settings.text    || WM_DEFAULTS.text);
  const font    = settings.font    || WM_DEFAULTS.font;
  const size    = Math.round((settings.size    || WM_DEFAULTS.size)    * 0.52); // corner is smaller
  const opacity = settings.opacity || WM_DEFAULTS.opacity;
  return url.replace(
    "/upload/",
    `/upload/l_text:${font}_${size}:${text},co_white,o_${opacity},g_${position},x_25,y_22/`
  );
}

// Strong diagonal watermark for public gallery — large, centred, angled
// Deters casual copying even if the image URL is directly saved
export function addPublicWatermark(url, settings = {}) {
  if (!url || !url.includes("/upload/")) return url;
  const text    = cloudinaryText(settings.text    || WM_DEFAULTS.text);
  const font    = settings.font    || WM_DEFAULTS.font;
  const size    = settings.size    ?? WM_DEFAULTS.size;
  const opacity = settings.opacity ?? WM_DEFAULTS.opacity;
  const angle   = settings.angle   ?? WM_DEFAULTS.angle;
  return url.replace(
    "/upload/",
    `/upload/l_text:${font}_${size}:${text},co_white,o_${opacity},g_center,a_${angle}/`
  );
}
