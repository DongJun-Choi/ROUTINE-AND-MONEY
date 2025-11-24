import { NextResponse } from "next/server";
import { parseExcel } from "@/lib/excel/parseExcel";
import { normalizeExcelData } from "@/lib/excel/normalizeExcel";
import prisma from "@/lib/prisma";
import { loadCategoryRules, findCategoryId } from "@/lib/autoCategory";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "파일이 존재하지 않습니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = parseExcel(buffer);

    const refined = normalizeExcelData(rows);

    const rules = await loadCategoryRules();

    const dbData = refined.map((t) => {
      const categoryId = findCategoryId(t.merchant, rules);

      return {
        date: new Date(t.date),
        merchant: t.merchant,
        amount: Math.abs(t.amount),
        type: "EXPENSE",
        paymentType: t.paymentType,
        categoryId: categoryId,
      };
    });

    await prisma.transaction.createMany({
      data: dbData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: "업로드 및 저장 성공",
      count: refined.length,
      preview: dbData,
    });
  } catch (error) {
    console.error("업로드 오류:", error);
    return NextResponse.json(
      { message: "서버 오류 발생", error: String(error) },
      { status: 500 }
    );
  }
}