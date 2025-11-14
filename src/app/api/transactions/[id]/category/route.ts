import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const transactionId = Number(params.id);
  const body = await req.json();
  const { categoryId } = body;

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { categoryId },
  });

  return NextResponse.json({ success: true });
}