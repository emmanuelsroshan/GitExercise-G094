import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

async function assertMember(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return !!membership;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!(await assertMember(id, userPayload.userId))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const messages = await prisma.groupMessage.findMany({
    where: { groupId: id },
    include: { sender: { select: { id: true, username: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!(await assertMember(id, userPayload.userId))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { content } = await request.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Message content required" }, { status: 400 });
  }

  const message = await prisma.groupMessage.create({
    data: {
      groupId: id,
      senderId: userPayload.userId,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, username: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
