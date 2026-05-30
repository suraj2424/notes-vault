import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";
import Topic from "@/models/Topic";
import { renumberTopicSequences } from "@/lib/topics";

const reorderSchema = z.object({
order: z.array(z.string()),
});

export async function PATCH(
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
    const body = await request.json();
    const { order } = reorderSchema.parse(body);

    const topic = await Topic.findOne({ _id: id, userId }).lean();
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const noteIds = order.map((id) => id.trim()).filter(Boolean);
    const uniqueIds = [...new Set(noteIds)];
    if (uniqueIds.length !== noteIds.length) {
      return NextResponse.json({ error: "Duplicate note IDs in order" }, { status: 400 });
    }

    const existingNotes = await Note.find({
      _id: { $in: uniqueIds },
      topicId: id,
      userId,
    }).lean();

    if (existingNotes.length !== uniqueIds.length) {
      return NextResponse.json(
        { error: "Some notes do not belong to this topic" },
        { status: 400 },
      );
    }

    for (let i = 0; i < uniqueIds.length; i++) {
      await Note.findOneAndUpdate(
        { _id: uniqueIds[i], userId },
        { sequence: i + 1 },
        { runValidators: true },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder notes error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
