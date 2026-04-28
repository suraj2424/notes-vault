import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { escapeRegex, formatTopic } from "@/lib/topics";
import { TOPIC_COLOR_PALETTE } from "@/lib/topic-constants";

const createTopicSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().trim().max(500, "Description is too long").optional().or(z.literal("")),
  coverImage: z.string().trim().url("Cover image must be a valid URL").optional().or(z.literal("")),
  color: z.string().trim().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const query: Record<string, unknown> = {
      userId,
      ...(includeArchived ? {} : { isArchived: false }),
    };

    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [{ title: pattern }, { description: pattern }];
    }

    const skip = (page - 1) * pageSize;

    const [topics, total] = await Promise.all([
      Topic.find(query).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean(),
      Topic.countDocuments(query),
    ]);

    return NextResponse.json({
      topics: topics.map(formatTopic),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      meta: {
        colors: TOPIC_COLOR_PALETTE,
      },
    });
  } catch (error) {
    console.error("Get topics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const topicData = createTopicSchema.parse(body);

    const topic = await Topic.create({
      userId,
      title: topicData.title,
      description: topicData.description || undefined,
      coverImage: topicData.coverImage || undefined,
      color: topicData.color || TOPIC_COLOR_PALETTE[0],
    });

    return NextResponse.json({ topic: formatTopic(topic) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    console.error("Create topic error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
