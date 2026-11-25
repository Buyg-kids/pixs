"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  DETAIL_RULES,
  evaluateDetail,
  MAX_FILES,
  readDimensions,
  REC_TOTAL_MB,
  type DetailFile,
  type DetailMarketId,
  type DetailStatus,
} from "@/lib/detailCheck";

const BADGE: Record<DetailStatus, string> = {
  pass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warn: "bg-amber-50 text-amber-700 ring-amber-600/20",
  fail: "bg-red-50 text-red-700 ring-red-600/20",
};
const LABEL: Record<DetailStatus, string> = { pass: "PASS", warn: "주의", fail: "FAIL" };

const fmtSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)}MB` : `${Math.round(b / 1024)}KB`);

function Badge({ s }: { s: DetailStatus }) {
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${BADGE[s]}`}>{LABEL[s]}</span>;
}

export default function DetailCheckTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [market, setMarket] = useState<DetailMarketId>("smartstore");
  const [files, setFiles] = useState<DetailFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rule = DETAIL_RULES.find((r) => r.id === market)!;
  const summary = files.length ? evaluateDetail(files, rule) : null;

  const handle = async (list: FileList | File[]) => {
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      setError("이미지 파일만 검사할 수 있습니다.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const room = MAX_FILES - files.length;
      const picked = images.slice(0, Math.max(room, 0));
      const read = await Promise.all(picked.map(readDimensions));
      // 파일명 순서대로 보여 주면 업로드 순서와 맞추기 쉬움
      setFiles((prev) => [...prev, ...read].sort((a, b) => a.name.localeCompare(b.name, "ko", { numeric: true })));
      if (images.length > room) setError(`한 번에 최대 ${MAX_FILES}장까지 검사할 수 있어 ${images.length - room}장은 제외했습니다.`);
    } catch (e) {
      setError(`읽을 수 없는 파일이 있습니다: ${e instanceof Error ? e.message : ""}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-600">올릴 마켓(가로폭 기준)</p>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {DETAIL_RULES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setMarket(r.id)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition sm:shrink ${
                market === r.id ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="block text-sm font-bold">{r.label}</span>
              <span className="block text-[11px] text-slate-500">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

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
          handle(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-400"
        }`}
      >
        <p className="text-3xl" aria-hidden>
          📑
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-800">{busy ? "읽는 중…" : "분할한 상세페이지 이미지들을 한꺼번에 올려 주세요"}</p>
        <p className="mt-1 text-xs text-slate-400">여러 장 선택 가능 · 최대 {MAX_FILES}장 · 서버로 전송되지 않습니다</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handle(e.target.files)} />
      </div>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className={`text-sm font-bold ${summary.fail === 0 ? "text-emerald-700" : "text-red-700"}`}>
                {summary.fail === 0 ? `${rule.label} 기준 필수 항목 통과` : `${rule.label} 기준 ${summary.fail}개 항목 수정 필요`}
                {summary.warn > 0 && <span className="font-medium text-amber-700"> · 주의 {summary.warn}</span>}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {files.length}장 · 합계 {fmtSize(summary.totalBytes)} · 이어 붙인 세로 길이 {summary.totalHeight.toLocaleString()}px
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setError(null);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50"
            >
              비우기
            </button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            <li className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">가로폭 통일</p>
                <Badge s={summary.widthUniform ? "pass" : "fail"} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{summary.widthUniform ? `모두 ${summary.widths[0]}px` : `${summary.widths.join(", ")}px 혼재`}</p>
              <p className="mt-1 text-xs text-slate-600 break-keep">
                {summary.widthUniform ? "모든 조각의 가로폭이 같아 이음새가 어긋나지 않습니다." : "조각마다 폭이 다르면 업로드 후 글자 크기와 여백이 들쭉날쭉해집니다."}
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">마켓 기준 가로폭</p>
                <Badge s={summary.rows.every((r) => r.widthStatus === "pass") ? "pass" : summary.rows.some((r) => r.widthStatus === "fail") ? "fail" : "warn"} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{rule.width}px 권장</p>
              <p className="mt-1 text-xs text-slate-600 break-keep">{summary.rows.filter((r) => r.widthStatus !== "pass").length}장이 기준과 다릅니다.</p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">전체 용량(참고)</p>
                <Badge s={summary.totalBytes / 1024 / 1024 > REC_TOTAL_MB ? "warn" : "pass"} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{fmtSize(summary.totalBytes)}</p>
              <p className="mt-1 text-xs text-slate-600 break-keep">상세페이지 전체는 {REC_TOTAL_MB}MB 안쪽을 권장합니다. (PIXS 참고 기준)</p>
            </li>
          </ul>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">조각별 검사 결과</caption>
              <thead className="bg-slate-100 text-xs text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">파일</th>
                  <th scope="col" className="px-3 py-2 font-semibold">가로</th>
                  <th scope="col" className="px-3 py-2 font-semibold">세로</th>
                  <th scope="col" className="px-3 py-2 font-semibold">용량</th>
                  <th scope="col" className="px-3 py-2 font-semibold">조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.rows.map((r, i) => (
                  <tr key={`${r.file.name}-${i}`}>
                    <th scope="row" className="max-w-[150px] truncate px-3 py-2 font-medium text-slate-800" title={r.file.name}>
                      {r.file.name}
                    </th>
                    <td className="px-3 py-2 tabular-nums">
                      {r.file.width}px <Badge s={r.widthStatus} />
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {r.file.height.toLocaleString()}px <Badge s={r.heightStatus} />
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {fmtSize(r.file.size)} <Badge s={r.sizeStatus} />
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 break-keep">{r.notes.length ? r.notes.join(" / ") : "문제 없음"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-sm font-semibold text-slate-700 break-keep">
              {summary.fail + summary.warn > 0 ? "폭 맞춤·분할·압축은 PIXS 도구에서 바로 할 수 있어요." : "규격에 잘 맞습니다. 업로드 전 모바일 화면에서 이음새를 한 번 더 확인하세요."}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link href="/?tab=detail" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700">
                👉 상세페이지 분할하기
              </Link>
              <Link href="/?tab=compress" className="rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">
                용량 압축하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
