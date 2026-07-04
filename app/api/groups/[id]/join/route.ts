import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const group = await prisma.studyGroup.findUnique({
    where: { id },
    include: { members: true },
  });

  if (!group) {
    return NextResponse.json({ error: "Study group not found" }, { status: 404 });
  }

  if (group.members.some((m) => m.userId === userPayload.userId)) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }

  if (group.members.length >= group.maxMembers) {
    return NextResponse.json({ error: "This group is full" }, { status: 400 });
  }

  await prisma.groupMember.create({
    data: { groupId: id, userId: userPayload.userId },
  });

  const updated = await prisma.studyGroup.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, profile: true } },
      members: {
        include: { user: { select: { id: true, username: true, profile: true } } },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const group = await prisma.studyGroup.findUnique({ where: { id } });
  if (!group) {
    return NextResponse.json({ error: "Study group not found" }, { status: 404 });
  }

  if (group.creatorId === userPayload.userId) {
    return NextResponse.json(
      { error: "Group creator can't leave. Delete the group instead." },
      { status: 400 }
    );
  }

  await prisma.groupMember.deleteMany({
    where: { groupId: id, userId: userPayload.userId },
  });

  return NextResponse.json({ success: true });
}
