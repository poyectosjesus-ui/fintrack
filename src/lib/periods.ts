import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subWeeks, subDays, getWeek } from "date-fns";
import { es } from "date-fns/locale";

export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Genera los períodos semanales de las últimas N semanas
 */
export function getWeeklyPeriods(count: number = 4): PeriodRange[] {
  const periods: PeriodRange[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const refDate = subWeeks(new Date(), i);
    const start = startOfWeek(refDate, { weekStartsOn: 1 }); // Lunes
    const end = endOfWeek(refDate, { weekStartsOn: 1 });
    periods.push({
      start,
      end,
      label: `Sem ${getWeek(refDate, { weekStartsOn: 1 })} (${format(start, "dd/MM", { locale: es })} - ${format(end, "dd/MM", { locale: es })})`,
    });
  }
  return periods;
}

/**
 * Genera las últimas N quincenas
 */
export function getBiweeklyPeriods(count: number = 4): PeriodRange[] {
  const periods: PeriodRange[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const refDate = subDays(now, i * 15);
    const day = refDate.getDate();
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    let start: Date;
    let end: Date;
    let label: string;

    if (day <= 15) {
      start = new Date(year, month, 1);
      end = new Date(year, month, 15, 23, 59, 59);
      label = `1ª quincena ${format(refDate, "MMM yyyy", { locale: es })}`;
    } else {
      start = new Date(year, month, 16);
      end = endOfMonth(refDate);
      label = `2ª quincena ${format(refDate, "MMM yyyy", { locale: es })}`;
    }

    // Avoid duplicates
    if (!periods.find((p) => p.label === label)) {
      periods.push({ start, end, label });
    }
  }

  return periods.slice(-count);
}

export function getCurrentWeek(): PeriodRange {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
    label: "Esta semana",
  };
}

export function getCurrentBiweek(): PeriodRange {
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (day <= 15) {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month, 15, 23, 59, 59),
      label: `1ª quincena ${format(now, "MMMM yyyy", { locale: es })}`,
    };
  } else {
    return {
      start: new Date(year, month, 16),
      end: endOfMonth(now),
      label: `2ª quincena ${format(now, "MMMM yyyy", { locale: es })}`,
    };
  }
}
