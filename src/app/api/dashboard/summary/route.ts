import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!year || !month) {
    return NextResponse.json(
      { message: "year, month는 필수입니다." },
      { status: 400 }
    );
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
    },
  });

  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") income += t.amount;
    else if (t.type === "EXPENSE") expense += t.amount;
  }

  const net = income - expense;

  const categoryMap = new Map<number, number>();

  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;

    const cid = t.categoryId;
    if (cid == null) continue;

    const prev = categoryMap.get(cid) ?? 0;
    categoryMap.set(cid, prev + t.amount);
  }

  let topCategoryId: number | null = null;
  let topCategoryAmount = 0;

  for (const [categoryId, total] of categoryMap.entries()) {
    if (total > topCategoryAmount) {
      topCategoryAmount = total;
      topCategoryId = categoryId;
    }
  }

  let topCategoryName = "미분류";
  if (topCategoryId !== null) {
    const c = transactions.find(t => t.categoryId === topCategoryId)?.category;
    if (c) {
      topCategoryName = c.parent
        ? `${c.parent.name} > ${c.name}`
        : c.name;
    }
  }

  return NextResponse.json({
    income,
    expense,
    net,
    count: transactions.length,
    topCategory: {
      id: topCategoryId,
      name: topCategoryName,
      amount: topCategoryAmount,
    },
  });
}
