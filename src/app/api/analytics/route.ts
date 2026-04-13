import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeeklyPeriods, getBiweeklyPeriods } from "@/lib/periods";

// GET /api/analytics?periodType=semanal|quincenal&count=4
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get("periodType") || "semanal";
    const count = parseInt(searchParams.get("count") || "4");

    const periods =
      periodType === "quincenal"
        ? getBiweeklyPeriods(count)
        : getWeeklyPeriods(count);

    const analyticsData = await Promise.all(
      periods.map(async (period) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            date: { gte: period.start, lte: period.end },
          },
          include: { category: true },
        });

        const ingresos = transactions
          .filter((t) => t.type === "INGRESO")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const gastos = transactions
          .filter((t) => t.type === "GASTO")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // By category
        const byCategory = transactions.reduce(
          (acc, t) => {
            const key = t.category.name;
            if (!acc[key]) {
              acc[key] = {
                name: key,
                type: t.type,
                color: t.category.color,
                total: 0,
                count: 0,
              };
            }
            acc[key].total += Number(t.amount);
            acc[key].count += 1;
            return acc;
          },
          {} as Record<string, { name: string; type: string; color: string; total: number; count: number }>
        );

        return {
          period: period.label,
          startDate: period.start.toISOString(),
          endDate: period.end.toISOString(),
          ingresos,
          gastos,
          balance: ingresos - gastos,
          transactionCount: transactions.length,
          byCategory: Object.values(byCategory),
        };
      })
    );

    // Summary stats
    const totalIngresos = analyticsData.reduce((s, d) => s + d.ingresos, 0);
    const totalGastos = analyticsData.reduce((s, d) => s + d.gastos, 0);

    return NextResponse.json({
      periodType,
      data: analyticsData,
      summary: {
        totalIngresos,
        totalGastos,
        totalBalance: totalIngresos - totalGastos,
        avgIngresos: totalIngresos / count,
        avgGastos: totalGastos / count,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Error al calcular analytics" }, { status: 500 });
  }
}
