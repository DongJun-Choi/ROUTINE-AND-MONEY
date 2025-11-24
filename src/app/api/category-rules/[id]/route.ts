import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  await prisma.categoryRule.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}