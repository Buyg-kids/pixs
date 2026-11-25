// 상세페이지 규격 검사기: 분할해 올릴 이미지들의 가로폭 통일, 조각 길이, 장당·전체 용량을 검사 (모든 처리는 브라우저에서만 실행)

export type DetailMarketId = "smartstore" | "coupang" | "fashion" | "global";
export type DetailStatus = "pass" | "warn" | "fail";

export interface DetailRule {
  id: DetailMarketId;
  label: string;
  width: number; // 권장 가로폭(px)
  recMaxHeight: number; // 조각당 권장 최대 세로(px)
  desc: string;
}

export const DETAIL_RULES: DetailRule[] = [
  { id: "smartstore", label: "스마트스토어·자사몰", width: 860, recMaxHeight: 3000, desc: "가로 860px" },
  { id: "coupang", label: "쿠팡·11번가·G마켓·옥션", width: 780, recMaxHeight: 5000, desc: "가로 780px" },
  { id: "fashion", label: "패션 전문몰(무신사·29CM·지그재그)", width: 1000, recMaxHeight: 3000, desc: "가로 1000px" },
  { id: "global", label: "글로벌(아마존 A+·쇼피)", width: 970, recMaxHeight: 3000, desc: "가로 970px" },
];

export const REC_PIECE_MB = 3; // 장당 권장 용량
export const MAX_PIECE_MB = 10; // 장당 한도(안전선)
export const REC_TOTAL_MB = 15; // 전체 권장 합계(참고)
export const MIN_PIECE_HEIGHT = 300; // 이보다 얇은 조각은 이음새가 많아짐
export const MAX_FILES = 40;

export interface DetailFile {
  name: string;
  size: number;
  width: number;
  height: number;
}

export interface DetailRow {
  file: DetailFile;
  widthStatus: DetailStatus;
  heightStatus: DetailStatus;
  sizeStatus: DetailStatus;
  notes: string[];
}

export interface DetailSummary {
  rows: DetailRow[];
  widthUniform: boolean;
  widths: number[];
  totalBytes: number;
  totalHeight: number;
  fail: number;
  warn: number;
}

export function readDimensions(file: File): Promise<DetailFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ name: file.name, size: file.size, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(file.name));
    };
    img.src = url;
  });
}

const mb = (bytes: number) => bytes / (1024 * 1024);

export function evaluateDetail(files: DetailFile[], rule: DetailRule): DetailSummary {
  const rows: DetailRow[] = files.map((f) => {
    const notes: string[] = [];
    const wDiff = Math.abs(f.width - rule.width);
    const widthStatus: DetailStatus = wDiff <= 1 ? "pass" : wDiff / rule.width <= 0.05 ? "warn" : "fail";
    if (widthStatus !== "pass") notes.push(`가로 ${f.width}px → ${rule.width}px로 비율 유지 리사이즈`);

    let heightStatus: DetailStatus = "pass";
    if (f.height > rule.recMaxHeight) {
      heightStatus = "warn";
      notes.push(`세로 ${f.height.toLocaleString()}px: ${rule.recMaxHeight.toLocaleString()}px 안팎으로 나누면 로딩에 유리`);
    } else if (f.height < MIN_PIECE_HEIGHT) {
      heightStatus = "warn";
      notes.push(`세로 ${f.height}px: 너무 얇은 조각은 이음새가 많아짐`);
    }

    const sizeMB = mb(f.size);
    let sizeStatus: DetailStatus = "pass";
    if (sizeMB > MAX_PIECE_MB) {
      sizeStatus = "fail";
      notes.push("장당 10MB 초과: 압축하거나 더 잘게 분할");
    } else if (sizeMB > REC_PIECE_MB) {
      sizeStatus = "warn";
      notes.push(`장당 ${REC_PIECE_MB}MB 초과: JPG 품질 85% 안팎으로 압축 권장`);
    }
    return { file: f, widthStatus, heightStatus, sizeStatus, notes };
  });

  const widths = Array.from(new Set(files.map((f) => f.width))).sort((a, b) => a - b);
  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  const totalHeight = files.reduce((s, f) => s + f.height, 0);
  let fail = 0;
  let warn = 0;
  for (const r of rows) {
    for (const s of [r.widthStatus, r.heightStatus, r.sizeStatus]) {
      if (s === "fail") fail++;
      else if (s === "warn") warn++;
    }
  }
  const widthUniform = widths.length <= 1;
  if (!widthUniform) fail++;
  if (mb(totalBytes) > REC_TOTAL_MB) warn++;
  return { rows, widthUniform, widths, totalBytes, totalHeight, fail, warn };
}
