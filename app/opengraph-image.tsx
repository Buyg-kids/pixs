import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "PIXS (픽스) - 개인 셀러를 위한 올인원 무료 이미지 스튜디오";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 카드에 쓰는 글자만 담은 Noto Sans KR 서브셋 (각 약 11KB). 카드 문구를 바꾸면 app/_fonts의 서브셋도 다시 만들어야 한글이 깨지지 않음
const fontRegular = await readFile(join(process.cwd(), "app/_fonts/NotoSansKR-400.ttf"));
const fontBold = await readFile(join(process.cwd(), "app/_fonts/NotoSansKR-700.ttf"));

const TAGS = ["대표이미지", "프로필배너", "상세분할", "옵션편집", "용량압축", "상세합치기", "워터마크"];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 130%)",
          color: "#ffffff",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: 999,
            background: "rgba(59, 130, 246, 0.2)",
            border: "1px solid rgba(147, 197, 253, 0.5)",
            color: "#bfdbfe",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          100% 브라우저 처리 · 서버 전송 없음 · 완전 무료
        </div>

        <div style={{ display: "flex", marginTop: 36, fontSize: 132, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
          PIXS (픽스)
        </div>

        <div style={{ display: "flex", marginTop: 18, fontSize: 48, fontWeight: 400, color: "#cbd5e1" }}>
          개인 셀러를 위한 올인원 이미지 스튜디오
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 54 }}>
          {TAGS.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                marginRight: 10,
                marginBottom: 10,
                padding: "8px 16px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                color: "#e2e8f0",
                fontSize: 22,
                fontWeight: 400,
              }}
            >
              {tag}
            </div>
          ))}
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
