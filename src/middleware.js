// ====== With Auth part ======

// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     // If user is authenticated and trying to access home page
//     if (req.nextUrl.pathname === "/" && req.nextauth.token) {
//       return NextResponse.redirect(new URL("/dashboard/overview", req.url));
//     }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//     pages: {
//       signIn: "/auth/signin",
//     },
//   }
// );

// // Specify which routes should be protected
// export const config = {
//   matcher: [
//     "/",
//     "/dashboard/:path*",
//   ],
// };

// ====== Without Auth part ======

