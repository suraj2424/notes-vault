import Note from "@/models/Note";
import Topic, { ITopic } from "@/models/Topic";
import { Topic as TopicType } from "@/types";

export function formatTopic(topic: Pick<
  ITopic,
  "_id" | "userId" | "title" | "description" | "isArchived" | "noteCount" | "createdAt" | "updatedAt"
>): TopicType {
  return {
    id: topic._id.toString(),
    userId: topic.userId,
    title: topic.title,
    description: topic.description,
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

export async function renumberTopicSequences(topicId: string) {
const notes = await Note.find({ topicId, sequence: { $ne: null } })
.sort({ sequence: 1 })
.lean();

const bulkOps = notes.map((note, index) => ({
  updateOne: {
    filter: { _id: note._id },
    update: { $set: { sequence: index + 1 } },
  },
}));

if (bulkOps.length > 0) {
  await Note.bulkWrite(bulkOps);
}
}
