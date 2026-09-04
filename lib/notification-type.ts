// 정기형 신고 항목명 → 알림 유형(기본/예외/특수/준비) 자동 대조표 (PRD.md 5번 표 그대로)
// DESIGN.md §1 ④: 알림 유형은 사용자가 화면에서 직접 고르지 않고, 이 표로 시스템이 자동 판정한다.

export type NotificationType = "기본" | "예외" | "특수" | "준비";

const BASIC_NAMES = [
  "간호간병통합서비스 예정근무 신고",
  "대체간호사 근무표 입력",
] as const;

const EXCEPTION_NAMES = [
  "간호인력 차등제 신고",
  "제2차 간호사 교대제 개선 시범사업 예정근무표 신고",
  "제2차 간호사 교대제 개선 시범사업 확정근무표 신고",
  "제2차 간호사 교대제 개선 시범사업 예정인력변동 신고",
  "제2차 간호사 교대제 개선 시범사업 확정인력변동 신고",
  // 병동마다 변경일이 달라 같은 이름으로 최대 3건이 동시에 존재할 수 있는 항목 (memo로 병동 구분)
  "간호간병통합서비스 야간전담간호사 변경신고",
] as const;

const SPECIAL_NAMES = ["간호간병통합서비스 정기신고"] as const;

// 실제 신고가 아니라 신고를 준비하기 위한 사전 작업. 시작일 아침에 1회만 알림을 보낸다.
const PREP_NAMES = [
  "간호간병 병동운영환경 자율점검",
  "교대제 원내자료 취합",
  "간호인력 야간근무 모니터링",
] as const;

// 정기형 신고 항목명으로 알림 유형을 판정한다. 표에 없는 이름이면 null을 반환한다.
export function getNotificationType(name: string): NotificationType | null {
  if ((BASIC_NAMES as readonly string[]).includes(name)) return "기본";
  if ((EXCEPTION_NAMES as readonly string[]).includes(name)) return "예외";
  if ((SPECIAL_NAMES as readonly string[]).includes(name)) return "특수";
  if ((PREP_NAMES as readonly string[]).includes(name)) return "준비";
  return null;
}

// 정기형 신고 항목명 12개 전체 (추가·수정 화면의 드롭다운, 엑셀 업로드 검증에 사용)
export const ALL_REGULAR_NAMES: readonly string[] = [
  ...BASIC_NAMES,
  ...EXCEPTION_NAMES,
  ...SPECIAL_NAMES,
  ...PREP_NAMES,
];

// 수시형 신고의 고정된 이름 (PRD.md 5번)
export const ADHOC_REPORT_NAME = "간호간병통합서비스 수시신고";

// 정기형이지만 병동마다 날짜가 달라 같은 이름으로 여러 건이 동시에 존재하는 유일한 항목
export const MULTI_INSTANCE_NAME = "간호간병통합서비스 야간전담간호사 변경신고";
