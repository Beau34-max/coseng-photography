// Client-safe Cloudinary URL helpers — no SDK dependency

export function addWatermark(url) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    "/upload/l_text:arial_28:cosengphotography,co_white,o_60,g_south_east,x_20,y_20/"
  );
}
