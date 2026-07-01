import type { Transaction } from "../excel/normalizeExcel";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, "")).trim();
}

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(/,/g, "");

  if (!cleaned) {
    return null;
  }

  const amount = Number(cleaned);
  return Number.isNaN(amount) ? null : amount;
}

export function normalizeVestmailHtmlData(html: string): Transaction[] {
  const tableMatch = html.match(
    /<table[^>]*id=["']usage1["'][^>]*>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>[\s\S]*?<\/table>/i
  );

  if (!tableMatch) {
    throw new Error("KB 카드 이용내역 테이블을 찾을 수 없습니다.");
  }

  const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const result: Transaction[] = [];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (cell) => stripTags(cell[1])
    );

    if (cells.length < 7) {
      continue;
    }

    const [cardNumber, rawDate, normalType, merchant, rawAmount, , rawPoint] =
      cells;

    if (normalType !== "정상") {
      continue;
    }

    const amount = parseAmount(rawAmount);

    if (amount === null) {
      continue;
    }

    const pointAmount = parseAmount(rawPoint) ?? 0;
    const finalAmount = amount - pointAmount;
    const paymentType: Transaction["paymentType"] =
      pointAmount <= 0 ? "CARD" : finalAmount === 0 ? "POINT" : "MIXED";

    result.push({
      cardNumber,
      date: rawDate.replace(/\./g, "-").trim(),
      merchant,
      amount: finalAmount,
      paymentType,
      type: "EXPENSE",
    });
  }

  return result;
}
