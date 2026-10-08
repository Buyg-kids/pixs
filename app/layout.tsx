import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 배포 주소가 정해지면 NEXT_PUBLIC_SITE_URL 환경변수만 바꾸면 OG 이미지 등 상대 경로가 모두 이 주소 기준으로 만들어짐
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pixs-theta.vercel.app"),
  title: "PIXS (픽스) - 개인 셀러를 위한 올인원 무료 이미지 스튜디오",
  description:
    "설치 없이, 서버 비용 없이 100% 브라우저에서 안전하게! 1인 셀러와 소규모 쇼핑몰을 위한 네이버·쿠팡·아마존·쇼피 대표이미지 규격 맞춤, 상세페이지 분할·이어붙이기, 옵션 대량 편집, 용량 압축, 워터마크까지 무료로 해결하세요.",
  keywords: [
    "개인 셀러 이미지 편집",
    "1인 셀러 쇼핑몰 툴",
    "스마트스토어 이미지 편집",
    "쿠팡 대표이미지 규격",
    "상세페이지 분할",
    "상세페이지 이어붙이기",
    "옵션 이미지 대량 편집",
    "이미지 용량 줄이기",
    "WebP 변환",
    "워터마크 일괄 삽입",
    "쇼피 아마존 규격 맞춤",
    "무료 쇼핑몰 이미지 도구",
    "PIXS",
  ],
  openGraph: {
    title: "PIXS (픽스) - 개인 셀러를 위한 올인원 무료 이미지 스튜디오",
    description:
      "외주·포토샵 없이 브라우저에서 끝내는 1인 셀러 필수 이미지 작업. 규격 맞춤, 분할, 합치기, 대량 편집, 압축, 워터마크를 무료로 해결하세요.",
    siteName: "PIXS",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PIXS (픽스) - 개인 셀러를 위한 올인원 무료 이미지 스튜디오",
    description: "1인 셀러와 소규모 쇼핑몰을 위한 100% 브라우저 기반 무료 이미지 작업실",
  },
  robots: { index: true, follow: true },
  // 네이버 서치어드바이저 사이트 소유 확인
  verification: {
    other: {
      "naver-site-verification": "6c28d09ea47e8bf5227b8f1b878052a0aa634055",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
