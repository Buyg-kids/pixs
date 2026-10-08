import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PIXS (픽스) - 이커머스 셀러 이미지 도구",
    short_name: "PIXS",
    description: "스마트스토어, 쿠팡, 올웨이즈 셀러를 위한 이미지 리사이즈 및 상세페이지 편집 도구",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    icons: [
      // 설치 가능 조건(192·512 PNG)을 채우는 표준 아이콘 + 원형/둥근 마스크용 maskable 아이콘 (public/icons)
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
