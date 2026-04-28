import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import Topic from "@/models/Topic";
import Note from "@/models/Note";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const topic = await Topic.findOne({ _id: id, userId }).lean();

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const skip = (page - 1) * pageSize;

    const [notes, total] = await Promise.all([
      Note.find({ userId, topicId: id })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Note.countDocuments({ userId, topicId: id }),
    ]);

    return NextResponse.json({
      notes: notes.map((note) => ({
        id: note._id.toString(),
        userId: note.userId,
        type: note.type,
        title: note.title,
        isFavorite: note.isFavorite,
        tags: note.tags,
        topicId: note.topicId ?? null,
        content: note.content,
        dsa: note.dsa,
        qa: note.qa,
        createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : String(note.createdAt),
        updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : String(note.updatedAt),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get topic notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
