import type { Metadata } from "next";
import Link from "next/link";
import { ContactSection, InfoTitle, Section } from "../_components/InfoParts";
import { Faq, GuideCta, OG_IMAGES } from "../../guide/_components/GuideParts";

const TITLE = "PIXS 서비스 소개 - 1인 셀러를 위한 무료 이미지 스튜디오";
const DESCRIPTION =
  "PIXS는 1인 셀러와 소상공인의 반복적인 이미지 규격 리사이징·용량 최적화 업무를 줄이기 위해 만든 100% 브라우저 기반 무료 이미지 스튜디오입니다. 제작 취지와 주요 기능을 소개합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["PIXS 소개", "셀러 이미지 편집", "무료 이미지 리사이징", "쇼핑몰 이미지 용량 줄이기", "1인 셀러 도구"],
  alternates: { canonical: "/about" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/about", siteName: "PIXS", locale: "ko_KR", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

const FEATURES = [
  { name: "대표이미지", desc: "스마트스토어·쿠팡·에이블리·무신사 등 마켓별 대표이미지 규격(1:1, 3:4, 4:5)에 맞춰 원본을 자르지 않고 변환합니다." },
  { name: "프로필·배너", desc: "스토어 로고, 프로필, 상단 배너를 마켓별 권장 사이즈로 한 번에 만듭니다." },
  { name: "상세페이지 분할·이어붙이기", desc: "긴 상세페이지를 마켓 권장 가로폭에 맞춰 나누거나, 여러 컷을 하나로 이어 붙입니다." },
  { name: "옵션 대량 편집", desc: "색상·사이즈별 옵션 이미지를 여러 장 한꺼번에 같은 규격으로 편집합니다." },
  { name: "용량 압축·변환", desc: "마켓별 용량 기준에 맞춰 JPG·PNG·WebP로 압축하고 변환해 ZIP으로 내려받습니다." },
  { name: "워터마크 삽입", desc: "9분할 위치, 회전, 크기, 투명도를 조절해 여러 장에 일괄 삽입합니다." },
];

const FAQ = [
  { q: "정말 무료인가요? 가입이 필요한가요?", a: "무료이며 회원가입이나 로그인 없이 바로 쓸 수 있습니다. 서비스 운영 비용은 광고로 충당할 수 있습니다." },
  { q: "내 이미지가 서버에 올라가나요?", a: "아니요. 모든 처리는 내 브라우저 안에서만 이루어지고, 이미지는 서버로 전송·저장되지 않습니다. 자세한 내용은 개인정보처리방침을 참고하세요." },
  { q: "어떤 기기에서 쓸 수 있나요?", a: "설치 없이 최신 크롬·엣지·사파리 등 브라우저가 있는 PC와 모바일에서 사용할 수 있습니다." },
];

export default function AboutPage() {
  return (
    <article>
      <InfoTitle
        title="PIXS 서비스 소개"
        intro="PIXS(픽스)는 1인 셀러와 소규모 쇼핑몰을 위한 올인원 무료 이미지 스튜디오입니다. 설치도, 서버 업로드도, 포토샵도 없이 브라우저에서 바로 이미지 작업을 끝낼 수 있도록 만들었습니다."
      />

      <Section title="만든 이유">
        <p>
          온라인으로 상품을 파는 1인 셀러와 소상공인은 같은 사진을 마켓마다 다른 규격으로 반복해서 자르고, 늘리고, 용량을 줄이는 일에 많은 시간을 씁니다. 스마트스토어는 1:1, 에이블리·무신사 같은 패션 앱은 3:4 또는 4:5,
          쿠팡은 순백색 배경처럼 마켓마다 기준이 달라서, 상품 하나를 등록할 때마다 같은 작업을 되풀이하게 됩니다.
        </p>
        <p>
          PIXS는 이 반복 작업을 줄이는 것을 목표로 합니다. 규격을 외우지 않아도 마켓을 고르면 알맞은 사이즈로 변환되고, 규격의 근거와 주의점은{" "}
          <Link href="/guide" className="text-blue-600 underline">
            규격 가이드
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </Section>

      <Section title="주요 기능">
        <ul className="space-y-2">
          {FEATURES.map((f) => (
            <li key={f.name} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="font-bold text-slate-900">{f.name}</p>
              <p className="mt-1 text-slate-600">{f.desc}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="PIXS가 지키는 원칙">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>내 이미지는 내 기기에서만:</strong> 업로드·저장 없이 브라우저에서 처리합니다. (<Link href="/privacy" className="text-blue-600 underline">개인정보처리방침</Link>)
          </li>
          <li>
            <strong>무료, 설치 없음:</strong> 회원가입 없이 접속해서 바로 사용합니다.
          </li>
          <li>
            <strong>투명한 기준:</strong> 규격 수치는 &lsquo;PIXS 정리 기준&rsquo;임을 밝히고, 마켓 정책이 바뀔 수 있음을 안내합니다. (<Link href="/terms" className="text-blue-600 underline">이용약관</Link>)
          </li>
        </ul>
      </Section>

      <Section title="자주 묻는 질문">
        <Faq items={FAQ} />
      </Section>

      <ContactSection />

      <GuideCta position="bottom" />
    </article>
  );
}
