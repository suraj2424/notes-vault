import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import UserNoteProgress from '@/models/UserNoteProgress';
import Note from '@/models/Note';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const note = await Note.findOne({ _id: id, userId }).lean();
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (!note.topicId) {
      return NextResponse.json({ error: 'Cannot complete a note outside a topic' }, { status: 400 });
    }

    const progress = await UserNoteProgress.findOneAndUpdate(
      { userId, noteId: id, topicId: note.topicId },
      { $set: { completed: true, completedAt: new Date() } },
      { new: true, upsert: true },
    ).lean();

    return NextResponse.json({
      progress: {
        id: progress._id.toString(),
        userId: progress.userId,
        noteId: progress.noteId,
        topicId: progress.topicId,
        completed: progress.completed,
        completedAt:
          typeof progress.completedAt === 'string'
            ? progress.completedAt
            : progress.completedAt instanceof Date
              ? progress.completedAt.toISOString()
              : String(progress.completedAt),
      },
    });
  } catch (error) {
    console.error('Complete note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
