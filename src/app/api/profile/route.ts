import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const profile = await prisma.profile.upsert({
      where: { userId: userPayload.userId },
      update: data,
      create: {
        userId: userPayload.userId,
        ...data,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: userPayload.userId },
  });

  return NextResponse.json(profile || {});
}

export async function DELETE(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: userPayload.userId },
    data: { accountStatus: "suspended" },
  });

  return NextResponse.json({ message: "Account suspended" });
}
