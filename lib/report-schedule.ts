import type { RepeatCycle } from "@/types/report";

// 오늘 날짜를 한국시간(KST, UTC+9) 기준 "YYYY-MM-DD"로 반환한다.
export function todayKST(): string {
  const kstMs = Date.now() + 9 * 60 * 60 * 1000;
  return new Date(kstMs).toISOString().slice(0, 10);
}

function toUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// targetDate까지 남은 일수 (오늘 = 0, 지났으면 음수).
export function daysUntil(dateStr: string, today: string = todayKST()): number {
  return Math.round((toUtcMs(dateStr) - toUtcMs(today)) / 86_400_000);
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function addMonthsToDateString(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + months, d)).toISOString().slice(0, 10);
}

// 완료 처리 시 다음 시작일을 계산한다. "비정기"는 다음 시작일이 없어 null을 반환한다 (PRD.md 5번).
export function getNextStartDate(currentStart: string, cycle: RepeatCycle): string | null {
  switch (cycle) {
    case "30일":
      return addDaysToDateString(currentStart, 30);
    case "매월":
      return addMonthsToDateString(currentStart, 1);
    case "2개월":
      return addMonthsToDateString(currentStart, 2);
    case "분기":
      return addMonthsToDateString(currentStart, 3);
    case "6개월":
      return addMonthsToDateString(currentStart, 6);
    case "연 1회":
      return addMonthsToDateString(currentStart, 12);
    case "비정기":
      return null;
  }
}

// "D-3", "D-day", "D+2" 형태의 표시용 문구를 만든다.
export function formatDday(days: number): string {
  if (days > 0) return `D-${days}`;
  if (days === 0) return "D-day";
  return `D+${Math.abs(days)} 지남`;
}
