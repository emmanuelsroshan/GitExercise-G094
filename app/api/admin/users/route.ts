import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload || userPayload.role !== "paid_tutor") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PUT(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload || userPayload.role !== "paid_tutor") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { userId, action } = await request.json();

  if (!userId || !action) {
    return NextResponse.json(
      { error: "User ID and action are required" },
      { status: 400 }
    );
  }

  if (action === "suspend") {
    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: "suspended" },
    });
  } else if (action === "activate") {
    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: "active" },
    });
  } else if (action === "delete") {
    await prisma.message.deleteMany({ where: { senderId: userId } });
    await prisma.review.deleteMany({
      where: { OR: [{ reviewerId: userId }, { tutorId: userId }] },
    });
    await prisma.helpRequest.deleteMany({
      where: { OR: [{ senderId: userId }, { tutorId: userId }] },
    });
    await prisma.profile.delete({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }

  return NextResponse.json({ message: `User ${action}d successfully` });
}
