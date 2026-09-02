import { connectToDb } from "@/lib/mongodb";
import HomepageEditor from "./HomepageEditor";

export const metadata = { title: "Homepage" };

const HERO_DEFAULTS = {
  title: "Capturing Moments",
  titleAccent: "That Last Forever",
  subtitle:
    "Professional photography for portraits, events, commercial and community work. Delivering stunning images across Newcastle and the North East.",
  backgroundImage: null,
  backgroundPositionY: 50,
};

const WM_DEFAULTS = { text: "COSENG Photography", font: "Dancing_Script", size: 80, opacity: 40, angle: -20 };

async function getSettings() {
  try {
    const db = await connectToDb();
    const [homepage, watermark] = await Promise.all([
      db.collection("settings").findOne({ key: "homepage" }),
      db.collection("settings").findOne({ key: "watermark" }),
    ]);
    return {
      hero: { ...HERO_DEFAULTS, ...(homepage?.hero || {}) },
      carousel: homepage?.carousel || [],
      watermark: { ...WM_DEFAULTS, ...(watermark || {}) },
    };
  } catch {
    return { hero: HERO_DEFAULTS, carousel: [], watermark: WM_DEFAULTS };
  }
}

export default async function HomepagePage() {
  const settings = await getSettings();
  return <HomepageEditor initial={settings} />;
}
