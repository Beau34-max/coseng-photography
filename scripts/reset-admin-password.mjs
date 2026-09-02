/**
 * Reset (or create) an admin account in cosengphotography.
 * Run with:
 *   node scripts/reset-admin-password.mjs
 */

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI env var is not set");

const TARGET_EMAIL = "uche_egwu@yahoo.com";
const TEMP_PASSWORD = "CosengPhoto2024!";
const ADMIN_NAME = "Uche Egwu";
const ADMIN_ROLE = "admin";

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db("cosengphotography");
    const col = db.collection("admins");

    const existing = await col.findOne({ email: TARGET_EMAIL });
    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 10);

    if (existing) {
      await col.updateOne(
        { email: TARGET_EMAIL },
        { $set: { passwordHash, name: ADMIN_NAME, role: ADMIN_ROLE } }
      );
      console.log(`Password reset for existing admin: ${TARGET_EMAIL}`);
    } else {
      await col.insertOne({
        name: ADMIN_NAME,
        email: TARGET_EMAIL,
        passwordHash,
        role: ADMIN_ROLE,
        createdAt: new Date(),
      });
      console.log(`New admin created: ${TARGET_EMAIL}`);
    }

    console.log(`Temporary password: ${TEMP_PASSWORD}`);
    console.log("Done. Ask Uche to change their password after first login.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

run();
