// 셀러 실전 가이드(/guide/[slug]) 데이터 타입. 글 내용은 같은 폴더의 슬러그별 파일에서 관리

export type GuideCategory = "market" | "detail" | "quality";

export const CATEGORY_LABELS: Record<GuideCategory, { title: string; desc: string }> = {
  market: { title: "마켓별 규격", desc: "마켓·플랫폼마다 다른 대표이미지와 상세페이지 기준" },
  detail: { title: "상세페이지 편집", desc: "상세페이지 분할, 모바일 최적화, 대량 작업 노하우" },
  quality: { title: "용량·화질 최적화", desc: "용량은 줄이고 화질은 지키는 저장·변환 원칙" },
};

export type Block =
  | { t: "p"; text: string }
  | { t: "h3"; text: string }
  | { t: "ul" | "ol" | "check"; items: string[] }
  | { t: "table"; caption: string; head: string[]; rows: string[][] }
  | { t: "note"; text: string }
  | { t: "figure"; src: string; alt: string; caption: string; width: number; height: number };

export interface GuideSectionData {
  h2: string;
  blocks: Block[];
}

export interface Guide {
  slug: string;
  category: GuideCategory;
  /** 화면에 보이는 H1 */
  title: string;
  /** <title>에 쓰는 검색 결과용 제목 ("| PIXS" 포함) */
  metaTitle: string;
  description: string;
  keywords: string[];
  /** 본문 상단 요약 박스 (3~4줄) */
  summary: string[];
  sections: GuideSectionData[];
  faq: { q: string; a: string }[];
  /** 본문 중간·하단 CTA. href는 /?tab=...&preset=... 형태로 도구의 해당 탭·프리셋을 연다 */
  cta: { label: string; href: string };
  /** 함께 읽으면 좋은 글 slug 3개 (신규 가이드 slug 또는 기존 정적 가이드 slug) */
  related: string[];
  published: string;
}
