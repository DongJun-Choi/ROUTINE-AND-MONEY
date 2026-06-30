import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const transactionId = Number(id);
  const body = await req.json();
  const { categoryId } = body;

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { categoryId },
  });

  return NextResponse.json({ success: true });
}
