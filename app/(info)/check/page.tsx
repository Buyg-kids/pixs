import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Faq, faqJsonLd, GuideSection, JsonLd, OG_IMAGES } from "../../guide/_components/GuideParts";
import CheckTool from "./CheckTool";

const TITLE = "쿠팡·스마트스토어 대표이미지 규격 검수기 (순백색 배경·비율·용량 무료 검사) | PIXS";
const DESCRIPTION =
  "대표이미지를 올리기 전에 쿠팡 순백색 배경(RGB 255), 상품 면적, 1:1·3:4 비율, 해상도, 용량을 무료로 검사하세요. 서버에 업로드하지 않고 브라우저에서만 검사하며 수정 방법까지 알려 줍니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["쿠팡 대표이미지 검사", "쿠팡 썸네일 흰색 배경 확인", "이미지 규격 검사", "대표이미지 반려 확인", "스마트스토어 이미지 규격 검사"],
  alternates: { canonical: "/check" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/check", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "쿠팡 썸네일의 배경이 순백색인지 어떻게 확인하나요?",
    a: "검수기는 이미지 네 변의 모든 픽셀이 정확히 RGB(255, 255, 255)인지 하나씩 검사합니다. 눈에는 흰색이지만 (254, 254, 254) 같은 값이 섞여 있으면 몇 개가 어긋나는지까지 알려 줍니다.",
  },
  {
    q: "내 이미지가 서버로 전송되나요?",
    a: "아니요. 파일 읽기부터 픽셀 분석까지 모두 내 브라우저의 Canvas에서만 실행되며, 이미지는 어디에도 업로드되거나 저장되지 않습니다.",
  },
  {
    q: "검사를 통과하면 마켓 등록이 보장되나요?",
    a: "아닙니다. 검수기는 자동으로 측정할 수 있는 규격(해상도, 비율, 용량, 형식, 배경, 상품 면적)만 확인합니다. 텍스트·로고·워터마크 등 내용 검수는 마켓이 별도로 하며, 규격 수치도 PIXS 정리 기준이라 마켓 정책에 따라 달라질 수 있습니다.",
  },
  {
    q: "상품 면적 비율은 어떻게 계산하나요?",
    a: "흰색에 가까운 배경이 아닌 픽셀을 모두 감싸는 사각형(바운딩 박스)의 면적을 전체 이미지 면적으로 나눈 근사값입니다. 그림자나 길쭉한 상품은 실제 판단과 다를 수 있어 '주의'로만 표시합니다.",
  },
];

const LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PIXS 대표이미지 검수기",
  url: `${SITE_URL}/check`,
  applicationCategory: "DesignApplication",
  operatingSystem: "All",
  inLanguage: "ko",
  description: "쿠팡·스마트스토어·패션 플랫폼 대표이미지의 배경, 비율, 해상도, 용량을 브라우저에서 무료로 검사하는 도구",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};

export default function CheckPage() {
  return (
    <article>
      <JsonLd data={LD} />
      <JsonLd data={faqJsonLd(FAQ)} />

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">대표이미지 규격 검수기</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        마켓에 올리기 전에 대표이미지가 규격에 맞는지 미리 확인하세요. 마켓을 고르고 이미지를 올리면 해상도, 비율, 용량, 형식, 투명 배경, 순백색 배경, 상품 면적을 한 번에 검사해 PASS·주의·FAIL로 알려 주고, 수정 방법까지
        안내합니다. 이미지는 서버로 전송되지 않습니다.
      </p>

      <div className="mt-6">
        <CheckTool />
      </div>

      <GuideSection title="이 검수기가 확인하는 것">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>순백색 배경:</strong> 네 변의 모든 픽셀이 정확히 RGB(255, 255, 255)인지 검사합니다. 쿠팡은 이 값이 어긋나면 반려될 수 있습니다.
          </li>
          <li>
            <strong>비율·해상도:</strong> 마켓별 권장 비율(1:1, 3:4)과 짧은 변의 최소·권장 픽셀을 비교합니다.
          </li>
          <li>
            <strong>용량·형식:</strong> 업로드 한도와 로딩 최적화 권장 용량, JPG·PNG 여부를 확인합니다.
          </li>
          <li>
            <strong>투명 배경:</strong> JPG로 바꿀 때 검은 배경이 되는 문제를 미리 알려 줍니다.
          </li>
          <li>
            <strong>상품 면적:</strong> 쿠팡 85% 기준에 대한 근사 비율과 상품 영역을 이미지 위에 표시합니다.
          </li>
        </ul>
        <p>
          규격의 이유와 해결 방법이 궁금하다면 <Link href="/guide/coupang-rocket-growth-image-rules" className="font-semibold text-blue-600 hover:underline">쿠팡 대표이미지 85% 기준과 순백색 반려 해결법</Link>,{" "}
          <Link href="/guide/transparent-png-to-white-jpg" className="font-semibold text-blue-600 hover:underline">투명 PNG를 순백색 JPG로 바꿀 때 주의점</Link>,{" "}
          <Link href="/guide" className="font-semibold text-blue-600 hover:underline">셀러 이미지 가이드 전체</Link>를 참고하세요.
        </p>
      </GuideSection>

      <GuideSection title="자주 묻는 질문">
        <Faq items={FAQ} />
      </GuideSection>
    </article>
  );
}
