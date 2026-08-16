import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectToDb } from "./mongodb";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "change-me-in-production");
const COOKIE = "photo_admin_session";

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.email) return null;
  const db = await connectToDb();
  const admin = await db.collection("admins").findOne({ email: payload.email });
  return admin || null;
}

export async function getAdminFromRequest(req) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.email) return null;
  const db = await connectToDb();
  return db.collection("admins").findOne({ email: payload.email });
}

export { COOKIE };
