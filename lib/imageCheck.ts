// 대표이미지 검수기: 마켓별 규격(PIXS 정리 기준)과 브라우저 Canvas 픽셀 분석 (모든 처리는 클라이언트에서만 실행)

export type MarketId = "smartstore" | "coupang" | "fashion" | "open";
export type Status = "pass" | "warn" | "fail";

export interface MarketRule {
  id: MarketId;
  label: string;
  desc: string;
  ratio: [number, number];
  ratioLabel: string;
  minShort: number; // 짧은 변 최소(px)
  recShort: number; // 짧은 변 권장(px)
  maxMB: number;
  recMB: number;
  needWhite: boolean; // 순백색 배경 필수 여부
  fillMin: number | null; // 상품 면적 권장 비율(%)
  presetHref: string; // 도구에서 바로 맞추기
}

export const MARKETS: MarketRule[] = [
  {
    id: "smartstore",
    label: "스마트스토어",
    desc: "1:1 · 1000x1000 권장",
    ratio: [1, 1],
    ratioLabel: "1:1",
    minShort: 640,
    recShort: 1000,
    maxMB: 20,
    recMB: 2,
    needWhite: false,
    fillMin: null,
    presetHref: "/?preset=smartstore",
  },
  {
    id: "coupang",
    label: "쿠팡",
    desc: "순백색 배경 · 상품 85%",
    ratio: [1, 1],
    ratioLabel: "1:1",
    minShort: 500,
    recShort: 1000,
    maxMB: 10,
    recMB: 2,
    needWhite: true,
    fillMin: 85,
    presetHref: "/?preset=coupang",
  },
  {
    id: "fashion",
    label: "에이블리·지그재그·무신사",
    desc: "3:4 세로형",
    ratio: [3, 4],
    ratioLabel: "3:4",
    minShort: 600,
    recShort: 1000,
    maxMB: 5,
    recMB: 2,
    needWhite: false,
    fillMin: null,
    presetHref: "/?preset=ably",
  },
  {
    id: "open",
    label: "G마켓·옥션·11번가",
    desc: "1:1 · 3MB 이하 권장",
    ratio: [1, 1],
    ratioLabel: "1:1",
    minShort: 500,
    recShort: 1000,
    maxMB: 10,
    recMB: 3,
    needWhite: false,
    fillMin: null,
    presetHref: "/?preset=smartstore",
  },
];

/** 마켓과 무관하게 이미지에서 측정하는 값 */
export interface Measure {
  width: number;
  height: number;
  edgeTotal: number;
  edgeNotPure: number; // 가장자리 중 순백(255,255,255, 불투명)이 아닌 픽셀 수
  edgeNearWhite: number; // 그중 눈에는 흰색이지만 순백이 아닌 픽셀 수 (예: 254,254,254)
  hasTransparency: boolean;
  bbox: { x: number; y: number; w: number; h: number } | null; // 흰 배경이 아닌 영역의 바운딩 박스
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface CheckItem {
  key: string;
  title: string;
  value: string;
  status: Status;
  detail: string;
  fix?: string;
}

const MAX_PIXELS = 36_000_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    img.src = url;
  });
}

