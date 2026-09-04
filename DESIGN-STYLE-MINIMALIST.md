# 디자인 스타일 가이드 — minimalist-ui (참고용)

> 출처: [taste-skill](https://github.com/leonxlnx/taste-skill) 저장소의 `minimalist-skill` (Notion/Linear 감성의 미니멀 스타일).
> taste-skill 자체(설치 스크립트·플러그인)는 설치하지 않았고, 이 문서는 스타일 스펙 내용만 텍스트로 옮겨온 참고 자료다.
>
> **주의**: 이 앱의 공식 디자인은 [DESIGN.md](DESIGN.md) 4번에 정의된 다크 네이비 테마다. 이 문서는 대안 스타일을 검토·비교할 때만 참고하고, DESIGN.md의 결정을 이 문서 내용으로 임의로 덮어쓰지 않는다. minimalist-ui로 실제 화면을 바꾸는 것은 사용자가 명시적으로 요청했을 때만 진행한다.

## 색상 팔레트 (Warm Monochrome + Muted Pastels)

**기본 배경**
- Canvas: `#FFFFFF` 또는 `#F7F6F3` / `#FBFBFA`
- 카드: `#FFFFFF` 또는 `#F9F9F8`
- 테두리/구분선: `#EAEAEA` 또는 `rgba(0,0,0,0.06)`

**강조 색상 (매우 탈포화된 파스텔)**
- 옅은 빨강: 배경 `#FDEBEC` / 텍스트 `#9F2F2D`
- 옅은 파랑: 배경 `#E1F3FE` / 텍스트 `#1F6C9F`
- 옅은 초록: 배경 `#EDF3EC` / 텍스트 `#346538`
- 옅은 노랑: 배경 `#FBF3DB` / 텍스트 `#956400`

**텍스트**
- 본문: `#111111` 또는 `#2F3437` (순검정 금지)
- 보조: `#787774`

## 타이포그래피 규칙

| 용도 | 폰트 선택 | 특성 |
|---|---|---|
| 본문/UI/버튼 | SF Pro Display, Geist Sans, Switzer | 기하학적 산세리프 |
| 헤딩/인용 | Lyon Text, Newsreader, Playfair Display | 세리프, 자간 -0.02~-0.04em, 줄높이 1.1 |
| 코드/메타데이터 | Geist Mono, SF Mono, JetBrains Mono | 모노스페이스 |

금지: Inter, Roboto, Open Sans

## 레이아웃 & 간격 규칙

- 섹션 간격: 매우 큼 (`py-24` ~ `py-32`)
- 콘텐츠 너비: `max-w-4xl` ~ `max-w-5xl`
- 카드 패딩: `24px ~ 40px`
- 카드 테두리: `border: 1px solid #EAEAEA`
- 모서리 반경: `8px` ~ `12px` (최대)

## 컴포넌트 스타일

**버튼 (Primary CTA)**
- 배경 `#111111`, 텍스트 `#FFFFFF`
- 모서리 반경 `4~6px`
- 음영 없음, hover 시 `#333333` 또는 `scale(0.98)`

**태그/배지**
- 알약형(`border-radius: 9999px`)
- 초소형 타이포(`text-xs`), 대문자, 자간 `0.05em`
- 뮤티드 파스텔 배경(위 강조색 팔레트 사용)

**아코디언**
- 컨테이너 박스 없이 `border-bottom: 1px solid #EAEAEA`로만 구분
- 깔끔한 `+`/`-` 아이콘

**윈도우 크롬(macOS 스타일)**
- 흰색 상단바 + 작은 회색 원 3개(윈도우 컨트롤)

## 아이콘 & 이미지

- 시스템 아이콘: Phosphor Icons(Bold/Fill) 또는 Radix UI Icons
- 일러스트레이션: 단색 스케치, 뮤티드 파스텔 채우기
- 사진: 탈색, 따뜻한 톤, `opacity: 0.04` 그레인 오버레이
- 배경: 매우 낮은 불투명도의 기하학 패턴 또는 방사형 그래디언트

## 모션 & 마이크로 애니메이션

- 스크롤 진입: fade-in + `translateY(12px)` → `opacity: 0`, `600ms`, `cubic-bezier(0.16,1,0.3,1)` (IntersectionObserver 사용, scroll 이벤트 금지)
- 호버(카드): 아주 옅은 섀도우 `0 2px 8px rgba(0,0,0,0.04)`, 200ms
- 호버(버튼): `scale(0.98)`
- 리스트/그리드 계단식 표시: `animation-delay: calc(var(--index) * 80ms)`
- 배경 앰비언트: 느리게 움직이는 방사형 그래디언트 블롭(20초+), `opacity: 0.02~0.04`
- 성능: `transform`/`opacity`만 애니메이션, `will-change` 최소 사용

## 절대 금지사항

- 무거운 그림자(`shadow-md`, `shadow-lg`, `shadow-xl`)
- 그래디언트, 네온색, 글래스모피즘
- 큰 컨테이너에 `rounded-full`
- 이모지
- 상투적인 SaaS 카피("Seamless", "Unleash", "Game-changer" 등)

## 참고 시안

이 스타일을 "신고 항목 목록 화면"에 적용한 시안: https://claude.ai/code/artifact/2157d3c0-9bc6-43bf-a320-447d090fbfcf
