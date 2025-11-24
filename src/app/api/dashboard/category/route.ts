import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!year || !month) {
    return NextResponse.json(
      { message: "year, month 필수" },
      { status: 400 }
    );
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const data = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "EXPENSE",
      date: {
        gte: start,
        lt: end,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, parentId: true },
  });

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, c])
  );

  const result = data.map((item) => {
    const category = categoryMap[item.categoryId ?? ""] ?? null;
    return {
      categoryId: item.categoryId,
      categoryName: category?.name ?? "미분류",
      parentId: category?.parentId ?? null,
      amount: item._sum.amount ?? 0,
    };
  });

  return NextResponse.json(result);
}
