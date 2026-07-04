import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const group = await prisma.studyGroup.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, profile: true } },
      members: {
        include: { user: { select: { id: true, username: true, profile: true } } },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Study group not found" }, { status: 404 });
  }

  return NextResponse.json(group);
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
  if (group.creatorId !== userPayload.userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.groupMessage.deleteMany({ where: { groupId: id } });
  await prisma.groupMember.deleteMany({ where: { groupId: id } });
  await prisma.studyGroup.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
