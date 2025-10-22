import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.pathname;
  const cookieValue = request.cookies.get('__session')?.value;

  // Protected routes (require authentication)
  const protectedRoutes = ['/cart', '/admin', '/profile'];
  
  // Auth routes (should not be accessible when logged in)
  const authRoutes = ['/login', '/register', '/signup'];

  // Check if user is authenticated
  const isAuthenticated = !!cookieValue;

  // ✅ Redirect authenticated users away from auth pages
  if (authRoutes.some(route => url.startsWith(route))) {
    if (isAuthenticated) {
      console.log("🔒 User is authenticated, redirecting from auth page");
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow non-authenticated users to access auth pages
    return NextResponse.next();
  }

  // Allow non-protected routes to pass through
  if (!protectedRoutes.some(route => url.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect if not logged in to protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    let token, role;

    // ✅ Handle both formats: JSON object or raw token
    if (cookieValue.startsWith('{')) {
      // Format: { token: "eyJhbGciOi...", role: "admin" }
      const sessionData = JSON.parse(cookieValue);
      token = sessionData.token;
      role = sessionData.role;
    } else {
      // Format: "eyJhbGciOi..." (raw token)
      token = cookieValue;
      
      // ✅ Decode JWT payload to get email for role determination
      const base64Payload = token.split('.')[1];
      const decodedPayload = JSON.parse(
        Buffer.from(base64Payload, 'base64').toString()
      );
      
      const email = decodedPayload.email;
      
      // ✅ Fallback role determination based on email (temporary)
      // This should be replaced with proper role from your database
      if (email === 'admin@thriftx.com') {
        role = 'superadmin';
      } else if (email === 'saker@gmail.com') {
        role = 'admin';
      } else {
        role = 'buyer'; // default role
      }
    }

    console.log("🎭 User role:", role);

    // ✅ Route protection based on roles
    if (url.startsWith('/admin/super')) {
      // Only superadmin can access super admin routes
      if (role !== 'superadmin') {
        return NextResponse.redirect(new URL('/?unauthorized=true', request.url));
      }
    } else if (url.startsWith('/admin')) {
      // Admin routes require admin or superadmin role
      if (!['admin', 'superadmin'].includes(role)) {
        return NextResponse.redirect(new URL('/?unauthorized=true', request.url));
      }
    } else if (url.startsWith('/cart') || url.startsWith('/profile')) {
      // Regular protected routes - any authenticated user can access
      console.log(`✅ User with role ${role} accessing ${url}`);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error processing session cookie:', error);
    // If there's an error processing the cookie, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/cart', 
    '/admin/:path*', 
    '/profile',
    '/login',
    '/register',
    '/signup'
  ],
};