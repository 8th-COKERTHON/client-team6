export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/((?!api|mock(?:/|$)|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
