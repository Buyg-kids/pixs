import type { Metadata } from "next";
import Link from "next/link";
import { Faq, GuideCta, GuideNote, GuideSection, GuideSub, SpecTable, GUIDE_UPDATED, OG_IMAGES } from "../_components/GuideParts";

const TITLE = "에이블리·지그재그·무신사 대표이미지 규격 (3:4 / 4:5) & 상세페이지 가이드 | PIXS";
const DESCRIPTION =
  "패션 버티컬 플랫폼(에이블리·지그재그·무신사·W컨셉) 대표이미지 3:4·4:5 비율 사이즈, 상세페이지 가로 1000px, 스토어 프로필·배너 규격을 표로 정리했습니다. 3:4와 4:5의 차이와 촬영·편집 팁까지 확인하고 PIXS에서 바로 변환하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["에이블리 대표이미지 사이즈", "지그재그 이미지 규격", "무신사 대표이미지 규격", "3:4 비율 사이즈", "4:5 비율 사이즈", "패션 쇼핑몰 상세페이지 가로 크기", "W컨셉 이미지 규격"],
  alternates: { canonical: "/guide/fashion" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: "/guide/fashion", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "에이블리·지그재그 대표이미지는 정방형(1:1)으로 올려도 되나요?",
    a: "올릴 수는 있지만 모바일 피드 카드가 세로형(3:4)이라 정방형 사진은 위아래에 여백이 생기거나 노출 방식에 따라 잘려 보일 수 있습니다. 착용컷은 처음부터 3:4 세로로 촬영하거나 3:4 캔버스에 맞춰 올리는 것을 권장합니다. (PIXS 정리 기준)",
  },
  {
    q: "3:4와 4:5 중 무엇을 선택해야 하나요?",
    a: "3:4(예: 1000x1333)가 패션 앱의 기본 세로 비율이고, 4:5(예: 1000x1250)는 3:4보다 살짝 짧은 세로형입니다. 한 상품의 모든 컷을 같은 비율로 통일하면 목록에서 정돈되어 보이니, 주로 입점하는 플랫폼의 비율에 맞춰 하나로 정하세요.",
  },
  {
    q: "패션 플랫폼에서도 대표이미지 배경이 흰색이어야 하나요?",
    a: "쿠팡처럼 순백색을 강제하는 마켓과 달리, 패션 버티컬은 감성 컷과 착용 컷을 쓰는 경우가 많아 흰색이 필수는 아니라고 정리했습니다. 다만 플랫폼과 카테고리별 검수 기준이 다를 수 있으니 입점 가이드를 함께 확인하세요.",
  },
  {
    q: "원본이 가로 사진인데 어떻게 세로형으로 맞추나요?",
    a: "사진을 억지로 자르면 상품이 잘릴 수 있습니다. 원본 비율을 유지한 채 3:4 캔버스에 배치하고 남는 여백을 배경색이나 블러로 채우는 방식이 안전합니다. PIXS가 이 방식으로 변환해 줍니다.",
  },
];

