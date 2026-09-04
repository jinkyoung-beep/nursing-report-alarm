"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { getSupabaseClient } from "@/lib/supabase";
import { getNextStartDate } from "@/lib/report-schedule";
import {
  ALL_REGULAR_NAMES,
  ADHOC_REPORT_NAME,
  MULTI_INSTANCE_NAME,
} from "@/lib/notification-type";
import { REPEAT_CYCLES } from "@/types/report";
import type { ReportItem, RepeatCycle } from "@/types/report";

// 완료 처리: 완료 시점을 기록하고, 정기형은 반복 주기만큼 다음 시작일을 계산해 갱신한다.
// "비정기"는 다음 시작일이 없으므로 완료 상태로 그대로 둔다 (PRD.md 5번 40행).
export async function completeReport(id: string) {
  const supabase = getSupabaseClient();

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single<ReportItem>();

  if (fetchError || !report) {
    throw new Error("완료 처리할 항목을 찾을 수 없습니다.");
  }

  const nowIso = new Date().toISOString();

  if (report.type === "정기형" && report.repeat_cycle && report.start_date) {
    const nextStart = getNextStartDate(report.start_date, report.repeat_cycle);

    const { error } = await supabase
      .from("reports")
      .update(
        nextStart
          ? { status: "대기", completed_at: nowIso, start_date: nextStart }
          : { status: "완료", completed_at: nowIso }
      )
      .eq("id", id);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("reports")
      .update({ status: "완료", completed_at: nowIso })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function deleteReport(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export type ReportFormState = { error?: string };

// 등록·수정 화면(DESIGN.md §1 ④) 폼 값을 검증해서 저장할 형태로 바꾼다.
function buildReportFromForm(formData: FormData): { row: Partial<ReportItem>; error?: string } {
  const type = formData.get("type");

  if (type === "정기형") {
    const name = String(formData.get("name") ?? "");
    const startDate = String(formData.get("start_date") ?? "");
    const repeatCycle = String(formData.get("repeat_cycle") ?? "");
    const memo = String(formData.get("memo") ?? "").trim() || null;

    if (!ALL_REGULAR_NAMES.includes(name)) {
      return { row: {}, error: "신고 항목명을 목록에서 선택해주세요." };
    }
    if (!startDate) {
      return { row: {}, error: "시작일을 입력해주세요." };
    }
    if (!(REPEAT_CYCLES as readonly string[]).includes(repeatCycle)) {
      return { row: {}, error: "반복 주기를 선택해주세요." };
    }

    return {
      row: {
        type: "정기형",
        name,
        start_date: startDate,
        repeat_cycle: repeatCycle as RepeatCycle,
        occurred_date: null,
        memo: name === MULTI_INSTANCE_NAME ? memo : null,
      },
    };
  }

  if (type === "수시형") {
    const occurredDate = String(formData.get("occurred_date") ?? "");
    const memo = String(formData.get("memo") ?? "").trim() || null;

    if (!occurredDate) {
      return { row: {}, error: "발생일을 입력해주세요." };
    }

    return {
      row: {
        type: "수시형",
        name: ADHOC_REPORT_NAME,
        occurred_date: occurredDate,
        start_date: null,
        repeat_cycle: null,
        memo,
      },
    };
  }

  return { row: {}, error: "유형을 선택해주세요." };
}

export async function createReport(
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const { row, error: validationError } = buildReportFromForm(formData);
  if (validationError) return { error: validationError };

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("reports").insert(row);
  if (error) return { error: `저장하지 못했어요: ${error.message}` };

  revalidatePath("/");
  redirect("/");
}

export async function updateReport(
  id: string,
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const { row, error: validationError } = buildReportFromForm(formData);
  if (validationError) return { error: validationError };

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("reports").update(row).eq("id", id);
  if (error) return { error: `저장하지 못했어요: ${error.message}` };

  revalidatePath("/");
  redirect("/");
}

export type UploadState = { error?: string; success?: string };

// 엑셀 셀 값을 "YYYY-MM-DD" 문자열로 바꾼다. 날짜로 읽을 수 없으면 null.
function normalizeDate(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value ?? "").trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

// 엑셀 일괄 업로드 (DESIGN.md §1 ③). 지정된 열(신고 항목명·유형·시작일·반복 주기·발생일·메모)만
// 읽고, 그 외 열(주민등록번호·이름 등)이 있어도 읽지도 저장하지도 않는다 (PRD.md 5번).
export async function uploadReportsExcel(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "엑셀 파일을 선택해주세요." };
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (rows.length === 0) {
    return { error: "엑셀에 내용이 없어요." };
  }

  const requiredHeaders = ["신고 항목명", "유형", "시작일", "반복 주기", "발생일"];
  const actualHeaders = Object.keys(rows[0]);
  const missingHeaders = requiredHeaders.filter((h) => !actualHeaders.includes(h));
  if (missingHeaders.length > 0) {
    return { error: `엑셀에 다음 열이 없어요: ${missingHeaders.join(", ")}` };
  }

  const toInsert: Partial<ReportItem>[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const lineNo = i + 2; // 1번째 줄은 제목 줄
    const name = String(r["신고 항목명"] ?? "").trim();
    const type = String(r["유형"] ?? "").trim();
    const memo = String(r["메모"] ?? "").trim() || null;

    if (!name) return { error: `${lineNo}번째 줄: 신고 항목명이 비어 있어요.` };
    if (type !== "정기형" && type !== "수시형") {
      return { error: `${lineNo}번째 줄: 유형은 "정기형" 또는 "수시형"이어야 해요.` };
    }

    if (type === "정기형") {
      if (!ALL_REGULAR_NAMES.includes(name)) {
        return { error: `${lineNo}번째 줄: "${name}"은(는) 알 수 없는 정기형 항목명이에요.` };
      }
      const startDate = normalizeDate(r["시작일"]);
      const repeatCycle = String(r["반복 주기"] ?? "").trim();
      if (!startDate) return { error: `${lineNo}번째 줄: 시작일이 비어 있어요.` };
      if (!(REPEAT_CYCLES as readonly string[]).includes(repeatCycle)) {
        return {
          error: `${lineNo}번째 줄: 반복 주기 값("${repeatCycle}")이 올바르지 않아요.`,
        };
      }
      toInsert.push({
        name,
        type: "정기형",
        start_date: startDate,
        repeat_cycle: repeatCycle as RepeatCycle,
        memo: name === MULTI_INSTANCE_NAME ? memo : null,
      });
    } else {
      if (name !== ADHOC_REPORT_NAME) {
        return {
          error: `${lineNo}번째 줄: 수시형 항목명은 "${ADHOC_REPORT_NAME}"이어야 해요.`,
        };
      }
      const occurredDate = normalizeDate(r["발생일"]);
      if (!occurredDate) return { error: `${lineNo}번째 줄: 발생일이 비어 있어요.` };
      toInsert.push({ name, type: "수시형", occurred_date: occurredDate, memo });
    }
  }

  const supabase = getSupabaseClient();
  const { data: existing } = await supabase
    .from("reports")
    .select("name, memo, type")
    .returns<Pick<ReportItem, "name" | "memo" | "type">[]>();

  // 정기형은 이름이 이미 있으면 건너뛴다 (야간전담간호사 변경신고는 병동별로 여러 건을 허용).
  const existingRegularNames = new Set(
    (existing ?? [])
      .filter((r) => r.type === "정기형" && r.name !== MULTI_INSTANCE_NAME)
      .map((r) => r.name)
  );
  const existingMultiInstanceKeys = new Set(
    (existing ?? [])
      .filter((r) => r.name === MULTI_INSTANCE_NAME)
      .map((r) => `${r.name}::${r.memo ?? ""}`)
  );

  const finalRows: Partial<ReportItem>[] = [];
  let skipped = 0;

  for (const row of toInsert) {
    if (row.type === "정기형") {
      if (row.name === MULTI_INSTANCE_NAME) {
        const key = `${row.name}::${row.memo ?? ""}`;
        if (existingMultiInstanceKeys.has(key)) {
          skipped++;
          continue;
        }
        existingMultiInstanceKeys.add(key);
      } else if (row.name && existingRegularNames.has(row.name)) {
        skipped++;
        continue;
      } else if (row.name) {
        existingRegularNames.add(row.name);
      }
    }
    finalRows.push(row);
  }

  if (finalRows.length > 0) {
    const { error } = await supabase.from("reports").insert(finalRows);
    if (error) return { error: `저장 중 오류가 발생했어요: ${error.message}` };
  }

  revalidatePath("/");
  return {
    success: `${finalRows.length}건 등록했어요${
      skipped > 0 ? ` (이미 있어서 건너뛴 항목 ${skipped}건)` : ""
    }.`,
  };
}
