// Client-safe Cloudinary URL helpers — no SDK dependency

// position: south_east | south_west | south | north_east | north_west
export function addWatermark(url, position = "south_east") {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/l_text:arial_30_bold:COSENG_Photography,co_white,o_65,g_${position},x_20,y_20/`
  );
}
