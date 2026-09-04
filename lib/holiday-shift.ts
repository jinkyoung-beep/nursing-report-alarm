import Holidays from "date-holidays";

// 한국 공휴일 판단 (설날·추석 등 음력 공휴일과 대체공휴일 규칙 포함). PRD.md 5번 알림 규칙 참고.
const hd = new Holidays("KR");

function toUtcDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function isNonWorkingDay(dateStr: string): boolean {
  const date = toUtcDate(dateStr);
  const dayOfWeek = date.getUTCDay(); // 0 = 일요일, 6 = 토요일
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;
  return Boolean(hd.isHoliday(date));
}

// 원래 알림 예정일이 평일이면 그대로 1개를 반환한다.
// 주말·공휴일(연휴 포함)과 겹치면, 그 구간 바로 직전 평일 1개 + 바로 직후 평일 1개, 총 2개를 반환한다.
export function resolveNotificationDates(dateStr: string): string[] {
  if (!isNonWorkingDay(dateStr)) return [dateStr];

  let before = addDays(dateStr, -1);
  while (isNonWorkingDay(before)) before = addDays(before, -1);

  let after = addDays(dateStr, 1);
  while (isNonWorkingDay(after)) after = addDays(after, 1);

  return [before, after];
}
