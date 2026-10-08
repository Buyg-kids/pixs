import type { Metadata } from "next";
import Link from "next/link";
import { Faq, GuideCta, GuideNote, GuideSection, SpecTable, GUIDE_UPDATED, OG_IMAGES } from "../_components/GuideParts";

const TITLE = "스마트스토어 대표이미지 사이즈 & 상세페이지 가로 크기 완벽 가이드 | PIXS";
const DESCRIPTION =
  "스마트스토어 대표이미지 사이즈(1000x1000), 용량 제한, 상세페이지 가로 860px 권장과 분할 팁, 스토어 로고·배너 규격 표를 한 번에 정리했습니다. 이커머스 썸네일 규격을 PIXS에서 무료로 맞추세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["스마트스토어 대표이미지 사이즈", "스마트스토어 상세페이지 가로 크기", "스마트스토어 이미지 규격", "이커머스 썸네일 규격", "스마트스토어 배너 사이즈"],
  alternates: { canonical: "/guide/smartstore" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: "/guide/smartstore", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "스마트스토어 대표이미지 사이즈는 몇 픽셀로 만들면 되나요?",
    a: "PIXS는 가로·세로 1:1 정방형 1000x1000px을 표준으로 권장합니다. 사진 비율이 다르면 비율을 유지한 채 남는 여백을 채워 정방형으로 맞추면 잘림 없이 등록할 수 있습니다.",
  },
  {
    q: "상세페이지 가로 크기는 어떻게 맞추나요?",
    a: "스마트스토어는 가로 860px 기준으로 맞추는 것을 권장합니다. 원본이 더 넓거나 좁아도 가로폭만 860px로 리사이즈하면 모바일과 PC 모두에서 깨짐이 적습니다.",
  },
  {
    q: "긴 상세페이지는 어떻게 나눠서 올리나요?",
    a: "모바일 최적화에는 가로 860px에 2,000px 단위 분할 조합을 권장합니다. 글자나 이미지가 중간에서 잘리지 않도록 분할선을 직접 옮겨 맞출 수 있는 도구를 활용하세요.",
  },
  {
    q: "이미지는 어떤 포맷과 용량이 안전한가요?",
    a: "JPG, PNG, WebP를 지원하며 최대 10MB, 권장 5MB 이하로 정리했습니다. 용량이 크면 WebP 변환이나 목표 용량 압축으로 줄이세요. (PIXS 정리 기준)",
  },
];

export default function SmartstoreGuidePage() {
  return (
    <article>
      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span>{" "}
        <Link href="/guide" className="hover:text-blue-600">규격 가이드</Link> <span aria-hidden>/</span> 스마트스토어
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">
        스마트스토어 이미지 규격 완벽 가이드
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        스마트스토어 대표이미지 사이즈부터 상세페이지 가로 크기, 스토어 로고·배너 규격까지 한 페이지에 정리했습니다.
        이커머스 썸네일 규격이 헷갈릴 때 표만 확인하세요. (PIXS 정리 기준: {GUIDE_UPDATED})
      </p>

      <GuideCta position="top" />

      <GuideSection id="summary" title="한눈에 보는 스마트스토어 이미지 규격">
        <SpecTable
          caption="스마트스토어 이미지 규격 요약"
          head={["항목", "권장 규격", "비고"]}
          rows={[
            ["대표이미지", "1000x1000px (1:1)", "정방형 표준"],
            ["용량", "최대 10MB (권장 5MB 이하)", "JPG·PNG·WebP"],
            ["상세페이지 가로폭", "860px", "세로 길이는 자유, 분할 업로드 권장"],
            ["옵션 이미지", "1000x1000px (1:1)", "네이버·쿠팡·쇼피·11번가·토스쇼핑 공용 표준"],
          ]}
        />
      </GuideSection>

      <GuideSection id="main-image" title="스마트스토어 대표이미지 사이즈와 배경 조건">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>해상도·비율:</strong> 가로·세로 1:1 정방형 <strong>1000x1000px</strong>이 표준입니다. 세로로 긴 사진은 잘리기 쉬우니
            비율을 유지한 채 여백을 채워 정방형으로 맞추세요.
          </li>
          <li>
            <strong>용량:</strong> 최대 10MB이며 5MB 이하를 권장합니다. 목록에서 빠르게 뜨려면 가벼울수록 좋습니다.
          </li>
          <li>
            <strong>배경:</strong> 흰색이 필수는 아니라서 단색 스튜디오 컷은 가장자리 색을 자동으로 감지해 여백을 채우면 자연스럽습니다.
          </li>
          <li>
            <strong>삽입물:</strong> 텍스트·로고·테두리를 넣으면 검색 순위에서 불이익을 받을 수 있어, 대표이미지는 깔끔한 상품 컷을 권장합니다.
          </li>
        </ul>
        <GuideNote>워터마크가 꼭 필요하면 우측 하단에 투명도 30~40% 정도로 작게 넣어 상품을 가리지 않게 하세요.</GuideNote>
      </GuideSection>

      <GuideSection id="detail" title="스마트스토어 상세페이지 가로 크기와 분할 팁">
        <p>
          상세페이지는 가로 <strong>860px</strong> 기준으로 맞추는 것을 권장합니다. 디자이너에게 받은 통이미지의 가로폭이 달라도,
          860px로 리사이즈한 뒤 올리면 화면 폭에 맞게 깔끔하게 보입니다.
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

      <GuideSection id="how-to" title="PIXS로 스마트스토어 규격 맞추는 방법">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            <strong>대표이미지</strong> 탭에서 사진을 올리고 [스마트스토어] 규격을 선택하세요.
          </li>
          <li>
            여백 채움 방식(순백색·가장자리 자동 감지·감성 블러)을 고르면 미리보기가 바로 바뀝니다.
          </li>
          <li>
            상세페이지는 <strong>상세페이지 분할</strong> 탭에서 가로 860px, 2,000px 단위를 선택해 나누세요.
          </li>
          <li>
            용량이 크면 <strong>용량 압축·변환</strong> 탭에서 목표 용량(5MB 이하)을 고르면 자동으로 맞춰집니다.
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
          쿠팡 이미지 규격 가이드
        </Link>
        도 확인해 보세요.
      </p>
    </article>
  );
}
