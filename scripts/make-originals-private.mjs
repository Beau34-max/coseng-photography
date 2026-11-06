/**
 * One-off migration: make the ORIGINAL files of existing gallery photos private.
 *
 * Why: photos uploaded before the fix are Cloudinary "upload" assets, so anyone who knows
 * (or is ever shown) the original URL can open it. Moving them to the "authenticated" type
 * means the original only works through links this server signs. New uploads are already
 * private. This script covers the photos that were uploaded earlier.
 *
 * BEFORE you run it with --apply:
 *   1. Deploy the updated code first (it can already serve both kinds of photo).
 *   2. Take a backup: export the MongoDB database and make sure Cloudinary originals are safe.
 *   3. Try one photo first:  --apply --limit 1  and open that gallery in the site and admin.
 *
 * Usage (a dry run is the default and changes nothing):
 *   node --env-file=.env.local scripts/make-originals-private.mjs
 *   node --env-file=.env.local scripts/make-originals-private.mjs --apply --limit 1
 *   node --env-file=.env.local scripts/make-originals-private.mjs --apply
 *
 * Side effects of --apply:
 *   - Old direct links to the originals stop working (Cloudinary cache is invalidated).
 *   - A gallery cover that pointed at a migrated original is replaced with a signed,
 *     watermarked copy so the site keeps showing it.
 */

import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const limitAt = args.indexOf("--limit");
const LIMIT = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;
if (limitAt >= 0 && !(LIMIT > 0)) throw new Error("--limit needs a number greater than 0");

for (const name of ["MONGODB_URI", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
  if (!process.env[name]) throw new Error(`${name} is not set. Run with: node --env-file=.env.local scripts/make-originals-private.mjs`);
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Keep in step with markLayer/derivedUrl in lib/delivery.js (width 800, diagonal mark).
const WM_DEFAULTS = { text: "COSENG Photography", font: "Dancing_Script", size: 80, opacity: 40, angle: -20 };
function coverUrlFor(publicId, wm) {
  const s = { ...WM_DEFAULTS, ...wm };
  return cloudinary.url(publicId, {
    secure: true, type: "authenticated", sign_url: true,
    transformation: [
      { width: 800, crop: "limit", quality: "auto", fetch_format: "auto" },
      {
        overlay: { font_family: s.font, font_size: Math.max(12, Math.round((s.size * 800) / 1600)), text: s.text },
        color: "white", opacity: s.opacity, gravity: "center", angle: s.angle,
      },
    ],
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function authenticatedExists(publicId) {
  try {
    await cloudinary.api.resource(publicId, { type: "authenticated", resource_type: "image" });
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("cosengphotography");
    const photos = db.collection("photos");
    const galleries = db.collection("galleries");
    const wm = (await db.collection("settings").findOne({ key: "watermark" })) || {};

    const todo = await photos
      .find({ deliveryType: { $ne: "authenticated" }, publicId: { $type: "string", $ne: "" } })
      .limit(Number.isFinite(LIMIT) ? LIMIT : 0)
      .toArray();

    console.log(`${APPLY ? "APPLYING" : "DRY RUN"}: ${todo.length} photo(s) still have a public original.`);
    if (!APPLY) {
      console.log("Nothing was changed. Re-run with --apply (try --apply --limit 1 first).");
      return;
    }

    const covered = await galleries.find({ coverImage: { $type: "string", $ne: "" } }).toArray();
    let moved = 0, failed = 0;

    for (const photo of todo) {
      try {
        try {
          await cloudinary.uploader.rename(photo.publicId, photo.publicId, {
            type: "upload", to_type: "authenticated", resource_type: "image", invalidate: true,
          });
        } catch (err) {
          // A previous run may have moved the file but not saved the database change.
          if (!(await authenticatedExists(photo.publicId))) throw err;
        }

        await photos.updateOne({ _id: photo._id }, { $set: { deliveryType: "authenticated", migratedAt: new Date() } });

        for (const g of covered) {
          if (g.coverImage.includes(photo.publicId) && !g.coverImage.includes("/authenticated/")) {
            const coverImage = coverUrlFor(photo.publicId, wm);
            await galleries.updateOne({ _id: g._id }, { $set: { coverImage } });
            g.coverImage = coverImage;
          }
        }
        moved += 1;
        console.log(`  moved ${photo.publicId}`);
      } catch (err) {
        failed += 1;
        console.error(`  FAILED ${photo.publicId}: ${err?.error?.message || err.message}`);
      }
      await sleep(150);
    }

    console.log(`Finished. Moved ${moved}, failed ${failed}. Failed photos are left exactly as they were; you can re-run safely.`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exitCode = 1;
});
