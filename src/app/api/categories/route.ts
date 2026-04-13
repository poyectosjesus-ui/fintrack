import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, color, icon } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Nombre y tipo son requeridos" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, type, color: color || "#6366f1", icon: icon || "tag" },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 });
  }
}
