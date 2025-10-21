import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.pathname;
  const cookieValue = request.cookies.get('__session')?.value;

  // Protected routes
  const protectedRoutes = ['/cart', '/admin'];

  if (!protectedRoutes.some(route => url.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect if not logged in
  if (!cookieValue) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ Decode JWT payload from token
  const base64Payload = cookieValue.split('.')[1];
  const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
  const email = decodedPayload.email;

  console.log("📩 Email extracted from token:", email);

  // ✅ Superadmin check
  const isSuperAdmin = email === 'admin@thriftx.com';

  // ✅ Admin check (email check or use Firestore role if needed)
  const isAdmin = isSuperAdmin || email === 'saker@gmail.com'; // Add your actual admin list

  // ✅ Superadmin route protection
  if (url.startsWith('/admin/super') && !isSuperAdmin) {
    return NextResponse.redirect(new URL('/?unauthorized=true', request.url));
  }

  // ✅ General admin protection
  if (url.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/?unauthorized=true', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart', '/admin/:path*'],
};
