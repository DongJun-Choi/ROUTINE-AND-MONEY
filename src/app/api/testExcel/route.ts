import { NextResponse } from "next/server";
import { parseExcel } from "@/lib/excel/parseExcel";

export async function GET() {
  const data = parseExcel("202508_usage.xlsx");
  return NextResponse.json({ data });
}