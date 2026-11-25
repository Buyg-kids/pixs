import type { Guide, GuideCategory } from "./types";
import { guide as detailSplit } from "./detail-page-split-vs-single";
import { guide as compression } from "./ecommerce-image-compression-guide";
import { guide as taobao } from "./taobao-1688-detail-page-editing";
import { guide as whitePadding } from "./white-padding-vs-crop-thumbnail";
import { guide as mobile } from "./mobile-commerce-image-optimization";
import { guide as esm } from "./esm-plus-gmarket-auction-image-spec";
import { guide as dpi } from "./product-photo-dpi-and-pixel-guide";
import { guide as bulk } from "./bulk-image-resizing-workflow";
import { guide as transparent } from "./transparent-png-to-white-jpg";
import { guide as caseStudy } from "./one-photo-three-markets-case";
import { guide as rejection } from "./main-image-rejection-patterns";
import { guide as workflow } from "./new-product-image-workflow";
import { guide as uploadFix } from "./detail-page-upload-troubleshooting";
import { guide as lessons } from "./seller-image-editing-lessons";

export { CATEGORY_LABELS } from "./types";
export type { Guide, GuideCategory, Block, GuideSectionData } from "./types";

/** /guide/[slug] 로 렌더링되는 심층 가이드 (새 글은 파일을 추가하고 여기에 등록하면 사이트맵·허브에 자동 반영) */
export const GUIDES: Guide[] = [
  caseStudy,
  rejection,
  workflow,
  uploadFix,
  lessons,
  detailSplit,
  compression,
  taobao,
  whitePadding,
  mobile,
  esm,
  dpi,
  bulk,
  transparent,
];

export const getGuide = (slug: string): Guide | undefined => GUIDES.find((g) => g.slug === slug);

/** 별도 page.tsx로 존재하는 기존 가이드 (URL 유지). 허브 카드와 '함께 읽으면 좋은 글'에서 참조 */
export const STATIC_GUIDES: { slug: string; href: string; title: string; desc: string; category: GuideCategory }[] = [
  {
    slug: "smartstore",
    href: "/guide/smartstore",
    title: "스마트스토어 대표이미지 & 추가이미지 완벽 가이드",
    desc: "대표이미지 1000x1000, 노출 불이익 유형, 추가 이미지 9장 배치, 상세페이지 860px",
    category: "market",
  },
  {
    slug: "coupang",
    href: "/guide/coupang",
    title: "쿠팡 윙·로켓그로스 썸네일 규격 & 이미지 반려 해결 가이드",
    desc: "순백색 배경(RGB 255), 윙 이미지 반려 사유별 해결법, 상세페이지 780px",
    category: "market",
  },
  {
    slug: "fashion",
    href: "/guide/fashion",
    title: "에이블리·지그재그·무신사 대표이미지 & 상세페이지 권장 규격 가이드",
    desc: "3:4·4:5 세로형 규격, 상세페이지 1000px, 스토어 프로필·배너 사이즈",
    category: "market",
  },
];

/** '함께 읽으면 좋은 셀러 가이드'용 링크 (신규·기존 가이드 모두 해석) */
export function relatedLinks(guide: Guide): { href: string; title: string; desc: string }[] {
  return guide.related.flatMap((slug) => {
    const g = getGuide(slug);
    if (g) return [{ href: `/guide/${g.slug}`, title: g.title, desc: g.summary[0] }];
    const s = STATIC_GUIDES.find((x) => x.slug === slug);
    return s ? [{ href: s.href, title: s.title, desc: s.desc }] : [];
  });
}
