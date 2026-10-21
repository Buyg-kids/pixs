import type { Metadata } from "next";
import Link from "next/link";
import { Faq, faqJsonLd, GuideCta, JsonLd, GuideNote, GuideSection, GuideSub, SpecTable, GUIDE_UPDATED, OG_IMAGES } from "../_components/GuideParts";

const TITLE = "쿠팡 썸네일 규격과 순백색 배경 반려 해결 가이드 (RGB 255) | PIXS";
const DESCRIPTION =
  "쿠팡 윙 대표이미지 반려의 주된 원인인 순백색 배경(#FFFFFF)과 상품 면적 85% 규칙 해결법. 여백 자동 채우기로 즉시 등록하는 방법 안내.";
const OG_TITLE = "쿠팡 썸네일 순백색 배경 & 규격 반려 해결법 | PIXS";
const OG_DESCRIPTION = "RGB 255 순백색 배경 가이드와 썸네일 승인 반려 사유 5가지 해결 팁.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["쿠팡 썸네일 규격", "쿠팡 윙 이미지 반려", "로켓그로스 이미지 규격", "쿠팡 상세페이지 가로 크기", "쿠팡 대표이미지 흰색배경", "쿠팡 이미지 사이즈"],
  alternates: { canonical: "/guide/coupang" },
  openGraph: { title: OG_TITLE, description: OG_DESCRIPTION, type: "article", url: "/guide/coupang", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: OG_TITLE, description: OG_DESCRIPTION, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "쿠팡 윙에서 대표이미지 등록 시 자주 반려되는 이유는?",
    a: "배경이 완전한 흰색(RGB 255, 255, 255 / #FFFFFF)이 아니거나, 상품 크기가 전체 면적의 85% 미만으로 너무 작을 때 주로 반려됩니다. 텍스트·로고·워터마크가 들어간 경우도 반려 사유가 될 수 있습니다.",
  },
  {
    q: "쿠팡 대표이미지 배경은 꼭 흰색이어야 하나요?",
    a: "쿠팡은 카탈로그 매칭을 위해 RGB 255 순수 흰색 배경을 필수로 요구하는 마켓으로 정리했습니다. 블러나 임의 색상 배경은 반려 사유가 될 수 있어, PIXS는 쿠팡 규격 출력 시 선택한 여백 모드와 관계없이 순백색으로 고정합니다.",
  },
  {
    q: "분명 흰색인데 왜 반려되나요?",
    a: "눈에는 흰색이어도 (254, 254, 254)나 (250, 250, 250)처럼 순수 흰색이 아닌 값이면 검수에서 걸릴 수 있습니다. JPG 압축과 그림자도 가장자리에 회색 픽셀을 만들 수 있으니, 배경을 #FFFFFF로 채우고 높은 품질로 저장하세요.",
  },
  {
    q: "상세페이지 가로 사이즈는 몇 px이 적당한가요?",
    a: "쿠팡 상세페이지 권장 가로 폭은 780px이며, 파일당 용량은 10MB 이하, 세로 길이는 3,000~5,000px 이내로 분할하여 등록하는 것이 로딩 속도에 좋습니다. (PIXS 정리 기준)",
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
      <JsonLd data={faqJsonLd(FAQ)} />
      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span>{" "}
        <Link href="/guide" className="hover:text-blue-600">규격 가이드</Link> <span aria-hidden>/</span> 쿠팡
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">
        쿠팡 윙·로켓그로스 썸네일 규격 &amp; 이미지 반려 해결 가이드
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        쿠팡은 대표이미지 배경과 상품 면적 기준이 까다로운 마켓입니다. 쿠팡 윙에서 상품을 등록하거나 로켓그로스로 입고하는 셀러를 위해, 썸네일 핵심 원칙과 규격, 반려되는 이유와 해결법, 상세페이지 가로 크기, 판매자 프로필·브랜드 배너 사이즈를
        실무 순서로 정리했습니다. (PIXS 정리 기준: {GUIDE_UPDATED})
      </p>

      <GuideCta position="top" href="/?preset=coupang" label="👉 쿠팡 순백색 배경 썸네일 자동 생성하기" />

      <GuideSection id="summary" title="한눈에 보는 쿠팡 이미지 규격">
        <SpecTable
          caption="쿠팡 이미지 규격 요약"
          head={["항목", "권장 규격", "비고"]}
          rows={[
            ["대표이미지", "1000x1000px (1:1)", "정방형"],
            ["배경", "RGB 255, 255, 255 순수 흰색(#FFFFFF)", "필수 — 블러·임의 색상 불가"],
            ["상품 면적", "이미지의 85% 이상", "프레임에 꽉 채워 촬영"],
            ["용량", "파일당 최대 10MB (모바일 최적화 2~3MB 이하 권장)", "JPG·PNG 권장"],
            ["상세페이지 가로폭", "780px", "세로 길이는 자유, 분할 업로드 권장"],
          ]}
        />
      </GuideSection>

      <GuideSection id="principle" title="쿠팡 썸네일의 핵심 원칙: 순백색 배경과 카탈로그 구조">
        <p>
          쿠팡은 같은 상품을 여러 판매자가 한 페이지에서 비교해 파는 <strong>카탈로그형 구조</strong>를 가진 마켓입니다. 판매자마다 배경색과 구도가 제각각이면 목록이 어수선해지므로, 대표이미지에는 통일된 기준을 요구합니다. 그 중심이 바로
          <strong> 순백색 배경(RGB 255, 255, 255)</strong>입니다.
        </p>
        <GuideSub title="순백색이란 정확히 무엇인가">
          <p>
            RGB 세 채널이 모두 255인 <code>#FFFFFF</code>를 뜻합니다. 눈으로는 같은 흰색 같아도 (252, 252, 252) 같은 아주 연한 회색은 순수 흰색이 아닙니다. 사진 배경을 단순히 &lsquo;하얗게 보정&rsquo;하는 것만으로는 부족하고, 배경 영역이 정확히
            #FFFFFF로 채워졌는지가 기준이 됩니다.
          </p>
        </GuideSub>
        <GuideSub title="상품 면적 85% 이상">
          <p>
            상품이 프레임에서 차지하는 비중도 중요합니다. 여백이 너무 크면 목록 썸네일에서 상품이 작아 보여 경쟁 상품에 밀립니다. 상품이 이미지의 85% 이상을 채우도록 촬영하고, 크롭할 때도 상품이 잘리지 않는 선에서 최대한 키우세요.
          </p>
        </GuideSub>
      </GuideSection>

      <GuideSection id="main-image" title="쿠팡 대표이미지 규격 상세">
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

      <GuideCta position="middle" href="/?preset=coupang" label="👉 쿠팡 순백색 배경 썸네일 자동 생성하기" />

      <GuideSection id="rejection" title="쿠팡 윙 이미지 반려 사유별 해결법">
        <p>
          이미지가 반려되면 상품 등록이 지연되고 판매 시작도 늦어집니다. 아래는 자주 마주치는 유형과 해결 방법입니다. 실제 반려 사유 문구는 윙에서 안내하는 내용을 우선 확인하세요.
        </p>
        <GuideSub title="1. 배경이 흰색이 아니라는 안내">
          <p>
            원인은 배경이 회색·아이보리·그라데이션이거나, 순백에 가까워 보이지만 (254, 254, 254) 같은 값일 때입니다. 배경을 완전히 #FFFFFF로 채워 다시 저장하세요. 그림자가 필요하다면 상품 바로 아래에 아주 약하게만 남기고, 가장자리 네 면은 순백으로 유지하는 것이 안전합니다.
          </p>
        </GuideSub>
        <GuideSub title="2. 상품이 너무 작다는 안내">
          <p>
            프레임 안에서 상품 비중이 낮은 경우입니다. 85% 이상이 되도록 상품 주변 여백을 줄여 크롭하거나, 상품을 키워 다시 배치하세요.
          </p>
        </GuideSub>
        <GuideSub title="3. 텍스트·로고·워터마크가 포함됨">
          <p>
            대표이미지에 문구, 가격, 할인 배지, 눈에 띄는 워터마크가 있으면 반려될 수 있습니다. 홍보 요소는 추가 이미지와 상세페이지로 옮기고, 대표이미지는 상품만 담으세요.
          </p>
        </GuideSub>
        <GuideSub title="4. 해상도·화질 부족">
          <p>
            너무 작거나 흐린 이미지는 반려 대상입니다. 1000x1000px 이상 원본으로 작업하고, 작은 이미지를 억지로 늘리지 마세요.
          </p>
        </GuideSub>
        <GuideSub title="5. 파일 형식 또는 용량 문제">
          <p>
            허용되지 않는 포맷이나 용량 초과가 원인일 수 있습니다. JPG로 저장하고 2~3MB 이하로 압축하면 대부분 해결됩니다.
          </p>
        </GuideSub>
      </GuideSection>

      <GuideSection id="rocket" title="로켓그로스·윙 셀러가 알아둘 점">
        <p>
          쿠팡 윙으로 직접 등록하는 셀러든, 로켓그로스로 물류를 맡기는 셀러든 상품 상세에 노출되는 대표이미지 기준은 같은 흐름으로 관리하는 것이 안전합니다. 같은 상품을 여러 옵션으로 등록한다면 옵션별 이미지도 같은 비율(1:1)과 같은 순백색 배경으로 통일해 두면,
          수정과 재등록 때 다시 만드는 수고가 줄어듭니다. 로켓그로스는 입고와 배송 요건이 별도로 있으니, 이미지 외 요건은 쿠팡 윙의 최신 안내를 확인하세요.
        </p>
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
            <strong>분할:</strong> 세로가 너무 길면 3,000~5,000px 이내로 나눠 올리고(모바일 로딩에 유리), 글자가 잘리는 구간은 분할선을 옮겨 피하세요.
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

      <GuideCta position="bottom" href="/?preset=coupang" label="👉 쿠팡 순백색 배경 썸네일 자동 생성하기" />

      <p className="mt-8 text-sm text-slate-600">
        다른 마켓이 궁금하다면{" "}
        <Link href="/guide/smartstore" className="font-semibold text-blue-600 hover:underline">
          스마트스토어
        </Link>
        {" · "}
        <Link href="/guide/fashion" className="font-semibold text-blue-600 hover:underline">
          패션 플랫폼
        </Link>{" "}
        이미지 규격 가이드도 확인해 보세요.
      </p>
    </article>
  );
}
