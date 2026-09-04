// supabase/schema.sql의 reports 테이블과 짝을 이루는 타입 정의

export type ReportType = "정기형" | "수시형";

export type RepeatCycle = "30일" | "매월" | "2개월" | "분기" | "6개월" | "연 1회" | "비정기";

// 추가·수정 화면의 드롭다운, 엑셀 업로드 검증에 쓰는 반복 주기 전체 목록
export const REPEAT_CYCLES: readonly RepeatCycle[] = [
  "30일",
  "매월",
  "2개월",
  "분기",
  "6개월",
  "연 1회",
  "비정기",
];

export type ReportStatus = "대기" | "완료";

export interface ReportItem {
  id: string;
  name: string;
  type: ReportType;
  start_date: string | null;
  repeat_cycle: RepeatCycle | null;
  occurred_date: string | null;
  deadline_date: string | null;
  memo: string | null;
  status: ReportStatus;
  completed_at: string | null;
  last_notified_on: string | null;
  created_at: string;
  updated_at: string;
}
