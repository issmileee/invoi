import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: { orderBy: { order: "asc" } }, payments: { orderBy: { paymentDate: "desc" } } },
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        clientId: body.clientId,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: body.status,
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
      include: { client: true, items: true, payments: true },
    });

    return NextResponse.json(invoice);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
