"use client";

import { useState } from "react";
import { useCategories } from "@/components/transactions/useTransactionsData";
import MailSyncCard from "@/components/upload/MailSyncCard";
import UploadCard from "@/components/upload/UploadCard";
import UploadResultCard from "@/components/upload/UploadResultCard";
import PageHeader from "@/components/ui/PageHeader";
import type { UploadResult } from "@/lib/upload/statement";

export default function UploadPage() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const categories = useCategories();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="명세서 가져오기" description="카드사 엑셀 명세서나 보안메일 HTML을 올리면 거래를 저장하고 자동 분류 규칙으로 분류해요." />
      <div className="flex flex-wrap items-stretch gap-6">
        <UploadCard className="flex-[7_1_520px]" onResult={setResult} />
        <MailSyncCard className="flex-[5_1_360px]" />
      </div>
      {result && <UploadResultCard result={result} categories={categories} />}
    </div>
  );
}
