import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "../_components/SiteChrome";

// /about, /privacy, /terms 공통 레이아웃 (URL에는 (info) 가 나타나지 않는 라우트 그룹)
export default function InfoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
