import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    let business = await prisma.business.findFirst();
    if (!business) {
      business = await prisma.business.create({
        data: {
          name: "My Business",
          address: "",
          ppnRate: 11,
          pphRate: 2,
        },
        include: { bankAccounts: true },
      });
    } else {
      business = await prisma.business.findFirst({
        include: { bankAccounts: true },
      })!;
    }
    return NextResponse.json(business);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { bankAccounts, ...businessData } = body;

    let business = await prisma.business.findFirst();
    if (!business) {
      business = await prisma.business.create({
        data: {
          name: businessData.name || "My Business",
          address: businessData.address,
          npwp: businessData.npwp,
          logoUrl: businessData.logoUrl,
          ppnRate: businessData.ppnRate ?? 11,
          ppnEnabled: businessData.ppnEnabled ?? true,
          pphRate: businessData.pphRate ?? 2,
          pphEnabled: businessData.pphEnabled ?? false,
          notes: businessData.notes,
          terms: businessData.terms,
        },
      });
    } else {
      business = await prisma.business.update({
        where: { id: business.id },
        data: {
          name: businessData.name,
          address: businessData.address,
          npwp: businessData.npwp,
          logoUrl: businessData.logoUrl,
          ppnRate: businessData.ppnRate,
          ppnEnabled: businessData.ppnEnabled,
          pphRate: businessData.pphRate,
          pphEnabled: businessData.pphEnabled,
          notes: businessData.notes,
          terms: businessData.terms,
        },
      });
    }

    if (Array.isArray(bankAccounts)) {
      await prisma.bankAccount.deleteMany({ where: { businessId: business.id } });
      for (const acc of bankAccounts) {
        if (acc.bankName && acc.accountNumber) {
          await prisma.bankAccount.create({
            data: {
              businessId: business.id,
              bankName: acc.bankName,
              accountName: acc.accountName || acc.bankName,
              accountNumber: acc.accountNumber,
              isDefault: acc.isDefault ?? false,
            },
          });
        }
      }
    }

    const updated = await prisma.business.findFirst({
      where: { id: business.id },
      include: { bankAccounts: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
