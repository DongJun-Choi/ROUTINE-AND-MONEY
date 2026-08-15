"use client";

import { PiggyBank, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";

interface SummaryData { expense: number; income: number; net: number; count: number; topCategory?: { name: string; amount: number } | null }

export default function Summary({ year, month }: { year: number; month: number }) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    fetch(`/api/dashboard/summary?year=${year}&month=${month}`).then((res) => { if (!res.ok) throw new Error(); return res.json(); }).then(setSummary).catch(() => setFailed(true));
  }, [year, month]);

  const income = summary?.income ?? 0;
  const expense = summary?.expense ?? 0;
  const net = summary?.net ?? income - expense;
  const note = failed ? "데이터를 불러오지 못했습니다" : summary ? `${summary.count}건의 거래` : "불러오는 중...";

  return <div className="summary-grid"><section className="summary-card"><header><h2>{month}월 수입</h2><TrendingUp size={17} className="income" /></header><strong className="income">+{income.toLocaleString()}원</strong><p>{note}</p></section><section className="summary-card"><header><h2>{month}월 지출</h2><TrendingDown size={17} className="expense" /></header><strong className="expense">-{expense.toLocaleString()}원</strong><p>{summary?.topCategory ? `${summary.topCategory.name} 지출이 가장 많아요` : note}</p></section><section className="summary-card"><header><h2>{month}월 순수익</h2><PiggyBank size={17} className="net" /></header><strong className={net < 0 ? "expense" : "net"}>{net < 0 ? "-" : "+"}{Math.abs(net).toLocaleString()}원</strong><p>수입에서 지출을 제외한 금액</p></section><section className="summary-card"><header><h2>{month}월 잔액</h2><WalletCards size={17} className="income" /></header><div className="balance-list"><span>수입 <b>+{income.toLocaleString()}원</b></span><span>지출 <b>-{expense.toLocaleString()}원</b></span><span className="total">잔액 <b>{net < 0 ? "-" : "+"}{Math.abs(net).toLocaleString()}원</b></span></div></section></div>;
}
