import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "PIXS - 쇼핑몰 올인원 이미지 스튜디오";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 카드에 쓰는 글자만 담은 Noto Sans KR 서브셋(각 약 18KB). 카드 문구를 바꾸면 app/_fonts의 서브셋도 같은 글자를 포함해 다시 만들어야 한글이 깨지지 않음
const fontRegular = await readFile(join(process.cwd(), "app/_fonts/NotoSansKR-400.ttf"));
const fontBold = await readFile(join(process.cwd(), "app/_fonts/NotoSansKR-700.ttf"));

const MARKETS = ["스마트스토어", "쿠팡", "에이블리", "무신사", "지그재그"];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "linear-gradient(135deg, #0b1220 0%, #12203f 62%, #1d3a8a 135%)",
          color: "#ffffff",
          fontFamily: "Noto Sans KR",
        }}
      >
        {/* 상단: 신뢰 문구 */}
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: 999,
            background: "rgba(59, 130, 246, 0.18)",
            border: "1px solid rgba(147, 197, 253, 0.45)",
            color: "#bfdbfe",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          100% 브라우저 처리 · 서버 전송 없음 · 무료
        </div>

        {/* 중앙: 브랜드 + 서브 카피 */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 168, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>PIXS</div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 52, fontWeight: 700, color: "#e2e8f0" }}>
            쇼핑몰 올인원 이미지 스튜디오
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 28, fontWeight: 400, color: "#94a3b8" }}>
            썸네일 리사이즈 · 상세페이지 분할 · 용량 압축
          </div>
        </div>

        {/* 하단: 마켓 뱃지 + 도메인 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            {MARKETS.map((m) => (
              <div
                key={m}
                style={{
                  display: "flex",
                  marginRight: 12,
                  padding: "10px 22px",
                  borderRadius: 14,
                  background: "rgba(255, 255, 255, 0.09)",
                  border: "1px solid rgba(255, 255, 255, 0.24)",
                  color: "#e2e8f0",
                  fontSize: 26,
                  fontWeight: 400,
                }}
              >
                {m}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 400, color: "#94a3b8" }}>pixs.kr</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: fontRegular, weight: 400, style: "normal" },
        { name: "Noto Sans KR", data: fontBold, weight: 700, style: "normal" },
      ],
    }
  );
}
