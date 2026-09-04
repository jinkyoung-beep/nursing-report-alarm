"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ALL_REGULAR_NAMES, ADHOC_REPORT_NAME, MULTI_INSTANCE_NAME } from "@/lib/notification-type";
import { REPEAT_CYCLES } from "@/types/report";
import type { ReportItem, ReportType } from "@/types/report";
import type { ReportFormState } from "@/app/actions/reports";

const initialState: ReportFormState = {};

export default function ReportForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: ReportFormState, formData: FormData) => Promise<ReportFormState>;
  initial?: Partial<ReportItem>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<ReportType>(initial?.type ?? "정기형");
  const [name, setName] = useState<string>(initial?.name ?? ALL_REGULAR_NAMES[0]);

  const showMemo = type === "수시형" || name === MULTI_INSTANCE_NAME;

  return (
    <form
      action={formAction}
      className="mt-8 flex flex-col gap-5 rounded-2xl border border-border-soft bg-surface p-8"
    >
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-muted">유형</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as ReportType)}
          className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
        >
          <option value="정기형">정기형</option>
          <option value="수시형">수시형</option>
        </select>
      </div>

      {type === "정기형" ? (
        <>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">
              신고 항목명
            </label>
            <select
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            >
              {ALL_REGULAR_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">시작일</label>
            <input
              type="date"
              name="start_date"
              defaultValue={initial?.start_date ?? ""}
              required
              className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">
              반복 주기
            </label>
            <select
              name="repeat_cycle"
              defaultValue={initial?.repeat_cycle ?? REPEAT_CYCLES[1]}
              className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            >
              {REPEAT_CYCLES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <input type="hidden" name="name" value={ADHOC_REPORT_NAME} />
          <p className="text-lg font-medium text-foreground">{ADHOC_REPORT_NAME}</p>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">발생일</label>
            <input
              type="date"
              name="occurred_date"
              defaultValue={initial?.occurred_date ?? ""}
              required
              className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </div>
        </>
      )}

      {showMemo ? (
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted">
            메모 (선택)
          </label>
          <input
            type="text"
            name="memo"
            defaultValue={initial?.memo ?? ""}
            placeholder={type === "수시형" ? "예: 본관20층 김OO" : "예: 본관20층"}
            className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
          />
        </div>
      ) : null}

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "저장 중..." : submitLabel}
        </button>
        <Link
          href="/"
          className="rounded-full border border-border-soft px-5 py-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
