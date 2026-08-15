import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { normalizeTransactionSplits } from "@/lib/transactionSplits";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    let where = {};

    if (year && month) {
      const y = Number(year);
      const m = Number(month) - 1;

      const start = new Date(Date.UTC(y, m, 1));
      const end = new Date(Date.UTC(y, m + 1, 1));

      where = {
        date: {
          gte: start,
          lt: end,
        },
      };
    }

    const data = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          include: {
            parent: true,
          }
        },
        splits: {
          include: { category: { include: { parent: true } } },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ transactions: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error fetching transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, merchant, amount, paymentType, memo, categoryId, splits } = body;

    if (!date || !merchant || amount == null || !paymentType) {
      return NextResponse.json(
        { message: "필수 값이 누락되었습니다." },
        { status: 400 }
      );
    }

    const rawAmount = Number(amount);

    const type = rawAmount >= 0 ? "INCOME" : "EXPENSE";

    const normalizedAmount = Math.abs(rawAmount);
    const normalizedSplits = normalizeTransactionSplits(splits, normalizedAmount);

    const newTx = await prisma.transaction.create({
      data: {
        date: new Date(date),
        merchant,
        amount: normalizedAmount,
        paymentType,
        memo: memo ?? null,
        categoryId: normalizedSplits.length > 0 ? null : categoryId ? Number(categoryId) : null,
        type: type,
        splits: normalizedSplits.length > 0 ? { create: normalizedSplits } : undefined,
      },
    });

    return NextResponse.json(newTx, { status: 201 });
  } catch (err) {
    console.error("Error creating transaction:", err);
    if (err instanceof Error && err.message.includes("분할")) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Error creating transaction" },
      { status: 500 }
    );
  }
}
