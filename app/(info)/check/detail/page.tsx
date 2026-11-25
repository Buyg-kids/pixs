import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Faq, faqJsonLd, GuideSection, JsonLd, OG_IMAGES } from "../../../guide/_components/GuideParts";
import DetailCheckTool from "./DetailCheckTool";

const TITLE = "상세페이지 규격 검사기 (가로폭 통일·조각 길이·용량 무료 검사) | PIXS";
const DESCRIPTION =
  "분할해 올릴 상세페이지 이미지들의 가로폭 통일 여부, 마켓 기준 가로폭(860·780·1000px), 조각 세로 길이, 장당·전체 용량을 한꺼번에 검사합니다. 서버에 업로드하지 않고 브라우저에서만 검사합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["상세페이지 규격 검사", "상세페이지 가로폭 확인", "상세페이지 분할 검사", "상세페이지 용량 확인", "스마트스토어 상세페이지 860px"],
  alternates: { canonical: "/check/detail" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/check/detail", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "상세페이지 이미지는 몇 장까지 올려서 검사할 수 있나요?",
    a: "한 번에 최대 40장까지 검사합니다. 파일명 순서(숫자 포함)대로 정렬해 보여 주므로 업로드할 순서와 맞는지도 함께 확인할 수 있습니다.",
  },
  {
    q: "가로폭이 마켓 기준과 다르면 어떻게 하나요?",
    a: "비율을 유지한 채 기준 가로폭으로 리사이즈하세요. 세로 길이는 자동으로 따라옵니다. PIXS의 상세페이지 분할 탭에서 가로폭을 고르면 리사이즈와 분할을 한 번에 할 수 있습니다.",
  },
  {
    q: "조각 세로 길이 기준은 어떻게 정했나요?",
    a: "스마트스토어·자사몰·패션·글로벌은 조각당 3,000px 안팎, 쿠팡 계열은 5,000px 이내를 로딩 안정성 면에서 권장하는 PIXS 정리 기준입니다. 마켓의 정확한 제한은 아니므로 각 판매자센터의 안내를 함께 확인하세요.",
  },
  {
    q: "내 이미지가 서버로 전송되나요?",
    a: "아니요. 이 검사기는 이미지의 가로·세로 크기와 파일 용량만 브라우저에서 읽으며 파일은 어디에도 업로드되지 않습니다.",
  },
];

const LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PIXS 상세페이지 규격 검사기",
  url: `${SITE_URL}/check/detail`,
  applicationCategory: "DesignApplication",
  operatingSystem: "All",
  inLanguage: "ko",
  description: "분할 상세페이지 이미지의 가로폭 통일, 조각 길이, 용량을 브라우저에서 무료로 검사하는 도구",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};

export default function DetailCheckPage() {
  return (
    <article>
      <JsonLd data={LD} />
      <JsonLd data={faqJsonLd(FAQ)} />

      <nav aria-label="검수기 종류" className="mb-5 flex gap-2 text-sm font-semibold">
        <Link href="/check" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:border-blue-300">
          대표이미지 검수기
        </Link>
        <span className="rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-blue-800" aria-current="page">
          상세페이지 검사기
        </span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">상세페이지 규격 검사기</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        분할해서 올릴 상세페이지 조각들을 한꺼번에 올리면 가로폭이 모두 같은지, 마켓 기준 가로폭에 맞는지, 조각 세로 길이와 용량이 적당한지를 표로 보여 줍니다. 파일은 서버로 전송되지 않고 크기와 용량만 브라우저에서 읽습니다.
      </p>

      <div className="mt-6">
        <DetailCheckTool />
      </div>

      <GuideSection title="이 검사기가 확인하는 것">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>가로폭 통일:</strong> 조각마다 폭이 다르면 업로드 후 글자 크기와 여백이 들쭉날쭉해집니다.
          </li>
          <li>
            <strong>마켓 기준 가로폭:</strong> 스마트스토어 860px, 쿠팡·G마켓·11번가 780px, 패션 전문몰 1000px, 글로벌 970px (PIXS 정리 기준)
          </li>
          <li>
            <strong>조각 세로 길이:</strong> 너무 길면 로딩이 느려지고, 300px보다 얇으면 이음새가 많아집니다.
          </li>
          <li>
            <strong>장당·전체 용량:</strong> 장당 3MB 이하를 권장하고, 10MB를 넘으면 FAIL로 표시합니다. 전체 합계는 15MB 안쪽을 참고 기준으로 삼습니다.
          </li>
        </ul>
        <p>
          분할 방식이 고민이라면 <Link href="/guide/detail-page-split-vs-single" className="font-semibold text-blue-600 hover:underline">통이미지 vs 세로 분할 비교</Link>,{" "}
          <Link href="/guide/mobile-commerce-image-optimization" className="font-semibold text-blue-600 hover:underline">모바일 상세페이지 해상도·글자 크기 설정법</Link>을 참고하세요.
        </p>
      </GuideSection>

      <GuideSection title="자주 묻는 질문">
        <Faq items={FAQ} />
      </GuideSection>
    </article>
  );
}
