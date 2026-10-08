"use client";

import React, { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Ratio = "1:1" | "3:4" | "4:5" | "자유";
type PresetKind = "product" | "store";

type TabId = PresetKind | "detail" | "batch" | "compress" | "merge" | "watermark";

const TABS: { id: TabId; label: string }[] = [
  { id: "product", label: "대표이미지" },
  { id: "store", label: "프로필·배너" },
  { id: "detail", label: "상세페이지 분할" },
  { id: "batch", label: "옵션 대량 편집" },
  { id: "compress", label: "용량 압축·변환" },
  { id: "merge", label: "상세페이지 이어붙이기" },
  { id: "watermark", label: "워터마크 삽입" },
];

// 워터마크·로고 일괄 삽입
const WM_MAX = 30;
type WmKind = "text" | "logo";
type WmPos = "tl" | "t" | "tr" | "l" | "center" | "r" | "bl" | "b" | "br" | "tile";

// 9개 위치 격자 (행 순서대로)
const WM_GRID: { id: WmPos; label: string; title: string }[] = [
  { id: "tl", label: "↖", title: "좌측 상단" },
  { id: "t", label: "↑", title: "상단 중앙" },
  { id: "tr", label: "↗", title: "우측 상단" },
  { id: "l", label: "←", title: "좌측 중앙" },
  { id: "center", label: "●", title: "정중앙" },
  { id: "r", label: "→", title: "우측 중앙" },
  { id: "bl", label: "↙", title: "좌측 하단" },
  { id: "b", label: "↓", title: "하단 중앙" },
  { id: "br", label: "↘", title: "우측 하단 (권장)" },
];
const WM_ROTATIONS: { v: number; label: string }[] = [
  { v: 0, label: "수평 (0°)" },
  { v: -45, label: "대각선 ↗ (-45°)" },
  { v: 45, label: "대각선 ↘ (45°)" },
];
const WM_PLACEHOLDER = "루나 공방 / DO NOT COPY";
// 글꼴/로고 크기는 이미지 가로폭 대비 % (글꼴 높이 기준 / 로고 가로폭 기준)
const WM_TEXT_SCALE = { min: 2, max: 14, def: 5.5 };
const WM_LOGO_SCALE = { min: 10, max: 60, def: 25 };

interface WmOptions {
  kind: WmKind;
  text: string;
  color: string;
  scale: number; // 가로폭 대비 %
  rotation: number; // 0, 45, -45 (도)
  pos: WmPos;
  opacity: number; // 10~100 (%)
  logo: HTMLImageElement | null;
}

interface WmItem {
  id: number;
  name: string;
  file: File;
  small: HTMLCanvasElement; // 미리보기용 축소본
  thumbUrl: string; // 목록 카드용
}

// 워터마크 합성: 크기는 이미지 가로폭 기준 비율이라 미리보기와 원본 해상도 결과가 같은 모양이 됨
const drawWatermark = (ctx: CanvasRenderingContext2D, w: number, h: number, o: WmOptions) => {
  const rad = (o.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const tile = o.pos === "tile";
  let sw = 0; // 회전 전 워터마크 크기
  let sh = 0;
  let fs = 0;
  let stamp: (x: number, y: number) => void; // 좌상단 (x, y) 기준으로 그림

  ctx.save();
  if (o.kind === "text") {
    const text = o.text.trim();
    if (!text) {
      ctx.restore();
      return;
    }
    const setFont = (size: number) => {
      ctx.font = `700 ${size}px 'Malgun Gothic','Apple SD Gothic Neo',sans-serif`;
    };
    fs = Math.max(10, (w * o.scale) / 100);
    setFont(fs);
    sw = ctx.measureText(text).width;
    sh = fs * 1.2;
    if (!tile) {
      // 회전한 뒤의 외곽 크기가 이미지를 넘지 않도록 축소
      const fit = Math.min(1, (w * 0.9) / (sw * cos + sh * sin), (h * 0.9) / (sw * sin + sh * cos));
      if (fit < 1) {
        fs *= fit;
        setFont(fs);
        sw = ctx.measureText(text).width;
        sh = fs * 1.2;
      }
    }
    ctx.fillStyle = o.color;
    ctx.textBaseline = "top";
    ctx.shadowColor = isLightColor(o.color) ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"; // 밝은/어두운 배경 모두에서 읽히도록
    ctx.shadowBlur = fs * 0.12;
    stamp = (x, y) => ctx.fillText(text, x, y + fs * 0.1);
  } else {
    const logo = o.logo;
    if (!logo) {
      ctx.restore();
      return;
    }
    sw = (w * o.scale) / 100;
    sh = (sw * logo.height) / logo.width;
    if (!tile) {
      const fit = Math.min(1, (w * 0.9) / (sw * cos + sh * sin), (h * 0.9) / (sw * sin + sh * cos));
      sw *= fit;
      sh *= fit;
    }
    stamp = (x, y) => ctx.drawImage(logo, x, y, sw, sh);
  }

  ctx.globalAlpha = o.opacity / 100;
  if (tile) {
    // 격자 반복: 이미지 중심을 기준으로 선택한 각도로 기울여 전체를 덮음
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rad);
    const gx = sw * 1.5;
    const gy = sh * 3;
    const r = Math.hypot(w, h) / 2;
    let row = 0;
    for (let y = -r; y < r; y += gy, row++) {
      for (let x = -r + (row % 2 ? gx / 2 : 0); x < r; x += gx) stamp(x, y);
    }
  } else {
    // 9칸 위치: 회전 후 외곽(bw x bh) 기준으로 가장자리 여백을 두고 배치한 뒤, 그 중심에서 회전해 그림
    const bw = sw * cos + sh * sin;
    const bh = sw * sin + sh * cos;
    const m = w * 0.03;
    const col = o.pos === "tl" || o.pos === "l" || o.pos === "bl" ? 0 : o.pos === "tr" || o.pos === "r" || o.pos === "br" ? 2 : 1;
    const row = o.pos === "tl" || o.pos === "t" || o.pos === "tr" ? 0 : o.pos === "bl" || o.pos === "b" || o.pos === "br" ? 2 : 1;
    const cx = col === 0 ? m + bw / 2 : col === 2 ? w - m - bw / 2 : w / 2;
    const cy = row === 0 ? m + bh / 2 : row === 2 ? h - m - bh / 2 : h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    stamp(-sw / 2, -sh / 2);
  }
  ctx.restore();
};

// #RRGGBB 색의 밝기 판별 (텍스트 그림자 색 결정용)
function isLightColor(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return true;
  const n = parseInt(m[1], 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 140;
}


// 상세페이지 이어붙이기(병합)
const MERGE_MAX = 40;

const MERGE_WIDTHS: { id: string; label: string; width: number | null }[] = [
  { id: "smartstore", label: "스마트스토어·자사몰 표준 (860px)", width: 860 },
  { id: "coupang", label: "쿠팡·11번가·오픈마켓 (780px)", width: 780 },
  { id: "fashion", label: "패션 전문몰 무신사·29CM·지그재그 (1000px)", width: 1000 },
  { id: "global", label: "글로벌 아마존 A+·쇼피 상세 (970px)", width: 970 },
  { id: "max", label: "원본 최대폭 맞춤 (가장 넓은 이미지 기준)", width: null },
  { id: "first", label: "원본 가로폭 유지 (첫 번째 이미지 기준)", width: null },
];

// maxH: 해당 포맷/브라우저에서 안전하게 인코딩할 수 있는 최대 높이
const MERGE_FORMATS: { id: string; label: string; mime: string; ext: string; quality: number; maxH: number }[] = [
  { id: "jpg", label: "JPG 고화질 (0.92)", mime: "image/jpeg", ext: "jpg", quality: 0.92, maxH: 32767 },
  { id: "webp", label: "WebP 초경량 (0.85)", mime: "image/webp", ext: "webp", quality: 0.85, maxH: 16383 },
];

interface MergeItem {
  id: number;
  name: string;
  file: File;
  w: number;
  h: number;
  thumbUrl: string; // 목록·미리보기용 축소본 (원본은 합성 시점에 다시 읽음)
}

// 이미지 용량 압축·변환
type CompFormat = "webp" | "jpg" | "png";

const COMP_FORMATS: { id: CompFormat; label: string; desc: string; mime: string; ext: string }[] = [
  { id: "webp", label: "WebP", desc: "로딩 최적화 권장", mime: "image/webp", ext: "webp" },
  { id: "jpg", label: "JPG", desc: "호환성 우선", mime: "image/jpeg", ext: "jpg" },
  { id: "png", label: "PNG", desc: "무손실·투명 유지", mime: "image/png", ext: "png" },
];

// 목표 용량 프리셋: mb가 null이면 목표 없이 품질 슬라이더 값만 적용
const COMP_TARGETS: { id: string; label: string; desc: string; mb: number | null }[] = [
  { id: "none", label: "목표 없음", desc: "품질 슬라이더 값 그대로", mb: null },
  { id: "coupang", label: "쿠팡 권장 (2MB 이하)", desc: "모바일 로딩 최적", mb: 2 },
  { id: "smartstore", label: "스마트스토어/상세 권장 (5MB 이하)", desc: "상세페이지·대표이미지 안전선", mb: 5 },
  { id: "light", label: "초경량 모바일 최적화 (1MB 이하)", desc: "가장 가벼운 로딩", mb: 1 },
  { id: "custom", label: "직접 용량 지정 (MB)", desc: "원하는 용량 입력", mb: null },
];
const COMP_QUALITY_MIN = 10;
const COMP_QUALITY_FLOOR = 0.5; // 목표 용량 맞춤 시 화질을 여기까지만 낮추고, 그래도 크면 해상도를 줄임
const RESIZE_MAX_W = 1920;

interface CompResult {
  blob: Blob;
  size: number;
  kept: boolean; // 압축 결과가 더 커서 원본을 그대로 쓴 경우
  quality: number | null; // 최종 적용 화질(%) — PNG·원본 유지는 null
  scaledDown: boolean; // 목표 용량을 맞추기 위해 해상도를 줄인 경우
}

interface CompItem {
  id: number;
  name: string;
  file: File;
  sig?: string; // 결과가 만들어진 시점의 설정 값 (설정이 바뀌면 재압축)
  result?: CompResult;
  error?: string;
}

const formatBytes = (n: number): string =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

// 옵션 썸네일 대량 변환
const BATCH_RECOMMENDED = 50; // 권장 장수
const BATCH_MAX = 100; // 안전을 위한 상한

const BATCH_SIZES: { id: string; label: string; desc: string; w: number; h: number }[] = [
  { id: "sq1000", label: "1:1 정방형 (1000x1000)", desc: "네이버, 쿠팡, 쇼피, 11번가, 토스쇼핑 공용 표준 (권장)", w: 1000, h: 1000 },
  { id: "p600", label: "3:4 세로형 (600x800)", desc: "에이블리, 지그재그 의류 옵션", w: 600, h: 800 },
  { id: "p1333", label: "3:4 고해상도 (1000x1333)", desc: "무신사, W컨셉 패션 옵션", w: 1000, h: 1333 },
  { id: "sq500", label: "1:1 경량 (500x500)", desc: "가벼운 옵션 이미지 (기존 옵션 표준)", w: 500, h: 500 },
  { id: "sq300", label: "1:1 초소형 (300x300)", desc: "아이콘·목록용 소형 썸네일", w: 300, h: 300 },
];

interface BatchItem {
  id: number;
  name: string;
  file: File;
  small: HTMLCanvasElement; // 카드 미리보기용 축소본 (원본은 변환 시점에 다시 읽어 메모리 절약)
  autoColor: string;
}

// 상세페이지 세로 분할 옵션
const DETAIL_WIDTHS: { id: string; label: string; desc: string; width: number | null }[] = [
  { id: "smartstore", label: "스마트스토어·자사몰 표준", desc: "가로 860px (기본값 · 권장)", width: 860 },
  { id: "coupang", label: "쿠팡·11번가·오픈마켓", desc: "가로 780px", width: 780 },
  { id: "fashion", label: "패션 전문몰 무신사·29CM·지그재그", desc: "가로 1000px", width: 1000 },
  { id: "global", label: "글로벌 아마존 A+·쇼피 상세", desc: "가로 970px", width: 970 },
  { id: "original", label: "원본 가로폭 유지", desc: "리사이즈 없이 그대로", width: null },
];

type SplitMode = "equal" | "fixed";

const SPLIT_MODES: { id: SplitMode; label: string; desc: string }[] = [
  { id: "equal", label: "균등 분할 (권장)", desc: "조각 높이를 똑같이 배분" },
  { id: "fixed", label: "고정 단위 분할", desc: "마지막 400px 미만 자투리는 앞 조각에 흡수" },
];

const MIN_TAIL = 400; // 고정 단위 분할에서 이보다 얇은 마지막 조각은 앞 조각에 합침
const MIN_PIECE = 100; // 분할선 수동 조정 시 조각 최소 높이

// 분할 지점(누적 높이, 처음/끝 제외)을 계산
const computeCuts = (totalH: number, unit: number, mode: SplitMode): number[] => {
  const cuts: number[] = [];
  if (mode === "equal") {
    const n = Math.max(1, Math.ceil(totalH / unit));
    const base = Math.floor(totalH / n);
    const extra = totalH - base * n; // 앞쪽 조각부터 1px씩 더해 합계를 맞춤
    let acc = 0;
    for (let i = 0; i < n - 1; i++) {
      acc += base + (i < extra ? 1 : 0);
      cuts.push(acc);
    }
  } else {
    const full = Math.floor(totalH / unit);
    const rest = totalH - full * unit;
    // 마지막 조각이 얇으면 끝 분할선을 생략해 이전 조각에 흡수
    const lines = rest === 0 || rest < MIN_TAIL ? full - 1 : full;
    for (let i = 1; i <= lines; i++) cuts.push(i * unit);
  }
  return cuts;
};

const DETAIL_CHUNK_MIN = 500;
const DETAIL_CHUNK_MAX = 10000;

const DETAIL_CHUNKS: { value: number; label: string; desc: string }[] = [
  { value: 1500, label: "1,500px 단위", desc: "모바일 세밀 분할" },
  { value: 2000, label: "2,000px 단위", desc: "모바일 최적화" },
  { value: 3000, label: "3,000px 단위", desc: "균형 권장" },
  { value: 4000, label: "4,000px 단위", desc: "태블릿·PC 겸용" },
  { value: 5000, label: "5,000px 단위", desc: "PC 최적화" },
];

interface Preset {
  kind: PresetKind;
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
  description: string;
  strictWhiteBg: boolean; // true: 마켓 규정상 RGB 255 순백색 배경 강제
  guidelineText: string;
  ratio: Ratio;
}

const PRODUCT_PRESETS: Omit<Preset, "kind">[] = [
  // 1. 오픈마켓 표준 1:1
  { id: "smartstore", name: "스마트스토어", width: 1000, height: 1000, category: "국내 오픈마켓 (1:1)", description: "권장 1000x1000", strictWhiteBg: false, ratio: "1:1", guidelineText: "스마트스토어: 1:1 정방형(1000x1000) 표준, 텍스트·로고·테두리 삽입은 검색 순위 페널티 우려" },
  { id: "coupang", name: "쿠팡", width: 1000, height: 1000, category: "국내 오픈마켓 (1:1)", description: "순백색 배경 필수", strictWhiteBg: true, ratio: "1:1", guidelineText: "쿠팡: RGB 255 순수 흰색 배경 필수, 상품 면적 85% 이상 권장" },
  { id: "11st", name: "11번가", width: 1000, height: 1000, category: "국내 오픈마켓 (1:1)", description: "표준 1000x1000", strictWhiteBg: false, ratio: "1:1", guidelineText: "11번가: 1000x1000 정방형 표준 규격" },
  { id: "gmarket", name: "G마켓/옥션", width: 1000, height: 1000, category: "국내 오픈마켓 (1:1)", description: "ESM+ 권장 규격", strictWhiteBg: false, ratio: "1:1", guidelineText: "G마켓/옥션: ESM+ 권장 1000x1000 정방형" },
  { id: "lotteon", name: "롯데온", width: 1000, height: 1000, category: "국내 오픈마켓 (1:1)", description: "정방형 1000x1000", strictWhiteBg: false, ratio: "1:1", guidelineText: "롯데온: 1000x1000 정방형" },
  { id: "toss", name: "토스쇼핑", width: 1000, height: 1000, category: "국내 오픈마켓 (1:1)", description: "모바일 피드 최적화", strictWhiteBg: false, ratio: "1:1", guidelineText: "토스쇼핑: 모바일 피드 노출에 맞춘 1:1 정방형" },
  { id: "ohou", name: "오늘의집", width: 1000, height: 1000, category: "국내 오픈마켓 (1:1)", description: "리빙/인테리어 1:1", strictWhiteBg: false, ratio: "1:1", guidelineText: "오늘의집: 리빙/인테리어 1:1 정방형" },

  // 2. 패션/버티컬 (3:4 세로형 & 감성몰)
  { id: "ably", name: "에이블리", width: 600, height: 800, category: "패션/버티컬", description: "세로 3:4 비율", strictWhiteBg: false, ratio: "3:4", guidelineText: "에이블리: 모바일 피드가 3:4 세로형이라 정방형·가로형 사진은 잘리거나 여백이 생김" },
  { id: "zigzag", name: "지그재그", width: 600, height: 800, category: "패션/버티컬", description: "착용컷 3:4 비율", strictWhiteBg: false, ratio: "3:4", guidelineText: "지그재그: 착용컷 위주 3:4 세로형 권장" },
  { id: "musinsa", name: "무신사", width: 1000, height: 1333, category: "패션/버티컬", description: "고해상도 3:4 규격", strictWhiteBg: false, ratio: "3:4", guidelineText: "무신사: 고해상도 3:4(1000x1333) 세로형" },
  { id: "29cm", name: "29CM", width: 1000, height: 1000, category: "패션/버티컬", description: "정방형 감성 룩북", strictWhiteBg: false, ratio: "1:1", guidelineText: "29CM: 정방형 감성 룩북 스타일 1:1" },
  { id: "wconcept", name: "W컨셉", width: 1000, height: 1333, category: "패션/버티컬", description: "디자이너 3:4 규격", strictWhiteBg: false, ratio: "3:4", guidelineText: "W컨셉: 디자이너 브랜드 3:4(1000x1333) 세로형" },
  { id: "ably-square", name: "에이블리 정방형", width: 1000, height: 1000, category: "패션/버티컬", description: "1:1 권장 (3:4는 '에이블리')", strictWhiteBg: false, ratio: "1:1", guidelineText: "에이블리 정방형: 1000x1000 (1:1 권장), 3:4 세로형은 '에이블리(600x800)'를 함께 선택" },
  { id: "musinsa-45", name: "무신사 고해상도", width: 1000, height: 1250, category: "패션/버티컬", description: "4:5 고해상도 표준", strictWhiteBg: false, ratio: "4:5", guidelineText: "무신사 고해상도: 1000x1250 (4:5) 세로형 표준, 3:4(1000x1333)는 '무신사'를 선택" },

  // 2-1. 공동구매/지역 커머스
  { id: "alwayz", name: "올웨이즈", width: 1000, height: 1000, category: "공동구매/지역", description: "1:1 정방형", strictWhiteBg: false, ratio: "1:1", guidelineText: "올웨이즈: 1000x1000 (1:1) 정방형" },
  { id: "daangn-biz", name: "당근 비즈니스", width: 1000, height: 1000, category: "공동구매/지역", description: "전문판매·커머스 1:1", strictWhiteBg: false, ratio: "1:1", guidelineText: "당근 비즈니스: 1000x1000 (1:1) 정방형, 전문판매·커머스용" },

  // 3. 글로벌 1:1 고해상도
  { id: "amazon", name: "아마존", width: 1600, height: 1600, category: "글로벌 마켓", description: "RGB 255 순백색 필수", strictWhiteBg: true, ratio: "1:1", guidelineText: "아마존: RGB 255 순수 흰색 배경 필수, 상품이 이미지의 85% 이상 차지 권장" },
  { id: "walmart", name: "월마트", width: 1600, height: 1600, category: "글로벌 마켓", description: "순백색 필수 · 1600px", strictWhiteBg: true, ratio: "1:1", guidelineText: "월마트: 순백색 배경 필수, 1600px 고해상도 정방형 권장" },
  { id: "ebay", name: "이베이", width: 1600, height: 1600, category: "글로벌 마켓", description: "글로벌 권장 규격", strictWhiteBg: false, ratio: "1:1", guidelineText: "이베이: 1600px 정방형 권장 (흰 배경 권장이나 필수는 아님)" },

  // 4. 아시아/동남아
  { id: "shopee", name: "쇼피 (Shopee)", width: 1024, height: 1024, category: "아시아/동남아", description: "동남아 표준 1024px", strictWhiteBg: false, ratio: "1:1", guidelineText: "쇼피: 1024x1024 정방형 표준" },
  { id: "qoo10", name: "큐텐 재팬", width: 1000, height: 1000, category: "아시아/동남아", description: "일본 역직구 규격", strictWhiteBg: false, ratio: "1:1", guidelineText: "큐텐 재팬: 1000x1000 정방형" },
];

const STORE_PRESETS: Omit<Preset, "kind">[] = [
  // 그룹 1: 스토어 로고 / 프로필 아이콘 (1:1)
  { id: "store-smartstore-logo", name: "스마트스토어 로고", width: 160, height: 160, category: "스토어 로고 / 프로필 (1:1)", description: "160x160", strictWhiteBg: false, ratio: "1:1", guidelineText: "스마트스토어 로고: 160x160 정방형, 작게 표시되므로 단순한 로고 권장" },
  { id: "store-coupang-profile", name: "쿠팡 판매자 프로필", width: 500, height: 500, category: "스토어 로고 / 프로필 (1:1)", description: "500x500", strictWhiteBg: false, ratio: "1:1", guidelineText: "쿠팡 판매자 프로필: 500x500 정방형" },
  { id: "store-ably-zigzag-profile", name: "에이블리/지그재그 프로필", width: 400, height: 400, category: "스토어 로고 / 프로필 (1:1)", description: "400x400", strictWhiteBg: false, ratio: "1:1", guidelineText: "에이블리/지그재그 프로필: 400x400 정방형" },
  { id: "store-toss-kakao-profile", name: "토스/카카오 스토어 프로필", width: 640, height: 640, category: "스토어 로고 / 프로필 (1:1)", description: "640x640", strictWhiteBg: false, ratio: "1:1", guidelineText: "토스/카카오 스토어 프로필: 640x640 정방형" },
  { id: "store-musinsa-logo", name: "무신사 브랜드 로고", width: 500, height: 500, category: "스토어 로고 / 프로필 (1:1)", description: "500x500", strictWhiteBg: false, ratio: "1:1", guidelineText: "무신사 브랜드 로고: 500x500 정방형" },
  { id: "store-shopee-logo", name: "쇼피 (Shopee) 샵 로고", width: 300, height: 300, category: "스토어 로고 / 프로필 (1:1)", description: "300x300", strictWhiteBg: false, ratio: "1:1", guidelineText: "쇼피 샵 로고: 300x300 정방형" },
  { id: "store-qoo10-profile", name: "큐텐 재팬 프로필", width: 400, height: 400, category: "스토어 로고 / 프로필 (1:1)", description: "400x400", strictWhiteBg: false, ratio: "1:1", guidelineText: "큐텐 재팬 프로필: 400x400 정방형" },
  { id: "store-alwayz-profile", name: "올웨이즈 프로필", width: 500, height: 500, category: "스토어 로고 / 프로필 (1:1)", description: "500x500", strictWhiteBg: false, ratio: "1:1", guidelineText: "올웨이즈 프로필: 500x500 정방형" },
  { id: "store-daangn-profile", name: "당근 비즈 프로필", width: 640, height: 640, category: "스토어 로고 / 프로필 (1:1)", description: "640x640", strictWhiteBg: false, ratio: "1:1", guidelineText: "당근 비즈 프로필: 640x640 정방형" },

  // 그룹 2: 스토어 상단 대표 배너 (와이드형)
  { id: "store-smartstore-mobile-banner", name: "스마트스토어 모바일 대표배너", width: 750, height: 1000, category: "스토어 상단 대표 배너 (와이드형)", description: "750x1000", strictWhiteBg: false, ratio: "3:4", guidelineText: "스마트스토어 모바일 대표배너: 750x1000 3:4 세로형" },
  { id: "store-smartstore-pc-header", name: "스마트스토어 PC 상단 헤더", width: 1920, height: 400, category: "스토어 상단 대표 배너 (와이드형)", description: "1920x400", strictWhiteBg: false, ratio: "자유", guidelineText: "스마트스토어 PC 상단 헤더: 1920x400 와이드, 좌우 가장자리는 화면 크기에 따라 잘릴 수 있어 핵심 내용은 중앙에 배치" },
  { id: "store-coupang-brand-header", name: "쿠팡 브랜드 헤더 배너", width: 1200, height: 400, category: "스토어 상단 대표 배너 (와이드형)", description: "1200x400", strictWhiteBg: false, ratio: "자유", guidelineText: "쿠팡 브랜드 헤더 배너: 1200x400 (3:1) 와이드" },
  { id: "store-zigzag-cover", name: "지그재그 스토어 커버", width: 1080, height: 540, category: "스토어 상단 대표 배너 (와이드형)", description: "1080x540", strictWhiteBg: false, ratio: "자유", guidelineText: "지그재그 스토어 커버: 1080x540 (2:1) 와이드" },
  { id: "store-musinsa-banner", name: "무신사 브랜드 메인 배너", width: 1920, height: 600, category: "스토어 상단 대표 배너 (와이드형)", description: "1920x600", strictWhiteBg: false, ratio: "자유", guidelineText: "무신사 브랜드 메인 배너: 1920x600 와이드" },
  { id: "store-shopee-cover", name: "쇼피 샵 대표 커버", width: 1200, height: 600, category: "스토어 상단 대표 배너 (와이드형)", description: "1200x600", strictWhiteBg: false, ratio: "자유", guidelineText: "쇼피 샵 대표 커버: 1200x600 (2:1) 와이드" },
  { id: "store-amazon-header", name: "아마존 스토어 헤더", width: 3000, height: 600, category: "스토어 상단 대표 배너 (와이드형)", description: "3000x600", strictWhiteBg: false, ratio: "자유", guidelineText: "아마존 스토어 헤더: 3000x600 (5:1) 와이드" },
  { id: "store-ably-cover", name: "에이블리 마켓 커버", width: 1080, height: 540, category: "스토어 상단 대표 배너 (와이드형)", description: "1080x540", strictWhiteBg: false, ratio: "자유", guidelineText: "에이블리 마켓 커버: 1080x540 (2:1) 와이드" },
  { id: "store-musinsa-shop-banner", name: "무신사 브랜드 샵 배너", width: 1500, height: 500, category: "스토어 상단 대표 배너 (와이드형)", description: "1500x500", strictWhiteBg: false, ratio: "자유", guidelineText: "무신사 브랜드 샵 배너: 1500x500 (3:1) 와이드" },

  // 피드/게시 이미지 (1:1)
  { id: "store-alwayz-feed", name: "올웨이즈 피드 이미지", width: 1080, height: 1080, category: "피드/게시 이미지 (1:1)", description: "1080x1080", strictWhiteBg: false, ratio: "1:1", guidelineText: "올웨이즈 피드 이미지: 1080x1080 정방형" },
  { id: "store-daangn-feed", name: "당근 비즈 피드 이미지", width: 1080, height: 1080, category: "피드/게시 이미지 (1:1)", description: "1080x1080", strictWhiteBg: false, ratio: "1:1", guidelineText: "당근 비즈 피드 이미지: 1080x1080 정방형" },
];

// 프로필·배너 파일명용 [마켓명, 배너유형]: {원본}_{마켓명}_{배너유형}_{가로x세로}.jpg (예: 로고원안_스마트스토어_PC상단배너_1920x400.jpg)
const STORE_NAMING: Record<string, [string, string]> = {
  "store-smartstore-logo": ["스마트스토어", "로고"],
  "store-coupang-profile": ["쿠팡", "판매자프로필"],
  "store-ably-zigzag-profile": ["에이블리·지그재그", "프로필"],
  "store-toss-kakao-profile": ["토스·카카오", "스토어프로필"],
  "store-musinsa-logo": ["무신사", "브랜드로고"],
  "store-shopee-logo": ["쇼피", "샵로고"],
  "store-qoo10-profile": ["큐텐재팬", "프로필"],
  "store-smartstore-mobile-banner": ["스마트스토어", "모바일대표배너"],
  "store-smartstore-pc-header": ["스마트스토어", "PC상단배너"],
  "store-coupang-brand-header": ["쿠팡", "브랜드헤더배너"],
  "store-zigzag-cover": ["지그재그", "스토어커버"],
  "store-musinsa-banner": ["무신사", "브랜드메인배너"],
  "store-shopee-cover": ["쇼피", "샵대표커버"],
  "store-amazon-header": ["아마존", "스토어헤더"],
  "store-alwayz-profile": ["올웨이즈", "프로필"],
  "store-daangn-profile": ["당근비즈", "프로필"],
  "store-ably-cover": ["에이블리", "마켓커버"],
  "store-musinsa-shop-banner": ["무신사", "브랜드샵배너"],
  "store-alwayz-feed": ["올웨이즈", "피드이미지"],
  "store-daangn-feed": ["당근비즈", "피드이미지"],
};

const PRESETS: Preset[] = [
  ...PRODUCT_PRESETS.map((p) => ({ ...p, kind: "product" as const })),
  ...STORE_PRESETS.map((p) => ({ ...p, kind: "store" as const })),
];

// 체험용 내장 샘플: 베이지 배경의 세로형 의류 사진 느낌 (가장자리 색 감지·블러 효과가 잘 보이도록 흰색이 아닌 배경)
// 배경은 그라데이션 없이 단일 솔리드(#EAE5D9)로 고정하고, 모든 요소를 가장자리에서 충분히 띄워 모서리 색 감지 값이 배경과 100% 같도록 함
const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<defs><linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3F5D7D"/><stop offset="1" stop-color="#2B4260"/></linearGradient></defs>
<rect width="600" height="800" fill="#EAE5D9"/>
<ellipse cx="300" cy="700" rx="170" ry="22" fill="#000" opacity="0.12"/>
<path d="M210 140 L120 200 L150 290 L200 262 L200 650 L400 650 L400 262 L450 290 L480 200 L390 140 Q300 200 210 140 Z" fill="url(#sh)"/>
<path d="M210 140 Q300 200 390 140 Q300 232 210 140 Z" fill="#1F3148"/>
<rect x="255" y="360" width="90" height="12" rx="6" fill="#fff" opacity="0.85"/>
<rect x="270" y="384" width="60" height="8" rx="4" fill="#fff" opacity="0.6"/>
</svg>`;

// 스토어 프로필·배너 체험용 샘플 (1200 x 800): 단색 배경 + 중앙 브랜드 비주얼 (가장자리에서 충분히 띄워 여백 확장·블러가 자연스럽게 보임)
const STORE_SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<rect width="1200" height="800" fill="#F3E9DC"/>
<circle cx="600" cy="400" r="270" fill="#E7D3BC"/>
<circle cx="600" cy="400" r="200" fill="#F8F1E7"/>
<circle cx="250" cy="260" r="46" fill="#D9BFA0"/>
<circle cx="170" cy="470" r="26" fill="#E2CBB0"/>
<circle cx="960" cy="230" r="34" fill="#D9BFA0"/>
<circle cx="1030" cy="500" r="52" fill="#E2CBB0"/>
<path d="M880 640 Q930 560 1010 600 Q960 680 880 640 Z" fill="#B9C9A8"/>
<path d="M190 630 Q240 560 320 600 Q270 680 190 630 Z" fill="#B9C9A8"/>
<text x="600" y="425" font-size="104" font-weight="800" fill="#4A3B2C" text-anchor="middle" letter-spacing="10" font-family="'Malgun Gothic','Apple SD Gothic Neo',Georgia,serif">LUNE</text>
<text x="600" y="490" font-size="26" fill="#7A6652" text-anchor="middle" letter-spacing="6" font-family="'Malgun Gothic','Apple SD Gothic Neo',sans-serif">HANDMADE · DAILY GOODS</text>
<text x="600" y="345" font-size="24" fill="#9A826A" text-anchor="middle" font-family="'Malgun Gothic','Apple SD Gothic Neo',sans-serif">루나 공방</text>
</svg>`;

// 상세페이지 분할 체험용 긴 샘플 (860 x 5200): 인트로 → 특장점 → 모델컷 → 스펙표 → 배송안내
// 분할선이 카드·표 한가운데를 지나도록 배치해 "드래그로 자르기 방지" 체험이 되게 구성
const buildDetailSampleSvg = (): string => {
  const W = 860;
  const H = 5200;
  const f = `font-family="'Malgun Gothic','Apple SD Gothic Neo',sans-serif"`;
  const t = (x: number, y: number, size: number, fill: string, text: string, weight = 400, anchor = "start") =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}" ${f}>${text}</text>`;
  const parts: string[] = [];
  parts.push(`<rect width="${W}" height="${H}" fill="#FFFFFF"/>`);

  // 1. 인트로 (0~950)
  parts.push(`<rect width="${W}" height="950" fill="#EAE5D9"/>`);
  parts.push(t(430, 330, 30, "#7A6F5C", "SPRING COLLECTION", 600, "middle"));
  parts.push(t(430, 440, 76, "#2B2A28", "데일리 코튼 셔츠", 800, "middle"));
  parts.push(t(430, 530, 32, "#4A4640", "하루 종일 편안한 부드러운 촉감", 400, "middle"));
  parts.push(`<rect x="280" y="620" width="300" height="76" rx="38" fill="#2B2A28"/>`);
  parts.push(t(430, 668, 28, "#FFFFFF", "지금 만나보세요", 600, "middle"));

  // 2. 특장점 (950~2000) — 세 번째 카드 제목이 y≈1733 분할선(5200px/3등분)에 걸리도록 배치
  parts.push(t(430, 1020, 44, "#2B2A28", "POINT 01 · 03 특장점", 800, "middle"));
  const cards = [
    { y: 1100, title: "01 프리미엄 코튼 100%", body: "피부에 닿는 순면 원단으로 사계절 착용" },
    { y: 1390, title: "02 구김 적은 가공 원단", body: "세탁 후에도 형태가 유지되는 안정적인 핏" },
    { y: 1680, title: "03 사이즈 걱정 없는 세미오버핏", body: "어깨선이 자연스럽게 떨어지는 여유 있는 실루엣" },
  ];
  cards.forEach((c) => {
    parts.push(`<rect x="70" y="${c.y}" width="720" height="260" rx="20" fill="#F4F1EA" stroke="#E0D9C8" stroke-width="2"/>`);
    parts.push(t(110, c.y + 70, 40, "#2B2A28", c.title, 700));
    parts.push(t(110, c.y + 150, 28, "#6B6558", c.body));
  });

  // 3. 모델컷 (2050~3300)
  parts.push(`<rect x="70" y="2100" width="720" height="900" rx="24" fill="#CFC8B8"/>`);
  parts.push(`<circle cx="430" cy="2380" r="110" fill="#B5AD9A"/>`);
  parts.push(`<path d="M270 2520 Q430 2470 590 2520 L640 2960 L220 2960 Z" fill="#B5AD9A"/>`);
  parts.push(t(430, 3090, 34, "#2B2A28", "모델 키 175cm · 착용 사이즈 L", 700, "middle"));
  parts.push(t(430, 3150, 26, "#6B6558", "※ 모니터 해상도에 따라 색상이 다르게 보일 수 있습니다", 400, "middle"));

  // 4. 스펙표 (3300~4500) — 표 행이 y≈3467 분할선에 걸리도록 배치
  parts.push(t(430, 3330, 44, "#2B2A28", "SIZE &amp; SPEC", 800, "middle"));
  const rows = [
    ["사이즈", "어깨", "가슴", "총장"],
    ["M", "46", "108", "70"],
    ["L", "48", "112", "72"],
    ["XL", "50", "116", "74"],
    ["XXL", "52", "120", "76"],
    ["소재", "코튼 100%", "세탁", "손세탁 권장"],
  ];
  rows.forEach((r, i) => {
    const y = 3400 + i * 110;
    parts.push(`<rect x="70" y="${y}" width="720" height="110" fill="${i === 0 ? "#2B2A28" : i % 2 ? "#F4F1EA" : "#FFFFFF"}" stroke="#E0D9C8"/>`);
    r.forEach((c, j) => parts.push(t(70 + 90 + j * 180, y + 68, 28, i === 0 ? "#FFFFFF" : "#2B2A28", c, i === 0 ? 700 : 400, "middle")));
  });

  // 5. 배송안내 (4150~5200)
  parts.push(`<rect y="4150" width="${W}" height="1050" fill="#F4F1EA"/>`);
  parts.push(t(430, 4270, 44, "#2B2A28", "배송 · 교환 · 반품 안내", 800, "middle"));
  const notes = [
    "· 평일 오후 2시 이전 결제 시 당일 출고",
    "· 택배사: CJ대한통운 (2~3일 소요)",
    "· 단순 변심 교환/반품은 수령 후 7일 이내",
    "· 착용 흔적·세탁 후에는 교환/반품이 어렵습니다",
    "· 제주/도서산간 지역은 추가 배송비가 부과됩니다",
  ];
  notes.forEach((n, i) => parts.push(t(110, 4400 + i * 100, 30, "#4A4640", n)));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>`;
};

// 탭 4 체험용 옵션 샘플 3종: 같은 상품의 색상별 컷 (배경은 각각 단색, 요소는 가장자리에서 충분히 띄움)
const tshirtSvg = (bg: string, body: string, collar: string, print: string): string => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<rect width="600" height="800" fill="${bg}"/>
<ellipse cx="300" cy="700" rx="170" ry="22" fill="#000" opacity="0.12"/>
<path d="M210 140 L120 200 L150 290 L200 262 L200 650 L400 650 L400 262 L450 290 L480 200 L390 140 Q300 200 210 140 Z" fill="${body}"/>
<path d="M210 140 Q300 200 390 140 Q300 232 210 140 Z" fill="${collar}"/>
<rect x="255" y="360" width="90" height="12" rx="6" fill="${print}" opacity="0.85"/>
<rect x="270" y="384" width="60" height="8" rx="4" fill="${print}" opacity="0.6"/>
</svg>`;

const BATCH_SAMPLES: { file: string; svg: string }[] = [
  { file: "sample_black.png", svg: tshirtSvg("#E8E4DA", "#222222", "#0E0E0E", "#FFFFFF") },
  { file: "sample_ivory.png", svg: tshirtSvg("#CFD8DC", "#F3EEDF", "#E2D9C2", "#8A7F66") },
  { file: "sample_navy.png", svg: tshirtSvg("#F0E6E2", "#1F3A5F", "#142846", "#FFFFFF") },
];


// 탭 7 체험용 가상 상품 샘플 3종 (600x800): 티셔츠 · 가방 · 슈즈
const WM_SAMPLES: { file: string; svg: string }[] = [
  { file: "sample_티셔츠.png", svg: tshirtSvg("#E8E4DA", "#3F5D7D", "#1F3148", "#FFFFFF") },
  {
    file: "sample_가방.png",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#EFE4E0"/><ellipse cx="300" cy="640" rx="190" ry="22" fill="#000" opacity="0.12"/><path d="M220 300 Q220 190 300 190 Q380 190 380 300" fill="none" stroke="#6B3E2E" stroke-width="22"/><rect x="130" y="290" width="340" height="340" rx="36" fill="#8C5A44"/><rect x="130" y="290" width="340" height="110" rx="36" fill="#7A4B38"/><rect x="270" y="380" width="60" height="44" rx="8" fill="#D9B77A"/></svg>`,
  },
  {
    file: "sample_슈즈.png",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#DDE6E0"/><ellipse cx="300" cy="560" rx="210" ry="20" fill="#000" opacity="0.12"/><path d="M110 520 L110 400 Q110 340 170 330 L250 320 Q290 400 380 410 L470 430 Q510 440 510 490 L510 520 Z" fill="#FFFFFF" stroke="#C9D2CC" stroke-width="4"/><rect x="110" y="505" width="400" height="40" rx="18" fill="#2B2A28"/><path d="M215 375 L290 385 M205 405 L280 415" stroke="#2B2A28" stroke-width="8" stroke-linecap="round"/></svg>`,
  },
];

const svgToPngFile = (svg: string, name: string, w: number, h: number): Promise<File> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return reject(new Error("canvas context unavailable"));
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      c.toBlob((b) => {
        c.width = 0;
        c.height = 0;
        if (b) resolve(new File([b], name, { type: "image/png" }));
        else reject(new Error("png encode failed"));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("sample svg load failed"));
    };
    img.src = url;
  });

