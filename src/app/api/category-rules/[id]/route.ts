import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const { keyword, categoryId } = await req.json();
  const normalizedKeyword = String(keyword ?? "").trim().toLocaleLowerCase("ko-KR");
  const normalizedCategoryId = Number(categoryId);

  if (!Number.isInteger(id) || !normalizedKeyword || !Number.isInteger(normalizedCategoryId)) {
    return NextResponse.json({ error: "유효한 키워드와 카테고리가 필요합니다." }, { status: 400 });
  }

  try {
    const rule = await prisma.categoryRule.update({
      where: { id },
      data: { keyword: normalizedKeyword, categoryId: normalizedCategoryId },
      include: { category: true },
    });

    return NextResponse.json(rule);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "이미 등록된 자동 분류 규칙입니다." }, { status: 409 });
    }
    throw error;
  }
}
