import Link from "next/link";
import type { ReactNode } from "react";

// 가이드 글 상·하단 공통 CTA: 메인 홈(스튜디오)으로 연결
export function GuideCta({
  position,
  href = "/",
  label = "PIXS 스튜디오에서 지금 바로 규격 맞춤 변환하기",
}: {
  position: "top" | "middle" | "bottom";
  href?: string;
  label?: string;
}) {
  const copy =
    position === "top"
      ? "규격을 알았다면 바로 변환해 보세요. 설치 없이 브라우저에서 무료로 처리됩니다."
      : position === "middle"
        ? "읽는 것보다 직접 해보는 게 빠릅니다. 사진을 올리면 규격에 맞게 바로 변환됩니다."
        : "이미지를 서버에 올리지 않고, 내 브라우저에서 규격에 맞춰 한 번에 변환합니다.";
  return (
    <div
      className={`rounded-2xl border border-blue-200 bg-blue-50 px-5 py-5 text-center ${position === "top" ? "mt-6" : "mt-10"}`}
    >
      <p className="text-sm font-semibold text-slate-700 break-keep">{copy}</p>
      <Link
        href={href}
        className="mt-3 inline-block max-w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 break-keep"
      >
        {label}
      </Link>
    </div>
  );
}

// 구조화 데이터(JSON-LD) 삽입: < 문자를 이스케이프해 </script> 주입을 막음
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

// 화면에 보이는 FAQ 배열과 동일한 내용으로 FAQPage 스키마 생성 (화면 내용과 구조화 데이터가 달라지지 않도록 같은 배열 사용)
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function GuideSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 space-y-3">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 break-keep">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 break-keep">{children}</div>
    </section>
  );
}

// GuideSection(h2) 안에서 쓰는 소제목(h3)
export function GuideSub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 pt-1">
      <h3 className="text-base font-bold text-slate-900 break-keep">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-slate-700 break-keep">{children}</div>
    </div>
  );
}

// 규격 표 (모바일에서는 가로 스크롤)
export function SpecTable({ head, rows, caption }: { head: string[]; rows: string[][]; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[420px] text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-100 text-xs text-slate-600">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="px-4 py-2.5 font-semibold text-slate-800">
                    {c}
                  </th>
                ) : (
                  <td key={i} className="px-4 py-2.5 text-slate-700">
                    {c}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GuideNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-slate-700 break-keep">
      {children}
    </p>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <details key={it.q} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">{it.q}</summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 break-keep">{it.a}</p>
        </details>
      ))}
    </div>
  );
}

export const GUIDE_UPDATED = "2026년 10월";

// 하위 페이지가 openGraph/twitter를 직접 지정하면 루트의 공유 이미지가 상속되지 않으므로 명시적으로 연결
export const OG_IMAGES = [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PIXS - 쇼핑몰 올인원 이미지 스튜디오" }];
