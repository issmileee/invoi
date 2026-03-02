import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if we can connect to DB
    try {
      await prisma.$connect();
    } catch (connErr: any) {
      console.error("DB Connection Error:", connErr);
      return NextResponse.json({ error: `Database connection failed: ${connErr.message}` }, { status: 500 });
    }

    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });

    if (adminCount > 0) {
      return NextResponse.json({ error: "Admin already exists. Please login instead." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // In a real app, hash this!
        name: name || "Admin",
        role: "admin",
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e: any) {
    console.error("Setup Admin Error:", e);
    return NextResponse.json({ error: `Failed to create admin: ${e.message || 'Unknown error'}` }, { status: 500 });
  }
}
