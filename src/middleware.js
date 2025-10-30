import { NextResponse } from 'next/server';



export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session');
  let role = null;
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      role = session.role;
    } catch (e) {
      // Invalid cookie, treat as not logged in
    }
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect /seller routes
  if (pathname.startsWith('/seller')) {
    if (role !== 'seller' && role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect /profile, /cart, etc. (must be logged in)
  if ([
    '/profile',
    '/cart',
    '/wishlist',
    '/checkout',
  ].some((p) => pathname.startsWith(p))) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart', 
    // '/admin/:path*', 
    '/profile',
    '/login',
    '/register/customer',
    '/register/seller',
    '/signup',
    '/seller/:path*' 
  ],
};