export default function FashionGuidePage() {
  return (
    <article>
      <nav aria-label="현재 위치" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link> <span aria-hidden>/</span>{" "}
        <Link href="/guide" className="hover:text-blue-600">규격 가이드</Link> <span aria-hidden>/</span> 패션 플랫폼
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">
        에이블리·지그재그·무신사 대표이미지 &amp; 상세페이지 권장 규격 가이드
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">
        패션 버티컬 플랫폼은 모바일 피드가 세로형이라 3:4 또는 4:5 비율이 기본입니다. 에이블리, 지그재그, 무신사, W컨셉의 대표이미지 사이즈와 상세페이지 가로 크기, 스토어 프로필·배너 규격을 정리했습니다.
        (PIXS 정리 기준: {GUIDE_UPDATED})
      </p>

      <GuideCta position="top" />

      <GuideSection id="summary" title="한눈에 보는 패션 플랫폼 이미지 규격">
        <SpecTable
          caption="패션 버티컬 플랫폼 대표이미지 권장 규격"
          head={["플랫폼", "대표이미지 권장 사이즈", "비율"]}
          rows={[
            ["에이블리", "600x800px", "3:4 세로"],
            ["지그재그", "600x800px", "3:4 세로 (착용컷 위주)"],
            ["무신사", "1000x1333px 또는 1000x1250px", "3:4 또는 4:5 세로"],
            ["W컨셉", "1000x1333px", "3:4 세로"],
            ["상세페이지 가로폭", "1000px (무신사·29CM·지그재그 기준)", "세로 길이 자유"],
          ]}
        />
        <GuideNote>
          위 수치는 PIXS가 정리한 권장 기준이며, 플랫폼 정책과 입점 유형에 따라 달라질 수 있습니다. 등록 전 각 플랫폼 입점사 가이드의 최신 안내를 함께 확인하세요.
        </GuideNote>
      </GuideSection>

      <GuideSection id="ratio" title="3:4와 4:5 비율, 무엇이 다를까?">
        <p>
          3:4는 가로 3, 세로 4의 비율(0.75)이고 4:5는 가로 4, 세로 5의 비율(0.8)입니다. 가로를 1000px로 맞추면 3:4는 <strong>1000x1333px</strong>, 4:5는 <strong>1000x1250px</strong>이 됩니다. 3:4가 조금 더 길쭉한
          세로형이라 전신 착용컷에 유리하고, 4:5는 상반신·디테일 컷에 잘 어울립니다.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>비율 통일:</strong> 한 상품의 대표이미지와 추가 컷은 같은 비율로 맞추면 목록과 상세에서 레이아웃이 흔들리지 않습니다.
          </li>
          <li>
            <strong>해상도:</strong> 모바일 화면 확대를 고려해 가로 1000px 이상으로 만들어 두면, 나중에 작은 사이즈가 필요할 때 줄이기만 하면 됩니다. 늘리는 것은 화질을 해칩니다.
          </li>
          <li>
            <strong>정방형은 보조 컷으로:</strong> 에이블리 정방형(1000x1000) 같은 1:1은 필요한 곳에만 쓰고, 주 대표이미지는 세로형이 안전합니다.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="main-image" title="패션 대표이미지 구성 팁">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>세로로 촬영:</strong> 가로 사진을 나중에 세로로 자르면 모델이나 상품이 잘립니다. 처음부터 세로 프레임으로 촬영하고 머리·발끝 위아래에 여유를 두세요.
          </li>
          <li>
            <strong>상품이 주인공:</strong> 의류는 전체 실루엣이 보이게, 가방·슈즈는 프레임을 충분히 채우도록 구성합니다. 상품이 너무 작으면 썸네일에서 알아보기 어렵습니다.
          </li>
          <li>
            <strong>텍스트·로고 최소화:</strong> 대표이미지에 문구나 워터마크를 크게 넣으면 노출이나 검수에 불리할 수 있습니다. 워터마크는 한쪽 모서리에 작고 옅게 넣는 편이 무난합니다.
          </li>
          <li>
            <strong>색감 일관성:</strong> 같은 브랜드의 컷은 조명과 배경 톤을 맞추면 스토어 전체가 정돈되어 보입니다.
          </li>
          <li>
            <strong>용량 관리:</strong> 모바일 로딩을 위해 JPG 품질 약 85%로 압축하면 화질 손실은 적고 용량은 크게 줄어듭니다.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="detail" title="패션 상세페이지 가로 크기(1000px)와 분할">
        <p>
          무신사·29CM·지그재그 같은 패션 전문몰은 상세페이지를 가로 <strong>1000px</strong> 기준으로 만드는 것을 권장합니다. 스마트스토어(860px), 쿠팡(780px)보다 넓어서, 같은 상세페이지를 그대로 올리면 글자가 작아 보이거나 좌우에 여백이 생깁니다.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>리사이즈:</strong> 가로폭만 1000px로 비율 유지 리사이즈하면 세로 길이는 자동으로 따라옵니다.
          </li>
          <li>
            <strong>분할:</strong> 모델컷·착용 정보·사이즈표처럼 내용 단위로 나눠 올리면 모바일에서 로딩이 부드럽습니다. 글자가 잘리는 지점은 분할선을 옮겨 피하세요.
          </li>
          <li>
            <strong>사이즈표는 이미지로:</strong> 사이즈표는 글자가 작아지기 쉬우니 가로 1000px 기준으로 읽기 편한 글자 크기를 확인하세요.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="store" title="패션 플랫폼 스토어 프로필·배너 권장 사이즈">
        <SpecTable
          caption="패션 플랫폼 스토어 프로필 및 배너 사이즈"
          head={["용도", "권장 사이즈", "비율"]}
          rows={[
            ["에이블리·지그재그 프로필", "400x400px", "1:1"],
            ["지그재그 스토어 커버", "1080x540px", "2:1 와이드"],
            ["에이블리 마켓 커버", "1080x540px", "2:1 와이드"],
            ["무신사 브랜드 로고", "500x500px", "1:1"],
            ["무신사 브랜드 메인 배너", "1920x600px", "3.2:1 와이드"],
            ["무신사 브랜드 샵 배너", "1500x500px", "3:1 와이드"],
          ]}
        />
      </GuideSection>

      <GuideSection id="mistakes" title="패션 셀러가 자주 하는 이미지 실수">
        <GuideSub title="1. 가로 사진을 세로 프레임에 억지로 늘리기">
          <p>
            비율이 다른 사진을 3:4 캔버스에 맞추려고 가로·세로를 늘리면 모델 체형과 상품 형태가 왜곡됩니다. 항상 비율을 유지한 채 여백을 채우거나, 세로로 다시 촬영하세요.
          </p>
        </GuideSub>
        <GuideSub title="2. 컷마다 다른 비율과 크기">
          <p>
            대표이미지는 3:4, 추가 컷은 1:1처럼 섞으면 상세 화면에서 이미지가 들쭉날쭉해 보입니다. 상품 하나의 모든 컷은 같은 비율로 맞추세요.
          </p>
        </GuideSub>
        <GuideSub title="3. 용량을 줄이지 않고 업로드">
          <p>
            고화질 원본을 그대로 올리면 모바일에서 로딩이 느려져 이탈이 늘어납니다. 가로 1000px 기준으로 줄이고 JPG 품질 약 85%로 압축하면 화질 차이는 거의 느끼지 못하면서 용량은 크게 줄어듭니다.
          </p>
        </GuideSub>
        <GuideSub title="4. 색감이 실제와 다른 보정">
          <p>
            패션은 색상 불만이 반품으로 이어지기 쉽습니다. 조명과 보정으로 색이 달라졌다면 &lsquo;화면에 따라 색상이 다를 수 있음&rsquo; 안내를 상세페이지에 넣고, 가능하면 자연광에 가까운 색으로 맞추세요.
          </p>
        </GuideSub>
      </GuideSection>

      <GuideSection id="how-to" title="PIXS로 패션 플랫폼 규격 맞추는 방법">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            <strong>대표이미지</strong> 탭에서 사진을 올리고 [에이블리], [지그재그], [무신사], [W컨셉] 중 원하는 플랫폼을 선택하면 3:4 또는 4:5 캔버스로 변환됩니다. 원본은 자르지 않고 남는 여백만 채웁니다.
          </li>
          <li>
            <strong>프로필·배너</strong> 탭에서 스토어 로고와 커버 사이즈를 한 번에 만드세요.
          </li>
          <li>
            상세페이지는 <strong>상세페이지 분할</strong> 탭에서 가로폭 [패션 전문몰 무신사·29CM·지그재그 (1000px)]을 선택하세요.
          </li>
          <li>
            용량이 크면 <strong>용량 압축·변환</strong> 탭에서 목표 용량을 골라 JPG로 줄여 ZIP으로 내려받으세요.
          </li>
        </ol>
      </GuideSection>

      <GuideSection id="faq" title="자주 묻는 질문">
        <Faq items={FAQ} />
      </GuideSection>

      <GuideNote>
        위 수치는 PIXS가 정리한 권장 기준이며 플랫폼 정책에 따라 바뀔 수 있습니다. 등록 전 해당 플랫폼 입점사 센터의 최신 안내를 함께 확인하세요.
      </GuideNote>

      <GuideCta position="bottom" />

      <p className="mt-8 text-sm text-slate-600">
        다른 마켓이 궁금하다면{" "}
        <Link href="/guide/smartstore" className="font-semibold text-blue-600 hover:underline">
          스마트스토어
        </Link>
        {" · "}
        <Link href="/guide/coupang" className="font-semibold text-blue-600 hover:underline">
          쿠팡
        </Link>{" "}
        이미지 규격 가이드도 확인해 보세요.
      </p>
    </article>
  );
}
