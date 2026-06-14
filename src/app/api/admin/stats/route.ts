import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalUsers = await prisma.user.count();
  const totalTutors = await prisma.user.count({
    where: {
      role: { in: ["volunteer_tutor", "paid_tutor"] },
    },
  });
  const totalStudents = await prisma.user.count({
    where: { role: "student" },
  });
  const totalRequests = await prisma.helpRequest.count();
  const completedSessions = await prisma.helpRequest.count({
    where: { status: "completed" },
  });
  const totalReviews = await prisma.review.count();
  const totalMessages = await prisma.message.count();

  const requestsBySubject = await prisma.helpRequest.groupBy({
    by: ["subject"],
    _count: true,
    orderBy: { _count: { subject: "desc" } },
    take: 10,
  });

  const averageRating = await prisma.review.aggregate({
    _avg: { rating: true },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { profile: true },
  });

  return NextResponse.json({
    totalUsers,
    totalTutors,
    totalStudents,
    totalRequests,
    completedSessions,
    totalReviews,
    totalMessages,
    averageRating: averageRating._avg.rating || 0,
    requestsBySubject,
    recentUsers,
  });
}
