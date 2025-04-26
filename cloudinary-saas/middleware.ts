import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in",
  "/sign-up",
  "/",
  "/home",
]);
const isPublicApiRoute = createRouteMatcher(["/api/videos"]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth; 

  const currentUrl = new URL(req.url);
  const pathname = currentUrl.pathname;
  const isAccessingDashboard = pathname === "/home";
  const isApiRequest = pathname.startsWith("/api");

  // If the user is logged in and tries to visit a public page (except /home), redirect to /home
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // If the user is NOT logged in:
  if (!userId) {
    // If trying to access a private page
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // If trying to access a protected API route
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Otherwise allow
  return NextResponse.next();
});

export const config = {
  matcher: [
    
    "/((?!_next|.*\\..*).*)",
    
    "/(api|trpc)(.*)",
  ],
};
