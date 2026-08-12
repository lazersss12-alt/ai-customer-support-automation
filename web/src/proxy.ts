import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Gates /dashboard behind HTTP Basic Auth. Deliberately minimal — no login
// page, no session/auth library — appropriate for a single-operator internal
// tool. Credentials live only in server-only env vars.
export function proxy(request: NextRequest) {
  const username = process.env.DASHBOARD_USERNAME;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!username || !password) {
    return new NextResponse(
      "Dashboard is not configured: set DASHBOARD_USERNAME and DASHBOARD_PASSWORD.",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const providedUser = decoded.slice(0, separatorIndex);
    const providedPass = decoded.slice(separatorIndex + 1);

    if (safeEqual(providedUser, username) && safeEqual(providedPass, password)) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Dashboard", charset="UTF-8"' },
  });
}

export const config = {
  matcher: "/dashboard/:path*",
};
