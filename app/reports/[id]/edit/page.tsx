import { notFound } from "next/navigation";
import NetworkMeshBackground from "@/components/NetworkMeshBackground";
import ReportForm from "@/components/ReportForm";
import { updateReport } from "@/app/actions/reports";
import { getSupabaseClient } from "@/lib/supabase";
import type { ReportItem } from "@/types/report";

// 신고 항목 수정 화면 (DESIGN.md §1 ④)
export default async function EditReportPage({
  params,
}: PageProps<"/reports/[id]/edit">) {
  const { id } = await params;
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle<ReportItem>();

  if (!data) notFound();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16 font-sans text-foreground">
      <NetworkMeshBackground className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] w-full opacity-20" />
      <div className="relative z-10 mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold tracking-wide">신고 항목 수정</h1>
        <ReportForm
          action={updateReport.bind(null, id)}
          initial={data}
          submitLabel="수정 저장"
        />
      </div>
    </div>
  );
}
