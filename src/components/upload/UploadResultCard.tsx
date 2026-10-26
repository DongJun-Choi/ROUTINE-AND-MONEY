import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { formatNumber, formatTransactionAmount } from "@/lib/format";
import { categoryPathById, paymentTypeShortLabel } from "@/lib/transactionDisplay";
import type { Category } from "@/lib/types";
import { summarizePreview, type UploadResult } from "@/lib/upload/statement";

const PREVIEW_LIMIT = 10;

interface UploadResultCardProps {
  result: UploadResult;
  categories: Category[];
}

function ResultBanner({ tone, icon, title, description, action }: { tone: "positive" | "pending" | "danger"; icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  const toneClass = {
    positive: { box: "border-positive-line bg-positive-soft", badge: "bg-positive text-surface", text: "text-positive" },
    pending: { box: "border-pending-line bg-pending-soft", badge: "bg-pending text-surface", text: "text-pending" },
    danger: { box: "border-danger-line bg-danger-soft", badge: "bg-danger text-surface", text: "text-danger" },
  }[tone];

  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border px-4 py-3.5 ${toneClass.box}`}>
      <span aria-hidden="true" className={`flex size-8 shrink-0 items-center justify-center rounded-full ${toneClass.badge}`}>{icon}</span>
      <span className={`flex min-w-0 flex-[1_1_260px] flex-col gap-0.5 ${toneClass.text}`}>
        <span className="text-[15px] leading-[22px] font-semibold">{title}</span>
        <span className="text-[13px] leading-[18px]">{description}</span>
      </span>
      {action}
    </div>
  );
}

export default function UploadResultCard({ result, categories }: UploadResultCardProps) {
  if (result.status === "duplicate") {
    return (
      <Card className="gap-4">
        <CardHeader title="업로드 결과" />
        <ResultBanner tone="pending" icon={<Copy size={16} strokeWidth={2.2} />} title="이미 올린 명세서예요" description="같은 달·같은 건수의 명세서가 이미 저장되어 있어 다시 저장하지 않았어요." />
      </Card>
    );
  }

  if (result.status === "error") {
    return (
      <Card className="gap-4">
        <CardHeader title="업로드 결과" />
        <ResultBanner tone="danger" icon={<AlertTriangle size={16} strokeWidth={2.2} />} title="업로드하지 못했어요" description={result.message} />
      </Card>
    );
  }

  const summary = summarizePreview(result.preview, PREVIEW_LIMIT);
  const transactionsLink = (
    <Link href="/transactions" className="inline-flex min-h-11 items-center gap-1 rounded-[10px] border border-positive-line bg-surface px-3.5 text-[13px] font-semibold whitespace-nowrap text-positive">
      {summary.uncategorized > 0 ? "미분류 정리하기" : "가계부에서 보기"}
      <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
    </Link>
  );

  return (
    <Card className="gap-4">
      <CardHeader title="업로드 결과" />
      <ResultBanner
        tone="positive"
        icon={<Check size={18} strokeWidth={2.4} />}
        title={`${formatNumber(result.count)}건을 저장했어요`}
        description={summary.monthLabel ? `${summary.monthLabel} 거래 ${formatNumber(summary.total)}건 중 분류됨 ${formatNumber(summary.categorized)}건 · 미분류 ${formatNumber(summary.uncategorized)}건` : "저장한 달의 거래를 불러오지 못했어요"}
        action={transactionsLink}
      />
      {summary.rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[640px] border-collapse text-sm leading-5">
              <caption className="sr-only">{summary.monthLabel} 거래 미리보기</caption>
              <thead>
                <tr className="bg-raised">
                  {["날짜", "가맹점", "카테고리", "결제수단"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-muted">{heading}</th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap text-muted">금액</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((transaction) => {
                  const path = categoryPathById(categories, transaction.categoryId);
                  return (
                    <tr key={transaction.id} className={`border-t border-subtle ${path ? "" : "bg-pending-soft/50"}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">{transaction.date.slice(5, 7)}.{transaction.date.slice(8, 10)}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-heading">{transaction.merchant}</td>
                      <td className="px-4 py-3">{path ? <Chip>{path}</Chip> : <Chip tone="pending" bordered>미분류</Chip>}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sub">{paymentTypeShortLabel[transaction.paymentType] ?? transaction.paymentType}</td>
                      <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-heading">{formatTransactionAmount(transaction.amount, transaction.type)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
            <span>{formatNumber(summary.total)}건 중 {formatNumber(summary.rows.length)}건 표시</span>
            <Link href="/transactions" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary-text hover:underline">
              가계부에서 전체 보기
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
