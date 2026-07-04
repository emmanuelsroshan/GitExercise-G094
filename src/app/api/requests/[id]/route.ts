import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const helpRequest = await prisma.helpRequest.findUnique({
    where: { id },
    include: {
      sender: {
        select: { id: true, username: true, profile: true },
      },
      tutor: {
        select: { id: true, username: true, profile: true },
      },
      messages: {
        include: {
          sender: {
            select: { id: true, username: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      review: true,
    },
  });

  if (!helpRequest) {
    return NextResponse.json(
      { error: "Help request not found" },
      { status: 404 }
    );
  }

  if (
    helpRequest.senderId !== userPayload.userId &&
    helpRequest.tutorId !== userPayload.userId
  ) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json(helpRequest);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { status } = await request.json();

  const helpRequest = await prisma.helpRequest.findUnique({ where: { id } });

  if (!helpRequest) {
    return NextResponse.json(
      { error: "Help request not found" },
      { status: 404 }
    );
  }

  if (
    helpRequest.tutorId !== userPayload.userId &&
    helpRequest.senderId !== userPayload.userId
  ) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const validStatuses = ["open", "accepted", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.helpRequest.update({
    where: { id },
    data: { status },
    include: {
      sender: {
        select: { id: true, username: true, profile: true },
      },
      tutor: {
        select: { id: true, username: true, profile: true },
      },
    },
  });

  return NextResponse.json(updated);
}
