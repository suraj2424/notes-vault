import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Archive, ChevronLeft, FolderOpen, Plus, Unlink } from "lucide-react";
import { Note, Topic } from "@/types";
import { cn } from "@/lib/utils";
import connectToDatabase from "@/lib/mongodb";
import TopicModel from "@/models/Topic";
import NoteModel from "@/models/Note";
import TopicDetailClient from "./TopicDetailClient";
import { syncTopicCounts } from "@/lib/topics";

export const revalidate = 60;

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/login");
  }

  const { id } = await params;

  await connectToDatabase();

  const topicDoc = await TopicModel.findOne({ _id: id, userId });
  if (!topicDoc) {
    notFound();
  }

  const topic: Topic = {
    id: topicDoc._id.toString(),
    userId: topicDoc.userId,
    title: topicDoc.title,
    description: topicDoc.description,
    isArchived: topicDoc.isArchived,
    noteCount: topicDoc.noteCount,
    createdAt: topicDoc.createdAt.toISOString(),
    updatedAt: topicDoc.updatedAt.toISOString(),
  };

const noteDocs = await NoteModel.find({ topicId: id, userId })
.sort({ sequence: 1, updatedAt: -1 })
.limit(50)
.lean();

const notes: Note[] = noteDocs.map((note) => ({
id: note._id.toString(),
userId: note.userId,
type: note.type,
title: note.title,
isFavorite: note.isFavorite,
tags: note.tags,
topicId: note.topicId,
sequence: note.sequence ?? null,
createdAt: note.createdAt.toISOString(),
updatedAt: note.updatedAt.toISOString(),
content: note.content,
dsa: note.dsa as any,
qa: note.qa as any,
}));

const sequencedNotes = noteDocs.filter((n) => n.sequence != null).sort((a, b) => a.sequence - b.sequence);

const onRemoveNote = async (noteId: string) => {
"use server";

await connectToDatabase();
const { userId } = await auth();
if (!userId) {
  throw new Error('Unauthorized');
}
const result = await NoteModel.findOneAndUpdate(
  { _id: noteId, userId },
  { topicId: null, sequence: null }
);
if (!result) {
  throw new Error('Note not found or unauthorized');
}
await syncTopicCounts([id]);
};

const onReorderNote = async (noteId: string, direction: "up" | "down") => {
"use server";

await connectToDatabase();
const { userId } = await auth();
if (!userId) {
  throw new Error('Unauthorized');
}

const note = await NoteModel.findOne({ _id: noteId, userId, topicId: id }).lean();
if (!note) {
  throw new Error("Note not found");
}

let seq = note.sequence;
const notesInTopic = await NoteModel.find({ userId, topicId: id, sequence: { $ne: null } })
  .sort({ sequence: 1 })
  .lean();

if (seq == null) {
  const maxSeq = notesInTopic.length > 0 ? notesInTopic[notesInTopic.length - 1].sequence : null;
  const insertAt = direction === "up" ? Math.max(1, (maxSeq ?? 0)) : (maxSeq ?? 0) + 1;
  await NoteModel.updateOne({ _id: noteId, userId }, { $set: { sequence: insertAt } });
  notesInTopic.splice(direction === "up" ? insertAt - 1 : notesInTopic.length, 0, { _id: noteId, sequence: insertAt } as any);
  seq = insertAt;
}

const currentIndex = notesInTopic.findIndex((n) => n._id.toString() === noteId);
if (currentIndex < 0) return;
const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
if (targetIndex < 0 || targetIndex >= notesInTopic.length) return;

const targetSeq = notesInTopic[targetIndex].sequence;
const currentSeq = notesInTopic[currentIndex].sequence;

if (targetSeq != null) {
  await NoteModel.updateOne({ _id: notesInTopic[targetIndex]._id, userId }, { $set: { sequence: currentSeq } });
}

await NoteModel.updateOne({ _id: noteId, userId }, { $set: { sequence: targetSeq ?? currentSeq } });
await syncTopicCounts([id]);
};

return (
<TopicDetailClient
topic={topic}
notes={notes}
onRemoveNote={onRemoveNote}
onReorder={onReorderNote}
/>
);
}
