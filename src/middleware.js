import { NextResponse } from 'next/server'

export function middleware(request) {
  // Check if the request is for the home page
  if (request.nextUrl.pathname === '/') {
    // Redirect to dashboard overview
    return NextResponse.redirect(new URL('/dashboard/overview', request.url))
  }

  // Continue with the request for all other paths
  return NextResponse.next()
}

export const config = {
  // Specify which paths this middleware will run on
  matcher: '/'
}
