import crypto from "node:crypto";

// 로그인 여부를 표시하는 쿠키 이름
export const AUTH_COOKIE_NAME = "app_auth";

// .env의 APP_PASSWORD를 그대로 쿠키에 저장하지 않고, 이 값으로 서명해서 저장한다.
function computeAuthToken(password: string): string {
  return crypto.createHmac("sha256", password).update("authenticated").digest("hex");
}

// .env에 APP_PASSWORD가 설정돼 있는지 확인한다. 비어 있으면 로그인 자체를 막아야 한다
// (비어 있는 비밀번호로 만든 고정된 서명값을 누군가 쿠키로 흉내 낼 수 있기 때문).
export function isAppPasswordConfigured(): boolean {
  return (process.env.APP_PASSWORD ?? "").length > 0;
}

// 로그인 화면에서 입력한 비밀번호가 맞는지 확인한다.
// 문자열을 바로 비교(===)하면 얼마나 다른지에 따라 비교 시간이 미세하게 달라져(타이밍 공격 위험),
// 두 값을 고정 길이 해시로 만든 뒤 crypto.timingSafeEqual로 비교한다.
// (로그인 시도 횟수 제한은 넣지 않았다 — Vercel처럼 서버가 요청마다 새로 뜨는 환경에서는
// 메모리에 횟수를 세어봐야 재시작되면 초기화돼 실제로 막아주지 못하고, 개인정보를 다루지 않는
// 개인용 1인 앱이라 지금은 이 정도로 충분하다고 판단했다.)
function hash(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

export function verifyPassword(input: string): boolean {
  const password = process.env.APP_PASSWORD ?? "";
  if (password.length === 0) return false;
  return crypto.timingSafeEqual(hash(input), hash(password));
}

// 로그인 성공 시 쿠키에 저장할 값, 그리고 요청마다 쿠키가 유효한지 비교할 때 쓰는 기준값.
// APP_PASSWORD가 비어 있으면 절대 호출하면 안 된다 (호출 쪽에서 isAppPasswordConfigured()로 먼저 막는다).
export function getAuthToken(): string {
  return computeAuthToken(process.env.APP_PASSWORD ?? "");
}
