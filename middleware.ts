import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect sales sub-pages (not the login page itself)
  if (pathname.startsWith('/sales/') && pathname !== '/sales') {
    const token = request.cookies.get('sales_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/sales', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.SALES_JWT_SECRET || 'change-this-secret-in-production'
      );
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/sales', request.url));
      response.cookies.delete('sales_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sales/:path*'],
};
