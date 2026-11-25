import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_LABELS, GUIDES, STATIC_GUIDES, type GuideCategory } from "@/data/guides";
import { GuideCta, GuideNote, GuideSection, GUIDE_UPDATED, OG_IMAGES } from "./_components/GuideParts";

const TITLE = "셀러 이미지 가이드 - 마켓별 규격·상세페이지 편집·용량 최적화 | PIXS";
const DESCRIPTION =
  "스마트스토어·쿠팡·패션 플랫폼 대표이미지 규격부터 상세페이지 분할, 용량·화질 최적화까지 이커머스 셀러가 바로 쓰는 실무 가이드 15편을 카테고리별로 모았습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["이커머스 썸네일 규격", "대표이미지 사이즈", "상세페이지 가로 크기", "마켓별 이미지 규격", "셀러 이미지 가이드", "이미지 용량 줄이기"],
  alternates: { canonical: "/guide" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/guide", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const ORDER: GuideCategory[] = ["market", "detail", "quality"];

interface Card {
  href: string;
  title: string;
  desc: string;
}

function cardsOf(category: GuideCategory): Card[] {
  const statics = STATIC_GUIDES.filter((s) => s.category === category).map((s) => ({ href: s.href, title: s.title, desc: s.desc }));
  const articles = GUIDES.filter((g) => g.category === category).map((g) => ({ href: `/guide/${g.slug}`, title: g.title, desc: g.summary[0] }));
  return [...statics, ...articles];
}

export default function GuideHubPage() {
  const total = STATIC_GUIDES.length + GUIDES.length;
  return (
    <article>
      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span> 규격 가이드
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">
        셀러 이미지 가이드
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        상품 등록 때마다 헷갈리는 이미지 작업을 {total}편의 실무 가이드로 정리했습니다. 마켓별 대표이미지 규격, 상세페이지 분할과 모바일 최적화, 용량·화질 관리까지 필요한 주제를 골라 읽고,
        바로 PIXS에서 변환하세요. (PIXS 정리 기준: {GUIDE_UPDATED})
      </p>

      <GuideCta position="top" />

      <p className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 break-keep">
        🔍 이미지를 올리기 전에 규격을 먼저 확인하고 싶다면 <Link href="/check" className="font-semibold text-blue-600 hover:underline">대표이미지 규격 검수기</Link>로 쿠팡 순백색 배경, 비율, 용량을 무료로 검사해 보세요.
      </p>

      {ORDER.map((cat) => (
        <GuideSection key={cat} id={cat} title={CATEGORY_LABELS[cat].title}>
          <p className="text-slate-500">{CATEGORY_LABELS[cat].desc}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {cardsOf(cat).map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm sm:p-5"
                >
                  <h3 className="text-base font-bold text-slate-900 break-keep">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 break-keep">{c.desc}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-blue-600">가이드 보기 →</span>
                </Link>
              </li>
            ))}
          </ul>
        </GuideSection>
      ))}

      <GuideSection title="이런 분들께 도움이 됩니다">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>디자이너 없이 혼자 상품을 등록하는 개인 셀러·1인 창업자</li>
          <li>마켓마다 다른 대표이미지 규격 때문에 같은 사진을 여러 번 편집하던 분</li>
          <li>긴 상세페이지를 마켓 권장 가로폭에 맞추고 용량 제한에 맞게 나누고 싶은 분</li>
          <li>위탁판매·구매대행으로 수십 장의 상품 사진을 한꺼번에 정리해야 하는 분</li>
        </ul>
        <GuideNote>
          가이드의 수치는 PIXS가 정리한 권장 기준입니다. 마켓 정책은 수시로 바뀔 수 있으니 등록 전 각 판매자센터의 최신 안내도 함께 확인하세요.
        </GuideNote>
      </GuideSection>

      <GuideCta position="bottom" />
    </article>
  );
}
