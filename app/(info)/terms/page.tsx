import type { Metadata } from "next";
import Link from "next/link";
import { ContactSection, InfoTitle, Section } from "../_components/InfoParts";
import { OG_IMAGES } from "../../guide/_components/GuideParts";

const TITLE = "이용약관 | PIXS";
const DESCRIPTION =
  "PIXS 무료 웹 이미지 도구의 이용약관입니다. 서비스 내용, 이용자의 책임, 데이터·결과물에 대한 보증 면책 조항을 안내합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/terms", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

export default function TermsPage() {
  return (
    <article>
      <InfoTitle
        title="이용약관"
        effective
        intro="본 약관은 PIXS(이하 '서비스', pixs.kr)가 제공하는 무료 웹 이미지 유틸리티의 이용 조건을 정합니다. 서비스를 이용하면 본 약관에 동의한 것으로 봅니다."
      />

      <Section title="제1조 (목적)">
        <p>이 약관은 서비스의 이용과 관련하여 운영자와 이용자 사이의 권리·의무 및 책임 사항을 정하는 것을 목적으로 합니다.</p>
      </Section>

      <Section title="제2조 (서비스의 내용)">
        <p>
          서비스는 온라인 셀러와 소상공인이 상품 이미지를 규격에 맞게 다듬을 수 있도록 다음 기능을 <strong>무료로</strong> 제공하는 웹 유틸리티입니다.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>마켓별 대표이미지 규격 맞춤 변환, 스토어 프로필·배너 사이즈 변환</li>
          <li>상세페이지 분할·이어붙이기, 옵션 이미지 대량 편집</li>
          <li>이미지 용량 압축 및 포맷 변환, 워터마크·로고 삽입</li>
          <li>마켓별 이미지 규격 가이드 등 정보성 콘텐츠</li>
        </ul>
        <p>모든 이미지 처리는 이용자의 브라우저에서 이루어지며, 자세한 내용은 <Link href="/privacy" className="text-blue-600 underline">개인정보처리방침</Link>을 따릅니다.</p>
      </Section>

      <Section title="제3조 (이용자의 의무)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>이용자는 본인이 사용할 권리가 있는 이미지만 서비스에서 처리해야 하며, 제3자의 저작권·초상권·상표권 등을 침해하는 이미지를 처리해서는 안 됩니다.</li>
          <li>워터마크·로고 삽입 기능을 타인의 권리를 침해하거나 허위·기만 표시를 하는 데 사용해서는 안 됩니다.</li>
          <li>서비스의 정상적인 운영을 방해하거나 서비스 및 호스팅 인프라에 과도한 부하를 주는 행위를 해서는 안 됩니다.</li>
          <li>이미지 업로드에 따른 법적 책임은 이용자 본인에게 있습니다.</li>
        </ul>
      </Section>

      <Section title="제4조 (데이터 보증 면책)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            서비스는 <strong>이미지를 서버에 저장하지 않으므로</strong>, 작업 도중 브라우저 종료·새로고침·기기 오류 등으로 작업물이 사라져도 복구할 수 없습니다. 중요한 원본은 항상 별도로 보관해 주세요.
          </li>
          <li>
            변환·압축·분할 결과물의 화질, 색상, 용량, 파일 호환성은 이용자의 원본·기기·브라우저 환경에 따라 달라질 수 있으며, 서비스는 결과물이 특정 목적에 적합하다는 것을 보증하지 않습니다.
          </li>
          <li>
            서비스가 안내하는 마켓별 이미지 규격은 PIXS가 정리한 권장 기준이며, 각 마켓의 정책 변경에 따라 달라질 수 있습니다. 서비스를 이용했다고 해서 마켓의 상품 등록 승인이나 검수 통과를 보장하지 않으므로, 등록 전 해당 마켓의 최신 안내를 확인해야 합니다.
          </li>
          <li>
            서비스는 네이버, 쿠팡, 무신사, 에이블리, 지그재그, 아마존 등 언급되는 마켓·브랜드와 제휴 또는 후원 관계가 없는 독립 서비스이며, 해당 명칭의 상표권은 각 권리자에게 있습니다.
          </li>
        </ul>
      </Section>

      <Section title="제5조 (책임의 제한)">
        <p>
          서비스는 무료로 &lsquo;있는 그대로&rsquo; 제공됩니다. 운영자는 법령이 허용하는 범위에서 서비스 이용 또는 이용 불능으로 발생한 손해(데이터 손실, 상품 등록 반려, 매출 손실 등 간접·결과적 손해 포함)에 대해 책임을 지지 않습니다. 다만 운영자의 고의 또는 중대한 과실로 인한 손해는 예외로 합니다.
        </p>
      </Section>

      <Section title="제6조 (지식재산권)">
        <p>
          서비스의 디자인, 문구, 가이드 콘텐츠, 소스 코드에 대한 권리는 운영자에게 있으며 사전 동의 없이 복제·배포할 수 없습니다. 이용자가 업로드·생성한 이미지의 권리는 이용자에게 있습니다.
        </p>
      </Section>

      <Section title="제7조 (광고의 게재)">
        <p>
          운영자는 서비스 운영을 위해 구글 애드센스 등 광고를 게재할 수 있으며, 광고와 관련한 쿠키 사용은 <Link href="/privacy" className="text-blue-600 underline">개인정보처리방침</Link>에서 안내합니다. 광고에 포함된 외부 사이트 및 상품에 대한 책임은 해당 광고주에게 있습니다.
        </p>
      </Section>

      <Section title="제8조 (서비스의 변경·중단 및 약관의 개정)">
        <p>
          운영자는 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 필요한 경우 본 약관을 개정할 수 있습니다. 개정된 약관은 이 페이지에 시행일과 함께 게시하며, 게시 후 서비스를 계속 이용하면 개정 약관에 동의한 것으로 봅니다.
        </p>
      </Section>

      <Section title="제9조 (준거법)">
        <p>본 약관은 대한민국 법령에 따라 해석되며, 서비스와 관련한 분쟁은 관련 법령이 정한 관할 법원에서 해결합니다.</p>
      </Section>

      <ContactSection />
    </article>
  );
}
