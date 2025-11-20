import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { oldId, newId } = await req.json();

  await prisma.transaction.updateMany({
    where: { categoryId: oldId },
    data: { categoryId: newId },
  });

  return NextResponse.json({ ok: true });
}
