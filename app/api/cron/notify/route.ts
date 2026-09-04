import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { todayKST } from "@/lib/report-schedule";
import { getDueLabel } from "@/lib/notification-schedule";
import { sendNotificationEmail } from "@/lib/mailer";
import type { ReportItem } from "@/types/report";

// 매일 한국시간 오전 9시에 Vercel Cron이 호출한다 (vercel.json 참고).
// CRON_SECRET 값이 Authorization 헤더와 일치할 때만 처리한다 (PRD.md 5번, CLAUDE.md "알림 규칙").
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "인증에 실패했습니다." }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  const { data: reports, error } = await supabase.from("reports").select("*").eq("status", "대기");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = todayKST();
  const sent: { id: string; name: string; label: string }[] = [];

  for (const report of (reports ?? []) as ReportItem[]) {
    const label = getDueLabel(report, today);
    if (!label) continue;

    const lines = [
      `신고 항목: ${report.name}`,
      `알림 시점: ${label}`,
      report.type === "정기형" ? `시작일: ${report.start_date}` : `마감일: ${report.deadline_date}`,
      report.memo ? `메모: ${report.memo}` : null,
    ].filter((line): line is string => Boolean(line));

    await sendNotificationEmail(`[신고 알림] ${report.name} (${label})`, lines.join("\n"));

    const { error: updateError } = await supabase
      .from("reports")
      .update({ last_notified_on: today })
      .eq("id", report.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    sent.push({ id: report.id, name: report.name, label });
  }

  return NextResponse.json({ ok: true, today, sent });
}