export async function measureImage(file: File): Promise<Measure> {
  const img = await loadImage(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (w * h > MAX_PIXELS) throw new Error("too-large");

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  let edgeNotPure = 0;
  let edgeNearWhite = 0;
  const checkEdge = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (r === 255 && g === 255 && b === 255 && a === 255) return;
    edgeNotPure++;
    if (a === 255 && Math.min(r, g, b) >= 245) edgeNearWhite++;
  };
  for (let x = 0; x < w; x++) {
    checkEdge(x, 0);
    if (h > 1) checkEdge(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    checkEdge(0, y);
    if (w > 1) checkEdge(w - 1, y);
  }
  const edgeTotal = w > 1 && h > 1 ? 2 * w + 2 * (h - 2) : w * h;

  // 상품 영역: 투명하지 않고(알파 128 이상) 거의 흰색(채널 245 이상)이 아닌 픽셀의 바운딩 박스
  let hasTransparency = false;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    let rowStart = y * w * 4;
    for (let x = 0; x < w; x++) {
      const i = rowStart + x * 4;
      const a = data[i + 3];
      if (a < 255) hasTransparency = true;
      if (a >= 128 && (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bbox = maxX >= 0 ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null;
  return { width: w, height: h, edgeTotal, edgeNotPure, edgeNearWhite, hasTransparency, bbox };
}

const mb = (bytes: number) => bytes / (1024 * 1024);
const fmtMB = (bytes: number) => (bytes >= 1024 * 1024 ? `${mb(bytes).toFixed(2)}MB` : `${(bytes / 1024).toFixed(0)}KB`);

export function evaluate(m: Measure, f: FileInfo, rule: MarketRule): CheckItem[] {
  const items: CheckItem[] = [];
  const short = Math.min(m.width, m.height);

  // 1. 해상도
  items.push({
    key: "resolution",
    title: "해상도",
    value: `${m.width} x ${m.height}px`,
    status: short >= rule.recShort ? "pass" : short >= rule.minShort ? "warn" : "fail",
    detail:
      short >= rule.recShort
        ? `짧은 변이 권장 기준(${rule.recShort}px) 이상입니다.`
        : short >= rule.minShort
          ? `최소 기준(${rule.minShort}px)은 넘지만 권장 ${rule.recShort}px보다 작아 확대·고밀도 화면에서 흐릿할 수 있습니다.`
          : `짧은 변이 최소 기준(${rule.minShort}px)보다 작습니다.`,
    fix: short >= rule.recShort ? undefined : "더 큰 원본으로 다시 만드세요. 작은 이미지를 키우면 화질이 좋아지지 않습니다.",
  });

  // 2. 비율
  const target = rule.ratio[0] / rule.ratio[1];
  const actual = m.width / m.height;
  const off = Math.abs(actual - target) / target;
  items.push({
    key: "ratio",
    title: `비율 (${rule.ratioLabel})`,
    value: `${actual.toFixed(3)} : 1`,
    status: off <= 0.01 ? "pass" : rule.id === "coupang" || rule.id === "smartstore" ? "fail" : "warn",
    detail: off <= 0.01 ? `${rule.ratioLabel} 비율에 맞습니다.` : `${rule.ratioLabel}과 ${(off * 100).toFixed(0)}% 차이가 납니다. 마켓 목록에서 잘리거나 여백이 붙을 수 있습니다.`,
    fix: off <= 0.01 ? undefined : "상품을 늘리지 말고 비율을 유지한 채 여백을 채워 맞추세요.",
  });

  // 3. 용량
  const sizeMB = mb(f.size);
  items.push({
    key: "size",
    title: "파일 용량",
    value: fmtMB(f.size),
    status: sizeMB > rule.maxMB ? "fail" : sizeMB > rule.recMB ? "warn" : "pass",
    detail:
      sizeMB > rule.maxMB
        ? `업로드 한도(${rule.maxMB}MB)를 넘습니다.`
        : sizeMB > rule.recMB
          ? `한도 안이지만 로딩 최적화 권장(${rule.recMB}MB 이하)보다 큽니다.`
          : `권장 용량(${rule.recMB}MB 이하) 안입니다.`,
    fix: sizeMB > rule.recMB ? "JPG 품질 85% 안팎으로 압축하세요." : undefined,
  });

  // 4. 포맷
  const t = f.type.toLowerCase();
  const okType = t === "image/jpeg" || t === "image/png";
  items.push({
    key: "format",
    title: "파일 형식",
    value: t.replace("image/", "").toUpperCase() || "알 수 없음",
    status: okType ? "pass" : "warn",
    detail: okType ? "JPG·PNG는 모든 마켓에서 가장 안전한 형식입니다." : "WebP·GIF 등은 마켓·카테고리에 따라 업로드가 제한될 수 있습니다.",
    fix: okType ? undefined : "JPG로 변환해서 올리는 것을 권장합니다.",
  });

  // 5. 투명도
  items.push({
    key: "alpha",
    title: "투명 배경",
    value: m.hasTransparency ? "투명 영역 있음" : "없음",
    status: m.hasTransparency ? (rule.needWhite ? "fail" : "warn") : "pass",
    detail: m.hasTransparency
      ? "투명 영역은 마켓과 기기에 따라 검은색이나 회색으로 보일 수 있습니다."
      : "불투명 이미지입니다.",
    fix: m.hasTransparency ? "배경을 #FFFFFF로 채운 JPG로 변환하세요." : undefined,
  });

  // 6. 가장자리 순백색
  const pureOk = m.edgeNotPure === 0;
  items.push({
    key: "white",
    title: rule.needWhite ? "순백색 배경 (RGB 255)" : "배경 흰색 여부 (참고)",
    value: pureOk ? "가장자리 전부 순백" : `${m.edgeNotPure.toLocaleString()}픽셀이 순백 아님`,
    status: pureOk ? "pass" : rule.needWhite ? "fail" : "pass",
    detail: pureOk
      ? "네 변의 모든 픽셀이 정확히 RGB(255, 255, 255)입니다."
      : rule.needWhite
        ? m.edgeNearWhite > 0
          ? `눈에는 흰색이지만 (254,254,254)처럼 순백이 아닌 픽셀이 ${m.edgeNearWhite.toLocaleString()}개 있습니다. 쿠팡 반려의 대표 원인입니다.`
          : "가장자리에 흰색이 아닌 픽셀이 있습니다."
        : "이 마켓은 흰색 배경이 필수가 아닙니다.",
    fix: !pureOk && rule.needWhite ? "배경을 #FFFFFF로 다시 채우고 JPG 품질 85% 이상으로 저장하세요." : undefined,
  });

  // 7. 상품 면적 (쿠팡 등 fillMin 기준이 있는 마켓)
  if (rule.fillMin !== null) {
    const area = m.bbox ? (m.bbox.w * m.bbox.h) / (m.width * m.height) : 0;
    const pct = Math.round(area * 100);
    items.push({
      key: "fill",
      title: `상품 면적 (권장 ${rule.fillMin}%)`,
      value: m.bbox ? `${pct}%` : "상품 없음",
      status: pct >= rule.fillMin ? "pass" : "warn",
      detail:
        pct >= rule.fillMin
          ? "상품이 프레임을 충분히 채웁니다."
          : "상품이 프레임에서 차지하는 비율이 권장보다 낮아 목록에서 작게 보일 수 있습니다. (흰색이 아닌 영역의 바운딩 박스 기준 근사값)",
      fix: pct >= rule.fillMin ? undefined : "상품 주변 여백을 줄여 다시 크롭하세요.",
    });
  }
  return items;
}

export function summarize(items: CheckItem[]) {
  return {
    fail: items.filter((i) => i.status === "fail").length,
    warn: items.filter((i) => i.status === "warn").length,
    pass: items.filter((i) => i.status === "pass").length,
  };
}
