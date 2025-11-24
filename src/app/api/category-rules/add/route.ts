import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { keyword, categoryId } = await req.json();

  if (!keyword || !categoryId)
    return NextResponse.json(
      { error: "keyword, categoryId are required" },
      { status: 400 }
    );

  const newRule = await prisma.categoryRule.create({
    data: {
      keyword: keyword.trim().toLowerCase(),
      categoryId: Number(categoryId),
    },
  });

  return NextResponse.json(newRule);
}