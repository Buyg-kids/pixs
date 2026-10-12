import type { Metadata } from "next";
import Link from "next/link";
import { ContactSection, InfoTitle, Section } from "../_components/InfoParts";
import { OG_IMAGES } from "../../guide/_components/GuideParts";

const TITLE = "개인정보처리방침 | PIXS";
const DESCRIPTION =
  "PIXS는 이미지를 서버로 전송·저장하지 않고 100% 브라우저에서 처리합니다. 개인정보 수집 항목, 구글 애드센스 및 쿠키 사용에 관한 안내를 확인하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/privacy", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

export default function PrivacyPage() {
  return (
    <article>
      <InfoTitle
        title="개인정보처리방침"
        effective
        intro="PIXS(이하 '서비스', pixs.kr)는 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다. 본 방침은 서비스를 이용할 때 어떤 정보가 어떻게 처리되는지 설명합니다."
      />

      <Section title="1. 수집하는 개인정보">
        <p>
          서비스는 <strong>회원가입·로그인 기능이 없으며</strong>, 이름·연락처·이메일·결제 정보 등 이용자를 식별할 수 있는 개인정보를 직접 수집하거나 저장하지 않습니다.
        </p>
      </Section>

      <Section title="2. 업로드한 이미지의 처리 (100% 브라우저 로컬 처리)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            이용자가 선택하거나 끌어다 놓은 이미지는 이용자의 기기(브라우저)에서 JavaScript와 HTML Canvas로만 처리됩니다.
          </li>
          <li>
            <strong>이미지는 서버로 전송되거나 저장되지 않으며</strong>, 운영자를 포함한 누구도 이용자의 이미지를 열람할 수 없습니다.
          </li>
          <li>변환 결과(이미지·ZIP 파일)도 이용자의 기기에서 생성되어 바로 내려받으며, 페이지를 닫거나 새로고침하면 작업 내용은 사라집니다.</li>
        </ul>
      </Section>

      <Section title="3. 자동으로 처리되는 정보 (호스팅)">
        <p>
          서비스는 제3자 호스팅 플랫폼(Vercel)에서 제공되며, 페이지를 전달하고 보안을 유지하기 위해 접속 IP 주소, 브라우저·기기 종류, 접속 시각, 요청한 주소 등의 기술 정보가 서버 로그에 자동으로 기록·처리될 수
          있습니다. 이 정보는 서비스 제공과 보안·오류 대응 목적으로만 쓰이며, 이용자의 이미지와는 무관합니다.
        </p>
      </Section>

      <Section title="4. 광고 및 쿠키 (Google AdSense)">
        <p>서비스는 운영 비용 충당을 위해 구글 애드센스(Google AdSense)가 제공하는 광고를 게재할 수 있으며, 이 경우 다음 사항이 적용됩니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Google을 포함한 제3자 광고 공급업체는 쿠키를 사용하여 이용자가 이 사이트 또는 다른 웹사이트를 이전에 방문한 기록을 바탕으로 광고를 게재합니다.</li>
          <li>
            Google의 광고 쿠키 사용으로 Google과 파트너는 이용자의 이 사이트 및/또는 인터넷상의 다른 사이트 방문 기록에 근거하여 광고를 게재할 수 있습니다.
          </li>
          <li>
            이용자는{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Google 광고 설정
            </a>
            에서 맞춤 광고를 해제할 수 있으며,{" "}
            <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              aboutads.info
            </a>
            에서 제3자 공급업체의 맞춤 광고용 쿠키 사용을 거부할 수 있습니다.
          </li>
          <li>
            유럽경제지역(EEA), 영국, 스위스 이용자에게는 법령에 따라 동의 선택 화면이 표시될 수 있으며, 광고는 이용자의 동의 선택에 따라 게재됩니다.
          </li>
          <li>
            Google이 광고 쿠키와 데이터를 사용하는 방식은{" "}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Google 광고 정책
            </a>
            에서 확인할 수 있습니다.
          </li>
        </ul>
        <p>광고 공급업체가 수집하는 정보에는 운영자가 접근할 수 없으며, 해당 정보의 처리는 각 공급업체의 개인정보처리방침을 따릅니다.</p>
      </Section>

      <Section title="5. 쿠키 거부 방법">
        <p>
          이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. 쿠키를 거부해도 PIXS의 이미지 변환 기능은 그대로 이용할 수 있으며, 광고가 맞춤형이 아닌 일반 광고로 표시될 수 있습니다.
        </p>
      </Section>

      <Section title="6. 이용자의 권리 및 아동의 개인정보">
        <p>
          서비스는 이용자를 식별할 수 있는 개인정보를 보관하지 않으므로 열람·정정·삭제를 요청할 개인정보가 없습니다. 광고 공급업체 등 제3자가 처리하는 정보에 관한 권리 행사는 해당 업체의 안내를 따라 주세요.
        </p>
        <p>서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지 않습니다.</p>
      </Section>

      <Section title="7. 방침의 변경">
        <p>
          본 방침은 법령이나 서비스 변경에 따라 개정될 수 있으며, 개정 시 이 페이지에 시행일과 함께 게시합니다. 이용 약관은 <Link href="/terms" className="text-blue-600 underline">이용약관</Link>에서 확인할 수 있습니다.
        </p>
      </Section>

      <ContactSection />
    </article>
  );
}
