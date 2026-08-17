import { connectToDb } from "@/lib/mongodb";
import HomepageEditor from "./HomepageEditor";

export const metadata = { title: "Homepage" };

const DEFAULTS = {
  hero: {
    title: "Capturing Moments",
    titleAccent: "That Last Forever",
    subtitle:
      "Professional photography for portraits, events, commercial and community work. Delivering stunning images across Newcastle and the North East.",
    backgroundImage: null,
  },
  carousel: [],
};

async function getHomepageSettings() {
  try {
    const db = await connectToDb();
    const doc = await db.collection("settings").findOne({ key: "homepage" });
    return {
      hero: { ...DEFAULTS.hero, ...(doc?.hero || {}) },
      carousel: doc?.carousel || [],
    };
  } catch {
    return DEFAULTS;
  }
}

export default async function HomepagePage() {
  const settings = await getHomepageSettings();
  return <HomepageEditor initial={settings} />;
}
