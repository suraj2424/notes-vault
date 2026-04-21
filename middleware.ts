import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/signup(.*)', '/api/auth/logout', '/api/notes', '/api/tags', '/api/stats'];
const ignoredRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/me'];

const isPublicRoute = createRouteMatcher(publicRoutes);
const isIgnoredRoute = createRouteMatcher(ignoredRoutes);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};