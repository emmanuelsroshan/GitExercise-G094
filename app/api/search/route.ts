import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/matchmaking";

export async function GET(request: NextRequest) {
  const userPayload = getUserFromRequest(request);
  const { searchParams } = new URL(request.url);

  const subject = searchParams.get("subject") || "";
  const tutorType = searchParams.get("tutorType") || "";
  const university = searchParams.get("university") || "";
  const minRating = parseFloat(searchParams.get("minRating") || "0");
  const availability = searchParams.get("availability") || "";

  const where: any = {
    role: { in: ["volunteer_tutor", "paid_tutor"] },
    accountStatus: "active",
  };

  if (tutorType === "volunteer" || tutorType === "paid") {
    where.role =
      tutorType === "volunteer" ? "volunteer_tutor" : "paid_tutor";
  }

  const tutors = await prisma.user.findMany({
    where,
    include: {
      profile: true,
      reviewsReceived: true,
    },
  });

  const currentUser = userPayload
    ? await prisma.user.findUnique({
        where: { id: userPayload.userId },
        include: { profile: true },
      })
    : null;

  const results = await Promise.all(
    tutors.map(async (tutor) => {
      const matchScore = await calculateMatchScore({
        tutorId: tutor.id,
        subject: subject || (tutor.profile?.subjectsTeaching?.split(",")[0]?.trim() || ""),
        studentAvailability: availability || currentUser?.profile?.availability,
        studentUniversity: university || currentUser?.profile?.university,
      });

      const reviews = tutor.reviewsReceived;
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      return {
        id: tutor.id,
        username: tutor.username,
        email: tutor.email,
        role: tutor.role,
        profile: tutor.profile,
        matchScore,
        avgRating,
        totalReviews: reviews.length,
      };
    })
  );

  let filtered = results;

  if (university) {
    filtered = filtered.filter(
      (r) =>
        r.profile?.university
          ?.toLowerCase()
          .includes(university.toLowerCase())
    );
  }

  if (minRating > 0) {
    filtered = filtered.filter((r) => r.avgRating >= minRating);
  }

  if (subject) {
    filtered = filtered.filter(
      (r) =>
        r.profile?.subjectsTeaching
          ?.toLowerCase()
          .includes(subject.toLowerCase()) || r.matchScore.subjectScore > 0
    );
  }

  filtered.sort((a, b) => b.matchScore.score - a.matchScore.score);

  return NextResponse.json(filtered);
}
