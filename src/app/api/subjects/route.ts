import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

export async function POST(request: Request) {
  try {
    const { name, category } = await request.json();
    const subject = await prisma.subject.create({
      data: { name, category: category || "" },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
