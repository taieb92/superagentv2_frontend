import { isValidRole, UserRole } from "@/lib/constants/roles";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const authResult = await auth();

    if (authResult.userId) {
      try {
        const metadata = authResult.sessionClaims?.metadata as
          | { role?: string }
          | undefined;
        const publicMetadata = authResult.sessionClaims?.publicMetadata as
          | { role?: string }
          | undefined;
        const role = (metadata?.role || publicMetadata?.role || "") as string;

        if (!isValidRole(role) || role !== UserRole.ADMIN) {
          if (role === UserRole.AGENT || !role) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
          }

          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (error) {
        console.error("Proxy error checking user role:", error);
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
