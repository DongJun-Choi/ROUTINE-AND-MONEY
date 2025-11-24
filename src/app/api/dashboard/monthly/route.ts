import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year"));

    if (!year)
      return NextResponse.json({ error: "year required" }, { status: 400 });

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const rows = await prisma.$queryRaw<
      { month: number; expense: number }[]
    >`
      SELECT
        EXTRACT(MONTH FROM date)::int AS month,
        SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END)::int AS expense
      FROM "Transaction"
      WHERE date >= ${start} AND date < ${end}
      GROUP BY 1
      ORDER BY 1;
    `;

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const row = rows.find((r) => r.month === i + 1);
      return {
        month: i + 1,
        expense: row?.expense ?? 0,
      };
    });

    return NextResponse.json(monthly);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
