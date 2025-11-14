import { NextResponse } from "next/server";
import { parseExcel } from "@/lib/excel/parseExcel";
import { normalizeExcelData } from "@/lib/excel/normalizeExcel";
import prisma from "@/lib/prisma";

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

    const dbData = refined.map((t) => ({
      date: new Date(t.date),
      merchant: t.merchant,
      amount: t.amount,
      paymentType: t.paymentType,
      categoryId: null,
    }));

    await prisma.transaction.createMany({
      data: dbData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: "업로드 및 저장 성공",
      count: refined.length,
    });
  } catch (error) {
    console.error("업로드 오류:", error);
    return NextResponse.json(
      { message: "서버 오류 발생", error: String(error) },
      { status: 500 }
    );
  }
}