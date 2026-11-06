import { getPackages } from "@/lib/packages";
import BookingClient from "./BookingClient";

export const metadata = {
  title: "Book a Session",
  description: "Book a professional photography session with COSENG Photography.",
};

export default async function BookPage() {
  const packages = await getPackages();
  return <BookingClient packages={packages} />;
}
