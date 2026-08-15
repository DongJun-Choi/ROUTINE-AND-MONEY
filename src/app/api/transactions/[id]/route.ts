import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeTransactionSplits } from "@/lib/transactionSplits";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await req.json();

    const {
      date,
      merchant,
      amount,
      paymentType,
      categoryId,
      memo,
      splits,
    } = body;

    const rawAmount = Number(amount);

    const type = rawAmount >= 0 ? "INCOME" : "EXPENSE";

    const normalizedAmount = Math.abs(rawAmount);
    const normalizedSplits = normalizeTransactionSplits(splits, normalizedAmount);

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id },
        data: {
          date: new Date(date), merchant, amount: normalizedAmount, type, paymentType,
          categoryId: normalizedSplits.length > 0 ? null : categoryId ?? null,
          memo: memo ?? null,
        },
      });
      await tx.transactionSplit.deleteMany({ where: { transactionId: id } });
      if (normalizedSplits.length > 0) {
        await tx.transactionSplit.createMany({ data: normalizedSplits.map((split) => ({ ...split, transactionId: id })) });
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes("분할")) {
      return NextResponse.json({ success: false, message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}
