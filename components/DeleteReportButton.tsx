"use client";

export default function DeleteReportButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("이 항목을 삭제할까요? 되돌릴 수 없어요.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-muted transition-colors hover:border-danger hover:text-danger"
      >
        삭제
      </button>
    </form>
  );
}
