export interface Transaction {
  cardNumber: string;
  date: string;
  merchant: string;
  amount: number;
  paymentType: "CARD" | "POINT" | "MIXED";
  type: "EXPENSE";
}

function parseAmount(value: any): number | null {
  if (value == null) return null;

  const cleaned = String(value)
    .replace(/\u00A0/g, "") // NBSP 제거
    .replace(/\s/g, "")     // 공백/탭 제거
    .replace(/,/g, "");     // 천 단위 콤마 제거

  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

export function normalizeExcelData(rows: any[][]): Transaction[] {
  const result: Transaction[] = [];

  // rows[0] = 헤더
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // 정상 거래 아닐 경우 skip
    const normalType = row[2]; // 정상구분
    if (normalType.trim() !== "정상") continue;

    const cardNumber = row[0];      // 카드번호
    const rawDate = row[1];         // 이용일
    const merchant = row[3];        // 가맹점명

    let amount = parseAmount(row[4]);    // 금액
    if (amount === null) continue;

    // 날짜 정규화: "2025.08.08 " → "2025-08-08"
    const date = rawDate.replace(/\./g, "-").trim();

    // 다음 줄 확인
    const next = rows[i + 1];
    let paymentType: Transaction["paymentType"] = "CARD";

    if (
      next &&
      next[3] === "포인트사용" &&   // 가맹점명 = 포인트사용
      Number(next[4]) < 0           // 금액 음수
    ) {
      amount += Number(next[4]); // 음수 더함

      paymentType = amount === 0 ? "POINT" : "MIXED";

      i++;
    }

    const type = "EXPENSE";

    result.push({
      cardNumber,
      date,
      merchant,
      amount,
      paymentType,
      type,
    });
  }

  return result;
}