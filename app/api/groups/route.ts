import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject") || "";
  const university = searchParams.get("university") || "";

  const where: any = {};
  if (subject) {
    where.subject = { contains: subject, mode: "insensitive" };
  }
  if (university) {
    where.university = { contains: university, mode: "insensitive" };
  }

  const groups = await prisma.studyGroup.findMany({
    where,
    include: {
      creator: { select: { id: true, username: true, profile: true } },
      members: { select: { id: true, userId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { name, subject, description, university, meetingTime, maxMembers } =
      await request.json();

    if (!name || !subject) {
      return NextResponse.json(
        { error: "Group name and subject are required" },
        { status: 400 }
      );
    }

    const group = await prisma.studyGroup.create({
      data: {
        name,
        subject,
        description: description || "",
        university: university || "",
        meetingTime: meetingTime || "",
        maxMembers: maxMembers && maxMembers > 0 ? maxMembers : 6,
        creatorId: userPayload.userId,
        members: {
          create: { userId: userPayload.userId },
        },
      },
      include: {
        creator: { select: { id: true, username: true, profile: true } },
        members: { select: { id: true, userId: true } },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json(
      { error: "Failed to create study group" },
      { status: 500 }
    );
  }
}
