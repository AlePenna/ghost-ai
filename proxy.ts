import { clerkMiddleware } from "@clerk/nextjs/server";

const publicPaths = [
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
].filter((p): p is string => Boolean(p));

function isPublic(pathname: string) {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export default clerkMiddleware(async (auth, req) => {
  // API routes authenticate themselves so they can return 401 JSON.
  const { pathname } = req.nextUrl;
  if (!isPublic(pathname) && !pathname.startsWith("/api/")) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