// 탭 5 체험용: 노이즈·패턴이 섞여 PNG로 저장하면 용량이 커지는 가상 고해상도 이미지 (시드 고정으로 매번 비슷한 크기)
const makeHeavyImageFile = async (name: string, w: number, h: number, seed: number): Promise<File> => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas context unavailable");
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#f2a65a");
  g.addColorStop(0.5, "#8fb8de");
  g.addColorStop(1, "#2f4f6f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 24; i++) ctx.fillRect((i * w) / 24, 0, w / 48, h);
  ctx.fillStyle = "rgba(20,20,20,0.35)";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, 0, Math.PI * 2);
  ctx.fill();

  const data = ctx.getImageData(0, 0, w, h);
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < data.data.length; i += 4) {
    const n = (rand() * 40) | 0; // 사진 센서 노이즈처럼 압축이 어려운 미세 질감
    data.data[i] += n;
    data.data[i + 1] += n;
    data.data[i + 2] += n;
  }
  ctx.putImageData(data, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => c.toBlob((b) => resolve(b), "image/png"));
  c.width = 0;
  c.height = 0;
  if (!blob) throw new Error("png encode failed");
  return new File([blob], name, { type: "image/png" });
};

// 탭 5 안내 카드: 마켓별 용량·포맷 기준 (정책은 변동될 수 있어 카드 하단에 최신 안내 확인 문구를 병기)
const MARKET_SIZE_GUIDES: { name: string; size: string; format: string }[] = [
  {
    name: "스마트스토어",
    size: "최대 10MB (권장 5MB 이하)",
    format: "JPG, PNG, WebP 지원 (가로 860px 권장)",
  },
  {
    name: "쿠팡",
    size: "파일당 최대 10MB (모바일 최적화 권장 2~3MB 이하)",
    format: "JPG, PNG 권장 (일부 카테고리 WebP 업로드 제한 주의)",
  },
  {
    name: "에이블리 · 지그재그",
    size: "파일당 5MB 이하 (초과 시 업로드 실패)",
    format: "JPG, PNG 지원 (앱 환경 특성상 1~2MB 내외 경량 권장)",
  },
  {
    name: "11번가 · G마켓 · 옥션",
    size: "장당 최대 5MB~10MB 제한 (권장 3MB 이하)",
    format: "JPG 표준 권장 (전통 오픈마켓은 JPG 호환성이 가장 안정적)",
  },
];

