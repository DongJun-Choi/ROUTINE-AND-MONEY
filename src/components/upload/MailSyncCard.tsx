"use client";

import { Copy, Mail } from "lucide-react";
import { useMailImports, type MailImportLogItem } from "@/components/upload/useMailImports";
import { Card, CardHeader } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { formatNumber } from "@/lib/format";

function formatCollectedAt(value: string, withTime = false): string {
  const date = new Date(value);
  const day = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  if (!withTime) return day;
  return `${day} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function statementLabel(statementMonth: string | null): string {
  if (!statementMonth) return "카드 명세서";
  const [year, month] = statementMonth.split("-").map(Number);
  return `${year}년 ${month}월 명세서`;
}

function MailLogRow({ log }: { log: MailImportLogItem }) {
  return (
    <li className="flex items-center gap-3 border-t border-subtle px-3.5 py-3 first:border-t-0">
      <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] ${log.duplicateUpload ? "bg-pending-soft text-pending" : "bg-primary-soft text-primary-soft-text"}`}>
        {log.duplicateUpload ? <Copy size={18} strokeWidth={1.8} /> : <Mail size={18} strokeWidth={1.8} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm leading-5 font-semibold text-heading">{statementLabel(log.statementMonth)}</span>
        <span className="text-xs leading-4 text-muted">{formatCollectedAt(log.createdAt)} 수집</span>
      </span>
      {log.duplicateUpload ? (
        <Chip size="md" tone="pending" bordered>중복 건너뜀</Chip>
      ) : (
        <span className="text-[13px] font-semibold whitespace-nowrap text-heading">{log.rowCount === null ? "저장" : `${formatNumber(log.rowCount)}건 저장`}</span>
      )}
    </li>
  );
}

export default function MailSyncCard({ className = "" }: { className?: string }) {
  const state = useMailImports();
  const data = state.status === "ready" ? state.data : null;
  const latest = data?.logs[0];

  return (
    <Card className={`gap-4 ${className}`}>
      <CardHeader
        title="네이버 메일 자동 수집"
        description={
          state.status === "loading" ? "수집 상태를 확인하는 중이에요"
            : state.status === "error" ? "수집 상태를 불러오지 못했어요"
              : latest ? `마지막 수집 · ${formatCollectedAt(latest.createdAt, true)}` : "아직 수집 기록이 없어요"
        }
        action={
          data && (data.enabled ? (
            <Chip size="md" tone="positive" bordered icon={<span aria-hidden="true" className="size-1.5 rounded-full bg-positive" />}>켜짐</Chip>
          ) : (
            <Chip size="md">꺼짐</Chip>
          ))
        }
      />
      <h3 className="m-0 text-[13px] leading-[18px] font-semibold text-muted">최근 수집 기록</h3>
      {state.status === "loading" ? (
        <p className="m-0 rounded-xl border border-subtle px-4 py-6 text-center text-sm text-muted">불러오는 중이에요…</p>
      ) : !data || data.logs.length === 0 ? (
        <p className="m-0 rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
          {state.status === "error" ? "수집 기록을 불러오지 못했어요." : "아직 메일에서 가져온 명세서가 없어요."}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col rounded-xl border border-subtle p-0">
          {data.logs.map((log) => <MailLogRow key={log.id} log={log} />)}
        </ul>
      )}
      <p className="m-0 mt-auto text-xs leading-[18px] text-muted">
        자동 수집은 <code className="rounded-md bg-subtle px-1.5 py-0.5 font-mono text-xs text-sub">NAVER_MAIL_SYNC_ENABLED</code> 환경 변수로 켜고 꺼요. 켜져 있어도 메일 수집 워커가 함께 실행 중이어야 동작해요.
      </p>
    </Card>
  );
}
