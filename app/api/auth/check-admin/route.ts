import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });
    return NextResponse.json({ hasAdmin: adminCount > 0 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to check admin status" }, { status: 500 });
  }
}
