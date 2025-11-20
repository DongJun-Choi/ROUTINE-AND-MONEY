import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, context: { params: { id: string } }) {
  const id = Number(context.params.id);
  const data = await req.json();

  const updated = await prisma.category.update({
    where: { id },
    data: { name: data.name },
  });

  return NextResponse.json({ category: updated });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const categoryId = Number(id);

  try {
    const target = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!target) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (target.parentId === null) {
      return NextResponse.json(
        { error: "Parent category cannot be deleted", safe: true },
        { status: 400 }
      );
    }

    const count = await prisma.transaction.count({
      where: { categoryId },
    });

    if (count > 0) {
      return NextResponse.json({
        used: true,
        usedCount: count,
      });
    }

    await prisma.categoryRule.deleteMany({
      where: { categoryId },
    });

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ deleted: true });

  } catch (err: any) {
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign key constraint violated", used: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
