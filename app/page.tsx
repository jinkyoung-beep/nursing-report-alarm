import Link from "next/link";
import NetworkMeshBackground from "@/components/NetworkMeshBackground";
import AlarmIllustration from "@/components/AlarmIllustration";
import DeleteReportButton from "@/components/DeleteReportButton";
import { logout } from "@/app/login/actions";
import { getSupabaseClient } from "@/lib/supabase";
import { getNotificationType } from "@/lib/notification-type";
import { daysUntil, formatDday } from "@/lib/report-schedule";
import {
  CATEGORY_LABELS,
  CATEGORY_COLOR_CLASS,
  getCategoryIndex,
} from "@/lib/report-category";
import { completeReport, deleteReport } from "@/app/actions/reports";
import type { ReportItem } from "@/types/report";

// 신고 항목 목록 화면 (DESIGN.md §1 ②). 로그인 후 첫 화면이다.
// 매번 최신 데이터를 보여줘야 하므로 정적 캐싱 없이 요청마다 새로 렌더링한다.
export const dynamic = "force-dynamic";

function targetDate(report: ReportItem): string | null {
  return report.type === "정기형" ? report.start_date : report.deadline_date;
}

// 차등제 항목의 "지난 완료 시점 ~ 이번 시작일" 구간에 발생한 수시형 항목을 찾는다 (DESIGN.md §2-6).
function findRelatedAdhocItems(
  cheungdeungje: ReportItem,
  allReports: ReportItem[]
): ReportItem[] {
  const lowerBound = cheungdeungje.completed_at
    ? cheungdeungje.completed_at.slice(0, 10)
    : "0000-01-01";
  const upperBound = cheungdeungje.start_date ?? "9999-12-31";

  return allReports.filter(
    (r) =>
      r.type === "수시형" &&
      r.occurred_date !== null &&
      r.occurred_date > lowerBound &&
      r.occurred_date <= upperBound
  );
}

export default async function Home() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .returns<ReportItem[]>();

  const reports = data ?? [];

  // 카테고리(간호인력 차등제 → 간호간병통합서비스 → 제2차 교대제 → 기타) 순으로 묶고,
  // 같은 카테고리 안에서는 이름이 같은 것끼리 먼저 모으고(예: 야간전담간호사 변경신고 3건),
  // 그 다음 날짜가 가까운 순으로 정렬한다.
  const byNameThenDate = (a: ReportItem, b: ReportItem) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name, "ko");
    const da = targetDate(a);
    const db = targetDate(b);
    if (!da) return 1;
    if (!db) return -1;
    return da.localeCompare(db);
  };

  const groups = CATEGORY_LABELS.map((label, index) => ({
    label,
    items: reports.filter((r) => getCategoryIndex(r.name) === index).sort(byNameThenDate),
  })).filter((g) => g.items.length > 0);

  const sorted = groups.flatMap((g) => g.items);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16 font-sans text-foreground">
      <NetworkMeshBackground className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] w-full opacity-20" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlarmIllustration className="h-10 w-10" />
            <h1 className="text-2xl font-semibold tracking-wide">
              간호인력 신고 알리미
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/upload"
              className="rounded-full border border-border-soft px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              엑셀 업로드
            </Link>
            <Link
              href="/reports/new?type=수시형"
              className="rounded-full border border-border-soft px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              수시신고 등록
            </Link>
            <Link
              href="/reports/new"
              className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-contrast transition-colors hover:bg-accent-strong"
            >
              새 항목 추가
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-border-soft px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>

        {error ? (
          <p className="mt-10 text-sm text-danger">
            목록을 불러오지 못했어요: {error.message}
          </p>
        ) : sorted.length === 0 ? (
          <p className="mt-10 text-sm text-muted">
            아직 등록된 신고 항목이 없어요. 엑셀을 업로드하거나 새 항목을
            추가해보세요.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.label}>
              <h2
                className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${CATEGORY_COLOR_CLASS[group.label]}`}
              >
                {group.label}
              </h2>
              <ul className="flex flex-col gap-4">
            {group.items.map((report) => {
              const date = targetDate(report);
              const days = date ? daysUntil(date) : null;
              const notiType =
                report.type === "정기형" ? getNotificationType(report.name) : null;
              const isCheungdeungje =
                report.name === "간호인력 차등제 신고";
              const related = isCheungdeungje
                ? findRelatedAdhocItems(report, reports)
                : [];

              return (
                <li
                  key={report.id}
                  className="rounded-2xl border border-border-soft bg-surface p-6 shadow-[0_20px_50px_-24px_rgba(91,141,239,0.35)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-medium text-foreground">
                          {report.name}
                        </p>
                        {report.memo ? (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-muted">
                            {report.memo}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span>{report.type}</span>
                        {notiType ? <span>· {notiType}</span> : null}
                        {report.repeat_cycle ? (
                          <span>· {report.repeat_cycle}</span>
                        ) : null}
                        <span
                          className={
                            report.status === "완료"
                              ? "rounded-full bg-accent-soft px-2 py-0.5 text-accent"
                              : "rounded-full bg-accent-soft px-2 py-0.5 text-accent-strong"
                          }
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-accent">
                      {days !== null ? formatDday(days) : "-"}
                    </p>
                  </div>

                  <div className="mt-4 h-px w-full bg-border-soft" />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={completeReport.bind(null, report.id)}>
                      <button
                        type="submit"
                        className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-contrast transition-colors hover:bg-accent-strong"
                      >
                        완료 처리
                      </button>
                    </form>
                    <Link
                      href={`/reports/${report.id}/edit`}
                      className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                    >
                      수정
                    </Link>
                    <DeleteReportButton
                      action={deleteReport.bind(null, report.id)}
                    />
                  </div>

                  {isCheungdeungje ? (
                    <details className="mt-4 rounded-xl bg-background/60 p-3">
                      <summary className="cursor-pointer text-xs font-medium text-muted">
                        지난 완료 이후 수시형 변동 항목 ({related.length}건)
                      </summary>
                      {related.length === 0 ? (
                        <p className="mt-2 text-xs text-muted">
                          해당 기간에 등록된 수시형 항목이 없어요.
                        </p>
                      ) : (
                        <ul className="mt-2 flex flex-col gap-1">
                          {related.map((item) => (
                            <li key={item.id} className="text-xs text-foreground">
                              {item.occurred_date} — {item.memo ?? "(메모 없음)"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </details>
                  ) : null}
                </li>
              );
            })}
              </ul>
            </section>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
