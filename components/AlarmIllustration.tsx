// 알림종(벨) 모양의 단순한 도형 그림. 사진이 아니라 팔레트 색으로 직접 그렸다 (DESIGN.md 4번 참고)
export default function AlarmIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="var(--accent-soft)" />
      <rect x="94" y="28" width="12" height="16" rx="6" fill="var(--accent)" />
      <path
        d="M100 40 C68 40 52 66 52 98 L52 132 L148 132 L148 98 C148 66 132 40 100 40 Z"
        fill="var(--accent)"
      />
      <rect x="44" y="132" width="112" height="16" rx="8" fill="var(--accent)" />
      <circle cx="100" cy="160" r="9" fill="var(--accent)" />
      <circle cx="150" cy="46" r="18" fill="var(--accent-strong)" />
      <path
        d="M142 46 l6 6 l12 -14"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
