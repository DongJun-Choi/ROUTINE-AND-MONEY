import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  await prisma.categoryRule.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
