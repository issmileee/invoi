import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      include: {
        _count: { select: { invoices: true } },
      },
      orderBy: { name: "asc" },
    });

    const withOutstanding = await Promise.all(
      clients.map(async (c) => {
        const invoices = await prisma.invoice.findMany({
          where: { clientId: c.id, status: { not: "paid" } },
          include: { items: true, payments: true },
        });
        const outstanding = invoices.reduce((sum, inv) => {
          const total = inv.items.reduce((s, i) => s + i.quantity * i.price, 0);
          const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
          return sum + (total - paid);
        }, 0);
        return { ...c, outstanding };
      })
    );

    return NextResponse.json(withOutstanding);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        npwp: body.npwp,
        contactPerson: body.contactPerson,
        industry: body.industry,
      },
    });
    return NextResponse.json(client);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
