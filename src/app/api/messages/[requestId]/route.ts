import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const helpRequest = await prisma.helpRequest.findUnique({
    where: { id: requestId },
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

  const messages = await prisma.message.findMany({
    where: { requestId },
    include: {
      sender: {
        select: { id: true, username: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Message content is required" },
      { status: 400 }
    );
  }

  const helpRequest = await prisma.helpRequest.findUnique({
    where: { id: requestId },
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

  const message = await prisma.message.create({
    data: {
      requestId,
      senderId: userPayload.userId,
      content: content.trim(),
    },
    include: {
      sender: {
        select: { id: true, username: true },
      },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
