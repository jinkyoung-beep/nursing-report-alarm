import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthToken, isAppPasswordConfigured } from "@/lib/auth";

// 로그인 없이도 들어갈 수 있는 경로 (정확히 이 경로일 때만 통과 — "/login"으로 시작하는
// 다른 경로(예: "/login-history")까지 실수로 통과시키지 않기 위해 접두사가 아니라 정확히 비교한다)
const PUBLIC_PATHS = ["/login"];

// 로그인 화면(/login)을 제외한 모든 화면은, 올바른 로그인 쿠키가 없으면 /login으로 보낸다.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // /api 경로(예: 앞으로 만들 Cron 알림 엔드포인트)는 로그인 쿠키가 아니라 CRON_SECRET으로
  // 자체 검증하므로, 여기서는 통과시키고 각 라우트 코드가 직접 검증한다.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // APP_PASSWORD가 설정되지 않았으면, 빈 비밀번호로 만든 고정 쿠키값을 누구든 흉내 낼 수 있으므로
  // 쿠키 비교 없이 무조건 막는다 (fail closed).
  if (!isAppPasswordConfigured()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!cookie || cookie !== getAuthToken()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// _next/static·_next/image·favicon.ico 같은 정적 자원만 여기서 제외하고, 나머지 경로("/login",
// "/api/..." 포함)는 전부 proxy()를 통과시켜서 위 코드가 정확한 경로 비교로 판단하게 한다.
// (matcher의 정규식 안에서 "login"·"api" 같은 이름을 직접 제외하면 "/login-history"처럼 그
// 이름으로 시작하는 다른 경로까지 실수로 함께 제외될 수 있어, 그 판단은 코드로 옮겼다)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
