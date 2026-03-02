import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);

    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      include: { items: true, payments: true },
    });

    const months = eachMonthOfInterval({ start: new Date(year, 0, 1), end: new Date(year, 11, 31) });
    const monthlyData = months.map((month) => {
      const monthInvoices = invoices.filter((inv) => {
        const d = new Date(inv.issueDate);
        return d.getFullYear() === year && d.getMonth() === month.getMonth();
      });
      const invoiced = monthInvoices.reduce((sum, inv) => {
        return sum + inv.items.reduce((s, i) => s + i.quantity * i.price, 0);
      }, 0);
      const received = invoices.flatMap((inv) => inv.payments).filter((p) => {
        const d = new Date(p.paymentDate);
        return d.getFullYear() === year && d.getMonth() === month.getMonth();
      }).reduce((s, p) => s + p.amount, 0);

      return {
        month: format(month, "MMM"),
        year: month.getFullYear(),
        invoiced,
        received,
      };
    });

    return NextResponse.json(monthlyData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
