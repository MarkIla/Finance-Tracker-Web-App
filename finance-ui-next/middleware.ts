import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // read the signed/unsigned cookie named "auth"
  const token = req.cookies.get('auth')?.value;

  // redirect logic only on the site root "/"
  if (req.nextUrl.pathname === '/') {
    const dest = token ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // default – just continue
  return NextResponse.next();
}

/** Only run on the root path ("/"). Add more patterns if needed. */
export const config = {
  matcher: ['/'],
};
