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
    coverImage: topicDoc.coverImage,
    color: topicDoc.color,
    isArchived: topicDoc.isArchived,
    noteCount: topicDoc.noteCount,
    createdAt: topicDoc.createdAt.toISOString(),
    updatedAt: topicDoc.updatedAt.toISOString(),
  };

  const noteDocs = await NoteModel.find({ topicId: id, userId })
    .sort({ updatedAt: -1 })
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
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    content: note.content,
    dsa: note.dsa as any,
    qa: note.qa as any,
  }));

  const onRemoveNote = async (noteId: string) => {
    "use server";

    await connectToDatabase();
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    // Verify note belongs to user before updating
    const result = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId },
      { topicId: null }
    );
    if (!result) {
      throw new Error('Note not found or unauthorized');
    }
    await syncTopicCounts([id]);
  };

  return (
    <TopicDetailClient topic={topic} notes={notes} onRemoveNote={onRemoveNote} />
  );
}
