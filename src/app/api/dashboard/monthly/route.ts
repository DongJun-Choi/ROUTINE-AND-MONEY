import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get("year"));

    if (!year)
      return NextResponse.json({ error: "year required" }, { status: 400 });

    const monthly = await prisma.$queryRaw<
      { month: string; total: number }[]
    >`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
        SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END) AS total
      FROM "Transaction"
      WHERE DATE_PART('year', date) = ${year}
      GROUP BY 1
      ORDER BY 1 ASC;
    `;

    return NextResponse.json(monthly);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
