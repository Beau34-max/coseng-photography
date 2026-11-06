import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/secret";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    let secret;
    try {
      secret = getJwtSecret();
    } catch (err) {
      // Misconfigured server: refuse access rather than fall back to a default secret.
      console.error(err.message);
      return new NextResponse("Server is not configured correctly.", { status: 500 });
    }

    const token = req.cookies.get("photo_admin_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
    try {
      await jwtVerify(token, secret, { algorithms: ["HS256"] });
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
