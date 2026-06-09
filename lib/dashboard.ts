import { prisma } from "@/lib/prisma";
import type { AppointmentStatus, PaymentStatus } from "@prisma/client/client";

// ── helpers ──────────────────────────────────────────────────────────────────

function dayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ── types ─────────────────────────────────────────────────────────────────────

export interface RecentAppointment {
  id: string;
  date: string; // ISO string — safe to pass to client components
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  client: { firstName: string; lastName: string };
  serviceNames: string[];
}

export interface RevenueDay {
  day: string;   // e.g. "Mon Jun 9"
  isoDate: string; // "2026-06-09" — used as recharts key
  revenue: number;
}

export interface DashboardData {
  todayAppointments: number;
  monthRevenue: number;
  uniqueClients: number;
  mostBookedService: string | null;
  recentAppointments: RecentAppointment[];
  revenueChart: RevenueDay[];
}

// ── main query ────────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();

  const { start: todayStart, end: todayEnd } = dayBounds(now);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    todayAppointments,
    monthRevenueAgg,
    uniqueClients,
    mostBookedRaw,
    rawRecent,
    recentTransactions,
  ] = await Promise.all([
    // KPI 1: appointments today
    prisma.appointment.count({
      where: { date: { gte: todayStart, lte: todayEnd } },
    }),

    // KPI 2: revenue this month (SUCCEEDED transactions)
    prisma.transaction.aggregate({
      where: { status: "SUCCEEDED", createdAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),

    // KPI 3: total unique clients
    prisma.client.count(),

    // KPI 4: most booked service (all time)
    prisma.appointmentService.groupBy({
      by: ["serviceId"],
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 1,
    }),

    // Recent appointments table
    prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        date: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        client: { select: { firstName: true, lastName: true } },
        services: { select: { service: { select: { name: true } } } },
      },
    }),

    // Revenue bar chart — transactions last 7 days
    prisma.transaction.findMany({
      where: { status: "SUCCEEDED", createdAt: { gte: sevenDaysAgo } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  // Resolve most booked service name
  let mostBookedService: string | null = null;
  if (mostBookedRaw.length > 0) {
    const svc = await prisma.service.findUnique({
      where: { id: mostBookedRaw[0].serviceId },
      select: { name: true },
    });
    mostBookedService = svc?.name ?? null;
  }

  // Serialize recent appointments (convert Decimal → number, Date → ISO string)
  const recentAppointments: RecentAppointment[] = rawRecent.map((apt) => ({
    id: apt.id,
    date: apt.date.toISOString(),
    status: apt.status,
    paymentStatus: apt.paymentStatus,
    totalAmount: Number(apt.totalAmount),
    client: apt.client,
    serviceNames: apt.services.map((s) => s.service.name),
  }));

  // Build revenue chart data — group by calendar day in JS (single query)
  const revenueByDay = new Map<string, number>();
  for (const tx of recentTransactions) {
    const key = tx.createdAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(tx.amount));
  }

  const revenueChart: RevenueDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const isoDate = d.toISOString().slice(0, 10);
    const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return { day, isoDate, revenue: revenueByDay.get(isoDate) ?? 0 };
  });

  return {
    todayAppointments,
    monthRevenue: Number(monthRevenueAgg._sum.amount ?? 0),
    uniqueClients,
    mostBookedService,
    recentAppointments,
    revenueChart,
  };
}
