import { prisma } from "./prisma";

interface MatchParams {
  tutorId: string;
  subject: string;
  studentAvailability?: string;
  studentUniversity?: string;
}

interface MatchResult {
  tutorId: string;
  score: number;
  subjectScore: number;
  scheduleScore: number;
  universityScore: number;
  ratingScore: number;
  details: string[];
}

export async function calculateMatchScore(
  params: MatchParams
): Promise<MatchResult> {
  const { tutorId, subject } = params;
  const tutor = await prisma.user.findUnique({
    where: { id: tutorId },
    include: {
      profile: true,
      reviewsReceived: true,
    },
  });

  if (!tutor || !tutor.profile) {
    return {
      tutorId,
      score: 0,
      subjectScore: 0,
      scheduleScore: 0,
      universityScore: 0,
      ratingScore: 0,
      details: [],
    };
  }

  const profile = tutor.profile;
  const details: string[] = [];

  // Subject Match (40%)
  const teachingSubjects = (profile.subjectsTeaching || "")
    .split(",")
    .map((s) => s.trim().toLowerCase());
  const requestedSubject = subject.toLowerCase();
  let subjectScore = 0;
  if (teachingSubjects.includes(requestedSubject)) {
    subjectScore = 100;
    details.push("✓ Exact subject match");
  } else {
    const partial = teachingSubjects.some(
      (s) => s.includes(requestedSubject) || requestedSubject.includes(s)
    );
    subjectScore = partial ? 50 : 0;
    if (partial) details.push("✓ Partial subject match");
  }

  // Schedule Compatibility (35%)
  let scheduleScore = 0;
  if (params.studentAvailability && profile.availability) {
    try {
      const studentSlots = JSON.parse(params.studentAvailability);
      const tutorSlots = JSON.parse(profile.availability);
      const overlap = studentSlots.filter((s: string) =>
        tutorSlots.includes(s)
      ).length;
      const totalSlots = Math.max(studentSlots.length, 1);
      scheduleScore = Math.round((overlap / totalSlots) * 100);
      if (overlap > 0) {
        details.push(`✓ ${overlap} matching time slots`);
      }
    } catch {
      scheduleScore = 50;
    }
  } else {
    scheduleScore = 50;
  }

  // University Similarity (10%)
  let universityScore = 0;
  if (
    params.studentUniversity &&
    profile.university &&
    params.studentUniversity.toLowerCase() === profile.university.toLowerCase()
  ) {
    universityScore = 100;
    details.push("✓ Same university");
  }

  // Tutor Rating (15%)
  const reviews = tutor.reviewsReceived;
  let ratingScore = 0;
  if (reviews.length > 0) {
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    ratingScore = Math.round((avgRating / 5) * 100);
    details.push(`✓ ${avgRating.toFixed(1)} rating`);
  } else {
    ratingScore = 50;
  }

  const totalScore = Math.round(
    subjectScore * 0.4 +
      scheduleScore * 0.35 +
      universityScore * 0.1 +
      ratingScore * 0.15
  );

  return {
    tutorId,
    score: totalScore,
    subjectScore,
    scheduleScore,
    universityScore,
    ratingScore,
    details,
  };
}

export function getMatchReason(details: string[]): string {
  return details.join(". ") || "No specific matches found";
}
