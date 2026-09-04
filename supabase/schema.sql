-- 신고 항목을 저장하는 테이블
-- PLAN.md 1번 작업: 신고 항목명·시작일·반복 주기·유형(정기/수시)·발생일·상태를 저장한다.
-- Supabase 프로젝트의 SQL Editor에서 이 파일 내용을 그대로 실행하면 테이블이 만들어진다.

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),

  -- 신고 항목명 (예: "간호인력 차등제 신고")
  name text not null,

  -- 유형: 정기형(주기적으로 반복) 또는 수시형(변동사항 발생 시)
  type text not null check (type in ('정기형', '수시형')),

  -- 정기형 항목의 시작일 (수시형은 사용하지 않음)
  start_date date,

  -- 정기형 항목의 반복 주기 (수시형은 사용하지 않음).
  -- 주의(PRD.md 5번 39행): '비정기'는 완료 처리해도 다음 시작일을 자동 계산하지 않고 종료 상태로
  -- 둔다 — 다른 주기처럼 완료 후 자동으로 '대기'로 되돌리면 안 된다. (Task 7·8 구현 시 반영할 것)
  repeat_cycle text check (repeat_cycle in ('30일', '매월', '2개월', '분기', '6개월', '연 1회', '비정기')),

  -- 수시형 항목의 변동사항 발생일 (정기형은 사용하지 않음)
  occurred_date date,

  -- 수시형 항목의 마감일 = 발생일 + 6일 (PRD.md 5번). occurred_date가 바뀌면 자동으로 같이 계산된다
  deadline_date date generated always as (occurred_date + 6) stored,

  -- 같은 이름의 항목이 동시에 여러 건 존재할 때 구분하기 위한 메모 (선택 입력, 예: "본관20층").
  -- 수시형은 항상 이렇게 여러 건이 동시에 진행되고, 정기형 중에서는 "간호간병통합서비스
  -- 야간전담간호사 변경신고"처럼 병동마다 날짜가 달라 같은 이름으로 여러 건이 동시에 존재하는
  -- 항목에도 쓴다. 그 외 정기형 항목은 이름당 한 건만 존재하므로 사용하지 않는다.
  memo text,

  -- 처리 상태: 대기(아직 신고 전) 또는 완료(신고 처리함)
  status text not null default '대기' check (status in ('대기', '완료')),

  -- 완료 처리를 누른 시점. 간호인력 차등제 화면에서 "지난 완료 시점 ~ 이번 시작일" 구간의
  -- 수시형 항목을 찾아 보여줄 때 기준으로 쓴다 (DESIGN.md 2번 6항)
  completed_at timestamptz,

  -- 마지막으로 알림을 보낸 날짜(KST 기준, 예: '2026-09-01'). 같은 날 Cron이 여러 번 실행돼도
  -- 이 값과 오늘 날짜가 같으면 다시 보내지 않아 중복 발송을 막는다
  last_notified_on date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 아래 제약·정책은 이 파일을 다시 실행해도 오류가 나지 않도록, 이미 있으면 건너뛴다
-- (Postgres는 add constraint / create policy에 "없으면 추가" 문법이 없어서 직접 존재 여부를 확인한다).
do $$
begin
  -- 정기형은 시작일·반복 주기가, 수시형은 발생일이 반드시 있어야 한다.
  if not exists (
    select 1 from pg_constraint where conname = 'reports_type_fields_check'
  ) then
    alter table reports
      add constraint reports_type_fields_check check (
        (type = '정기형' and start_date is not null and repeat_cycle is not null)
        or
        (type = '수시형' and occurred_date is not null)
      );
  end if;

  -- PRD.md 5번 표에 있는 이름만 허용한다 (오타가 나면 알림 유형 자동 판정에서 조용히 빠지는 것을 막기 위함).
  if not exists (
    select 1 from pg_constraint where conname = 'reports_known_name_check'
  ) then
    alter table reports
      add constraint reports_known_name_check check (
        (type = '정기형' and name in (
          '간호인력 차등제 신고',
          '간호간병통합서비스 정기신고',
          '간호간병통합서비스 예정근무 신고',
          '대체간호사 근무표 입력',
          '제2차 간호사 교대제 개선 시범사업 예정근무표 신고',
          '제2차 간호사 교대제 개선 시범사업 확정근무표 신고',
          '제2차 간호사 교대제 개선 시범사업 예정인력변동 신고',
          '제2차 간호사 교대제 개선 시범사업 확정인력변동 신고',
          '간호간병 병동운영환경 자율점검',
          '교대제 원내자료 취합',
          '간호인력 야간근무 모니터링',
          '간호간병통합서비스 야간전담간호사 변경신고'
        ))
        or
        (type = '수시형' and name = '간호간병통합서비스 수시신고')
      );
  end if;
end $$;

-- 이 앱은 Supabase Auth를 쓰지 않는다 — 접근 제한은 Next.js 쪽 비밀번호 로그인 1개로만 한다
-- (proxy.ts, CLAUDE.md "범위(스코프)" 참고). anon key는 서버(Server Component/Action)에서만 쓰고
-- 브라우저에는 절대 노출하지 않는다 (.env 변수에 NEXT_PUBLIC_ 접두사를 붙이지 않는다).
-- RLS를 켜두고 "의도적으로 전체 허용"이라는 정책을 명시적으로 선언해서, 설정을 깜빡해 열려있는
-- 상태가 아니라는 것을 분명히 한다.
alter table reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'reports' and policyname = 'reports_allow_all_to_anon'
  ) then
    create policy "reports_allow_all_to_anon" on reports
      for all
      to anon
      using (true)
      with check (true);
  end if;
end $$;
