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

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      type: "EXPENSE",
      date: {
        gte: start,
        lt: end,
      },
    },
    select: { amount: true, categoryId: true, splits: { select: { amount: true, categoryId: true } } },
  });

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, parentId: true },
  });

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, c])
  );

  const totals = new Map<number | null, number>();
  for (const transaction of transactions) {
    const allocations = transaction.splits.length > 0 ? transaction.splits : [{ amount: transaction.amount, categoryId: transaction.categoryId }];
    for (const allocation of allocations) totals.set(allocation.categoryId, (totals.get(allocation.categoryId) ?? 0) + allocation.amount);
  }

  const result = [...totals.entries()].map(([categoryId, amount]) => {
    const category = categoryMap[categoryId ?? ""] ?? null;
    return {
      categoryId,
      categoryName: category?.name ?? "미분류",
      parentId: category?.parentId ?? null,
      amount,
    };
  });

  return NextResponse.json(result);
}
