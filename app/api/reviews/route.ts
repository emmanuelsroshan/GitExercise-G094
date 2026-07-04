import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { requestId, tutorId, rating, feedback } = await request.json();

    if (!requestId || !tutorId || !rating) {
      return NextResponse.json(
        { error: "Request ID, tutor ID, and rating are required" },
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

    if (helpRequest.senderId !== userPayload.userId) {
      return NextResponse.json(
        { error: "Only the requester can leave a review" },
        { status: 403 }
      );
    }

    if (helpRequest.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed sessions" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { requestId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "A review already exists for this request" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        requestId,
        reviewerId: userPayload.userId,
        tutorId,
        rating: Math.min(5, Math.max(1, rating)),
        feedback: feedback || "",
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
