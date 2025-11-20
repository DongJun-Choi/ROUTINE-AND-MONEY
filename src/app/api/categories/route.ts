import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const data = await req.json();

  const newCategory = await prisma.category.create({
    data: {
      name: data.name,
      parentId: data.parentId ?? null,
    },
  });

  return NextResponse.json({ category: newCategory });
}