import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener transacción" }, { status: 500 });
  }
}

// PUT /api/transactions/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amount, description, type, date, categoryId, notes } = body;

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        description,
        type,
        date: date ? new Date(date) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        notes,
      },
      include: { category: true },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar transacción" }, { status: 500 });
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.transaction.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Transacción eliminada" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 });
  }
}
