import Note from "@/models/Note";
import Topic, { ITopic } from "@/models/Topic";
import { Topic as TopicType } from "@/types";
import { TOPIC_COLOR_PALETTE } from "@/lib/topic-constants";

export function formatTopic(topic: Pick<
  ITopic,
  "_id" | "userId" | "title" | "description" | "coverImage" | "color" | "isArchived" | "noteCount" | "createdAt" | "updatedAt"
>): TopicType {
  return {
    id: topic._id.toString(),
    userId: topic.userId,
    title: topic.title,
    description: topic.description,
    coverImage: topic.coverImage,
    color: topic.color,
    isArchived: topic.isArchived,
    noteCount: topic.noteCount,
    createdAt: topic.createdAt instanceof Date ? topic.createdAt.toISOString() : String(topic.createdAt),
    updatedAt: topic.updatedAt instanceof Date ? topic.updatedAt.toISOString() : String(topic.updatedAt),
  };
}

export async function ensureTopicOwnership(userId: string, topicId: string) {
  const topic = await Topic.findOne({ _id: topicId, userId }).lean();

  if (!topic || topic.isArchived) {
    return null;
  }

  return topic;
}

export async function syncTopicNoteCount(topicId: string) {
  const noteCount = await Note.countDocuments({ topicId });

  await Topic.findByIdAndUpdate(topicId, {
    noteCount,
    updatedAt: new Date(),
  });

  return noteCount;
}

export async function syncTopicCounts(topicIds: Array<string | null | undefined>) {
  const uniqueTopicIds = [...new Set(topicIds.filter((topicId): topicId is string => Boolean(topicId)))];

  await Promise.all(uniqueTopicIds.map((topicId) => syncTopicNoteCount(topicId)));
}

export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
