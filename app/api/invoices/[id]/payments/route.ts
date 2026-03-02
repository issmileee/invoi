import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const payment = await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: body.amount,
        paymentDate: new Date(body.paymentDate || Date.now()),
        method: body.method || "bank_transfer",
        reference: body.reference,
        notes: body.notes,
      },
    });

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const subtotal = invoice.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);

    let newStatus = invoice.status;
    if (totalPaid >= subtotal) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partial";
    }

    await prisma.invoice.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(payment);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
