# PIXS (pixs.kr) 현황 — 2026-11-25 기준

셀러용 무료 이미지 도구(브라우저 처리, 서버 업로드 없음). Next.js 16.4.6, Vercel 자동 배포(git push).
작업 전 `AGENTS.md`(node_modules/next/dist/docs 먼저 읽기) 확인.

## 도구
- `/` 변환기: 대표이미지·프로필/배너·상세페이지 분할/이어붙이기·옵션 대량·압축·워터마크 (`?tab=`, `?preset=` 딥링크)
- `/check` 이미지 규격 검수기, `/check/detail` 상세페이지 검수기 (lib/imageCheck.ts, lib/detailCheck.ts)

## 콘텐츠
- 정적 가이드 3편: /guide/smartstore, /coupang, /fashion
- 심층 가이드 14편: data/guides/*.ts (index.ts 등록 시 허브·사이트맵 자동 반영)
  - 11/25 추가: 사진 한 장 세 마켓 사례(샘플 사진 /public/cases), 반려 7패턴, 신상품 작업 순서, 업로드 점검, 8년차 셀러 시행착오
- 겹치던 가이드 3편은 통합, 옛 주소 308 리다이렉트(next.config.ts)
- /about: 운영자 "피터"(온라인 쇼핑몰 8년차 1인 셀러), 운영·콘텐츠 원칙. 문의 메일 lib/site.ts CONTACT_EMAIL

## 애드센스
- 2026-11-25 "가치가 별로 없는 콘텐츠"로 거절 (pixs.kr). 재심사는 아직 요청 안 함.
- 방침: 색인 확인 + 실제 방문자 + 경험 기반 글이 쌓인 뒤(약 2~4주) 요청. 반복 요청 금지.
- 남은 할 일: Search Console 사이트맵 재제출·새 글 색인 요청, 4번 글(/guide/seller-image-editing-lessons)에 실제 경험 보강, 2번 글에 실제 작업 시간 추가

## 원칙
- 글의 수치는 도구로 측정한 값만, 샘플 이미지는 "예시용 샘플"로 표시, 운영자 경험은 본인이 말한 것만
- 커밋·푸시는 사용자가 요청할 때만. 커밋 메시지는 `git commit -F 파일`
