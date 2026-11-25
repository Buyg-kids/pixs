"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  evaluate,
  MARKETS,
  measureImage,
  summarize,
  type FileInfo,
  type MarketId,
  type Measure,
  type Status,
} from "@/lib/imageCheck";

const BADGE: Record<Status, { label: string; cls: string }> = {
  pass: { label: "PASS", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  warn: { label: "주의", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  fail: { label: "FAIL", cls: "bg-red-50 text-red-700 ring-red-600/20" },
};

export default function CheckTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [market, setMarket] = useState<MarketId>("coupang");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<FileInfo | null>(null);
  const [measure, setMeasure] = useState<Measure | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handle = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("이미지 파일만 검사할 수 있습니다.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const m = await measureImage(f);
      setMeasure(m);
      setFile({ name: f.name, size: f.size, type: f.type });
      setPreviewUrl(URL.createObjectURL(f));
    } catch (e) {
      setError(e instanceof Error && e.message === "too-large" ? "이미지가 너무 큽니다. 3,600만 픽셀 이하로 줄여서 다시 시도해 주세요." : "이미지를 읽을 수 없습니다. 다른 파일로 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setMeasure(null);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const rule = MARKETS.find((m) => m.id === market)!;
  const items = measure && file ? evaluate(measure, file, rule) : [];
  const sum = summarize(items);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-600">검사할 마켓</p>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {MARKETS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMarket(m.id)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition sm:shrink ${
                market === m.id ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="block text-sm font-bold">{m.label}</span>
              <span className="block text-[11px] text-slate-500">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {!measure || !file ? (
        <div>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handle(e.dataTransfer.files[0]);
            }}
            className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-4 py-12 text-center transition ${
              dragging ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-400"
            }`}
          >
            <p className="text-3xl" aria-hidden>
              🔍
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{busy ? "검사 중…" : "대표이미지를 끌어다 놓거나 클릭하세요"}</p>
            <p className="mt-1 text-xs text-slate-400">JPG, PNG, WebP · 서버로 전송되지 않고 내 브라우저에서만 검사됩니다</p>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
          </div>
          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100" style={{ width: 96, height: 96 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {previewUrl && <img src={previewUrl} alt={file.name} className="h-full w-full object-contain" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{file.name}</p>
              <p className={`mt-1 text-sm font-semibold ${sum.fail === 0 ? "text-emerald-700" : "text-red-700"}`}>
                {sum.fail === 0 ? `${rule.label} 기준 필수 항목 통과` : `${rule.label} 기준 ${sum.fail}개 항목 수정 필요`}
                {sum.warn > 0 && <span className="font-medium text-amber-700"> · 주의 {sum.warn}</span>}
              </p>
            </div>
            <button type="button" onClick={reset} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50">
              다른 이미지
            </button>
          </div>

          {measure.bbox && previewUrl && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
              <p className="mb-2 text-xs font-semibold text-slate-600">상품 영역 (빨간 점선: 흰색이 아닌 영역의 바운딩 박스)</p>
              <div className="mx-auto" style={{ maxWidth: 320 }}>
                <div className="relative w-full border border-slate-300" style={{ aspectRatio: `${measure.width} / ${measure.height}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full" />
                  <div
                    className="absolute border-2 border-dashed border-red-500"
                    style={{
                      left: `${(measure.bbox.x / measure.width) * 100}%`,
                      top: `${(measure.bbox.y / measure.height) * 100}%`,
                      width: `${(measure.bbox.w / measure.width) * 100}%`,
                      height: `${(measure.bbox.h / measure.height) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((it) => (
              <li key={it.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900 break-keep">{it.title}</p>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE[it.status].cls}`}>{BADGE[it.status].label}</span>
                </div>
                <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">{it.value}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 break-keep">{it.detail}</p>
                {it.fix && <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs leading-relaxed text-slate-700 break-keep">💡 {it.fix}</p>}
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-sm font-semibold text-slate-700 break-keep">
              {sum.fail + sum.warn > 0 ? "수정이 필요한 항목은 PIXS 도구에서 바로 맞출 수 있어요." : "규격에 잘 맞습니다. 다른 마켓용도 한 번에 만들어 보세요."}
            </p>
            <Link href={rule.presetHref} className="mt-3 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700">
              👉 {rule.label} 규격으로 1초 만에 맞추기
            </Link>
          </div>
          <p className="text-center text-[11px] text-slate-400 break-keep">
            텍스트·로고·워터마크 포함 여부와 이미지 내용은 자동으로 판별하지 못합니다. 규격은 PIXS 정리 기준이며 마켓 정책에 따라 달라질 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
