import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  // 요청할 때마다 바뀌는 new Date() 대신 고정 날짜를 사용 (lastmod가 매번 달라지면 검색엔진이 신뢰하지 않음). 콘텐츠를 크게 수정하면 이 날짜를 갱신
  const lastModified = new Date("2026-10-20");

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // 마켓별 이미지 규격 가이드 (SEO 서브페이지)
    {
      url: `${baseUrl}/guide`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/smartstore`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/coupang`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/fashion`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // 서비스 소개 · 법적 고지 (애드센스 심사 필수 페이지)
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
