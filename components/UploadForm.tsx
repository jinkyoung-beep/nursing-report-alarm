"use client";

import { useActionState } from "react";
import { uploadReportsExcel, type UploadState } from "@/app/actions/reports";

const initialState: UploadState = {};

export default function UploadForm() {
  const [state, formAction, pending] = useActionState(uploadReportsExcel, initialState);

  return (
    <form
      action={formAction}
      className="mt-8 flex flex-col gap-5 rounded-2xl border border-border-soft bg-surface p-8"
    >
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-muted">
          엑셀 파일 (.xlsx)
        </label>
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          required
          className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-sm text-foreground outline-none file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-xs file:font-medium file:text-accent-contrast"
        />
      </div>

      <p className="text-xs leading-5 text-muted">
        필수 열: 신고 항목명 · 유형(정기형/수시형) · 시작일 · 반복 주기 · 발생일 (메모는
        선택). 이미 등록된 정기형 항목명은 건너뛰고, 수시형은 항상 새 건으로
        추가됩니다.
      </p>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-accent">{state.success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "업로드 중..." : "업로드"}
      </button>
    </form>
  );
}
