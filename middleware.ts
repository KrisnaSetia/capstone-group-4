// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  roles: number; // 0 = psikolog, 1 = mahasiswa
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kecualikan static assets dan public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/auth/signin') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/unauthorized')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/signin', request.nextUrl.origin);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Role-based route protection
    if (pathname.startsWith('/mahasiswa')) {
      if (decoded.roles !== 1) {
        return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin));
      }

      const userIdFromUrl = extractUserIdFromPath(pathname);
      if (userIdFromUrl && userIdFromUrl !== decoded.userId) {
        return NextResponse.redirect(new URL('/mahasiswa/beranda', request.nextUrl.origin));
      }
    }

    if (pathname.startsWith('/psikolog')) {
      if (decoded.roles !== 0) {
        return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin));
      }

      const userIdFromUrl = extractUserIdFromPath(pathname);
      if (userIdFromUrl && userIdFromUrl !== decoded.userId) {
        return NextResponse.redirect(new URL('/psikolog/beranda', request.nextUrl.origin));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error('JWT invalid:', err);
    const res = NextResponse.redirect(new URL('/auth/signin', request.nextUrl.origin));
    res.cookies.delete('token');
    return res;
  }
}

// Helper: ekstrak user ID dari path (opsional untuk validasi tambahan)
function extractUserIdFromPath(pathname: string): number | null {
  const patterns = [
    /\/mahasiswa\/.*\/(\d+)/,
    /\/psikolog\/.*\/(\d+)/,
  ];
  for (const pattern of patterns) {
    const match = pathname.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return null;
}

// Konfigurasi matcher (ini WAJIB untuk Next.js mengenali middleware aktif di route ini)
export const config = {
  matcher: ['/mahasiswa/:path*', '/psikolog/:path*'],
};
