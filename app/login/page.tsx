"use client";

import { useActionState } from "react";
import AlarmIllustration from "@/components/AlarmIllustration";
import NetworkMeshBackground from "@/components/NetworkMeshBackground";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 font-sans text-foreground">
      <NetworkMeshBackground className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] w-full opacity-20" />

      <div className="relative z-10 flex flex-col items-center">
        <AlarmIllustration className="h-20 w-20" />
        <p className="mt-4 text-xs uppercase tracking-[0.35em] text-accent">
          Nursing Report Alarm
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-wide">
          간호인력 신고 알리미
        </h1>

        <form
          action={formAction}
          className="mt-10 w-full max-w-sm rounded-2xl border border-border-soft bg-surface p-8"
        >
          <label
            htmlFor="password"
            className="text-xs uppercase tracking-[0.2em] text-muted"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            required
            className="mt-2 w-full rounded-lg border border-border-soft bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
          />

          {state.error ? (
            <p className="mt-3 text-sm text-danger">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {pending ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
