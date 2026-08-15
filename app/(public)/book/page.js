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
];

export default function BookPage() {
  return <BookingClient packages={DEFAULT_PACKAGES} />;
}
