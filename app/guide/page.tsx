import type { Metadata } from "next";
import Link from "next/link";
import { GuideCta, GuideNote, GuideSection, GUIDE_UPDATED, OG_IMAGES } from "./_components/GuideParts";

const TITLE = "마켓별 이미지 규격 가이드 - 이커머스 썸네일 규격·대표이미지 사이즈 | PIXS";
const DESCRIPTION =
  "스마트스토어·쿠팡 등 마켓별 대표이미지 사이즈, 상세페이지 가로 크기, 배너·프로필 규격을 한눈에 정리했습니다. 이커머스 썸네일 규격을 확인하고 PIXS에서 바로 변환하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["이커머스 썸네일 규격", "대표이미지 사이즈", "상세페이지 가로 크기", "마켓별 이미지 규격", "스마트스토어 이미지 규격", "쿠팡 이미지 규격"],
  alternates: { canonical: "/guide" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/guide", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const GUIDES = [
  {
    href: "/guide/smartstore",
    title: "네이버 스마트스토어 이미지 규격 가이드",
    desc: "대표이미지 1000x1000, 상세페이지 가로 860px, 스토어 로고·배너 사이즈까지 한 번에 정리했습니다.",
    tags: ["대표이미지 1000x1000", "상세페이지 860px"],
  },
  {
    href: "/guide/coupang",
    title: "쿠팡 대표이미지 & 상세페이지 권장 규격 가이드",
    desc: "순백색 배경과 상품 면적 기준, 상세페이지 가로 780px, 판매자 프로필·브랜드 배너 사이즈를 확인하세요.",
    tags: ["흰색 배경 필수", "상세페이지 780px"],
  },
];

export default function GuideHubPage() {
  return (
    <article>
      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span> 규격 가이드
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">
        마켓별 이미지 규격 가이드
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        상품 등록 때마다 헷갈리는 이커머스 썸네일 규격을 마켓별로 정리했습니다. 대표이미지 사이즈, 상세페이지 가로 크기,
        배너·프로필 규격을 확인하고, 아래 버튼으로 PIXS에서 바로 변환하세요. (PIXS 정리 기준: {GUIDE_UPDATED})
      </p>

      <GuideCta position="top" />

      <GuideSection title="마켓별 가이드 바로가기">
        <ul className="grid gap-3 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <li key={g.href}>
              <Link
                href={g.href}
                className="block h-full rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm"
              >
                <h3 className="text-base font-bold text-slate-900 break-keep">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 break-keep">{g.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.tags.map((t) => (
                    <span key={t} className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="mt-3 inline-block text-sm font-semibold text-blue-600">가이드 보기 →</span>
              </Link>
            </li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection title="이런 분들께 도움이 됩니다">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>디자이너 없이 혼자 상품을 등록하는 개인 셀러·1인 창업자</li>
          <li>마켓마다 다른 대표이미지 규격 때문에 같은 사진을 여러 번 편집하던 분</li>
          <li>긴 상세페이지를 마켓 권장 가로폭에 맞추고 용량 제한에 맞게 나누고 싶은 분</li>
        </ul>
        <GuideNote>
          가이드의 수치는 PIXS가 정리한 권장 기준입니다. 마켓 정책은 수시로 바뀔 수 있으니 등록 전 각 판매자센터의 최신 안내도 함께 확인하세요.
        </GuideNote>
      </GuideSection>

      <GuideCta position="bottom" />
    </article>
  );
}
