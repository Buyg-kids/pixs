import type { Metadata } from "next";
import Link from "next/link";
import { Faq, GuideCta, GuideNote, GuideSection, GuideSub, SpecTable, GUIDE_UPDATED, OG_IMAGES } from "../_components/GuideParts";

const TITLE = "스마트스토어 대표이미지 사이즈 1000x1000 규격 및 추가이미지 가이드 | PIXS";
const DESCRIPTION =
  "네이버 쇼핑 노출을 위한 스마트스토어 대표이미지 권장 규격(1000x1000), 용량 최적화, 추가이미지 9장 배치 팁 총정리.";
const OG_TITLE = "스마트스토어 대표이미지 1000x1000 규격 가이드 | PIXS";
const OG_DESCRIPTION = "네이버 쇼핑 상위 노출을 위한 썸네일 규격과 감점 사유 예방 체크리스트.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["스마트스토어 대표이미지 사이즈", "스마트스토어 추가이미지", "스마트스토어 상세페이지 가로 크기", "스마트스토어 이미지 규격", "이커머스 썸네일 규격", "스마트스토어 배너 사이즈", "네이버 쇼핑 대표이미지"],
  alternates: { canonical: "/guide/smartstore" },
  openGraph: { title: OG_TITLE, description: OG_DESCRIPTION, type: "article", url: "/guide/smartstore", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: OG_TITLE, description: OG_DESCRIPTION, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "스마트스토어 대표이미지 사이즈는 몇 픽셀로 만들면 되나요?",
    a: "1:1 정방형 1000x1000px을 표준으로 권장합니다. 사진 비율이 다르면 억지로 자르지 말고, 비율을 유지한 채 남는 여백을 배경색으로 채워 정방형으로 맞추세요. 상품이 잘리지 않고 목록에서도 일정한 크기로 보입니다.",
  },
  {
    q: "대표이미지 용량은 얼마나 되어야 하나요?",
    a: "파일 용량은 2MB 이하를 권장하고, 업로드 한도는 최대 20MB입니다. 한도 안이라도 용량이 크면 목록·상세 로딩이 느려져 모바일 이탈이 늘 수 있으니, 1000x1000px 기준 JPG 품질 85% 안팎으로 압축해 2MB 이하로 맞추는 것이 안전합니다. (PIXS 정리 기준)",
  },
  {
    q: "대표이미지에 문구나 할인 배지를 넣으면 안 되나요?",
    a: "대표이미지에 큰 문구, 할인율, 배지, 테두리를 넣으면 검색 노출에서 불이익을 받거나 상품 정보 수정 요청을 받을 수 있다고 정리했습니다. 홍보 문구는 추가 이미지나 상세페이지에 넣고, 대표이미지는 깔끔한 상품 컷으로 유지하세요.",
  },
  {
    q: "추가 이미지는 몇 장까지, 어떤 순서로 올리나요?",
    a: "대표이미지 외에 추가 이미지를 최대 9장까지 등록할 수 있습니다. 전체 모습 → 다른 각도 → 디테일 → 사용 장면 → 구성·사이즈 순서로 구매자의 궁금증이 풀리는 흐름으로 배치하는 것을 권장합니다.",
  },
];

const CHECKLIST = [
  "대표이미지가 1000x1000px, 1:1인가요?",
  "파일 용량이 2MB 이하(최대 20MB)인가요?",
  "텍스트·로고·테두리·배지가 대표이미지에 들어가 있지 않나요?",
  "상품 색상이 실제와 다르게 보정되지 않았나요?",
  "추가 이미지가 같은 비율과 톤으로 통일되어 있나요?",
  "상세페이지 가로폭을 860px로 맞췄나요?",
  "모바일 화면(가로 약 360~400px)에서 글자가 읽히나요?",
];

