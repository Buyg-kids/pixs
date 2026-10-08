import type { Metadata } from "next";
import Link from "next/link";
import { Faq, GuideCta, GuideNote, GuideSection, SpecTable, GUIDE_UPDATED, OG_IMAGES } from "../_components/GuideParts";

const TITLE = "쿠팡 대표이미지 규격 & 상세페이지 가로 크기(780px) 권장 가이드 | PIXS";
const DESCRIPTION =
  "쿠팡 대표이미지는 순백색(RGB 255) 배경과 상품 면적 기준이 중요합니다. 쿠팡 상세페이지 가로 크기 780px, 용량·포맷 주의점, 판매자 프로필·브랜드 배너 규격을 표로 정리하고 PIXS에서 바로 맞추세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["쿠팡 상세페이지 가로 크기", "쿠팡 대표이미지 규격", "쿠팡 썸네일 흰색배경", "이커머스 썸네일 규격", "쿠팡 이미지 사이즈"],
  alternates: { canonical: "/guide/coupang" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: "/guide/coupang", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "쿠팡 대표이미지 배경은 꼭 흰색이어야 하나요?",
    a: "쿠팡은 카탈로그 매칭을 위해 RGB 255 순수 흰색 배경을 필수로 요구하는 마켓으로 정리했습니다. 블러나 임의 색상 배경은 반려 사유가 될 수 있어, PIXS는 쿠팡 규격 출력 시 선택한 여백 모드와 관계없이 순백색으로 고정합니다.",
  },
  {
    q: "쿠팡 상세페이지 가로 크기는 몇 픽셀인가요?",
    a: "가로 780px을 기준으로 권장합니다. 가로폭만 780px로 맞추면 세로는 자유롭게 구성할 수 있고, 길다면 나눠서 올리세요.",
  },
  {
    q: "쿠팡에 WebP 이미지를 올려도 되나요?",
    a: "일부 카테고리는 WebP 업로드가 제한될 수 있어 JPG·PNG를 권장합니다. 용량이 문제라면 JPG 유지 압축으로 2~3MB 이하로 줄이는 방법이 가장 안전합니다. (PIXS 정리 기준)",
  },
  {
    q: "상품이 이미지에서 얼마나 차지해야 하나요?",
    a: "상품 면적 85% 이상을 권장합니다. 여백이 너무 크면 상품이 작아 보이니, 촬영 때 상품을 프레임에 꽉 채워 주세요.",
  },
];

