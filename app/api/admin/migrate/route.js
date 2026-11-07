import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// Re-upload authenticated Cloudinary assets as public so they load without signed URLs.
export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await connectToDb();
    const photos = await db.collection("photos")
      .find({ publicId: { $exists: true, $ne: null } })
      .toArray();

    const results = { migrated: 0, skipped: 0, failed: 0, errors: [] };

    for (const photo of photos) {
      if (photo.deliveryType === "upload") {
        results.skipped++;
        continue;
      }

      try {
        // Build a signed URL to fetch the authenticated original from Cloudinary
        const signedUrl = cloudinary.url(photo.publicId, {
          secure: true,
          type: "authenticated",
          sign_url: true,
          resource_type: "image",
        });

        // Re-upload as a public asset into the same folder
        const folder = `coseng-photography/${photo.galleryId}`;
        const result = await cloudinary.uploader.upload(signedUrl, {
          resource_type: "image",
          type: "upload",
          folder,
          invalidate: true,
          overwrite: false,
        });

        await db.collection("photos").updateOne(
          { _id: photo._id },
          {
            $set: {
              publicId: result.public_id,
              url: result.secure_url,
              deliveryType: "upload",
              width: result.width || photo.width,
              height: result.height || photo.height,
              format: result.format || photo.format,
            },
          }
        );

        // Best-effort cleanup of old authenticated asset
        try {
          await cloudinary.uploader.destroy(photo.publicId, {
            type: "authenticated",
            resource_type: "image",
            invalidate: true,
          });
        } catch { /* ignore */ }

        results.migrated++;
      } catch (err) {
        results.failed++;
        results.errors.push({ publicId: photo.publicId, error: err.message });
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
