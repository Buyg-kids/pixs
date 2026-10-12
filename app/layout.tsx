import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ADSENSE_CLIENT, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next.js 14+ 규격: themeColor는 metadata가 아니라 viewport export에 둠 (metadata에 넣으면 빌드 경고)
export const viewport: Viewport = {
  themeColor: "#18181b",
};

export const metadata: Metadata = {
  // 홈 화면에 추가했을 때 iOS 앱처럼 열리도록 (아이콘은 app/apple-icon.png 가 자동 연결됨)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PIXS",
  },
  // canonical / OG url / OG 이미지 등 상대 경로는 모두 이 주소 기준으로 만들어짐 (도메인은 lib/site.ts 에서 관리)
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "PIXS (픽스) - 스마트스토어·쿠팡 썸네일 리사이저 & 상세페이지 분할",
  description:
    "포토샵 없이 스마트스토어 대표이미지 1000x1000 비율 조절, 쿠팡 썸네일 순백색 배경 여백 채움, 에이블리 3:4 비율 변환 및 긴 상세페이지 자르기를 브라우저에서 무료로 해결하세요.",
  keywords: [
    "스마트스토어 대표이미지 사이즈",
    "쿠팡 썸네일 흰색 배경",
    "상세페이지 자르기",
    "에이블리 썸네일 비율",
    "쇼핑몰 이미지 용량 줄이기",
    "PIXS",
  ],
  openGraph: {
    title: "PIXS (픽스) - 스마트스토어·쿠팡 썸네일 리사이저 & 상세페이지 분할",
    description:
      "포토샵 없이 스마트스토어 대표이미지 1000x1000 비율 조절, 쿠팡 썸네일 순백색 배경 여백 채움, 에이블리 3:4 비율 변환 및 긴 상세페이지 자르기를 브라우저에서 무료로 해결하세요.",
    siteName: "PIXS",
    url: "/",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PIXS (픽스) - 스마트스토어·쿠팡 썸네일 리사이저 & 상세페이지 분할",
    description: "포토샵 없이 스마트스토어 대표이미지 1000x1000 비율 조절, 쿠팡 썸네일 순백색 배경 여백 채움, 에이블리 3:4 비율 변환 및 긴 상세페이지 자르기를 브라우저에서 무료로 해결하세요.",
  },
  robots: { index: true, follow: true },
  // 구글 서치 콘솔 · 네이버 서치어드바이저 사이트 소유 확인
  verification: {
    google: "hwRiSkjHN_Pt8P-VVkLV-yhgDA-gJ7uI1wyWgQeS_kc",
    other: {
      // 기존(vercel 주소)과 pixs.kr 소유확인 토큰을 함께 유지
      "naver-site-verification": [
        "6c28d09ea47e8bf5227b8f1b878052a0aa634055",
        "dae686abb1455a8fdd365dfb62b5292cfed83e33",
      ],
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 애드센스: 초기 HTML에 그대로 들어가야 사이트 소유 확인·심사 크롤러가 인식함 (next/script 는 data-nscript 속성이 붙고 클라이언트에서 삽입됨) */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
