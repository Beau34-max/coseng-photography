// Single source of truth for bookable packages. Prices are always read here, on the
// server. Never trust a price (or a "paid" flag) that arrives from the browser.
import { connectToDb } from "./mongodb";

export const DEFAULT_PACKAGES = [
  { id: "portrait", name: "Portrait Session", duration: "1 hour", price: 150, description: "Individual or family portrait session", includes: ["1 hour shoot", "20 edited photos", "Online gallery"] },
  { id: "event", name: "Event Coverage", duration: "4 hours", price: 450, description: "Events, parties and celebrations", includes: ["4 hours coverage", "100+ edited photos", "Online gallery", "USB delivery"] },
  { id: "wedding", name: "Wedding Package", duration: "Full day", price: 1200, description: "Full-day wedding photography", includes: ["Full day coverage", "500+ edited photos", "Private gallery", "USB + prints"] },
  { id: "commercial", name: "Commercial Shoot", duration: "2 hours", price: 350, description: "Product or business photography", includes: ["2 hour shoot", "50 edited photos", "Commercial licence"] },
  { id: "charity", name: "Charity & Community", duration: "4 hours", price: 400, description: "Supporting charities and community groups. Extra £100/hr thereafter.", includes: ["4 hours coverage", "50+ edited photos", "Online gallery", "Community rates"] },
];

export async function getPackages() {
  try {
    const db = await connectToDb();
    const settings = await db.collection("settings").findOne({ key: "site" });
    return settings?.packages?.length > 0 ? settings.packages : DEFAULT_PACKAGES;
  } catch {
    return DEFAULT_PACKAGES;
  }
}

// Match by id first, then by exact name. Returns null when there is no match or
// the stored price is not a usable number.
export async function findPackage({ packageId, packageName }) {
  const packages = await getPackages();
  const pkg =
    (packageId && packages.find((p) => String(p.id) === String(packageId))) ||
    (packageName && packages.find((p) => p.name === packageName)) ||
    null;
  if (!pkg) return null;
  const price = Number(pkg.price);
  if (!Number.isFinite(price) || price < 0) return null;
  return { ...pkg, price };
}
