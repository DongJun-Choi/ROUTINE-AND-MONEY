import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));

    if (!year || !month)
      return NextResponse.json({ error: "year, month required" }, { status: 400 });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const daily = await prisma.$queryRaw<
      { date: string; expense: number }[]
    >`
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END)::int AS expense
      FROM "Transaction"
      WHERE date >= ${start} AND date < ${end}
      GROUP BY 1
      ORDER BY 1 ASC;
    `;

    return NextResponse.json(daily);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
