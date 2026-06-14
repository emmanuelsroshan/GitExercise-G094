import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const requests = await prisma.helpRequest.findMany({
    where: {
      OR: [
        { senderId: userPayload.userId },
        { tutorId: userPayload.userId },
      ],
    },
    include: {
      sender: {
        select: { id: true, username: true, profile: true },
      },
      tutor: {
        select: { id: true, username: true, profile: true },
      },
      review: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { tutorId, subject, topic, description, requestType, urgency, preferredTime } =
      await request.json();

    if (!tutorId || !subject) {
      return NextResponse.json(
        { error: "Tutor and subject are required" },
        { status: 400 }
      );
    }

    const helpRequest = await prisma.helpRequest.create({
      data: {
        senderId: userPayload.userId,
        tutorId,
        subject,
        topic: topic || "",
        description: description || "",
        requestType: requestType || "general_learning",
        urgency: urgency || "medium",
        preferredTime: preferredTime || "",
        status: "open",
      },
      include: {
        sender: {
          select: { id: true, username: true, profile: true },
        },
        tutor: {
          select: { id: true, username: true, profile: true },
        },
      },
    });

    return NextResponse.json(helpRequest, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Failed to create help request" },
      { status: 500 }
    );
  }
}
