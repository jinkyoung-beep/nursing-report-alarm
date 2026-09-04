import NetworkMeshBackground from "@/components/NetworkMeshBackground";
import ReportForm from "@/components/ReportForm";
import { createReport } from "@/app/actions/reports";

// 신고 항목 추가 화면 (DESIGN.md §1 ④)
// ?type=수시형으로 들어오면 수시신고 발생일 입력 상태로 바로 시작한다 (홈 화면의 "수시신고 등록" 버튼).
export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isAdhoc = type === "수시형";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16 font-sans text-foreground">
      <NetworkMeshBackground className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] w-full opacity-20" />
      <div className="relative z-10 mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold tracking-wide">
          {isAdhoc ? "간호간병통합서비스 수시신고 등록" : "새 신고 항목 추가"}
        </h1>
        <ReportForm
          action={createReport}
          submitLabel="등록"
          initial={isAdhoc ? { type: "수시형" } : undefined}
        />
      </div>
    </div>
  );
}
