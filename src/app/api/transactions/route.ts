import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (type) where.type = type;
    if (categoryId) where.categoryId = parseInt(categoryId);

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, type, date, categoryId, notes } = body;

    if (!amount || !description || !type || !categoryId) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        date: date ? new Date(date) : new Date(),
        categoryId: parseInt(categoryId),
        notes,
      },
      include: { category: true },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Error al crear transacción" }, { status: 500 });
  }
}
