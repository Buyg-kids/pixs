import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CATEGORY_LABELS,
  GUIDES,
  getGuide,
  relatedLinks,
  type Block,
  type Guide,
} from "@/data/guides";
import { SITE_URL } from "@/lib/site";
import {
  Faq,
  faqJsonLd,
  GuideCta,
  GuideNote,
  GuideSection,
  JsonLd,
  OG_IMAGES,
  SpecTable,
} from "../_components/GuideParts";

// 목록에 없는 주소(오타·존재하지 않는 slug)도 첫 요청부터 완전한 404 응답을 주도록, 전체 경로가 정적으로 렌더링되어야 한다고 요구
export const ensureStatic = "navigation";

// 모든 심층 가이드를 빌드 시점에 정적으로 생성. (cacheComponents 사용 시 dynamicParams 설정은 지원되지 않으므로 알 수 없는 slug는 아래에서 notFound() 처리)
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  const url = `/guide/${g.slug}`;
  return {
    title: g.metaTitle,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: g.metaTitle,
      description: g.description,
      type: "article",
      url,
      siteName: "PIXS",
      locale: "ko_KR",
      publishedTime: g.published,
      images: OG_IMAGES,
    },
    twitter: { card: "summary_large_image", title: g.metaTitle, description: g.description, images: ["/opengraph-image"] },
  };
}

function articleJsonLd(g: Guide) {
  const url = `${SITE_URL}/guide/${g.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    inLanguage: "ko",
    datePublished: g.published,
    dateModified: g.published,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [`${SITE_URL}/opengraph-image`],
    author: { "@type": "Organization", name: "PIXS", url: SITE_URL },
    publisher: { "@type": "Organization", name: "PIXS", url: SITE_URL },
  };
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.t) {
    case "p":
      return <p>{block.text}</p>;
    case "h3":
      return <h3 className="pt-2 text-base font-bold text-slate-900 break-keep">{block.text}</h3>;
    case "ul":
      return (
        <ul className="list-disc space-y-1.5 pl-5">
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-1.5 pl-5">
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ol>
      );
    case "check":
      return (
        <ul className="space-y-1.5">
          {block.items.map((it) => (
            <li key={it} className="flex gap-2">
              <span className="text-blue-600" aria-hidden>
                ✓
              </span>
              {it}
            </li>
          ))}
        </ul>
      );
    case "table":
      return <SpecTable caption={block.caption} head={block.head} rows={block.rows} />;
    case "note":
      return <GuideNote>{block.text}</GuideNote>;
  }
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const related = relatedLinks(g);
  const cat = CATEGORY_LABELS[g.category];
  const midIndex = Math.floor(g.sections.length / 2); // 본문 중간(절반 지점 뒤)에 CTA

  return (
    <article>
      <JsonLd data={articleJsonLd(g)} />
      <JsonLd data={faqJsonLd(g.faq)} />

      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span>{" "}
        <Link href="/guide" className="hover:text-blue-600">규격 가이드</Link> <span aria-hidden>/</span> {cat.title}
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">{g.title}</h1>
      <p className="mt-2 text-xs text-slate-500">
        {cat.title} · PIXS 셀러 가이드 · {g.published.replace(/-/g, ".")} 작성
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-sm font-bold text-slate-900">한눈에 요약</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-700 break-keep">
          {g.summary.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-blue-600" aria-hidden>
                ●
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <GuideCta position="top" href={g.cta.href} label={g.cta.label} />

      {g.sections.map((sec, i) => (
        <div key={sec.h2}>
          <GuideSection title={sec.h2}>
            {sec.blocks.map((b, j) => (
              <RenderBlock key={j} block={b} />
            ))}
          </GuideSection>
          {i === midIndex - 1 && <GuideCta position="middle" href={g.cta.href} label={g.cta.label} />}
        </div>
      ))}

      <GuideSection title="자주 묻는 질문">
        <Faq items={g.faq} />
      </GuideSection>

      <GuideNote>
        이 글의 수치와 기준은 PIXS가 정리한 권장 값이며 마켓·플랫폼 정책에 따라 바뀔 수 있습니다. 등록 전 각 판매자센터의 최신 안내를 함께 확인하세요.
      </GuideNote>

      <GuideCta position="bottom" href={g.cta.href} label={g.cta.label} />

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="text-xl font-bold tracking-tight text-slate-900 break-keep">
            함께 읽으면 좋은 셀러 가이드
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="block h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm"
                >
                  <p className="text-sm font-bold text-slate-900 break-keep">{r.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 break-keep">{r.desc}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-blue-600">읽어보기 →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
