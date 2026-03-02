import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(status && { status }),
        ...(clientId && { clientId }),
      },
      include: { client: true, items: true, payments: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const year = new Date().getFullYear();
    const normalizedStatus = body.status === "send" ? "sent" : body.status;
    const status = ["draft", "sent", "partial", "paid", "overdue"].includes(normalizedStatus) ? normalizedStatus : "draft";
    const items = Array.isArray(body.items) ? body.items.filter((item: { description?: string }) => item?.description?.trim()) : [];

    if (!body.clientId) {
      return NextResponse.json({ error: "Client wajib dipilih" }, { status: 400 });
    }
    if (!items.length) {
      return NextResponse.json({ error: "Minimal harus ada 1 item invoice" }, { status: 400 });
    }

    const existingNumbers = await prisma.invoice.findMany({
      where: { invoiceNumber: { startsWith: `INV/${year}/` } },
      select: { invoiceNumber: true },
    });
    const maxCounter = existingNumbers.reduce((max, inv) => {
      const part = inv.invoiceNumber.split("/")[2];
      const n = Number.parseInt(part || "0", 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const invoiceNumber = `INV/${year}/${String(maxCounter + 1).padStart(3, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: body.clientId,
        issueDate: new Date(body.issueDate || Date.now()),
        dueDate: new Date(body.dueDate || Date.now()),
        status,
        notes: body.notes,
        terms: body.terms,
        discountType: body.discountType,
        discountValue: body.discountValue ?? 0,
        ppnEnabled: body.ppnEnabled ?? true,
        pphEnabled: body.pphEnabled ?? false,
        bankAccountId: body.bankAccountId,
        items: items.length
          ? {
              create: items.map((item: { description: string; quantity: number; unit?: string; price: number }, i: number) => ({
                description: item.description,
                quantity: item.quantity,
                unit: item.unit || "pcs",
                price: item.price,
                order: i,
              })),
            }
          : undefined,
      },
      include: { client: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Failed to create invoice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
