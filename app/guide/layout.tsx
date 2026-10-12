import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "../_components/SiteChrome";

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">{children}</main>
      <SiteFooter showMarketNote />
    </div>
  );
}
