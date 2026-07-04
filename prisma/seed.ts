import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Programming",
  "Data Science",
  "English Literature",
  "History",
  "Psychology",
  "Economics",
  "Accounting",
  "Statistics",
  "Calculus",
  "Linear Algebra",
  "Organic Chemistry",
  "Computer Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Web Development",
  "Mobile Development",
];

async function main() {
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name, category: "General" },
    });
  }
  console.log("Seeded", subjects.length, "subjects");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
