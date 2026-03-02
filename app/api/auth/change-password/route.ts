import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = cookies().get("auth_session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan baru wajib diisi" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password baru minimal 8 karakter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session } });
    if (!user) {
      return NextResponse.json({ error: "Session tidak valid" }, { status: 401 });
    }
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: "Password lama tidak sesuai" }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "Password baru harus berbeda dari password lama" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal mengganti password" }, { status: 500 });
  }
}

