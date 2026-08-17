// Client-safe Cloudinary URL helpers — no SDK dependency

// Corner watermark — used in carousel and client previews
// position: south_east | south_west | south | north_east | north_west
export function addWatermark(url, position = "south_east") {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/l_text:Allura_42:COSENG%20Photography,co_white,o_75,g_${position},x_25,y_22/`
  );
}

// Strong diagonal watermark for public gallery — large, centred, angled
// Deters casual copying even if the image URL is directly saved
export function addPublicWatermark(url) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/l_text:Allura_80:COSENG%20Photography,co_white,o_40,g_center,a_-20/`
  );
}
