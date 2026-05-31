import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import NoteDisplayClient from "./NoteDisplayClient";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";
import Topic from "@/models/Topic";
import UserNoteProgress from "@/models/UserNoteProgress";
import { syncTopicCounts } from "@/lib/topics";

export const revalidate = 60;

export default async function NoteDetailPage({
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

  const note = await Note.findOne({ _id: id, userId }).lean();
  if (!note) {
    notFound();
  }

  let topicTitle: string | null = null;
  let topicNotes: Array<{
    id: string;
    title: string;
    sequence?: number | null;
  }> = [];
  let isInitiallyCompleted = false;

  if (note.topicId) {
    const topic = await Topic.findById(note.topicId).lean();
    topicTitle = topic?.title || null;

    const topicNoteDocs = await Note.find({ topicId: note.topicId, userId })
      .sort({ sequence: 1 })
      .lean();
    topicNotes = topicNoteDocs.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      sequence: n.sequence ?? null,
    }));

    const progress = await UserNoteProgress.findOne({
      userId,
      noteId: id,
      topicId: note.topicId,
    }).lean();
    isInitiallyCompleted = !!progress?.completed;
  }

  const formattedNote = {
    id: note._id.toString(),
    userId: note.userId,
    title: note.title,
    type: note.type,
    isFavorite: note.isFavorite,
    tags: note.tags,
    updatedAt:
      note.updatedAt instanceof Date
        ? note.updatedAt.toISOString()
        : String(note.updatedAt),
    createdAt:
      note.createdAt instanceof Date
        ? note.createdAt.toISOString()
        : String(note.createdAt),
    topicId: note.topicId,
    sequence: note.sequence ?? null,
    content: note.content,
    qa: note.qa,
    dsa: note.dsa,
  };

  // Server Action: Navigate to edit page
  async function handleEdit() {
    "use server";
    redirect(`/dashboard/notes/${id}/edit`);
  }

  // Server Action: Delete note and redirect
  async function handleDelete() {
    "use server";
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
    await connectToDatabase();
    const existingNote = await Note.findOne({ _id: id, userId }).lean();
    if (!existingNote) {
      notFound();
    }
    await Note.findOneAndDelete({ _id: id, userId });
    await syncTopicCounts([existingNote.topicId]);
    redirect("/dashboard/notes");
  }

  return (
    <NoteDisplayClient
      note={formattedNote}
      topicTitle={topicTitle}
      topicId={note.topicId || null}
      onEdit={handleEdit}
      onDelete={handleDelete}
      topicNotes={topicNotes}
      isInitiallyCompleted={isInitiallyCompleted}
    />
  );
}