// 탭 6 체험용: 가로 860px의 상단/본문/하단 조각 3장 (경계가 이어져 한 장처럼 보이도록 구성)
const mergePieceSvg = (kind: "top" | "body" | "bottom"): { svg: string; h: number } => {
  const W = 860;
  const f = `font-family="'Malgun Gothic','Apple SD Gothic Neo',sans-serif"`;
  const t = (x: number, y: number, size: number, fill: string, text: string, weight = 400, anchor = "middle") =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}" ${f}>${text}</text>`;
  let h = 0;
  const p: string[] = [];
  if (kind === "top") {
    h = 900;
    p.push(`<rect width="${W}" height="${h}" fill="#EAE5D9"/>`);
    p.push(t(430, 320, 28, "#7A6F5C", "NEW ARRIVAL", 600));
    p.push(t(430, 430, 72, "#2B2A28", "데일리 린넨 셔츠", 800));
    p.push(t(430, 510, 30, "#4A4640", "가볍고 시원한 여름 필수템"));
    p.push(`<rect x="290" y="600" width="280" height="72" rx="36" fill="#2B2A28"/>`);
    p.push(t(430, 646, 26, "#FFFFFF", "1 / 3 상단 조각", 600));
  } else if (kind === "body") {
    h = 1400;
    p.push(`<rect width="${W}" height="${h}" fill="#FFFFFF"/>`);
    p.push(t(430, 120, 42, "#2B2A28", "이런 점이 좋아요", 800));
    [0, 1, 2].forEach((i) => {
      const y = 200 + i * 360;
      p.push(`<rect x="70" y="${y}" width="720" height="300" rx="20" fill="#F4F1EA" stroke="#E0D9C8" stroke-width="2"/>`);
      p.push(t(110, y + 110, 38, "#2B2A28", ["통기성 좋은 린넨 혼방", "구김이 덜한 가공", "세미오버 여유 핏"][i], 700, "start"));
      p.push(t(110, y + 180, 26, "#6B6558", ["한여름에도 쾌적한 착용감", "다림질 걱정 없는 관리", "체형을 가려주는 실루엣"][i], 400, "start"));
    });
    p.push(t(430, 1340, 24, "#9A9486", "2 / 3 본문 조각"));
  } else {
    h = 800;
    p.push(`<rect width="${W}" height="${h}" fill="#F4F1EA"/>`);
    p.push(t(430, 140, 42, "#2B2A28", "배송 · 교환 · 반품 안내", 800));
    ["평일 오후 2시 이전 결제 시 당일 출고", "택배사: CJ대한통운 (2~3일 소요)", "단순 변심 교환/반품은 수령 후 7일 이내"].forEach((n, i) =>
      p.push(t(430, 260 + i * 90, 28, "#4A4640", `· ${n}`))
    );
    p.push(t(430, 720, 24, "#9A9486", "3 / 3 하단 조각"));
  }
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}">${p.join("")}</svg>`,
    h,
  };
};

const CATEGORY_HINTS: Record<string, string> = {
  "국내 오픈마켓 (1:1)": "· 네이버·쿠팡 등 포털 검색 목록 표준 규격",
  "패션/버티컬": "· 에이블리·지그재그 등 모바일 패션 앱 피드 최적화",
  "공동구매/지역": "· 올웨이즈·당근 등 공동구매·지역 기반 커머스",
};

const STRICT_WHITE_NOTICE = "해당 플랫폼은 마켓 규정에 따라 순백색(#FFFFFF)으로 강제 적용됩니다";

// 플랫폼 규정을 반영한 실제 여백 처리: 순백색 필수 마켓은 사용자 선택을 무시
const resolveFill = (
  preset: Preset | null,
  mode: FillMode,
  color: string
): { mode: FillMode; color: string } =>
  preset?.strictWhiteBg ? { mode: "white", color: "#FFFFFF" } : { mode, color };

const GUIDES: { title: string; badge: string; summary: string; points: string[] }[] = [
  {
    title: "쿠팡 · 아마존 · 월마트",
    badge: "순백색(#FFFFFF) 필수",
    summary: "카탈로그형 마켓은 배경이 흰색이 아니면 등록이 반려될 수 있습니다.",
    points: [
      "여러 판매자의 같은 상품을 한 페이지에 모아 보여 주는 카탈로그 구조라, 배경색이 제각각이면 목록이 통일되지 않아 RGB 255 순백색을 요구합니다.",
      "상품이 이미지의 85% 이상을 차지하도록 꽉 채워 촬영하는 것을 권장합니다.",
      "이 도구는 해당 마켓 출력 시 블러·자동 감지·직접 선택 색상을 무시하고 #FFFFFF로 강제 변환합니다.",
    ],
  },
  {
    title: "에이블리 · 지그재그 · 무신사 · W컨셉",
    badge: "3:4 세로형",
    summary: "패션 앱은 모바일 피드가 세로형이라 3:4 비율로 노출됩니다.",
    points: [
      "피드 카드가 3:4 세로 프레임이라, 정방형·가로형 사진을 올리면 플랫폼에서 위아래·좌우가 잘리거나 여백이 생깁니다.",
      "이 도구는 원본을 자르지 않고 3:4 캔버스에 비율 유지로 배치하고 남는 여백을 채웁니다. 착용컷은 처음부터 세로로 촬영하는 편이 가장 좋습니다.",
      "순백색 강제 규정이 없으므로 자동 감지 색상이나 블러 배경으로 자연스럽게 채울 수 있습니다.",
    ],
  },
  {
    title: "스마트스토어 · 11번가 · G마켓 · 롯데온 등",
    badge: "1:1 정방형",
    summary: "국내 오픈마켓은 1000x1000 정방형이 표준입니다.",
    points: [
      "스마트스토어는 1:1 비율이 표준이며, 텍스트·로고·테두리 삽입 시 검색 순위에서 불이익을 받을 수 있습니다.",
      "흰색이 필수는 아니므로 여백 채움 방식을 자유롭게 선택할 수 있습니다.",
    ],
  },
];



type FillMode = "white" | "auto" | "custom" | "blur";

const FILL_MODES: { id: FillMode; label: string }[] = [
  { id: "white", label: "순백색" },
  { id: "auto", label: "가장자리 자동 감지" },
  { id: "custom", label: "직접 선택" },
  { id: "blur", label: "감성 블러" },
];

const toHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

const PREVIEW_BASE = 300;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const formatRatio = (w: number, h: number): string => {
  const r = w / h;
  if (Math.abs(r - 1) < 0.01) return "1:1";
  if (Math.abs(r - 3 / 4) < 0.01) return "3:4";
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
};

// 네 모서리 영역의 평균 색상을 추출
const detectEdgeColor = (img: HTMLImageElement): string => {
  const size = 100;
  const sample = 6;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#FFFFFF";
  ctx.drawImage(img, 0, 0, size, size);

  let r = 0, g = 0, b = 0, n = 0;
  const corners = [
    [0, 0],
    [size - sample, 0],
    [0, size - sample],
    [size - sample, size - sample],
  ];
  for (const [cx, cy] of corners) {
    const data = ctx.getImageData(cx, cy, sample, sample).data;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  return toHex(r / n, g / n, b / n);
};

// 미리보기와 ZIP 변환이 공통으로 쓰는 렌더링 함수
const drawThumbnail = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
  mode: FillMode,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  if (mode === "blur") {
    // 배경: 캔버스를 꽉 채우도록(Cover) 확대 후 블러
    const cover = Math.max(width / img.width, height / img.height) * 1.1; // 블러 가장자리 번짐 방지
    const bw = img.width * cover;
    const bh = img.height * cover;
    ctx.save();
    ctx.filter = "blur(20px)";
    ctx.drawImage(img, (width - bw) / 2, (height - bh) / 2, bw, bh);
    ctx.restore();
  }

  // 선명한 원본: 비율 유지 중앙 배치 (Fit Center)
  const ratio = Math.min(width / img.width, height / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
};

const loadImageFromFile = (file: File): Promise<{ img: HTMLImageElement; revoke: () => void }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, revoke: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`이미지를 읽지 못했습니다: ${file.name}`));
    };
    img.src = url;
  });

// 한 장씩 디코딩 → 캔버스 인코딩 → 즉시 해제 (원본 용량이 커도 메모리를 한 장 분량으로 유지)
// quality: 0.1~1 (PNG는 무손실이라 무시) / targetBytes: 있으면 그 용량 이하 중 가장 높은 화질을 이분 탐색으로 찾음
const compressFile = async (
  file: File,
  format: CompFormat,
  quality: number,
  targetBytes: number | null,
  resize: boolean
): Promise<CompResult> => {
  const { img, revoke } = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const fmt = COMP_FORMATS.find((f) => f.id === format) ?? COMP_FORMATS[0];
  try {
    let baseW = img.width;
    let baseH = img.height;
    if (resize && baseW > RESIZE_MAX_W) {
      baseH = Math.round((baseH * RESIZE_MAX_W) / baseW);
      baseW = RESIZE_MAX_W;
    }
    const resized = baseW !== img.width;

    const encode = async (cw: number, ch: number, q: number): Promise<Blob> => {
      canvas.width = cw; // 크기 재지정으로 이전 시도의 버퍼 초기화
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas context unavailable");
      if (format === "jpg") {
        ctx.fillStyle = "#FFFFFF"; // JPEG는 투명 미지원
        ctx.fillRect(0, 0, cw, ch);
      }
      ctx.drawImage(img, 0, 0, cw, ch);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), fmt.mime, format === "png" ? undefined : q)
      );
      if (!blob) throw new Error("인코딩에 실패했습니다.");
      if (blob.type !== fmt.mime) throw new Error("이 브라우저는 WebP 저장을 지원하지 않습니다. JPG를 선택해 주세요.");
      return blob;
    };

    let best: Blob | null = null;
    let usedQuality = quality;
    let scale = 1;
    // 1순위 화질 보정 → 2순위 해상도 축소(PNG는 화질 조절이 없어 해상도만)
    for (let step = 0; step < 8; step++) {
      const cw = Math.max(1, Math.round(baseW * scale));
      const ch = Math.max(1, Math.round(baseH * scale));
      const first = await encode(cw, ch, quality);
      if (targetBytes === null || first.size <= targetBytes) {
        best = first;
        usedQuality = quality;
        break;
      }
      best = first;
      if (format !== "png") {
        const floorQ = Math.min(COMP_QUALITY_FLOOR, quality);
        const atFloor = await encode(cw, ch, floorQ);
        best = atFloor;
        usedQuality = floorQ;
        if (atFloor.size <= targetBytes) {
          // 목표 안에 들어오는 가장 높은 화질을 이분 탐색
          let lo = floorQ;
          let hi = quality;
          for (let i = 0; i < 5; i++) {
            const mid = (lo + hi) / 2;
            const b = await encode(cw, ch, mid);
            if (b.size <= targetBytes) {
              best = b;
              usedQuality = mid;
              lo = mid;
            } else {
              hi = mid;
            }
          }
          break;
        }
      }
      scale *= 0.85;
    }
    if (!best) throw new Error("인코딩에 실패했습니다.");
    const scaledDown = scale < 1;

    // 이미 최적화된 파일이라 같은 포맷으로 변환했는데 오히려 커졌다면 원본을 그대로 사용
    if (file.type === fmt.mime && !resized && !scaledDown && best.size >= file.size) {
      return { blob: file, size: file.size, kept: true, quality: null, scaledDown: false };
    }
    return {
      blob: best,
      size: best.size,
      kept: false,
      quality: format === "png" ? null : Math.round(usedQuality * 100),
      scaledDown,
    };
  } finally {
    revoke();
    img.src = "";
    canvas.width = 0;
    canvas.height = 0;
  }
};

