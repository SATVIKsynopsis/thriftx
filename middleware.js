import { NextResponse } from 'next/server';

export function middleware(req) {
  const pathname = req.nextUrl.pathname;
  console.log("✅ Middleware triggered on:", pathname);

  // Paths that require authentication
  const protectedRoutes = [
    '/cart', 
    // '/admin', 
    '/category'
  ];

  // Check if current path starts with any protected route
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // If not a protected route → allow
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = req.cookies.get('__session')?.value;
  console.log("🔍 RAW COOKIE:", sessionCookie);

  if (!sessionCookie) {
    console.log("🚫 Not logged in → redirecting to /login");
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If a cookie is present (any value for now) → allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart',
    // '/admin/:path*', 
    '/category'
  ],
};
