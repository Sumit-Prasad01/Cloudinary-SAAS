import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { publicDecrypt } from "crypto";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/signin", "/singup", "/", "/home"]);

const isPublicApiRoute = createRouteMatcher(["/api/videos"]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const currentUrl = new URL(req.url);
  const isAccessingDashboard = currentUrl.pathname === "/home";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  if(userId && isPublicRoute(req) && !isAccessingDashboard){
    return NextResponse.redirect(new URL("/home", req.url));
  }

  if(!userId){
    if(!isPublicRoute(req) && !isPublicApiRoute(req)){
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    if(!isApiRequest && !isPublicApiRoute(req)){
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
