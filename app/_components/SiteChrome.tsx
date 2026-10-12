import Link from "next/link";

// 가이드·소개·약관 페이지가 함께 쓰는 공통 헤더/푸터
export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-slate-900">
          PIXS
        </Link>
        <nav aria-label="사이트 메뉴" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-600">
          <Link href="/guide" className="hover:text-blue-600">
            규격 가이드
          </Link>
          <Link href="/guide/smartstore" className="hover:text-blue-600">
            스마트스토어
          </Link>
          <Link href="/guide/coupang" className="hover:text-blue-600">
            쿠팡
          </Link>
          <Link href="/guide/fashion" className="hover:text-blue-600">
            패션
          </Link>
          <Link href="/" className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700">
            스튜디오 열기
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ showMarketNote = false }: { showMarketNote?: boolean }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 text-xs leading-relaxed text-slate-500">
        <nav aria-label="서비스 정보" className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-medium text-slate-600">
          <Link href="/about" className="hover:text-blue-600 hover:underline">
            서비스 소개
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-blue-600 hover:underline">
            이용약관
          </Link>
        </nav>
        <p className="mt-3">
          PIXS는 설치 없이 브라우저에서 이미지를 규격에 맞게 변환하는 무료 이미지 스튜디오입니다. 이미지는 서버로 전송되지 않습니다.
        </p>
        {showMarketNote && (
          <p className="mt-1">※ 마켓 정책은 수시로 바뀔 수 있으니 등록 전 각 마켓 판매자센터의 최신 안내를 함께 확인하세요.</p>
        )}
        <p className="mt-1 text-slate-400">© PIXS</p>
      </div>
    </footer>
  );
}
