import { connectToDb } from "@/lib/mongodb";
import BookingClient from "./BookingClient";

export const metadata = {
  title: "Book a Session",
  description: "Book a professional photography session with COSENG Photography.",
};

const DEFAULT_PACKAGES = [
  { id: "portrait", name: "Portrait Session", duration: "1 hour", price: 150, description: "Individual or family portrait session", includes: ["1 hour shoot", "20 edited photos", "Online gallery"] },
  { id: "event", name: "Event Coverage", duration: "4 hours", price: 450, description: "Events, parties and celebrations", includes: ["4 hours coverage", "100+ edited photos", "Online gallery", "USB delivery"] },
  { id: "wedding", name: "Wedding Package", duration: "Full day", price: 1200, description: "Full-day wedding photography", includes: ["Full day coverage", "500+ edited photos", "Private gallery", "USB + prints"] },
  { id: "commercial", name: "Commercial Shoot", duration: "2 hours", price: 350, description: "Product or business photography", includes: ["2 hour shoot", "50 edited photos", "Commercial licence"] },
  { id: "charity", name: "Charity & Community", duration: "4 hours", price: 400, description: "Supporting charities and community groups. Extra £100/hr thereafter.", includes: ["4 hours coverage", "50+ edited photos", "Online gallery", "Community rates"] },
];

async function getPackages() {
  try {
    const db = await connectToDb();
    const settings = await db.collection("settings").findOne({ key: "site" });
    return settings?.packages?.length > 0 ? settings.packages : DEFAULT_PACKAGES;
  } catch { return DEFAULT_PACKAGES; }
}

export default async function BookPage() {
  const packages = await getPackages();
  return <BookingClient packages={packages} />;
}
