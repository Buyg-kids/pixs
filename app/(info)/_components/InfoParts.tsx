import type { ReactNode } from "react";
import { CONTACT_EMAIL, LEGAL_EFFECTIVE } from "@/lib/site";

export function InfoTitle({ title, intro, effective }: { title: string; intro: string; effective?: boolean }) {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl break-keep">{title}</h1>
      {effective && <p className="mt-2 text-xs text-slate-500">시행일: {LEGAL_EFFECTIVE}</p>}
      <p className="mt-3 text-sm leading-relaxed text-slate-600 break-keep">{intro}</p>
    </>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9 space-y-3">
      <h2 className="text-lg font-bold tracking-tight text-slate-900 break-keep">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 break-keep">{children}</div>
    </section>
  );
}

// 이메일을 lib/site.ts 에 넣어 두면 표시되고, 비어 있으면 아무것도 렌더링하지 않음
export function ContactSection() {
  if (!CONTACT_EMAIL) return null;
  return (
    <Section title="문의">
      <p>
        본 페이지 및 서비스에 관한 문의는{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-blue-600 underline">
          {CONTACT_EMAIL}
        </a>
        로 보내 주세요.
      </p>
    </Section>
  );
}
