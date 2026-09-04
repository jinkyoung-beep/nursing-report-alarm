import Link from "next/link";
import NetworkMeshBackground from "@/components/NetworkMeshBackground";
import UploadForm from "@/components/UploadForm";

// 엑셀 업로드 화면 (DESIGN.md §1 ③)
export default function UploadPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16 font-sans text-foreground">
      <NetworkMeshBackground className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] w-full opacity-20" />
      <div className="relative z-10 mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold tracking-wide">엑셀 업로드</h1>
        <UploadForm />
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-muted transition-colors hover:text-foreground"
        >
          ← 목록으로
        </Link>
      </div>
    </div>
  );
}