export default function SmartstoreGuidePage() {
  return (
    <article>
      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span>{" "}
        <Link href="/guide" className="hover:text-blue-600">규격 가이드</Link> <span aria-hidden>/</span> 스마트스토어
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">
        스마트스토어 대표이미지 &amp; 추가이미지 완벽 가이드
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        네이버 스마트스토어에서 상품 이미지는 구매자가 가장 먼저 만나는 정보입니다. 이 글은 대표이미지 사이즈와 용량 같은 기본 규격뿐 아니라, 이미지 품질이 노출과 클릭에 미치는 영향, 불이익을 피하는 방법, 추가 이미지 9장의 배치 전략,
        모바일 가독성, 상세페이지 가로 크기까지 실무 순서로 정리했습니다. (PIXS 정리 기준: {GUIDE_UPDATED})
      </p>

      <GuideCta position="top" />

      <GuideSection id="summary" title="한눈에 보는 스마트스토어 이미지 규격">
        <SpecTable
          caption="스마트스토어 이미지 규격 요약"
          head={["항목", "권장 규격", "비고"]}
          rows={[
            ["대표이미지", "1000x1000px (1:1)", "정방형 표준"],
            ["용량", "2MB 이하 권장 (최대 20MB)", "JPG 품질 85% 안팎 권장"],
            ["추가 이미지", "최대 9장", "대표이미지와 같은 비율·톤으로 통일"],
            ["상세페이지 가로폭", "860px", "세로 길이는 자유, 분할 업로드 권장"],
            ["옵션 이미지", "1000x1000px (1:1)", "마켓 공용 표준"],
          ]}
        />
      </GuideSection>

      <GuideSection id="quality" title="대표이미지 품질이 노출과 클릭에 미치는 영향">
        <p>
          네이버 쇼핑 검색 결과는 상품명, 카테고리, 가격, 판매 실적, 리뷰 같은 여러 요소를 종합해 노출 순서가 정해진다고 알려져 있습니다. 이미지는 이 중 구매자의 <strong>클릭 여부</strong>를 좌우하는 요소입니다. 같은 가격과 상품명이라도 선명하고 정돈된 대표이미지는
          클릭을 더 많이 받고, 클릭이 쌓이면 상품의 반응 지표도 좋아지는 선순환이 생깁니다. 반대로 흐리거나 어색한 이미지는 검색 노출이 되더라도 클릭으로 이어지기 어렵습니다.
        </p>
        <GuideSub title="목록에서 보이는 첫인상">
          <p>
            구매자는 목록에서 작은 썸네일 수십 개를 빠르게 훑습니다. 그래서 상품이 프레임의 대부분을 차지하고, 배경이 단순하며, 윤곽이 또렷한 이미지가 유리합니다. 상품이 너무 작거나 배경이 복잡하면 썸네일 크기에서 무엇을 파는지 알아보기 어렵습니다.
          </p>
        </GuideSub>
        <GuideSub title="이미지 품질을 결정하는 네 가지">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>선명도:</strong> 작은 이미지를 억지로 늘리면 흐려집니다. 처음부터 1000px 이상으로 촬영하고, 줄이는 방향으로만 리사이즈하세요.
            </li>
            <li>
              <strong>구도:</strong> 상품이 중앙에 오고 사방에 일정한 여백이 있으면 정방형 프레임에서 안정적으로 보입니다.
            </li>
            <li>
              <strong>색감:</strong> 실제 상품과 같은 색으로 보여야 반품·문의가 줄어듭니다. 과한 필터나 채도 보정은 피하세요.
            </li>
            <li>
              <strong>용량:</strong> 화질이 같다면 가벼운 파일이 목록·상세 로딩에서 유리합니다.
            </li>
          </ul>
        </GuideSub>
      </GuideSection>

      <GuideSection id="main-image" title="스마트스토어 대표이미지 권장 규격과 배경 조건">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>해상도·비율:</strong> 가로·세로 1:1 정방형 <strong>1000x1000px</strong>이 표준입니다. 세로로 긴 사진은 잘리기 쉬우니 비율을 유지한 채 여백을 채워 정방형으로 맞추세요.
          </li>
          <li>
            <strong>용량:</strong> 2MB 이하를 권장하며 업로드 한도는 최대 20MB입니다. 한도 안이라도 가벼울수록 목록 로딩이 빠릅니다.
          </li>
          <li>
            <strong>배경:</strong> 흰색이 필수는 아니라서 단색 스튜디오 컷은 가장자리 색을 자동으로 감지해 여백을 채우면 자연스럽습니다. 그래도 같은 스토어 안에서는 배경 톤을 통일하면 정돈되어 보입니다.
          </li>
          <li>
            <strong>포맷:</strong> JPG와 PNG를 주로 사용합니다. 사진은 JPG가 용량 면에서 유리하고, 투명 배경이나 선명한 도형은 PNG가 어울립니다.
          </li>
        </ul>
        <GuideNote>워터마크가 꼭 필요하면 우측 하단에 투명도 30~40% 정도로 작게 넣어 상품을 가리지 않게 하세요.</GuideNote>
      </GuideSection>

      <GuideSection id="penalty" title="노출 누락·불이익으로 이어지는 대표이미지 유형">
        <p>
          아래 유형은 검색 노출에서 불리해지거나 상품 정보 수정 요청을 받을 수 있는 대표적인 경우로 정리했습니다. 정확한 기준은 스마트스토어센터의 최신 안내를 따라야 하니, 등록 전 함께 확인하세요.
        </p>
        <GuideSub title="1. 과도한 텍스트 삽입">
          <p>
            &lsquo;무료배송&rsquo;, &lsquo;최저가&rsquo;, 할인율, 이벤트 문구를 대표이미지에 크게 넣는 경우입니다. 구매자에게는 정보처럼 보일 수 있지만 목록 전체의 통일성을 해치고 불이익의 대상이 될 수 있습니다. 문구는 추가 이미지나 상세페이지로 옮기세요.
          </p>
        </GuideSub>
        <GuideSub title="2. 프레임·테두리·배지">
          <p>
            이미지 가장자리에 색 테두리나 액자 효과, 모서리 배지를 넣는 경우입니다. 정방형 캔버스를 꽉 채운 깨끗한 상품 컷으로 바꾸면 해결됩니다.
          </p>
        </GuideSub>
        <GuideSub title="3. 지나친 색상 왜곡">
          <p>
            채도와 대비를 과하게 올려 실제와 다른 색이 되면 구매 후 &lsquo;사진과 다르다&rsquo;는 반품 사유가 됩니다. 노출 면에서도 이미지 품질이 낮다고 판단될 수 있으니 자연광에 가까운 색으로 보정하세요.
          </p>
        </GuideSub>
        <GuideSub title="4. 늘려서 흐려진 저해상도 이미지">
          <p>
            작은 이미지를 1000px로 키우면 계단 현상과 번짐이 생깁니다. 원본이 작다면 다시 촬영하거나 더 큰 원본을 구하는 것이 근본 해결입니다.
          </p>
        </GuideSub>
        <GuideSub title="5. 타인의 이미지 도용">
          <p>
            다른 판매자나 브랜드의 사진을 그대로 쓰면 저작권 문제와 신고로 이어질 수 있습니다. 직접 촬영했거나 사용 권리를 가진 이미지만 쓰세요.
          </p>
        </GuideSub>
      </GuideSection>

      <GuideSection id="extra-images" title="추가 이미지 최대 9장, 이렇게 배치하세요">
        <p>
          대표이미지가 클릭을 만든다면, 추가 이미지는 구매 결정을 돕습니다. 상세페이지까지 내려가지 않고 상단 이미지만 보고 판단하는 모바일 구매자도 많아서, 핵심 정보를 앞쪽 이미지에 두는 것이 좋습니다.
        </p>
        <SpecTable
          caption="추가 이미지 배치 순서 예시"
          head={["순서", "내용", "목적"]}
          rows={[
            ["1", "상품 전체 모습", "무엇을 파는지 한눈에 확인"],
            ["2", "다른 각도(측면·뒷면)", "형태와 구조 확인"],
            ["3", "소재·마감 디테일", "품질에 대한 신뢰"],
            ["4", "실제 사용·착용 장면", "크기감과 활용 상상"],
            ["5", "구성품·옵션 한눈에", "받게 될 구성 안내"],
            ["6", "사이즈·치수 표시", "사이즈 문의·반품 감소"],
            ["7~9", "포장 상태, 인증·안내, 추가 컷", "배송 신뢰와 보충 정보"],
          ]}
        />
        <GuideSub title="모바일 화면에서 읽히게 만드는 법">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              스마트폰에서는 이미지가 가로 약 360~400px 폭으로 보입니다. 1000px 이미지 안의 글자는 이 크기로 줄어드니, 글자를 넣는다면 충분히 크게(1000px 기준 약 40px 이상) 쓰세요.
            </li>
            <li>핵심 정보는 이미지 중앙부에 두세요. 가장자리는 기기와 화면에 따라 잘려 보일 수 있습니다.</li>
            <li>9장 모두 같은 비율(1:1)과 같은 배경 톤을 유지하면 넘겨 볼 때 정돈된 인상을 줍니다.</li>
          </ul>
        </GuideSub>
      </GuideSection>

      <GuideSection id="detail" title="스마트스토어 상세페이지 가로 크기와 분할 팁">
        <p>
          상세페이지는 가로 <strong>860px</strong> 기준으로 맞추는 것을 권장합니다. 디자이너에게 받은 통이미지의 가로폭이 달라도, 860px로 리사이즈한 뒤 올리면 화면 폭에 맞게 깔끔하게 보입니다.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>분할:</strong> 세로가 수만 px인 통이미지는 <strong>2,000px 단위</strong>로 나누면 모바일 로딩과 업로드 용량에 유리합니다.
          </li>
          <li>
            <strong>균등 분할:</strong> 마지막 조각이 얇게 남지 않도록 같은 높이로 나누고, 글자·이미지가 잘리는 지점은 분할선을 옮겨 피하세요.
          </li>
          <li>
            <strong>이어붙이기:</strong> 반대로 여러 장으로 쪼개 받았다면 860px 폭으로 이어붙여 한 장으로 관리할 수 있습니다.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="banner" title="스마트스토어 스토어 로고·배너 권장 사이즈">
        <SpecTable
          caption="스마트스토어 로고 및 배너 사이즈"
          head={["용도", "권장 사이즈", "비율"]}
          rows={[
            ["스토어 로고", "160x160px", "1:1"],
            ["모바일 대표 배너", "750x1000px", "3:4 세로형"],
            ["PC 상단 헤더", "1920x400px", "24:5 와이드"],
          ]}
        />
        <GuideNote>PC 상단 헤더는 화면 크기에 따라 좌우가 잘릴 수 있어 핵심 문구와 로고는 중앙에 배치하세요.</GuideNote>
      </GuideSection>

      <GuideSection id="checklist" title="상품 등록 전 이미지 체크리스트">
        <ul className="space-y-1.5">
          {CHECKLIST.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-blue-600" aria-hidden>
                ✓
              </span>
              {c}
            </li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection id="how-to" title="PIXS로 스마트스토어 규격 맞추는 방법">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            <strong>대표이미지</strong> 탭에서 사진을 올리고 [스마트스토어] 규격을 선택하세요.
          </li>
          <li>여백 채움 방식(순백색·가장자리 자동 감지·감성 블러)을 고르면 미리보기가 바로 바뀝니다.</li>
          <li>
            상세페이지는 <strong>상세페이지 분할</strong> 탭에서 가로 860px, 2,000px 단위를 선택해 나누세요.
          </li>
          <li>
            용량이 크면 <strong>용량 압축·변환</strong> 탭에서 목표 용량(2MB 이하)을 골라 자동으로 줄이세요.
          </li>
        </ol>
      </GuideSection>

      <GuideSection id="faq" title="자주 묻는 질문">
        <Faq items={FAQ} />
      </GuideSection>

      <GuideNote>
        위 수치는 PIXS가 정리한 권장 기준이며 마켓 정책에 따라 바뀔 수 있습니다. 등록 전 스마트스토어센터의 최신 안내를 함께 확인하세요.
      </GuideNote>

      <GuideCta position="bottom" />

      <p className="mt-8 text-sm text-slate-600">
        다른 마켓이 궁금하다면{" "}
        <Link href="/guide/coupang" className="font-semibold text-blue-600 hover:underline">
          쿠팡
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
