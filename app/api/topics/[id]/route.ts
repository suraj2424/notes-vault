import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import Topic from "@/models/Topic";
import Note from "@/models/Note";
import { formatTopic } from "@/lib/topics";

const updateTopicSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long").optional(),
  description: z.string().trim().max(500, "Description is too long").optional().or(z.literal("")),
  coverImage: z.string().trim().url("Cover image must be a valid URL").optional().or(z.literal("")),
  color: z.string().trim().optional().or(z.literal("")),
  isArchived: z.boolean().optional(),
});

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

    return NextResponse.json({ topic: formatTopic(topic) });
  } catch (error) {
    console.error("Get topic error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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
    const parsed = updateTopicSchema.parse(body);

    const topic = await Topic.findOneAndUpdate(
      { _id: id, userId },
      {
        ...parsed,
        ...(parsed.description === "" ? { description: undefined } : {}),
        ...(parsed.coverImage === "" ? { coverImage: undefined } : {}),
        ...(parsed.color === "" ? { color: undefined } : {}),
        updatedAt: new Date(),
      },
      { returnDocument: "after", runValidators: true },
    ).lean();

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ topic: formatTopic(topic) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    console.error("Update topic error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const unlinkResult = await Note.updateMany({ userId, topicId: id }, { $set: { topicId: null } });
    await Topic.deleteOne({ _id: id, userId });

    return NextResponse.json({
      message: "Topic deleted successfully",
      unlinkedNotes: unlinkResult.modifiedCount,
    });
  } catch (error) {
    console.error("Delete topic error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