// 앱 설치 가이드 (PWA) — 브라우저별 홈 화면/바탕화면 추가 방법
const INSTALL_GUIDES: { title: string; icon: "monitor" | "iphone" | "android"; steps: string[] }[] = [
  {
    title: "PC Chrome / Edge",
    icon: "monitor",
    steps: [
      "브라우저 우측 상단 더보기 [⋮] 메뉴를 클릭하세요. (또는 주소창 우측 설치 아이콘 클릭)",
      "[캐스팅, 저장, 공유] > [페이지를 앱으로 설치...]를 선택하세요.",
      "팝업창에서 [설치]를 클릭하면 단독 앱 창으로 실행되고 바탕화면에 아이콘이 생성됩니다.",
    ],
  },
  {
    title: "모바일 Safari (아이폰)",
    icon: "iphone",
    steps: [
      "하단 중앙의 공유 버튼(네모에 위 화살표)을 터치하세요.",
      "아래로 스크롤하여 [홈 화면에 추가]를 선택하세요.",
      "우측 상단 [추가]를 터치하면 앱 아이콘이 생성됩니다.",
    ],
  },
  {
    title: "모바일 Chrome (안드로이드)",
    icon: "android",
    steps: ["상단 더보기 [⋮] 메뉴를 터치하세요.", "[홈 화면에 추가] 또는 [앱 설치]를 터치하세요."],
  },
];

function InstallIcon({ kind }: { kind: "monitor" | "iphone" | "android" }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "monitor") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    );
  }
  if (kind === "iphone") {
    return (
      <svg {...common}>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M10.5 5.5h3M11 18.5h2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <circle cx="12" cy="18" r="0.8" fill="currentColor" />
    </svg>
  );
}

// 탭 공통 '실무 추천 가이드' 박스 (강조 키워드는 <GuideEm>)
function GuideBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-slate-700 break-keep">
      {children}
    </div>
  );
}

