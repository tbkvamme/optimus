import { NextResponse, type NextRequest } from 'next/server';

const REALM = 'Optimus KB';

export function middleware(req: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return NextResponse.next();

  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice('Basic '.length));
      const idx = decoded.indexOf(':');
      const pass = idx >= 0 ? decoded.slice(idx + 1) : decoded;
      if (pass === expected) return NextResponse.next();
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
