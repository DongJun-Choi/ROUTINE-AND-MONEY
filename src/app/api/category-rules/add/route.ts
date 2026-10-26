import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const { keyword, categoryId } = await req.json();

  if (!keyword || !categoryId)
    return NextResponse.json(
      { error: "keyword, categoryId are required" },
      { status: 400 }
    );

  const normalizedKeyword = String(keyword).trim().toLocaleLowerCase("ko-KR");
  const normalizedCategoryId = Number(categoryId);

  if (!normalizedKeyword || !Number.isSafeInteger(normalizedCategoryId) || normalizedCategoryId <= 0) {
    return NextResponse.json({ error: "유효한 키워드와 카테고리가 필요합니다." }, { status: 400 });
  }

  try {
    const newRule = await prisma.categoryRule.create({
      data: { keyword: normalizedKeyword, categoryId: normalizedCategoryId },
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "이미 등록된 자동 분류 규칙입니다." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "존재하지 않는 카테고리입니다." }, { status: 400 });
    }
    throw error;
  }
}