export default function CoupangGuidePage() {
  return (
    <article>
      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span>{" "}
        <Link href="/guide" className="hover:text-blue-600">규격 가이드</Link> <span aria-hidden>/</span> 쿠팡
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">
        쿠팡 대표이미지 &amp; 상세페이지 권장 규격 가이드
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        쿠팡은 대표이미지 배경과 상품 면적 기준이 까다로운 마켓입니다. 쿠팡 대표이미지 규격, 상세페이지 가로 크기, 판매자 프로필·브랜드 배너 사이즈를 표로 정리했습니다.
        (PIXS 정리 기준: {GUIDE_UPDATED})
      </p>

      <GuideCta position="top" />

      <GuideSection id="summary" title="한눈에 보는 쿠팡 이미지 규격">
        <SpecTable
          caption="쿠팡 이미지 규격 요약"
          head={["항목", "권장 규격", "비고"]}
          rows={[
            ["대표이미지", "1000x1000px (1:1)", "정방형"],
            ["배경", "RGB 255 순수 흰색(#FFFFFF)", "필수 — 블러·임의 색상 불가"],
            ["상품 면적", "이미지의 85% 이상", "프레임에 꽉 채워 촬영"],
            ["용량", "파일당 최대 10MB (모바일 최적화 2~3MB 이하 권장)", "JPG·PNG 권장"],
            ["상세페이지 가로폭", "780px", "세로 길이는 자유, 분할 업로드 권장"],
          ]}
        />
      </GuideSection>

      <GuideSection id="main-image" title="쿠팡 대표이미지 규격: 흰색 배경이 핵심">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>배경:</strong> 카탈로그 매칭을 위해 <strong>RGB 255 순수 흰색</strong>이어야 합니다. 연한 회색이나 아이보리도 반려될 수 있으니 <code>#FFFFFF</code>로 맞추세요.
          </li>
          <li>
            <strong>비율·해상도:</strong> 1:1 정방형 1000x1000px을 기본으로 합니다. 사진 비율이 다르면 비율을 유지한 채 흰색으로 여백을 채워 정방형으로 만드세요.
          </li>
          <li>
            <strong>상품 면적:</strong> 상품이 이미지의 <strong>85% 이상</strong>을 차지하도록 구성하는 것을 권장합니다.
          </li>
          <li>
            <strong>포맷·용량:</strong> JPG·PNG를 권장하며 일부 카테고리는 WebP 업로드가 제한될 수 있어 주의가 필요합니다. 모바일 로딩을 위해 2~3MB 이하로 줄이면 좋습니다.
          </li>
        </ul>
        <GuideNote>PIXS에서는 쿠팡을 선택하면 여백 모드(블러·자동 감지·직접 선택)와 상관없이 항상 순백색으로 변환되어 반려를 줄여 줍니다.</GuideNote>
      </GuideSection>

      <GuideSection id="detail" title="쿠팡 상세페이지 가로 크기(780px)와 분할 팁">
        <p>
          쿠팡 상세페이지는 가로 <strong>780px</strong> 기준을 권장합니다. 스마트스토어(860px)와 폭이 달라서, 같은 상세페이지를 두 마켓에 올릴 때는 마켓별로 가로폭을 다시 맞춰야 글자가 작아 보이거나 깨지지 않습니다.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>리사이즈:</strong> 가로폭만 780px로 비율 유지 리사이즈하면 세로 길이는 자동으로 따라옵니다.
          </li>
          <li>
            <strong>분할:</strong> 세로가 너무 길면 2,000px 안팎으로 나눠 올리고, 글자가 잘리는 구간은 분할선을 옮겨 피하세요.
          </li>
          <li>
            <strong>용량 절감:</strong> 긴 상세페이지는 JPG 유지 압축(품질 약 85%)으로 장당 용량을 낮추는 것이 안정적입니다.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="banner" title="쿠팡 판매자 프로필·브랜드 배너 권장 사이즈">
        <SpecTable
          caption="쿠팡 프로필 및 배너 사이즈"
          head={["용도", "권장 사이즈", "비율"]}
          rows={[
            ["판매자 프로필", "500x500px", "1:1"],
            ["브랜드 헤더 배너", "1200x400px", "3:1 와이드"],
          ]}
        />
      </GuideSection>

      <GuideSection id="how-to" title="PIXS로 쿠팡 규격 맞추는 방법">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            <strong>대표이미지</strong> 탭에서 사진을 올리고 [쿠팡]을 선택하면 1000x1000 순백색으로 변환됩니다.
          </li>
          <li>
            상세페이지는 <strong>상세페이지 분할</strong> 탭에서 가로폭 [쿠팡·11번가·오픈마켓 (780px)]을 선택하세요.
          </li>
          <li>
            용량이 크면 <strong>용량 압축·변환</strong> 탭에서 [쿠팡 권장 (2MB 이하)] 목표를 고르면 자동으로 맞춰집니다.
          </li>
        </ol>
      </GuideSection>

      <GuideSection id="faq" title="자주 묻는 질문">
        <Faq items={FAQ} />
      </GuideSection>

      <GuideNote>
        위 수치는 PIXS가 정리한 권장 기준이며 마켓 정책에 따라 바뀔 수 있습니다. 등록 전 쿠팡 Wing의 최신 안내를 함께 확인하세요.
      </GuideNote>

      <GuideCta position="bottom" />

      <p className="mt-8 text-sm text-slate-600">
        다른 마켓이 궁금하다면{" "}
        <Link href="/guide/smartstore" className="font-semibold text-blue-600 hover:underline">
          스마트스토어 이미지 규격 가이드
        </Link>
        도 확인해 보세요.
      </p>
    </article>
  );
}
