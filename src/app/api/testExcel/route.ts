import { NextResponse } from "next/server";
import { parseExcel } from "@/lib/excel/parseExcel";
import { normalizeExcelData } from "@/lib/excel/normalizeExcel";

export async function GET() {
  const rows = parseExcel("202508_usage.xlsx");
  const transactions = normalizeExcelData(rows);

  return NextResponse.json({ transactions });
}