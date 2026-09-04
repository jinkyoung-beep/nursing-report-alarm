import type { ReportItem } from "@/types/report";
import { getNotificationType, ADHOC_REPORT_NAME } from "./notification-type";
import { addDaysToDateString } from "./report-schedule";
import { resolveNotificationDates } from "./holiday-shift";

interface Milestone {
  date: string;
  label: string;
}

// 신고 항목별 "원래" 알림 예정일을 계산한다 (주말·공휴일 보정 전). PRD.md 5번 규칙 그대로.
function getRawMilestones(report: ReportItem): Milestone[] {
  if (report.type === "수시형") {
    if (report.name !== ADHOC_REPORT_NAME || !report.occurred_date || !report.deadline_date) {
      return [];
    }
    return [
      { date: addDaysToDateString(report.occurred_date, 1), label: "발생일+1일" },
      { date: addDaysToDateString(report.deadline_date, -1), label: "마감일-1일" },
    ];
  }

  if (!report.start_date) return [];
  const start = report.start_date;

  switch (getNotificationType(report.name)) {
    case "기본":
      return [
        { date: addDaysToDateString(start, -7), label: "D-7" },
        { date: addDaysToDateString(start, -3), label: "D-3" },
        { date: start, label: "D-day" },
      ];
    case "예외":
      return [
        { date: addDaysToDateString(start, -10), label: "D-10" },
        { date: addDaysToDateString(start, -7), label: "D-7" },
        { date: addDaysToDateString(start, -3), label: "D-3" },
        { date: start, label: "D-day" },
      ];
    case "특수":
    case "준비":
      return [{ date: start, label: "안내" }];
    default:
      // 표에 없는 이름(자동 판정 실패)이면 알림을 보내지 않는다.
      return [];
  }
}

// 오늘(today, KST "YYYY-MM-DD") 이 신고 항목의 알림 발송일인지 판단한다.
// 완료 처리됐거나 오늘 이미 보냈으면 null. 주말·공휴일 보정(lib/holiday-shift.ts)까지 반영한 결과다.
export function getDueLabel(report: ReportItem, today: string): string | null {
  if (report.status === "완료") return null;
  if (report.last_notified_on === today) return null;

  for (const milestone of getRawMilestones(report)) {
    if (resolveNotificationDates(milestone.date).includes(today)) {
      return milestone.label;
    }
  }
  return null;
}