function GuideEm({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-slate-900">{children}</strong>;
}

function BatchCard({
  item,
  mode,
  onRemove,
  w,
  h,
  fileName,
  onSave,
  saveDisabled,
}: {
  item: BatchItem;
  mode: FillMode;
  onRemove: (id: number) => void;
  w: number;
  h: number;
  fileName: string; // 저장될 결과 파일명
  onSave: () => void;
  saveDisabled: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = 160; // 선택한 규격 비율에 맞춰 카드 미리보기 비율도 변경 (크기 지정 시 내용이 지워지므로 매번 다시 그림)
    canvas.height = Math.round((160 * h) / w);
    drawThumbnail(ctx, item.small, canvas.width, canvas.height, mode, mode === "white" ? "#FFFFFF" : item.autoColor);
  }, [item, mode, w, h]);

  return (
    <div className="relative rounded-lg border border-slate-200 bg-white p-1.5">
      <canvas
        ref={ref}
        width={160}
        height={Math.round((160 * h) / w)}
        style={{ aspectRatio: `${w} / ${h}` }}
        className="block w-full rounded border border-slate-200"
      />
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`${item.name} 삭제`}
        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-800/80 text-white text-[11px] leading-none flex items-center justify-center hover:bg-red-500"
      >
        ✕
      </button>
      <p className="mt-1 text-[10px] text-slate-600 truncate" title={fileName}>
        {fileName}
      </p>
      <button
        onClick={onSave}
        disabled={saveDisabled}
        className="mt-1 w-full rounded border border-slate-200 py-0.5 text-[10px] font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-40"
      >
        ↓ 저장
      </button>
    </div>
  );
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("product");
  const [detailWidthId, setDetailWidthId] = useState<string>("smartstore");
  const [chunkH, setChunkH] = useState<number>(3000);
  const [chunkText, setChunkText] = useState<string>("3000"); // 직접 입력창 표시값
  const [splitProgress, setSplitProgress] = useState<number>(0);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchSizeId, setBatchSizeId] = useState<string>("sq1000");
  const [batchFill, setBatchFill] = useState<FillMode>("white");
  const [batchNaming, setBatchNaming] = useState<"original" | "seq">("original");
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [batchDragging, setBatchDragging] = useState<boolean>(false);
  const [wmItems, setWmItems] = useState<WmItem[]>([]);
  const [wmKind, setWmKind] = useState<WmKind>("text");
  const [wmText, setWmText] = useState<string>("");
  const [wmTextScale, setWmTextScale] = useState<number>(WM_TEXT_SCALE.def);
  const [wmLogoScale, setWmLogoScale] = useState<number>(WM_LOGO_SCALE.def);
  const [wmRotation, setWmRotation] = useState<number>(0);
  const [wmPreviewId, setWmPreviewId] = useState<number | null>(null);
  const [wmColor, setWmColor] = useState<string>("#FFFFFF");
  const [wmPos, setWmPos] = useState<WmPos>("br");
  const [wmOpacity, setWmOpacity] = useState<number>(40);
  const [wmLogo, setWmLogo] = useState<HTMLImageElement | null>(null);
  const [wmLogoName, setWmLogoName] = useState<string>("");
  const [wmDragging, setWmDragging] = useState<boolean>(false);
  const [wmLoading, setWmLoading] = useState<boolean>(false);
  const [wmProgress, setWmProgress] = useState<number>(0);
  const [wmBusy, setWmBusy] = useState<boolean>(false);
  const wmInputRef = useRef<HTMLInputElement>(null);
  const wmLogoInputRef = useRef<HTMLInputElement>(null);
  const wmPreviewRef = useRef<HTMLCanvasElement>(null);
  const wmIdSeq = useRef<number>(0);
  const [mergeItems, setMergeItems] = useState<MergeItem[]>([]);
  const [mergeWidthId, setMergeWidthId] = useState<string>("smartstore");
  const [mergeFormatId, setMergeFormatId] = useState<string>("jpg");
  const [mergeDragging, setMergeDragging] = useState<boolean>(false);
  const [mergeLoading, setMergeLoading] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<number>(0);
  const [mergeBusy, setMergeBusy] = useState<boolean>(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const mergeIdSeq = useRef<number>(0);
  const [compItems, setCompItems] = useState<CompItem[]>([]);
  const [compFormat, setCompFormat] = useState<CompFormat>("webp");
  const [compQualityLive, setCompQualityLive] = useState<number>(85); // 슬라이더 표시값
  const [compQuality, setCompQuality] = useState<number>(85); // 슬라이더가 멈춘 뒤 확정된 값(%)
  const [compTargetId, setCompTargetId] = useState<string>("none");
  const [compCustomMB, setCompCustomMB] = useState<string>("3");
  const [compResize, setCompResize] = useState<boolean>(false);
  const [compDragging, setCompDragging] = useState<boolean>(false);
  const compInputRef = useRef<HTMLInputElement>(null);
  const compIdSeq = useRef<number>(0);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const batchIdSeq = useRef<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [manualCuts, setManualCuts] = useState<number[] | null>(null); // 사용자가 끌어서 조정한 분할 지점
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const dragIdx = useRef<number | null>(null);
  // 탭과 무관하게 선택 상태는 보존하고, 현재 탭에 속한 항목만 selectedPresets로 사용
  const [selectedIds, setSelectedPresets] = useState<string[]>([
    "smartstore",
    "coupang",
    "store-smartstore-logo",
  ]);
  const visiblePresets = PRESETS.filter((p) => p.kind === tab);
  const selectedPresets = selectedIds.filter((id) => visiblePresets.some((p) => p.id === id));
  const [fillMode, setFillMode] = useState<FillMode>("white");
  const [autoColor, setAutoColor] = useState<string>("#FFFFFF");
  const [customColor, setCustomColor] = useState<string>("#F5F0E6");
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [lastPresetId, setLastPresetId] = useState<string>("coupang");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const bgColor =
    fillMode === "auto" ? autoColor : fillMode === "custom" ? customColor : "#FFFFFF";
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSelectedFile(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setLoadedImg(img);
      setManualCuts(null);
      // 업로드 즉시 가장자리 색상을 추출해 두고, 자동 감지 모드로 전환
      setAutoColor(detectEdgeColor(img));
      setFillMode("auto");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert("이미지를 불러오지 못했습니다.");
    };
    img.src = url;
  };

  // 미리보기 기준 플랫폼: 가장 최근에 선택한 플랫폼 (해제됐다면 선택 목록의 마지막)
  const previewPreset =
    PRESETS.find(
      (p) =>
        p.id === (selectedPresets.includes(lastPresetId) ? lastPresetId : selectedPresets[selectedPresets.length - 1])
    ) ?? null;
  // 선택된 플랫폼 구성: 전부 순백색 필수 / 혼합 / 일반만
  const selectedList = PRESETS.filter((p) => selectedPresets.includes(p.id));
  const allStrict = selectedList.length > 0 && selectedList.every((p) => p.strictWhiteBg);
  const isMixed = selectedList.some((p) => p.strictWhiteBg) && !allStrict;
  const previewIsStrict = !!previewPreset?.strictWhiteBg;
  // 버튼에 표시할 활성 모드: 순백색 필수 마켓만 선택됐다면 실제 적용값인 순백색으로 고정
  const activeMode: FillMode = allStrict ? "white" : fillMode;

  const [modeNotice, setModeNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleModeClick = (mode: FillMode) => {
    if (allStrict && mode !== "white") {
      setModeNotice("쿠팡·아마존 등은 마켓 필수 규정으로 순백색만 지원됩니다.");
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setModeNotice(null), 3000);
      return;
    }
    setFillMode(mode);
    // 혼합 선택에서 순백색 마켓 미리보기가 떠 있다면, 선택한 모드의 효과가 보이도록 일반 마켓으로 전환
    if (isMixed && previewIsStrict) {
      const normal = selectedList.filter((p) => !p.strictWhiteBg);
      setLastPresetId(normal[normal.length - 1].id);
    }
  };

  const previewW = PREVIEW_BASE;
  const previewH = previewPreset
    ? Math.round((PREVIEW_BASE * previewPreset.height) / previewPreset.width)
    : PREVIEW_BASE;

  // 선택한 모드·색상·플랫폼 비율이 바뀔 때마다 미리보기를 다시 그림
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !loadedImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // 캔버스 크기가 바뀌면 내용이 초기화되므로 항상 새로 그린다
    canvas.width = previewW;
    canvas.height = previewH;
    const fill = resolveFill(previewPreset, fillMode, bgColor);
    drawThumbnail(ctx, loadedImg, previewW, previewH, fill.mode, fill.color);
  }, [loadedImg, fillMode, bgColor, previewW, previewH, previewPreset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const togglePreset = (id: string) => {
    if (!selectedPresets.includes(id)) setLastPresetId(id);
    setSelectedPresets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectCategory = (category: string) => {
    const ids = PRESETS.filter((p) => p.category === category).map((p) => p.id);
    const allSelected = ids.every((id) => selectedPresets.includes(id));
    if (allSelected) {
      setSelectedPresets((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setLastPresetId(ids[ids.length - 1]);
      setSelectedPresets((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  // ── 대표이미지/배너 변환 ──────────────────────────────────────────────
  const sanitizeName = (s: string) => s.replace(/[\\/:*?"<>|]/g, "_").trim();
  const srcBase = sanitizeName((selectedFile?.name ?? "image").replace(/\.[^.]+$/, "")) || "image";

  // 규칙: 대표이미지 {원본파일명}_{마켓명}_{가로x세로}.jpg / 프로필·배너 {원본파일명}_{마켓명}_{배너유형}_{가로x세로}.jpg
  const presetFileName = (p: Preset) => {
    const store = STORE_NAMING[p.id];
    return store
      ? `${srcBase}_${sanitizeName(store[0])}_${sanitizeName(store[1])}_${p.width}x${p.height}.jpg`
      : `${srcBase}_${sanitizeName(p.name)}_${p.width}x${p.height}.jpg`;
  };

  // 마켓 하나를 JPEG(품질 0.92)로 렌더링. 캔버스 재인코딩이라 EXIF·GPS 등 메타데이터는 결과에 포함되지 않음
  const renderPresetBlob = async (preset: Preset): Promise<Blob> => {
    const img = loadedImg;
    if (!img) throw new Error("이미지가 없습니다.");
    const canvas = document.createElement("canvas");
    canvas.width = preset.width;
    canvas.height = preset.height;
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas context unavailable");
      // 순백색 필수 마켓은 사용자가 고른 여백 모드와 무관하게 #FFFFFF로 강제
      const fill = resolveFill(preset, fillMode, bgColor);
      drawThumbnail(ctx, img, canvas.width, canvas.height, fill.mode, fill.color);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
      if (!blob) throw new Error("인코딩에 실패했습니다.");
      return blob;
    } finally {
      canvas.width = 0; // 캔버스 버퍼 즉시 해제
      canvas.height = 0;
    }
  };

  const selectedPresetObjs = selectedPresets
    .map((id) => PRESETS.find((p) => p.id === id))
    .filter((p): p is Preset => !!p);

  // 마켓 1개만 골랐을 때(JPG 바로 저장)와 개별 저장 버튼에서 사용
  const downloadOnePreset = async (preset: Preset) => {
    if (!selectedFile || isProcessing) return;
    setIsProcessing(true);
    try {
      saveAs(await renderPresetBlob(preset), presetFileName(preset));
    } catch (err) {
      console.error(err);
      alert("변환 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processAndDownloadZip = async () => {
    if (!selectedFile || selectedPresetObjs.length === 0) return;
    if (selectedPresetObjs.length === 1) return downloadOnePreset(selectedPresetObjs[0]);
    setIsProcessing(true);

    try {
      const zip = new JSZip();
      const used = new Set<string>();
      for (const preset of selectedPresetObjs) {
        const blob = await renderPresetBlob(preset); // 한 장씩 순차 처리
        let name = presetFileName(preset);
        for (let n = 2; used.has(name); n++) name = presetFileName(preset).replace(/\.jpg$/, `_${n}.jpg`);
        used.add(name);
        zip.file(name, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, tab === "store" ? `PIXS_${srcBase}_스토어배너.zip` : `PIXS_${srcBase}_대표이미지.zip`);
    } catch (err) {
      console.error(err);
      alert("변환 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 상세페이지 분할 계산: 목표 가로폭에 맞춘 리사이즈 후 기준 높이 단위로 분할
  const detailTargetW = loadedImg
    ? (DETAIL_WIDTHS.find((o) => o.id === detailWidthId)?.width ?? loadedImg.width)
    : 0;
  const detailScaledH = loadedImg
    ? Math.round((loadedImg.height * detailTargetW) / loadedImg.width)
    : 0;
  const autoCuts = loadedImg ? computeCuts(detailScaledH, chunkH, splitMode) : [];
  const cuts =
    manualCuts && manualCuts.length === autoCuts.length ? manualCuts : autoCuts;
  const boundaries = loadedImg ? [0, ...cuts, detailScaledH] : [0];
  const pieceHeights = boundaries.slice(1).map((b, i) => b - boundaries[i]);
  const detailCount = loadedImg ? pieceHeights.length : 0;
  const minPiece = pieceHeights.length ? Math.min(...pieceHeights) : 0;
  const maxPiece = pieceHeights.length ? Math.max(...pieceHeights) : 0;
  const isManual = cuts !== autoCuts;

  // 분할선 드래그 조정 (이웃 분할선을 넘지 않도록 제한)
  const handleCutMove = (e: React.PointerEvent, i: number) => {
    if (dragIdx.current !== i || !previewWrapRef.current) return;
    const rect = previewWrapRef.current.getBoundingClientRect();
    const raw = Math.round(((e.clientY - rect.top) / rect.height) * detailScaledH);
    const lo = (i === 0 ? 0 : cuts[i - 1]) + MIN_PIECE;
    const hi = (i === cuts.length - 1 ? detailScaledH : cuts[i + 1]) - MIN_PIECE;
    const v = Math.min(Math.max(raw, lo), Math.max(lo, hi));
    setManualCuts(cuts.map((c, k) => (k === i ? v : c)));
  };

  // 파일명: {원본파일명}_상세_01.jpg (조각 수에 맞춰 번호 자릿수 패딩)
  const detailBase = sanitizeName((selectedFile?.name ?? "detail").replace(/\.[^.]+$/, "")) || "detail";
  const detailPad = Math.max(2, String(detailCount).length);
  const detailPieceName = (i: number) => `${detailBase}_상세_${String(i + 1).padStart(detailPad, "0")}.jpg`;

  // 조각 i를 전달받은 캔버스에 그려 JPEG(0.92)로 인코딩. 큰 원본은 소스 영역만 잘라 그리므로 조각 하나 분량의 버퍼만 사용
  const encodeDetailPiece = async (canvas: HTMLCanvasElement, i: number): Promise<Blob> => {
    const img = loadedImg;
    if (!img) throw new Error("이미지가 없습니다.");
    const scale = detailTargetW / img.width;
    const y = boundaries[i];
    const h = pieceHeights[i];

    canvas.width = detailTargetW; // 크기 지정 시 이전 조각 버퍼가 초기화됨
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context unavailable");
    ctx.fillStyle = "#FFFFFF"; // JPEG는 투명 미지원
    ctx.fillRect(0, 0, detailTargetW, h);
    ctx.imageSmoothingQuality = "high";

    const srcY = y / scale;
    const srcH = Math.min(h / scale, img.height - srcY);
    ctx.drawImage(img, 0, srcY, img.width, srcH, 0, 0, detailTargetW, h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
    if (!blob) throw new Error("toBlob failed");
    return blob;
  };

  // 조각 하나만 저장
  const saveDetailPiece = async (i: number) => {
    if (!loadedImg || isProcessing) return;
    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    try {
      saveAs(await encodeDetailPiece(canvas, i), detailPieceName(i));
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      canvas.width = 0;
      canvas.height = 0;
      setIsProcessing(false);
    }
  };

  const splitAndDownloadZip = async () => {
    if (!loadedImg || detailCount === 0) return;
    setIsProcessing(true);
    setSplitProgress(0);
    // 캔버스 하나를 모든 조각이 재사용 → 10,000~30,000px 이상 긴 이미지도 메모리는 조각 한 장 분량으로 유지
    const canvas = document.createElement("canvas");

    try {
      const zip = new JSZip();
      for (let i = 0; i < detailCount; i++) {
        zip.file(detailPieceName(i), await encodeDetailPiece(canvas, i));
        setSplitProgress(i + 1);
        // 렌더링 스레드에 양보해 UI 멈춤 방지
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      saveAs(await zip.generateAsync({ type: "blob" }), `PIXS_${detailBase}_상세분할.zip`);
    } catch (err) {
      console.error(err);
      alert("분할 중 오류가 발생했습니다. 이미지가 너무 크면 분할 단위를 줄여 다시 시도해 주세요.");
    } finally {
      canvas.width = 0; // 캔버스 버퍼 메모리 해제
      canvas.height = 0;
      setSplitProgress(0);
      setIsProcessing(false);
    }
  };

  // 압축: 설정 값이 달라진 파일을 한 장씩 순서대로 자동 압축 (결과가 반영되면 다음 장으로 이어짐)
  const compTargetOpt = COMP_TARGETS.find((t) => t.id === compTargetId) ?? COMP_TARGETS[0];
  const customMB = Number(compCustomMB);
  const compTargetMB =
    compTargetOpt.id === "custom"
      ? Number.isFinite(customMB) && customMB >= 0.1 && customMB <= 50
        ? customMB
        : null
      : compTargetOpt.mb;
  const compTargetBytes = compTargetMB === null ? null : Math.round(compTargetMB * 1024 * 1024);
  const compQ = compQuality / 100;
  const compSig = `${compFormat}|${compQuality}|${compTargetBytes ?? "none"}|${compResize}`;

  // 슬라이더를 끄는 동안에는 재압축하지 않고, 멈춘 뒤 0.4초 후 값을 확정 (빠른 연속 변경 시 낭비 방지)
  useEffect(() => {
    const t = setTimeout(() => setCompQuality(compQualityLive), 400);
    return () => clearTimeout(t);
  }, [compQualityLive]);
  const compNext = compItems.find((it) => it.sig !== compSig);
  const compDone = compItems.filter((it) => it.sig === compSig).length;
  const compPending = compItems.length - compDone;

  useEffect(() => {
    if (tab !== "compress" || !compNext) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await compressFile(compNext.file, compFormat, compQ, compTargetBytes, compResize);
        if (cancelled) return;
        setCompItems((prev) =>
          prev.map((p) => (p.id === compNext.id ? { ...p, sig: compSig, result, error: undefined } : p))
        );
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        const message = err instanceof Error ? err.message : "압축에 실패했습니다.";
        setCompItems((prev) =>
          prev.map((p) => (p.id === compNext.id ? { ...p, sig: compSig, result: undefined, error: message } : p))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, compNext, compSig, compFormat, compQ, compTargetBytes, compResize]);

  const addCompFiles = (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      if (files.length > 0) alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const room = BATCH_MAX - compItems.length;
    if (room <= 0) {
      alert(`한 번에 최대 ${BATCH_MAX}장까지 처리할 수 있습니다.`);
      return;
    }
    if (images.length > room) alert(`최대 ${BATCH_MAX}장까지만 추가되어 ${images.length - room}장은 제외되었습니다.`);
    setCompItems((prev) => [
      ...prev,
      ...images.slice(0, room).map((file) => ({ id: ++compIdSeq.current, name: file.name, file })),
    ]);
  };

  const downloadCompressed = async () => {
    const ready = compItems.filter((it) => it.result);
    if (ready.length === 0 || compPending > 0) return;
    const ext = COMP_FORMATS.find((f) => f.id === compFormat)?.ext ?? "jpg";
    const used = new Set<string>();
    const named = ready.map((it) => {
      const base = it.name.replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]/g, "_");
      let name = `${base}_압축.${ext}`; // {원본파일명}_압축.{확장자}
      for (let n = 2; used.has(name); n++) name = `${base}_압축_${n}.${ext}`;
      used.add(name);
      return { name, blob: it.result!.blob };
    });

    if (named.length === 1) {
      saveAs(named[0].blob, named[0].name); // 1장은 ZIP 없이 바로 다운로드
      return;
    }
    const zip = new JSZip();
    for (const f of named) zip.file(f.name, f.blob);
    saveAs(await zip.generateAsync({ type: "blob" }), "PIXS_압축이미지.zip");
  };

  // 탭 전환: 이전 탭의 이미지와 설정을 모두 초기화해 빈 대기 화면으로 시작
  const switchTab = (next: TabId) => {
    if (next === tab) return;
    setTab(next);

    // 탭 1~3 공용 작업 상태
    setSelectedFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setLoadedImg(null);
    setFillMode("white");
    setAutoColor("#FFFFFF");
    setCustomColor("#F5F0E6");
    setSelectedPresets(["smartstore", "coupang", "store-smartstore-logo"]);
    setLastPresetId("coupang");
    setModeNotice(null);
    setIsDragging(false);
    // 탭 3 (상세페이지 분할)
    setDetailWidthId("smartstore");
    setChunkH(3000);
    setChunkText("3000");
    setSplitMode("equal");
    setManualCuts(null);
    // 탭 4 (옵션 이미지 대량 편집)
    setBatchItems([]);
    setBatchSizeId("standard");
    setBatchFill("white");
    setBatchNaming("original");
    setBatchDragging(false);
    // 탭 5 (용량 압축·변환)
    setCompItems([]);
    setCompFormat("webp");
    setCompQualityLive(85);
    setCompQuality(85);
    setCompTargetId("none");
    setCompCustomMB("3");
    setCompResize(false);
    setCompDragging(false);
    // 탭 7 (워터마크·로고 일괄 삽입)
    setWmItems([]);
    setWmKind("text");
    setWmText("");
    setWmTextScale(WM_TEXT_SCALE.def);
    setWmLogoScale(WM_LOGO_SCALE.def);
    setWmRotation(0);
    setWmPreviewId(null);
    setWmColor("#FFFFFF");
    setWmPos("br");
    setWmOpacity(40);
    setWmLogo(null);
    setWmLogoName("");
    setWmDragging(false);
    // 탭 6 (상세페이지 이어붙이기)
    setMergeItems([]);
    setMergeWidthId("smartstore");
    setMergeFormatId("jpg");
    setMergeDragging(false);
  };

  const batchDims = BATCH_SIZES.find((s) => s.id === batchSizeId) ?? BATCH_SIZES[0];
  const batchSizeLabel = `${batchDims.w}x${batchDims.h}`;

  // 다중 업로드: 한 장씩 순차로 읽어 축소본·가장자리 색만 보관하고 원본 디코딩은 즉시 해제
  const addBatchFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      if (files.length > 0) alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const room = BATCH_MAX - batchItems.length;
    if (room <= 0) {
      alert(`한 번에 최대 ${BATCH_MAX}장까지 처리할 수 있습니다.`);
      return;
    }
    const accepted = images.slice(0, room);
    if (images.length > room) alert(`최대 ${BATCH_MAX}장까지만 추가되어 ${images.length - room}장은 제외되었습니다.`);

    setBatchLoading(true);
    let failed = 0;
    for (const file of accepted) {
      try {
        const { img, revoke } = await loadImageFromFile(file);
        const autoColor = detectEdgeColor(img);
        const scale = Math.min(1, 320 / Math.max(img.width, img.height));
        const small = document.createElement("canvas");
        small.width = Math.max(1, Math.round(img.width * scale));
        small.height = Math.max(1, Math.round(img.height * scale));
        small.getContext("2d")?.drawImage(img, 0, 0, small.width, small.height);
        revoke();
        img.src = "";
        const id = ++batchIdSeq.current;
        setBatchItems((prev) => [...prev, { id, name: file.name, file, small, autoColor }]);
      } catch (err) {
        console.error(err);
        failed++;
      }
    }
    setBatchLoading(false);
    if (failed > 0) alert(`${failed}장의 이미지를 읽지 못해 제외했습니다.`);
  };

  const removeBatchItem = (id: number) => setBatchItems((prev) => prev.filter((b) => b.id !== id));

  // 결과 파일명: {원본파일명}_옵션_{가로x세로}.jpg (순번 방식은 앞에 01_, 02_ … 를 붙임)
  const batchFileNames = (() => {
    const used = new Set<string>();
    const pad = Math.max(2, String(batchItems.length).length);
    return batchItems.map((it, i) => {
      const base = sanitizeName(it.name.replace(/\.[^.]+$/, "")) || "image";
      const prefix = batchNaming === "seq" ? `${String(i + 1).padStart(pad, "0")}_` : "";
      let name = `${prefix}${base}_옵션_${batchSizeLabel}.jpg`;
      for (let n = 2; used.has(name); n++) name = `${prefix}${base}_옵션_${n}_${batchSizeLabel}.jpg`;
      used.add(name);
      return name;
    });
  })();
  // ZIP 이름: PIXS_{첫번째원본파일명}_옵션대량편집.zip
  const batchZipName = `PIXS_${sanitizeName((batchItems[0]?.name ?? "image").replace(/\.[^.]+$/, "")) || "image"}_옵션대량편집.zip`;

  // 규격에 맞춰 JPEG(0.92)로 인코딩. 캔버스 재인코딩이라 EXIF는 포함되지 않음
  const renderBatchBlob = async (canvas: HTMLCanvasElement, item: BatchItem): Promise<Blob> => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context unavailable");
    const { img, revoke } = await loadImageFromFile(item.file);
    try {
      canvas.width = batchDims.w; // 크기 재지정으로 이전 장 버퍼 초기화
      canvas.height = batchDims.h;
      drawThumbnail(ctx, img, batchDims.w, batchDims.h, batchFill, batchFill === "white" ? "#FFFFFF" : item.autoColor);
    } finally {
      revoke();
      img.src = "";
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
    if (!blob) throw new Error("toBlob failed");
    return blob;
  };

  // 낱개 저장
  const saveOneBatch = async (idx: number) => {
    const item = batchItems[idx];
    if (!item || isProcessing) return;
    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    try {
      saveAs(await renderBatchBlob(canvas, item), batchFileNames[idx]);
    } catch (err) {
      console.error(err);
      alert("변환 중 오류가 발생했습니다.");
    } finally {
      canvas.width = 0;
      canvas.height = 0;
      setIsProcessing(false);
    }
  };

  const convertBatchToZip = async () => {
    if (batchItems.length === 0) return;
    if (batchItems.length === 1) return saveOneBatch(0); // 1장은 ZIP 없이 바로 저장
    setIsProcessing(true);
    setBatchProgress(0);
    const canvas = document.createElement("canvas"); // 전 장 공용 캔버스

    try {
      const zip = new JSZip();
      for (let i = 0; i < batchItems.length; i++) {
        zip.file(batchFileNames[i], await renderBatchBlob(canvas, batchItems[i]));
        setBatchProgress(i + 1);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      saveAs(await zip.generateAsync({ type: "blob" }), batchZipName);
    } catch (err) {
      console.error(err);
      alert("변환 중 오류가 발생했습니다. 장수를 줄이거나 다시 시도해 주세요.");
    } finally {
      canvas.width = 0; // 캔버스 버퍼 메모리 해제
      canvas.height = 0;
      setBatchProgress(0);
      setIsProcessing(false);
    }
  };

  // 체험 샘플 주입 (탭 4·5)
  const [sampleBusy, setSampleBusy] = useState<boolean>(false);

  const loadBatchSamples = async () => {
    setSampleBusy(true);
    try {
      const files = await Promise.all(BATCH_SAMPLES.map((s) => svgToPngFile(s.svg, s.file, 600, 800)));
      setBatchItems([]);
      await addBatchFiles(files);
    } catch (err) {
      console.error(err);
      alert("샘플을 불러오지 못했습니다.");
    } finally {
      setSampleBusy(false);
    }
  };

  const loadCompSamples = async () => {
    setSampleBusy(true);
    try {
      const files = [
        await makeHeavyImageFile("sample_고화질_원본.png", 2600, 1650, 1),
        await makeHeavyImageFile("sample_상세_원본.png", 1750, 1200, 2),
      ];
      setCompItems(files.map((file) => ({ id: ++compIdSeq.current, name: file.name, file })));
    } catch (err) {
      console.error(err);
      alert("샘플을 만들지 못했습니다.");
    } finally {
      setSampleBusy(false);
    }
  };

  // 워터마크·로고 일괄 삽입
  const wmOptions: WmOptions = {
    kind: wmKind,
    text: wmText,
    color: wmColor,
    scale: wmKind === "text" ? wmTextScale : wmLogoScale,
    rotation: wmRotation,
    pos: wmPos,
    opacity: wmOpacity,
    logo: wmLogo,
  };
  const wmReady = wmKind === "text" ? wmText.trim().length > 0 : wmLogo !== null;
  // 미리보기 대상: 목록에서 선택한 이미지(없으면 첫 번째)
  const wmSelected = wmItems.find((it) => it.id === wmPreviewId) ?? wmItems[0];

  // 선택한 이미지에 설정값을 실시간 합성해 보여줌
  useEffect(() => {
    const canvas = wmPreviewRef.current;
    if (tab !== "watermark" || !canvas || !wmSelected) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = wmSelected.small.width;
    canvas.height = wmSelected.small.height;
    ctx.drawImage(wmSelected.small, 0, 0);
    drawWatermark(ctx, canvas.width, canvas.height, {
      kind: wmKind,
      text: wmText,
      color: wmColor,
      scale: wmKind === "text" ? wmTextScale : wmLogoScale,
      rotation: wmRotation,
      pos: wmPos,
      opacity: wmOpacity,
      logo: wmLogo,
    });
  }, [tab, wmSelected, wmKind, wmText, wmColor, wmTextScale, wmLogoScale, wmRotation, wmPos, wmOpacity, wmLogo]);

  const addWmFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      if (files.length > 0) alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const room = WM_MAX - wmItems.length;
    if (room <= 0) {
      alert(`한 번에 최대 ${WM_MAX}장까지 처리할 수 있습니다.`);
      return;
    }
    if (images.length > room) alert(`최대 ${WM_MAX}장까지만 추가되어 ${images.length - room}장은 제외되었습니다.`);

    setWmLoading(true);
    let failed = 0;
    for (const file of images.slice(0, room)) {
      try {
        const { img, revoke } = await loadImageFromFile(file);
        const scale = Math.min(1, 480 / Math.max(img.width, img.height));
        const small = document.createElement("canvas");
        small.width = Math.max(1, Math.round(img.width * scale));
        small.height = Math.max(1, Math.round(img.height * scale));
        small.getContext("2d")?.drawImage(img, 0, 0, small.width, small.height);
        const thumbUrl = small.toDataURL("image/jpeg", 0.7);
        revoke();
        img.src = "";
        setWmItems((prev) => [...prev, { id: ++wmIdSeq.current, name: file.name, file, small, thumbUrl }]);
      } catch (err) {
        console.error(err);
        failed++;
      }
    }
    setWmLoading(false);
    if (failed > 0) alert(`${failed}장의 이미지를 읽지 못해 제외했습니다.`);
  };

  const loadWmLogo = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일(투명 배경 PNG 권장)만 올릴 수 있습니다.");
      return;
    }
    try {
      // 로고는 한 장뿐이라 디코딩된 이미지를 그대로 보관 (일괄 합성 때마다 재사용하므로 blob 주소는 해제하지 않음)
      const { img } = await loadImageFromFile(file);
      setWmLogo(img);
      setWmLogoName(file.name);
    } catch (err) {
      console.error(err);
      alert("로고 이미지를 읽지 못했습니다.");
    }
  };

  const loadWmSamples = async () => {
    setSampleBusy(true);
    try {
      const files = await Promise.all(WM_SAMPLES.map((s) => svgToPngFile(s.svg, s.file, 600, 800)));
      setWmItems([]);
      setWmKind("text");
      if (!wmText.trim()) setWmText(WM_PLACEHOLDER);
      await addWmFiles(files);
    } catch (err) {
      console.error(err);
      alert("샘플을 불러오지 못했습니다.");
    } finally {
      setSampleBusy(false);
    }
  };

  // 결과 파일명: {원본파일명}_워터마크.jpg (같은 이름이 있으면 번호를 붙임)
  const wmFileNames = (() => {
    const used = new Set<string>();
    return wmItems.map((it) => {
      const base = sanitizeName(it.name.replace(/\.[^.]+$/, "")) || "image";
      let name = `${base}_워터마크.jpg`;
      for (let n = 2; used.has(name); n++) name = `${base}_워터마크_${n}.jpg`;
      used.add(name);
      return name;
    });
  })();

  // 원본 해상도로 워터마크를 합성해 JPEG(0.92)로 인코딩 (캔버스는 호출한 쪽에서 재사용·해제)
  const renderWmBlob = async (canvas: HTMLCanvasElement, item: WmItem): Promise<Blob> => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context unavailable");
    const { img, revoke } = await loadImageFromFile(item.file);
    try {
      canvas.width = img.width; // 크기 재지정으로 이전 장 버퍼 초기화
      canvas.height = img.height;
      ctx.fillStyle = "#FFFFFF"; // JPEG 저장용 (투명 PNG 대비)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      drawWatermark(ctx, canvas.width, canvas.height, wmOptions); // 모든 이미지에 같은 설정을 동일하게 적용
    } finally {
      revoke();
      img.src = "";
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
    if (!blob) throw new Error("인코딩에 실패했습니다.");
    return blob;
  };

  // 낱개 저장
  const saveOneWatermarked = async (idx: number) => {
    const item = wmItems[idx];
    if (!item || !wmReady || wmBusy) return;
    setWmBusy(true);
    const canvas = document.createElement("canvas");
    try {
      saveAs(await renderWmBlob(canvas, item), wmFileNames[idx]);
    } catch (err) {
      console.error(err);
      alert("워터마크를 삽입하는 중 오류가 발생했습니다.");
    } finally {
      canvas.width = 0;
      canvas.height = 0;
      setWmBusy(false);
    }
  };

  const applyWatermarkAndDownload = async () => {
    if (wmItems.length === 0 || !wmReady) return;
    if (wmItems.length === 1) return saveOneWatermarked(0);
    setWmBusy(true);
    setWmProgress(0);
    const canvas = document.createElement("canvas"); // 전 장 공용 캔버스
    try {
      const zip = new JSZip();
      for (let i = 0; i < wmItems.length; i++) {
        zip.file(wmFileNames[i], await renderWmBlob(canvas, wmItems[i]));
        setWmProgress(i + 1);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      saveAs(await zip.generateAsync({ type: "blob" }), "PIXS_워터마크.zip");
    } catch (err) {
      console.error(err);
      alert("워터마크를 삽입하는 중 오류가 발생했습니다.");
    } finally {
      canvas.width = 0; // 캔버스 버퍼 메모리 해제
      canvas.height = 0;
      setWmProgress(0);
      setWmBusy(false);
    }
  };

  // 상세페이지 이어붙이기
  const mergeWidthOpt = MERGE_WIDTHS.find((o) => o.id === mergeWidthId) ?? MERGE_WIDTHS[0];
  const mergeFormat = MERGE_FORMATS.find((o) => o.id === mergeFormatId) ?? MERGE_FORMATS[0];
  const mergeTargetW =
    mergeWidthOpt.width ??
    (mergeWidthOpt.id === "max" ? Math.max(0, ...mergeItems.map((it) => it.w)) : (mergeItems[0]?.w ?? 0));
  // 결과 파일명: PIXS_{첫번째파일명}_상세이어붙이기.jpg (순서를 바꾸면 첫 번째 파일 기준으로 바뀜)
  const mergeFirstBase =
    sanitizeName((mergeItems[0]?.name ?? "merge").replace(/\.[^.]+$/, "")) || "merge";
  const mergeFileName = `PIXS_${mergeFirstBase}_상세이어붙이기.${mergeFormat.ext}`;
  const [mergeDragId, setMergeDragId] = useState<number | null>(null);
  const [mergeOverId, setMergeOverId] = useState<number | null>(null);

  // 드래그 앤 드롭 재정렬: 끌어온 항목을 놓은 항목의 위치로 이동
  const moveMergeTo = (fromId: number, toId: number) =>
    setMergeItems((prev) => {
      const from = prev.findIndex((p) => p.id === fromId);
      const to = prev.findIndex((p) => p.id === toId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  const mergeHeights = mergeItems.map((it) => Math.round((it.h * mergeTargetW) / it.w));
  const mergeTotalH = mergeHeights.reduce((s, h) => s + h, 0);
  const mergeTooTall = mergeTotalH > mergeFormat.maxH;

  const addMergeFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      if (files.length > 0) alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const room = MERGE_MAX - mergeItems.length;
    if (room <= 0) {
      alert(`최대 ${MERGE_MAX}장까지 이어붙일 수 있습니다.`);
      return;
    }
    if (images.length > room) alert(`최대 ${MERGE_MAX}장까지만 추가되어 ${images.length - room}장은 제외되었습니다.`);
    // 디자이너가 넘겨준 01, 02, 03... 파일이 순서대로 들어가도록 파일명 숫자 순 정렬
    const picked = images.slice(0, room).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    setMergeLoading(true);
    let failed = 0;
    for (const file of picked) {
      try {
        const { img, revoke } = await loadImageFromFile(file);
        const scale = Math.min(1, 320 / img.width);
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
        const thumbUrl = c.toDataURL("image/jpeg", 0.75);
        const item: MergeItem = { id: ++mergeIdSeq.current, name: file.name, file, w: img.width, h: img.height, thumbUrl };
        c.width = 0;
        c.height = 0;
        revoke();
        img.src = "";
        setMergeItems((prev) => [...prev, item]);
      } catch (err) {
        console.error(err);
        failed++;
      }
    }
    setMergeLoading(false);
    if (failed > 0) alert(`${failed}장의 이미지를 읽지 못해 제외했습니다.`);
  };

  const moveMergeItem = (id: number, dir: -1 | 1) =>
    setMergeItems((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const loadMergeSamples = async () => {
    setSampleBusy(true);
    try {
      const kinds: { k: "top" | "body" | "bottom"; name: string }[] = [
        { k: "top", name: "sample_01_상단.png" },
        { k: "body", name: "sample_02_본문.png" },
        { k: "bottom", name: "sample_03_하단.png" },
      ];
      const files = await Promise.all(
        kinds.map((x) => {
          const { svg, h } = mergePieceSvg(x.k);
          return svgToPngFile(svg, x.name, 860, h);
        })
      );
      setMergeItems([]);
      await addMergeFiles(files);
    } catch (err) {
      console.error(err);
      alert("샘플을 불러오지 못했습니다.");
    } finally {
      setSampleBusy(false);
    }
  };

  const mergeAndDownload = async () => {
    if (mergeItems.length === 0 || mergeTooTall) return;
    setMergeBusy(true);
    setMergeProgress(0);
    const canvas = document.createElement("canvas"); // 최종 결과 캔버스 1개에 조각을 한 장씩 그림
    try {
      canvas.width = mergeTargetW;
      canvas.height = mergeTotalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas context unavailable");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, mergeTargetW, mergeTotalH);
      ctx.imageSmoothingQuality = "high";

      let y = 0;
      for (let i = 0; i < mergeItems.length; i++) {
        const { img, revoke } = await loadImageFromFile(mergeItems[i].file);
        ctx.drawImage(img, 0, y, mergeTargetW, mergeHeights[i]);
        y += mergeHeights[i];
        revoke();
        img.src = ""; // 디코딩된 조각 메모리 즉시 해제
        setMergeProgress(i + 1);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), mergeFormat.mime, mergeFormat.quality)
      );
      if (!blob) throw new Error("인코딩에 실패했습니다.");
      if (blob.type !== mergeFormat.mime) throw new Error("이 브라우저는 WebP 저장을 지원하지 않습니다. JPG를 선택해 주세요.");
      saveAs(blob, mergeFileName);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "이어붙이는 중 오류가 발생했습니다.");
    } finally {
      canvas.width = 0; // 캔버스 버퍼 메모리 해제
      canvas.height = 0;
      setMergeProgress(0);
      setMergeBusy(false);
    }
  };

  const categories = Array.from(new Set(visiblePresets.map((p) => p.category)));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* 헤더 */}
        <header className="text-center pt-6 pb-4 space-y-8">
          <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 text-xs sm:text-sm px-4 py-1.5 rounded-full font-semibold break-keep">
            ⚡ 프로그램 설치 없이 · 100% 무료 · 서버 업로드 없는 안전한 브라우저 편집
          </span>

          {/* 브랜드 로고 */}
          <div className="space-y-1">
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900">PIXS</div>
            <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-500">
              Pixel Studio · 이커머스 이미지 스튜디오
            </p>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug text-slate-900 break-keep max-w-3xl mx-auto">
              프로그램 설치 없이,
              <br className="hidden sm:block" /> 쇼핑몰에 필요한 모든 사진 편집을 한곳에서
            </h1>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed max-w-3xl mx-auto break-keep">
              대표이미지 맞춤 규격부터 스토어 배너, 상세페이지 세로 분할, 대량 옵션 변환, 초경량 압축까지.
              <br className="hidden sm:block" /> 포토샵 없이 브라우저에서 클릭 한 번으로 마켓 규격에 맞게 완성하세요.
            </p>
          </div>
        </header>

        {/* 모드 전환 탭 */}
        {/* 한 줄 고정: 화면이 좁으면 줄바꿈 대신 가로 스크롤. 안쪽 mx-auto는 넘치지 않을 때만 가운데 정렬되어 좌측 탭이 잘리지 않음 */}
        <div role="tablist" className="flex flex-nowrap overflow-x-auto whitespace-nowrap border-b border-slate-200 [scrollbar-width:thin]">
          <div className="mx-auto flex flex-nowrap gap-x-1 sm:gap-x-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => switchTab(t.id)}
                // 굵기는 동일하게 두고 색·밑줄로만 구분해 탭 전환 시 글자 폭이 흔들리지 않게 함
                className={`shrink-0 px-3 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.id
                    ? "text-slate-900 border-blue-600"
                    : "text-slate-400 border-transparent hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 워터마크·로고 일괄 삽입 */}
        {tab === "watermark" ? (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                워터마크를 넣을 이미지 업로드
              </h2>
              <div
                onClick={() => wmInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setWmDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setWmDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setWmDragging(false);
                  addWmFiles(Array.from(e.dataTransfer.files));
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  wmDragging ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:border-blue-500 bg-slate-50"
                }`}
              >
                <div className="text-3xl text-slate-400">🛡️</div>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  상품·상세 이미지를 여러 장 끌어다 놓거나 클릭하세요
                </p>
                <p className="text-[11px] text-slate-400">최대 {WM_MAX}장 · JPG, PNG, WebP · 서버로 전송되지 않습니다</p>
                <input
                  ref={wmInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addWmFiles(Array.from(e.target.files ?? []));
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </div>
              <button
                onClick={loadWmSamples}
                disabled={sampleBusy || wmLoading}
                className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-60"
              >
                {sampleBusy ? "샘플 준비 중..." : "💡 상품 사진 3장으로 워터마크 체험하기"}
              </button>
              {wmLoading && <p className="text-[11px] text-blue-600">이미지를 불러오는 중...</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                  워터마크 설정
                </h2>

                <div className="space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">① 워터마크 종류</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "text", label: "텍스트 워터마크", desc: "스토어명·브랜드명" },
                        { id: "logo", label: "로고 이미지 워터마크", desc: "투명 배경 PNG 권장" },
                      ] as { id: WmKind; label: string; desc: string }[]
                    ).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setWmKind(o.id)}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          wmKind === o.id
                            ? "border-blue-600 bg-blue-50/50 text-blue-900"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{o.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{o.desc}</div>
                      </button>
                    ))}
                  </div>

                  {wmKind === "text" ? (
                    <div className="space-y-3 pt-1">
                      <input
                        type="text"
                        value={wmText}
                        onChange={(e) => setWmText(e.target.value)}
                        placeholder={WM_PLACEHOLDER}
                        maxLength={60}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-16 shrink-0 font-semibold text-slate-700">글꼴 크기</span>
                        <input
                          type="range"
                          min={WM_TEXT_SCALE.min}
                          max={WM_TEXT_SCALE.max}
                          step={0.5}
                          value={wmTextScale}
                          onChange={(e) => setWmTextScale(Number(e.target.value))}
                          className="flex-1 accent-blue-600"
                          aria-label="글꼴 크기"
                        />
                        <span className="w-12 text-right font-bold text-slate-700">{wmTextScale}%</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                        <span className="w-16 shrink-0 font-semibold text-slate-700">텍스트 색상</span>
                        {[
                          { v: "#FFFFFF", label: "화이트" },
                          { v: "#000000", label: "블랙" },
                        ].map((c) => (
                          <button
                            key={c.v}
                            onClick={() => setWmColor(c.v)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition ${
                              wmColor.toUpperCase() === c.v ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <span className="inline-block w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.v }} />
                            {c.label}
                          </button>
                        ))}
                        <label className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-slate-200 font-medium cursor-pointer hover:bg-slate-50">
                          직접 선택
                          <input
                            type="color"
                            value={wmColor}
                            onChange={(e) => setWmColor(e.target.value.toUpperCase())}
                            className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
                            aria-label="텍스트 색상 직접 선택"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => wmLogoInputRef.current?.click()}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          로고 파일 선택
                        </button>
                        <span className="min-w-0 truncate text-[11px] text-slate-500">{wmLogoName || "선택된 로고가 없습니다"}</span>
                        <input
                          ref={wmLogoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            loadWmLogo(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-16 shrink-0 font-semibold text-slate-700">로고 크기</span>
                        <input
                          type="range"
                          min={WM_LOGO_SCALE.min}
                          max={WM_LOGO_SCALE.max}
                          step={5}
                          value={wmLogoScale}
                          onChange={(e) => setWmLogoScale(Number(e.target.value))}
                          className="flex-1 accent-blue-600"
                          aria-label="로고 크기 비율"
                        />
                        <span className="w-12 text-right font-bold text-slate-700">{wmLogoScale}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">② 위치 배치 (9개 위치 + 격자 반복)</div>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="grid grid-cols-3 gap-1.5">
                      {WM_GRID.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setWmPos(g.id)}
                          title={g.title}
                          aria-label={g.title}
                          className={`h-10 w-12 rounded-lg border text-sm font-bold transition ${
                            wmPos === g.id
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setWmPos("tile")}
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                        wmPos === "tile"
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      전체 바둑판 (격자 반복)
                      <span className="mt-0.5 block text-[10px] font-normal text-slate-400">무단 도용 방지에 가장 강력</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">③ 회전 각도</div>
                  <div className="flex flex-wrap gap-2">
                    {WM_ROTATIONS.map((r) => (
                      <button
                        key={r.v}
                        onClick={() => setWmRotation(r.v)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                          wmRotation === r.v
                            ? "border-blue-600 bg-blue-50/50 text-blue-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">④ 투명도</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={wmOpacity}
                      onChange={(e) => setWmOpacity(Number(e.target.value))}
                      className="flex-1 accent-blue-600"
                      aria-label="워터마크 투명도"
                    />
                    <span className="w-12 text-right text-xs font-bold text-slate-700">{wmOpacity}%</span>
                  </div>
                </div>

                <GuideBox>
                  💡 <GuideEm>워터마크 가이드:</GuideEm> 상품을 가리지 않는 깔끔한 보호를 원하면{" "}
                  <GuideEm>[우측 하단 + 투명도 30~40%]</GuideEm>, 무단 도용 방지가 최우선인 상세페이지는{" "}
                  <GuideEm>[중앙 또는 바둑판 패턴 + 투명도 15~20%]</GuideEm>를 추천합니다.
                </GuideBox>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">실시간 미리보기</h3>
                {wmSelected ? (
                  <>
                    <p className="truncate text-[11px] text-slate-500" title={wmSelected.name}>
                      {wmSelected.name}
                      {wmItems.length > 1 && " · 아래 목록에서 다른 이미지를 눌러 확인"}
                    </p>
                    <div className="rounded-lg border border-slate-300 bg-slate-100 p-2">
                      <canvas ref={wmPreviewRef} className="block w-full h-auto rounded" />
                    </div>
                    {!wmReady && (
                      <p className="text-[11px] text-amber-700">
                        {wmKind === "text" ? "워터마크 문구를 입력하면 미리보기에 반영됩니다." : "로고 파일을 선택하면 미리보기에 반영됩니다."}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400">이미지를 올리면 워터마크가 합성된 모습이 여기에 표시됩니다.</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  업로드한 이미지 {wmItems.length}장
                  {wmItems.length > 1 && <span className="ml-2 text-[11px] font-medium text-slate-400">눌러서 미리보기 · 모든 이미지에 같은 설정이 적용됩니다</span>}
                </h3>
                {wmItems.length > 0 && (
                  <button
                    onClick={() => setWmItems([])}
                    disabled={wmBusy}
                    className="text-[11px] font-medium text-blue-600 hover:underline disabled:opacity-50"
                  >
                    전체 비우기
                  </button>
                )}
              </div>
              {wmItems.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {wmItems.map((it, idx) => (
                    <div
                      key={it.id}
                      onClick={() => setWmPreviewId(it.id)}
                      className={`relative cursor-pointer rounded-lg border bg-white p-1.5 transition ${
                        wmSelected?.id === it.id ? "border-blue-600 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.thumbUrl} alt={it.name} className="block w-full aspect-square rounded object-cover object-top" />
                      <span className="absolute top-0.5 left-0.5 rounded bg-slate-800/80 px-1 text-[10px] font-bold text-white">{idx + 1}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWmItems((prev) => prev.filter((p) => p.id !== it.id));
                        }}
                        disabled={wmBusy}
                        aria-label={`${it.name} 삭제`}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-800/80 text-white text-[11px] leading-none flex items-center justify-center hover:bg-red-500 disabled:opacity-40"
                      >
                        ✕
                      </button>
                      <p className="mt-1 text-[10px] text-slate-600 truncate" title={wmFileNames[idx]}>{wmFileNames[idx]}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveOneWatermarked(idx);
                        }}
                        disabled={!wmReady || wmBusy}
                        className="mt-1 w-full rounded border border-slate-200 py-0.5 text-[10px] font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-40"
                      >
                        ↓ 저장
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">아직 업로드한 이미지가 없습니다.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={applyWatermarkAndDownload}
                disabled={wmItems.length === 0 || !wmReady || wmBusy || wmLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wmBusy
                  ? wmItems.length > 1
                    ? `워터마크 삽입 중... ${wmProgress}/${wmItems.length}`
                    : "워터마크 삽입 중..."
                  : wmItems.length === 0
                    ? "이미지를 먼저 업로드하세요"
                    : !wmReady
                      ? wmKind === "text"
                        ? "워터마크 문구를 입력하세요"
                        : "로고 파일을 선택하세요"
                      : wmItems.length === 1
                        ? "워터마크 적용 이미지 다운로드"
                        : "전체 워터마크 적용 결과 ZIP 다운로드 (PIXS_워터마크.zip)"}
              </button>
              <p className="mt-2 text-[11px] text-slate-400">
                원본 해상도 그대로 JPEG 고화질(품질 0.92)로 저장되며, 파일명은 {"{원본파일명}"}_워터마크.jpg 입니다.
              </p>
            </div>
          </div>
        ) : tab === "merge" ? (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                쪼개진 상세페이지 조각 업로드
              </h2>
              <div
                onClick={() => mergeInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setMergeDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setMergeDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setMergeDragging(false);
                  addMergeFiles(Array.from(e.dataTransfer.files));
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  mergeDragging ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:border-blue-500 bg-slate-50"
                }`}
              >
                <div className="text-3xl text-slate-400">🧩</div>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  도매몰·디자이너에게 받은 조각 이미지(3~20장)를 한 번에 끌어다 놓거나 클릭하세요
                </p>
                <p className="text-[11px] text-slate-400">JPG, PNG, WebP · 파일명 순서대로 자동 정렬됩니다</p>
                <input
                  ref={mergeInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addMergeFiles(Array.from(e.target.files ?? []));
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </div>
              <button
                onClick={loadMergeSamples}
                disabled={sampleBusy || mergeLoading}
                className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-60"
              >
                {sampleBusy ? "샘플 준비 중..." : "💡 조각 이미지 3장으로 이어붙이기 체험하기"}
              </button>
              {mergeLoading && <p className="text-[11px] text-blue-600">이미지를 불러오는 중...</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">① 가로폭 기준 맞춤</div>
                <div className="grid grid-cols-1 gap-2">
                  {MERGE_WIDTHS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setMergeWidthId(o.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-bold transition ${
                        mergeWidthId === o.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">가로폭이 제각각이어도 기준폭에 맞춰 비율 유지로 리사이즈한 뒤 이어붙입니다.</p>
              </div>
              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">② 저장 포맷 및 화질</div>
                <div className="grid grid-cols-1 gap-2">
                  {MERGE_FORMATS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setMergeFormatId(o.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-bold transition ${
                        mergeFormatId === o.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <GuideBox>
              💡 <GuideEm>이어붙이기 가이드:</GuideEm> 스마트스토어·자사몰은 <GuideEm>[가로 860px]</GuideEm>, 쿠팡·오픈마켓은{" "}
              <GuideEm>[가로 780px]</GuideEm> 기준을 권장하며, 전체 길이가 매우 길다면 용량 절감을 위해{" "}
              <GuideEm>[WebP 초경량]</GuideEm> 포맷 저장을 추천합니다.
            </GuideBox>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    이어붙일 순서 ({mergeItems.length}장)
                    {mergeItems.length > 1 && <span className="ml-2 text-[11px] font-medium text-slate-400">끌어서 순서 변경 가능</span>}
                  </h3>
                  {mergeItems.length > 0 && (
                    <button
                      onClick={() => setMergeItems([])}
                      disabled={mergeBusy}
                      className="text-[11px] font-medium text-blue-600 hover:underline disabled:opacity-50"
                    >
                      전체 비우기
                    </button>
                  )}
                </div>
                {mergeItems.length > 0 ? (
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 max-h-[28rem] overflow-y-auto">
                    {mergeItems.map((it, idx) => (
                      <li
                        key={it.id}
                        draggable={!mergeBusy}
                        onDragStart={(e) => {
                          setMergeDragId(it.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(it.id)); // Firefox는 데이터가 있어야 드래그가 시작됨
                        }}
                        onDragOver={(e) => {
                          if (mergeDragId === null) return;
                          e.preventDefault();
                          setMergeOverId(it.id);
                        }}
                        onDrop={(e) => {
                          if (mergeDragId === null) return;
                          e.preventDefault();
                          e.stopPropagation();
                          moveMergeTo(mergeDragId, it.id);
                          setMergeDragId(null);
                          setMergeOverId(null);
                        }}
                        onDragEnd={() => {
                          setMergeDragId(null);
                          setMergeOverId(null);
                        }}
                        className={`flex items-center gap-2 px-2.5 py-2 text-xs transition ${
                          mergeDragId === it.id ? "opacity-40" : ""
                        } ${mergeOverId === it.id && mergeDragId !== it.id ? "bg-blue-50 shadow-[inset_0_2px_0_0_#3b82f6]" : ""}`}
                      >
                        <span className="shrink-0 cursor-grab select-none text-slate-300" title="끌어서 순서 변경" aria-hidden>⠿</span>
                        <span className="w-5 shrink-0 text-center font-bold text-blue-600">{idx + 1}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.thumbUrl} alt="" className="w-12 h-12 shrink-0 rounded border border-slate-200 object-cover object-top" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800" title={it.name}>{it.name}</p>
                          <p className="text-[11px] text-slate-400">{it.w.toLocaleString()} x {it.h.toLocaleString()} px</p>
                        </div>
                        <button
                          onClick={() => moveMergeItem(it.id, -1)}
                          disabled={idx === 0 || mergeBusy}
                          aria-label={`${it.name} 위로`}
                          className="w-6 h-6 rounded bg-slate-100 text-slate-600 hover:bg-blue-100 disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveMergeItem(it.id, 1)}
                          disabled={idx === mergeItems.length - 1 || mergeBusy}
                          aria-label={`${it.name} 아래로`}
                          className="w-6 h-6 rounded bg-slate-100 text-slate-600 hover:bg-blue-100 disabled:opacity-30"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => setMergeItems((prev) => prev.filter((p) => p.id !== it.id))}
                          disabled={mergeBusy}
                          aria-label={`${it.name} 삭제`}
                          className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white disabled:opacity-30"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-slate-400">아직 업로드한 조각이 없습니다.</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">합쳐진 결과 미리보기</h3>
                {mergeItems.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold text-slate-700">
                      결과: {mergeTargetW.toLocaleString()} x {mergeTotalH.toLocaleString()} px ({mergeItems.length}장)
                    </p>
                    {mergeTooTall && (
                      <p className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-800">
                        총 높이가 {mergeFormat.label.split(" ")[0]} 저장 한계({mergeFormat.maxH.toLocaleString()}px)를 넘었어요.
                        {mergeFormat.id === "webp" ? " JPG를 선택하거나 " : " "}조각 수를 줄여 나눠서 이어붙여 주세요.
                      </p>
                    )}
                    <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-slate-300 bg-slate-100">
                      {mergeItems.map((it) => (
                        // 모든 조각이 같은 가로폭으로 맞춰지므로 w-full로 쌓으면 결과물과 같은 비율이 됨
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={it.id} src={it.thumbUrl} alt={it.name} className="block w-full h-auto" />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400">조각을 올리면 이어붙인 모습이 여기에 표시됩니다.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={mergeAndDownload}
                disabled={mergeItems.length === 0 || mergeBusy || mergeTooTall || mergeLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mergeBusy
                  ? `이어붙이는 중... ${mergeProgress}/${mergeItems.length}`
                  : mergeItems.length > 0
                    ? "이어붙인 상세페이지 다운로드"
                    : "조각 이미지를 먼저 업로드하세요"}
              </button>
              <p className="mt-2 text-[11px] text-slate-400">
                서버로 전송되지 않고 내 브라우저에서만 합성됩니다.
                {mergeItems.length > 0 && ` 저장 파일명: ${mergeFileName}`}
              </p>
            </div>
          </div>
        ) : tab === "compress" ? (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                용량이 큰 이미지 업로드
              </h2>
              <div
                onClick={() => compInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setCompDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setCompDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setCompDragging(false);
                  addCompFiles(Array.from(e.dataTransfer.files));
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  compDragging ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:border-blue-500 bg-slate-50"
                }`}
              >
                <div className="text-3xl text-slate-400">🗜️</div>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  10MB가 넘는 JPG·PNG를 여러 장 끌어다 놓거나 클릭하세요
                </p>
                <p className="text-[11px] text-slate-400">서버로 전송되지 않고 내 브라우저에서만 압축됩니다</p>
                <input
                  ref={compInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addCompFiles(Array.from(e.target.files ?? []));
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </div>
              <button
                onClick={loadCompSamples}
                disabled={sampleBusy}
                className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-60"
              >
                {sampleBusy ? "고용량 샘플 만드는 중..." : "💡 고용량 사진 2장으로 압축 체험하기"}
              </button>
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 space-y-2.5">
                <div className="space-y-1">
                  <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">
                    💡 주요 쇼핑몰 권장 용량 &amp; 포맷 기준표
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 break-keep">
                    용량이 클수록 모바일 페이지 로딩이 느려져 구매 전환율이 떨어집니다. 마켓 규격에 맞춰 최적화하세요.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MARKET_SIZE_GUIDES.map((g) => (
                    <div key={g.name} className="rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] leading-relaxed text-slate-600">
                      <p className="mb-1 text-xs font-bold text-slate-800">{g.name}</p>
                      <p className="break-keep">
                        <span className="mr-1 font-semibold text-slate-800">용량</span>
                        {g.size}
                      </p>
                      <p className="break-keep">
                        <span className="mr-1 font-semibold text-slate-800">포맷</span>
                        {g.format}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="rounded-md bg-white border border-blue-100 px-2.5 py-1.5 text-xs leading-relaxed text-slate-700 break-keep">
                  💡 <strong className="font-semibold text-slate-800">추천 가이드:</strong> 오픈마켓·쿠팡 등록용은{" "}
                  <strong className="font-semibold text-slate-800">[JPG 유지 압축(0.85)]</strong>, 자사몰·스마트스토어 초고속 로딩용은{" "}
                  <strong className="font-semibold text-slate-800">[WebP 변환]</strong>을 추천합니다.
                </p>
                <p className="text-[11px] text-slate-400">
                  ※ 마켓 정책은 수시로 바뀔 수 있으니 등록 전 각 판매자센터의 최신 안내를 함께 확인하세요.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">① 포맷 변환</div>
                <div className="grid grid-cols-1 gap-2">
                  {COMP_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setCompFormat(f.id)}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        compFormat === f.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">{f.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">JPG·WebP·PNG 사이를 자유롭게 변환합니다.</p>
              </div>

              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">② 목표 용량 (원클릭 타깃 압축)</div>
                <div className="grid grid-cols-1 gap-2">
                  {COMP_TARGETS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCompTargetId(t.id)}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        compTargetId === t.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold break-keep">{t.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
                {compTargetId === "custom" && (
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">목표</span>
                    <input
                      type="number"
                      min={0.1}
                      max={50}
                      step={0.5}
                      value={compCustomMB}
                      onChange={(e) => setCompCustomMB(e.target.value)}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-xs focus:border-blue-500 focus:outline-none"
                      aria-label="목표 용량(MB) 직접 입력"
                    />
                    <span>MB 이하 (0.1~50)</span>
                  </label>
                )}
                {compTargetId === "custom" && compTargetMB === null && (
                  <p className="text-[11px] text-amber-700">0.1~50 사이의 값을 입력하면 적용됩니다.</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">③ 품질 조절</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={COMP_QUALITY_MIN}
                      max={100}
                      step={5}
                      value={compQualityLive}
                      disabled={compFormat === "png"}
                      onChange={(e) => setCompQualityLive(Number(e.target.value))}
                      className="flex-1 accent-blue-600 disabled:opacity-40"
                      aria-label="압축 품질"
                    />
                    <span className="w-12 text-right text-xs font-bold text-slate-700">
                      {compFormat === "png" ? "무손실" : `${compQualityLive}%`}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400 break-keep">
                    {compFormat === "png"
                      ? "PNG는 무손실이라 화질 슬라이더가 적용되지 않아요. 목표 용량은 해상도를 줄여 맞춥니다."
                      : compTargetMB !== null
                        ? `목표(${compTargetMB}MB)를 넘으면 화질을 이 값에서부터 자동으로 낮춰 목표 바로 아래로 맞춥니다.`
                        : "값이 높을수록 화질이 좋고 용량이 커집니다. (권장 85%)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">④ 크기 조절</div>
                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={compResize}
                      onChange={(e) => setCompResize(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded text-blue-600"
                    />
                    <span>
                      <span className="block text-xs font-bold text-slate-700">가로폭 {RESIZE_MAX_W}px 초과 시 자동 축소</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">불필요한 초고해상도를 줄여 용량을 크게 절감합니다</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  업로드한 파일 {compItems.length}개
                  {compItems.length > 0 && compPending > 0 && (
                    <span className="ml-2 text-[11px] font-medium text-blue-600">
                      압축 중... {compDone}/{compItems.length}
                    </span>
                  )}
                </h3>
                {compItems.length > 0 && (
                  <button
                    onClick={() => setCompItems([])}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    전체 비우기
                  </button>
                )}
              </div>

              {compItems.length > 0 ? (
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {compItems.map((it) => {
                    const done = it.sig === compSig;
                    const r = done ? it.result : undefined;
                    const saved = r ? Math.round((1 - r.size / it.file.size) * 100) : 0;
                    return (
                      <li key={it.id} className="flex items-center gap-3 px-3 py-2.5 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800" title={it.name}>{it.name}</p>
                          <p className="text-[11px] text-slate-500">
                            원본 {formatBytes(it.file.size)}
                            {r && ` → ${formatBytes(r.size)}`}
                            {r && r.quality !== null && <span className="text-slate-400"> · 화질 {r.quality}%</span>}
                            {r && r.scaledDown && <span className="text-amber-600"> · 해상도 축소</span>}
                            {done && it.error && <span className="text-red-600"> · {it.error}</span>}
                            {!done && <span className="text-blue-600"> → 압축 중...</span>}
                          </p>
                        </div>
                        {r && (
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              r.kept
                                ? "bg-slate-100 text-slate-600"
                                : saved > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {r.kept ? "원본 유지" : saved > 0 ? `-${saved}% 절감` : `+${-saved}% 증가`}
                          </span>
                        )}
                        {r && compTargetBytes !== null && (
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              r.size <= compTargetBytes ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.size <= compTargetBytes ? `${compTargetMB}MB 이하 달성` : `${compTargetMB}MB 초과`}
                          </span>
                        )}
                        <button
                          onClick={() => setCompItems((prev) => prev.filter((p) => p.id !== it.id))}
                          aria-label={`${it.name} 삭제`}
                          className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] leading-none flex items-center justify-center hover:bg-red-500 hover:text-white"
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400">아직 업로드한 파일이 없습니다.</p>
              )}

              {compItems.some((it) => it.result) && compPending === 0 && (
                <p className="text-xs font-semibold text-slate-700">
                  총 {formatBytes(compItems.reduce((s, it) => s + it.file.size, 0))} →{" "}
                  {formatBytes(compItems.reduce((s, it) => s + (it.result?.size ?? it.file.size), 0))}
                  {(() => {
                    const before = compItems.reduce((s, it) => s + it.file.size, 0);
                    const after = compItems.reduce((s, it) => s + (it.result?.size ?? it.file.size), 0);
                    const pct = Math.round((1 - after / before) * 100);
                    return (
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${pct > 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {pct > 0 ? `-${pct}% 절감` : `+${-pct}%`}
                      </span>
                    );
                  })()}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={downloadCompressed}
                disabled={compPending > 0 || !compItems.some((it) => it.result)}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {compItems.length === 0
                  ? "이미지를 먼저 업로드하세요"
                  : compPending > 0
                    ? `압축 중... ${compDone}/${compItems.length}`
                    : compItems.filter((it) => it.result).length === 1
                      ? "압축 이미지 다운로드"
                      : "전체 압축 결과 ZIP 다운로드 (PIXS_압축이미지.zip)"}
              </button>
            </div>
          </div>
        ) : tab === "batch" ? (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                옵션 이미지 여러 장 업로드
              </h2>
              <div
                onClick={() => batchInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setBatchDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setBatchDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setBatchDragging(false);
                  addBatchFiles(Array.from(e.dataTransfer.files));
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  batchDragging ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:border-blue-500 bg-slate-50"
                }`}
              >
                <div className="text-3xl text-slate-400">🎨</div>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  색상·구성별 옵션 사진을 여러 장 끌어다 놓거나 클릭하세요
                </p>
                <p className="text-[11px] text-slate-400">한 번에 최대 {BATCH_RECOMMENDED}장 권장 (JPG, PNG, WebP)</p>
                <input
                  ref={batchInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addBatchFiles(Array.from(e.target.files ?? []));
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </div>
              <button
                onClick={loadBatchSamples}
                disabled={sampleBusy || batchLoading}
                className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-60"
              >
                {sampleBusy ? "샘플 준비 중..." : "💡 옵션 샘플 3종으로 일괄 변환 체험하기"}
              </button>
              {batchLoading && <p className="text-[11px] text-blue-600">이미지를 불러오는 중...</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">① 규격 선택</div>
                <div className="grid grid-cols-1 gap-2">
                  {BATCH_SIZES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setBatchSizeId(s.id)}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        batchSizeId === s.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold">{s.label}</span>
                        <span
                          className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            s.w === s.h ? "bg-slate-100 text-slate-600" : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {s.w === s.h ? "■ 정방형" : "▮ 세로형"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 break-keep">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">② 여백 채움 방식</div>
                <div className="grid grid-cols-1 gap-2">
                  {FILL_MODES.filter((m) => m.id !== "custom").map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setBatchFill(m.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-bold transition ${
                        batchFill === m.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {m.label}
                      <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                        {m.id === "white" && "모든 이미지를 #FFFFFF로 채웁니다"}
                        {m.id === "auto" && "이미지마다 모서리 색을 감지해 각각 채웁니다"}
                        {m.id === "blur" && "이미지마다 자기 자신을 블러 처리한 배경을 깝니다"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">③ 파일명 방식</div>
                <div className="grid grid-cols-1 gap-2">
                  {(
                    [
                      { id: "original", label: "원본 파일명 유지", desc: "red_옵션_1000x1000.jpg" },
                      { id: "seq", label: "순번 파일명", desc: "01_red_옵션_…, 02_blue_옵션_… (업로드 순서)" },
                    ] as { id: "original" | "seq"; label: string; desc: string }[]
                  ).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setBatchNaming(o.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-bold transition ${
                        batchNaming === o.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {o.label}
                      <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <GuideBox>
              💡 <GuideEm>등록 팁:</GuideEm> 마켓 엑셀 대량 업로드 오류를 방지하려면 <GuideEm>[01_, 02_ 순번 파일명]</GuideEm>과{" "}
              <GuideEm>[1:1 정방형]</GuideEm>으로 규격을 통일해 변환하는 것을 추천합니다.
            </GuideBox>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  업로드한 이미지 {batchItems.length}장
                  {batchItems.length > BATCH_RECOMMENDED && (
                    <span className="ml-2 text-[11px] font-medium text-amber-700">
                      권장 {BATCH_RECOMMENDED}장을 넘었어요. 변환에 시간이 더 걸릴 수 있습니다.
                    </span>
                  )}
                </h3>
                {batchItems.length > 0 && (
                  <button
                    onClick={() => setBatchItems([])}
                    disabled={isProcessing}
                    className="text-[11px] font-medium text-blue-600 hover:underline disabled:opacity-50"
                  >
                    전체 비우기
                  </button>
                )}
              </div>

              {batchItems.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {batchItems.map((item, idx) => (
                    <BatchCard
                      key={item.id}
                      item={item}
                      mode={batchFill}
                      onRemove={removeBatchItem}
                      w={batchDims.w}
                      h={batchDims.h}
                      fileName={batchFileNames[idx]}
                      onSave={() => saveOneBatch(idx)}
                      saveDisabled={isProcessing}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">아직 업로드한 이미지가 없습니다.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={convertBatchToZip}
                disabled={batchItems.length === 0 || isProcessing || batchLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? batchItems.length > 1
                    ? `변환 중... ${batchProgress}/${batchItems.length}`
                    : "변환 중..."
                  : batchItems.length === 0
                    ? "이미지를 먼저 업로드하세요"
                    : batchItems.length === 1
                      ? "옵션 이미지 JPG 다운로드"
                      : `총 ${batchItems.length}장의 옵션 이미지 전체 ZIP 다운로드`}
              </button>
              <p className="mt-2 text-[11px] text-slate-400">
                JPEG 고화질(품질 0.92)로 저장되며 EXIF 메타데이터는 자동 제거됩니다.
                {batchItems.length > 0 && ` 파일명 예: ${batchFileNames[0]}`}
                {batchItems.length > 1 && ` · ZIP: ${batchZipName}`}
              </p>
            </div>
          </div>
        ) : (
        /* 메인 작업 영역 */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">

          {/* 좌측: 이미지 업로드 & 미리보기 */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
              원본 이미지 업로드
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] ${
                isDragging
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-300 hover:border-blue-500 bg-slate-50"
              }`}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="max-h-48 object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl text-slate-400">📷</div>
                  <p className="text-xs font-semibold text-slate-700">
                    사진을 끌어다 놓거나 클릭하세요
                  </p>
                  <p className="text-[11px] text-slate-400">JPG, PNG, WebP 원본</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {tab === "product" && (
              <button
                onClick={() => loadFile(new File([SAMPLE_SVG], "예시_세로사진.svg", { type: "image/svg+xml" }))}
                className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                💡 예시 사진으로 1초 체험하기
              </button>
            )}

            {tab === "store" && (
              <button
                onClick={() => {
                  loadFile(new File([STORE_SAMPLE_SVG], "예시_스토어배너.svg", { type: "image/svg+xml" }));
                  // 로고·와이드 배너 변환 결과를 한 번에 비교해 볼 수 있도록 대표 규격을 선택
                  setSelectedPresets((prev) =>
                    Array.from(new Set([...prev, "store-smartstore-logo", "store-smartstore-pc-header", "store-zigzag-cover"]))
                  );
                  setLastPresetId("store-smartstore-pc-header");
                }}
                className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                💡 스토어 배너 예시로 체험하기
              </button>
            )}

            {tab === "detail" && (
              <button
                onClick={() => {
                  loadFile(new File([buildDetailSampleSvg()], "예시_긴상세페이지.svg", { type: "image/svg+xml" }));
                  setChunkH(2000); // 체험 시 분할선이 바로 보이도록 2,000px 기준으로 맞춤
                  setChunkText("2000");
                }}
                className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                💡 긴 상세페이지 예시로 분할 체험하기
              </button>
            )}

            {tab === "detail" ? (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700">분할 미리보기</label>
                {loadedImg ? (
                  <>
                    <p className="text-xs font-semibold text-slate-700">
                      원본 해상도: {loadedImg.width.toLocaleString()} x {loadedImg.height.toLocaleString()} px
                    </p>
                    <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-300 bg-slate-100">
                      <div className="relative" ref={previewWrapRef}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl ?? ""} alt="상세페이지 분할 미리보기" className="block w-full h-auto" />
                        {cuts.map((c, i) => (
                          <div
                            key={i}
                            title="위아래로 끌어서 분할 위치 조정"
                            onPointerDown={(e) => {
                              dragIdx.current = i;
                              e.currentTarget.setPointerCapture(e.pointerId);
                            }}
                            onPointerMove={(e) => handleCutMove(e, i)}
                            onPointerUp={() => (dragIdx.current = null)}
                            onPointerCancel={() => (dragIdx.current = null)}
                            className="absolute left-0 right-0 h-3 -translate-y-1/2 cursor-row-resize touch-none group/cut"
                            style={{ top: `${(c / detailScaledH) * 100}%` }}
                          >
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-red-500 transition-all group-hover/cut:border-t-4 group-hover/cut:border-red-400 group-hover/cut:drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]" />
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white shadow pointer-events-none whitespace-nowrap group-hover/cut:bg-red-400">
                              ↕ 드래그 · {i + 1}|{i + 2}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 min-h-5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[11px] font-bold">
                          💡 분할 위치 조정 팁
                        </span>
                        {isManual && (
                          <button
                            onClick={() => setManualCuts(null)}
                            className="text-[11px] font-medium text-blue-600 hover:underline"
                          >
                            자동으로 되돌리기
                          </button>
                        )}
                      </div>
                      <ul className="text-xs leading-relaxed text-slate-600 space-y-0.5">
                        <li>
                          ↕️ <strong className="font-semibold text-slate-800">[드래그]</strong> 점선을 마우스로 위아래로 끌어보세요
                        </li>
                        <li>
                          ✂️ <strong className="font-semibold text-slate-800">[자르기 방지]</strong> 중요한 글자나 이미지가 안 잘리게 맞출 수 있어요
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400">긴 상세페이지 이미지를 올리면 분할선이 표시됩니다.</p>
                )}
              </div>
            ) : (
            /* 여백 배경색 선택 */
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700">여백 채움 방식</label>
              <div className="grid grid-cols-2 gap-2">
                {FILL_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleModeClick(m.id)}
                    className={`text-xs py-1.5 px-1 rounded-lg border font-medium transition ${
                      activeMode === m.id
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                        : isMixed && previewIsStrict && m.id === "white"
                          ? "border-amber-400 bg-amber-50 text-amber-800" // 미리보기 중인 순백색 필수 마켓과 연동
                          : allStrict
                            ? "border-slate-200 text-slate-400 bg-slate-50"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {modeNotice && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-300 rounded-md px-2 py-1.5">
                  {modeNotice}
                </p>
              )}

              {allStrict && !modeNotice && (
                <p className="text-[11px] text-slate-500">
                  선택된 마켓은 모두 순백색 필수라 순백색으로 고정됩니다.
                </p>
              )}

              {isMixed && (
                <div className="text-[11px] leading-relaxed text-blue-900 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-2 space-y-0.5">
                  <p>
                    📌 쿠팡·아마존: 규정상{" "}
                    <span className="px-1 py-px rounded bg-white border border-blue-200 font-bold">순백색</span> 고정
                  </p>
                  <p>✨ 그 외 마켓: 선택한 여백 모드 적용</p>
                </div>
              )}

              {tab === "product" && (
                <GuideBox>
                  💡 <GuideEm>여백 채움 가이드:</GuideEm> 쿠팡·오픈마켓 규격 준수용은 <GuideEm>[순백색]</GuideEm>, 단색 배경 스튜디오 컷은{" "}
                  <GuideEm>[가장자리 자동 감지]</GuideEm>, 야외·감성 의류 컷은 <GuideEm>[감성 블러]</GuideEm>를 추천합니다.
                </GuideBox>
              )}

              {activeMode === "auto" && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span
                    className="inline-block w-4 h-4 rounded border border-slate-300"
                    style={{ backgroundColor: autoColor }}
                  />
                  {loadedImg ? `감지된 색상 ${autoColor}` : "이미지를 올리면 자동으로 감지됩니다"}
                </div>
              )}

              {activeMode === "custom" && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value.toUpperCase())}
                    className="w-8 h-8 p-0 border border-slate-300 rounded cursor-pointer bg-transparent"
                  />
                  {customColor}
                </div>
              )}

              {activeMode === "blur" && (
                <p className="text-[11px] text-slate-500">
                  원본을 확대·블러 처리한 배경 위에 선명한 원본을 얹습니다. (Safari는 블러 미지원 시 단색으로 표시)
                </p>
              )}

              {loadedImg && (
                <div className="pt-1 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {previewPreset
                      ? `결과 미리보기: ${previewPreset.name} (${formatRatio(previewPreset.width, previewPreset.height)})`
                      : "결과 미리보기: 플랫폼을 선택하세요 (1:1)"}
                  </span>
                  {/* 격자 배경 위에 캔버스를 올려 흰색 여백과 실제 경계가 구분되도록 함 */}
                  <div
                    className="flex justify-center items-center rounded-lg border border-slate-200 p-3"
                    style={{
                      backgroundColor: "#E2E8F0",
                      backgroundImage:
                        "linear-gradient(45deg,#CBD5E1 25%,transparent 25%,transparent 75%,#CBD5E1 75%),linear-gradient(45deg,#CBD5E1 25%,transparent 25%,transparent 75%,#CBD5E1 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 8px 8px",
                    }}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      width={previewW}
                      height={previewH}
                      style={{ aspectRatio: `${previewW} / ${previewH}` }}
                      className={`w-full border-2 border-slate-500 shadow-md ${
                        previewH > previewW ? "max-w-[220px]" : ""
                      }`}
                    />
                  </div>
                  {previewPreset && (
                    previewPreset.strictWhiteBg ? (
                      <div className="text-[11px] leading-relaxed rounded-lg px-2.5 py-2 bg-amber-50 border border-amber-300 text-amber-800 font-semibold">
                        ⚠ {STRICT_WHITE_NOTICE}
                      </div>
                    ) : (
                      (() => {
                        // "플랫폼명: 핵심, 부가" → 라벨 / 핵심 / 부가 팁으로 분리
                        const tip = previewPreset.guidelineText.replace(/^[^:]+:\s*/, "");
                        const [main, ...rest] = tip.split(/,\s*/);
                        return (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] leading-relaxed text-slate-600">
                            <span className="inline-block mb-1 px-1.5 py-px rounded bg-slate-200 text-slate-700 font-bold">
                              {previewPreset.name} 규정 팁
                            </span>
                            <p className="font-semibold text-slate-700">{main}</p>
                            {rest.length > 0 && <p>{rest.join(", ")}</p>}
                          </div>
                        );
                      })()
                    )
                  )}
                </div>
              )}
            </div>
            )}
          </div>

          {/* 우측 2칸: 플랫폼 규격 선택 / 상세페이지 분할 옵션 */}
          {tab === "detail" ? (
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                분할 옵션 설정
              </h2>

              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">① 가로폭 기준</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DETAIL_WIDTHS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setDetailWidthId(o.id);
                        setManualCuts(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        detailWidthId === o.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">{o.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{o.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">② 분할 기준 높이</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DETAIL_CHUNKS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => {
                        setChunkH(o.value);
                        setChunkText(String(o.value));
                        setManualCuts(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        chunkH === o.value
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">{o.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{o.desc}</div>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">직접 입력</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={DETAIL_CHUNK_MIN}
                    max={DETAIL_CHUNK_MAX}
                    step={100}
                    value={chunkText}
                    onChange={(e) => {
                      setChunkText(e.target.value);
                      const n = Number(e.target.value);
                      // 입력 도중(너무 작은 값)에는 반영하지 않고, 허용 범위 안의 값일 때만 적용
                      if (Number.isFinite(n) && n >= DETAIL_CHUNK_MIN && n <= DETAIL_CHUNK_MAX) {
                        setChunkH(Math.round(n));
                        setManualCuts(null);
                      }
                    }}
                    onBlur={() => setChunkText(String(chunkH))}
                    className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-xs focus:border-blue-500 focus:outline-none"
                    aria-label="분할 기준 높이 직접 입력"
                  />
                  <span>px ({DETAIL_CHUNK_MIN.toLocaleString()}~{DETAIL_CHUNK_MAX.toLocaleString()})</span>
                </label>
              </div>

              <div className="space-y-2">
                <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">③ 분할 방식</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPLIT_MODES.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSplitMode(o.id);
                        setManualCuts(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        splitMode === o.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">{o.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{o.desc}</div>
                    </button>
                  ))}
                </div>
                {splitMode === "equal" && (
                  <p className="text-[11px] text-slate-400">② 높이 이하가 되도록 장수를 정한 뒤, 모든 조각을 같은 높이로 나눕니다.</p>
                )}
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs leading-relaxed text-blue-900">
                {loadedImg ? (
                  <>
                    <p className="font-bold">
                      총 {detailCount}장의 이미지로 분할 (각 약{" "}
                      {minPiece === maxPiece
                        ? `${minPiece.toLocaleString()}`
                        : maxPiece - minPiece <= 1
                          ? `${maxPiece.toLocaleString()}`
                          : `${minPiece.toLocaleString()}~${maxPiece.toLocaleString()}`}{" "}
                      px 내외){isManual && " · 수동 조정됨"}
                    </p>
                    <p className="text-[11px] text-blue-800">
                      변환 후 {detailTargetW.toLocaleString()} x {detailScaledH.toLocaleString()} px
                      {detailCount <= 12 && ` · 조각 높이: ${pieceHeights.map((h) => h.toLocaleString()).join(" / ")}`}
                    </p>
                  </>
                ) : (
                  <p>이미지를 올리면 분할 장수가 표시됩니다.</p>
                )}
              </div>

              {loadedImg && previewUrl && (
                <div className="space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-700">
                    조각별 미리보기 · 개별 저장
                  </div>
                  <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {pieceHeights.map((h, i) => {
                      const thumbW = 72;
                      const scaledFull = (detailScaledH / detailTargetW) * thumbW; // 썸네일 폭 기준 전체 이미지 높이
                      const thumbH = Math.min(96, (h / detailTargetW) * thumbW);
                      return (
                        <li key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
                          <div
                            className="shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100"
                            style={{
                              width: thumbW,
                              height: thumbH,
                              backgroundImage: `url(${previewUrl})`,
                              backgroundSize: `${thumbW}px ${scaledFull}px`,
                              backgroundPosition: `0 -${(boundaries[i] / detailTargetW) * thumbW}px`,
                              backgroundRepeat: "no-repeat",
                            }}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1 text-xs">
                            <p className="truncate font-semibold text-slate-800" title={detailPieceName(i)}>{detailPieceName(i)}</p>
                            <p className="text-[11px] text-slate-400">
                              {detailTargetW.toLocaleString()} x {h.toLocaleString()} px · {boundaries[i].toLocaleString()}~{boundaries[i + 1].toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => saveDetailPiece(i)}
                            disabled={isProcessing}
                            className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
                          >
                            ↓ 저장
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <GuideBox>
                💡 <GuideEm>추천 가이드:</GuideEm> 스마트스토어 및 모바일 최적화에는 <GuideEm>[가로 860px]</GuideEm> +{" "}
                <GuideEm>[2,000px 단위 분할]</GuideEm> 조합이 가장 깨짐 없이 안정적입니다.
              </GuideBox>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={splitAndDownloadZip}
                  disabled={!loadedImg || isProcessing}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing
                    ? `분할 중... ${splitProgress}/${detailCount}`
                    : loadedImg
                      ? `${detailCount}장으로 분할된 이미지 ZIP 다운로드`
                      : "이미지를 먼저 업로드하세요"}
                </button>
                <p className="mt-2 text-[11px] text-slate-400">JPEG 고화질(품질 0.92)로 저장되며, 파일명은 {detailBase}_상세_01.jpg 순으로, ZIP은 PIXS_{detailBase}_상세분할.zip 으로 저장됩니다.</p>
              </div>
            </div>
          ) : (
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
              출력할 마켓 플랫폼 선택
            </h2>

            <div className="space-y-5">
              {categories.map((category) => {
                const categoryPresets = PRESETS.filter((p) => p.category === category);
                const isAllSelected = categoryPresets.every((p) => selectedPresets.includes(p.id));

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                      <span className="text-xs font-bold text-slate-700">
                        {category}
                        {CATEGORY_HINTS[category] && (
                          <span className="ml-1 text-xs font-normal text-slate-500">{CATEGORY_HINTS[category]}</span>
                        )}
                      </span>
                      <button
                        onClick={() => selectCategory(category)}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        {isAllSelected ? "전체 해제" : "그룹 전체 선택"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categoryPresets.map((preset) => {
                        const isChecked = selectedPresets.includes(preset.id);
                        return (
                          <div
                            key={preset.id}
                            onClick={() => togglePreset(preset.id)}
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition select-none ${
                              isChecked
                                ? "border-blue-600 bg-blue-50/50 text-blue-900"
                                : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{preset.name}</span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 pointer-events-none"
                              />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {preset.width}x{preset.height} px
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {preset.strictWhiteBg && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  순백색 필수
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  preset.ratio === "3:4" || preset.ratio === "4:5"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {preset.ratio === "3:4" || preset.ratio === "4:5"
                                  ? `▮ ${preset.ratio} 세로형`
                                  : preset.ratio === "1:1"
                                    ? "■ 1:1 정방형"
                                    : `▬ ${formatRatio(preset.width, preset.height)} 와이드`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 다운로드 버튼 액션 바 */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={processAndDownloadZip}
                disabled={!selectedFile || selectedPresets.length === 0 || isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>{selectedPresets.length > 1 ? "압축 파일 생성 중..." : "이미지 변환 중..."}</span>
                ) : selectedPresets.length === 1 ? (
                  <span>선택한 마켓 이미지 JPG 다운로드</span>
                ) : (
                  <>
                    <span>
                      {selectedPresets.length > 1 ? "전체 마켓 결과 ZIP으로 일괄 다운로드" : "마켓을 선택하세요"}
                      {selectedPresets.length > 1 && ` (${selectedPresets.length}개)`}
                    </span>
                    <span className="text-xs bg-blue-500 py-0.5 px-2 rounded-full">1초 완성</span>
                  </>
                )}
              </button>

              {selectedFile && selectedPresetObjs.length > 1 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-500">또는 마켓별로 하나씩 받기</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPresetObjs.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => downloadOnePreset(p)}
                        disabled={isProcessing}
                        title={presetFileName(p)}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
                      >
                        ↓ {p.name} <span className="text-slate-400">{p.width}x{p.height}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-2 text-[11px] text-slate-400">
                JPEG 고화질(품질 0.92)로 저장되며, 촬영 위치·기기 정보 같은 EXIF 메타데이터는 자동으로 제거됩니다.
              </p>
            </div>
          </div>
          )}
        </div>
        )}

        {/* 하단: SEO & 셀러 가이드라인 정보 블록 */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800">💡 이커머스 대표이미지 등록 필수 가이드</h3>
          <div className="space-y-2">
            {GUIDES.map((g, i) => (
              <details
                key={g.title}
                open={i === 0}
                className="group border border-slate-200 rounded-xl p-3 bg-slate-50/50"
              >
                <summary className="cursor-pointer list-none flex flex-wrap items-center gap-2 font-bold text-slate-800">
                  <span className="text-slate-400 group-open:rotate-90 transition">▶</span>
                  {g.title}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{g.badge}</span>
                </summary>
                <p className="mt-2 font-semibold text-slate-700">{g.summary}</p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1">
                  {g.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          <p>
            <strong>보안 보장</strong>: 본 웹 도구는 사용자의 이미지를 서버로 전송하지 않으며, 모든 리사이징 및 압축 작업은 브라우저(Canvas API) 내부에서 안전하게 실행됩니다.
          </p>
          <p className="text-[11px] text-slate-400">
            ※ 마켓 정책은 수시로 바뀔 수 있으니 등록 전 각 마켓 판매자센터의 최신 가이드를 함께 확인하세요.
          </p>
        </div>

        {/* 앱 설치 가이드 (PWA 홈 화면 추가) */}
        <section className="rounded-2xl bg-slate-900 px-6 py-10 sm:px-10 text-white">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight break-keep">
              앱처럼 더 빠르고 편리하게 PIXS 사용하기
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 break-keep">
              별도 다운로드 프로그램 없이, 바탕화면이나 홈 화면에 바로가기 앱을 등록해 작업창으로 바로 띄울 수 있습니다.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {INSTALL_GUIDES.map((g) => (
              <div key={g.title} className="rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                    <InstallIcon kind={g.icon} />
                  </span>
                  <h3 className="text-sm font-bold leading-snug">{g.title}</h3>
                </div>
                <ol className="mt-4 space-y-3">
                  {g.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-slate-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="break-keep">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
