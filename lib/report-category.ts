// 목록 화면에서 신고 항목을 묶어서 보여주기 위한 카테고리 분류 (PRD.md 5번 표의 그룹 그대로).

const CHEUNGDEUNGJE = ["간호인력 차등제 신고"];

const GANHOGANBYEONG = [
  "간호간병통합서비스 정기신고",
  "간호간병통합서비스 예정근무 신고",
  "대체간호사 근무표 입력",
  "간호간병 병동운영환경 자율점검",
  "간호간병통합서비스 야간전담간호사 변경신고",
  "간호간병통합서비스 수시신고",
];

const GYODAEJE = [
  "제2차 간호사 교대제 개선 시범사업 예정근무표 신고",
  "제2차 간호사 교대제 개선 시범사업 예정인력변동 신고",
  "제2차 간호사 교대제 개선 시범사업 확정근무표 신고",
  "제2차 간호사 교대제 개선 시범사업 확정인력변동 신고",
  "교대제 원내자료 취합",
];

// 사용자 요청으로 맨 마지막에 오는 항목
const ETC_LAST = ["간호인력 야간근무 모니터링"];

export const CATEGORY_LABELS = [
  "간호인력 차등제",
  "간호간병통합서비스",
  "제2차 간호사 교대제 개선 시범사업",
  "기타",
] as const;

// 카테고리 제목마다 다른 색을 줘서 한눈에 구분되게 한다 (app/globals.css의 --category-* 참고)
export const CATEGORY_COLOR_CLASS: Record<(typeof CATEGORY_LABELS)[number], string> = {
  "간호인력 차등제": "text-category-cheungdeungje",
  "간호간병통합서비스": "text-category-ganhoganbyeong",
  "제2차 간호사 교대제 개선 시범사업": "text-category-gyodaeje",
  "기타": "text-muted",
};

// 이름으로 카테고리 순번을 정한다 (0~3, 작을수록 위에 옴). 목록에 없는 이름은 "기타" 앞에 둔다.
export function getCategoryIndex(name: string): number {
  if (CHEUNGDEUNGJE.includes(name)) return 0;
  if (GANHOGANBYEONG.includes(name)) return 1;
  if (GYODAEJE.includes(name)) return 2;
  if (ETC_LAST.includes(name)) return 3;
  return 1;
}
