import { NextResponse } from "next/server";

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // If user is trying to access home page, redirect to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard/overview", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
  ],
};