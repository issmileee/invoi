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

    const count = await prisma.invoice.count({
      where: { invoiceNumber: { startsWith: `INV/${year}/` } },
    });
    const invoiceNumber = `INV/${year}/${String(count + 1).padStart(3, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: body.clientId,
        issueDate: new Date(body.issueDate || Date.now()),
        dueDate: new Date(body.dueDate || Date.now()),
        status: body.status || "draft",
        notes: body.notes,
        terms: body.terms,
        discountType: body.discountType,
        discountValue: body.discountValue ?? 0,
        ppnEnabled: body.ppnEnabled ?? true,
        pphEnabled: body.pphEnabled ?? false,
        bankAccountId: body.bankAccountId,
        items: body.items?.length
          ? {
              create: body.items.map((item: { description: string; quantity: number; unit?: string; price: number }, i: number) => ({
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
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
