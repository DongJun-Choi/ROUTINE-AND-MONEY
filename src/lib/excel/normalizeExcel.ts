export interface Transaction {
  cardNumber: string;
  date: string;
  merchant: string;
  amount: number;
  paymentType: "CARD" | "POINT" | "MIXED";
}

export function normalizeExcelData(rows: any[][]): Transaction[] {
  const result: Transaction[] = [];

  // rows[0] = 헤더
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // 정상 거래 아닐 경우 skip
    const normalType = row[2]; // 정상구분 ← ★ 수정됨
    if (normalType.trim() !== "정상") continue;

    const cardNumber = row[0];      // 카드번호
    const rawDate = row[1];         // 이용일
    const merchant = row[3];        // 가맹점명
    let amount = Number(row[4]);    // 금액

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

      i++; // 다음 줄 skip
    }

    result.push({
      cardNumber,
      date,
      merchant,
      amount,
      paymentType,
    });
  }

  return result;
}