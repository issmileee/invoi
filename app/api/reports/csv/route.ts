import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || String(new Date().getFullYear());
    const month = searchParams.get("month");

    const where: { issueDate?: { gte: Date; lt: Date } } = {};
    if (month) {
      const m = parseInt(month, 10);
      where.issueDate = {
        gte: new Date(parseInt(year, 10), m - 1, 1),
        lt: new Date(parseInt(year, 10), m, 1),
      };
    } else {
      where.issueDate = {
        gte: new Date(parseInt(year, 10), 0, 1),
        lt: new Date(parseInt(year, 10) + 1, 0, 1),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { client: true, items: true, payments: true },
      orderBy: { issueDate: "asc" },
    });

    const rows: string[][] = [
      ["No", "Invoice #", "Client", "Date", "Due Date", "Subtotal", "Paid", "Balance", "Status"],
    ];

    invoices.forEach((inv, i) => {
      const subtotal = inv.items.reduce((s, item) => s + item.quantity * item.price, 0);
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      const balance = subtotal - paid;
      rows.push([
        String(i + 1),
        inv.invoiceNumber,
        inv.client.name,
        format(new Date(inv.issueDate), "yyyy-MM-dd"),
        format(new Date(inv.dueDate), "yyyy-MM-dd"),
        String(subtotal),
        String(paid),
        String(balance),
        inv.status,
      ]);
    });

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const bom = "\uFEFF";
    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-${year}${month ? `-${month}` : ""}.csv"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
