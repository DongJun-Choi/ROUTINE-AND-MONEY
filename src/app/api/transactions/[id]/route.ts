import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    } = body;

    const rawAmount = Number(amount);

    const type = rawAmount >= 0 ? "INCOME" : "EXPENSE";

    const normalizedAmount = Math.abs(rawAmount);

    await prisma.transaction.update({
      where: { id },
      data: {
        date: new Date(date),
        merchant,
        amount: normalizedAmount,
        type,
        paymentType,
        categoryId: categoryId ?? null,
        memo: memo ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
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
