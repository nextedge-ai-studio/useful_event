import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 受保護的路徑 - 這些頁面需要登入才能存取
// 但我們讓頁面先載入，由前端處理認證狀態顯示
// 這避免了 cookie 同步時間差的問題
const PROTECTED_PATHS = ["/submit", "/inbox"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 非受保護路徑，直接放行
  if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 對於受保護路徑，我們不再做 server-side 重導向
  // 讓頁面載入，由前端 client component 處理認證狀態
  // 這解決了 OAuth 登入後 cookie 同步時間差的問題
  return NextResponse.next();
}

export const config = {
  matcher: ["/submit/:path*", "/inbox/:path*"],
};
