// Client-safe Cloudinary URL helpers — no SDK dependency

// position: south_east | south_west | south | north_east | north_west
export function addWatermark(url, position = "south_east") {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/l_text:Allura_42:COSENG%20Photography,co_white,o_75,g_${position},x_25,y_22/`
  );
}
