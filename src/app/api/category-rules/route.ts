import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const rules = await prisma.categoryRule.findMany({
    orderBy: { id: "desc" },
    include: {
      category: true,
    },
  });

  return NextResponse.json(rules);
}