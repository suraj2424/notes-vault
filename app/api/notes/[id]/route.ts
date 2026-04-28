import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '../../../../lib/mongodb';
import Note from '../../../../models/Note';
import Topic from '../../../../models/Topic';
import { auth } from '@clerk/nextjs/server';
import { syncTopicCounts } from '@/lib/topics';

const updateNoteSchema = z.object({
  type: z.enum(['dsa', 'qa', 'general']).optional(),
  title: z.string().min(1, 'Title is required').optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  topicId: z.string().trim().nullable().optional(),
  content: z.string().optional(),
  dsa: z.object({
    platform: z.string(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    pattern: z.string(),
    problemStatement: z.string(),
    implementations: z.array(z.object({
      language: z.string(),
      code: z.string(),
      timeComplexity: z.string().default(''),
      spaceComplexity: z.string().default(''),
    })),
    notes: z.string().optional(),
  }).optional(),
   qa: z.object({
     topic: z.string(),
     content: z.string(),
     importantPoints: z.array(z.string()).optional().default([]),
   }).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const note = await Note.findOne({
      _id: id,
      userId: userId,
    }).lean();

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({
      note: {
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
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });

  } catch (error) {
    console.error('Get note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const body = await request.json();
    const updateData = updateNoteSchema.parse(body);

    const existingNote = await Note.findOne({ _id: id, userId }).lean();
    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (updateData.topicId) {
      const topic = await Topic.findOne({ _id: updateData.topicId, userId }).lean();
      if (!topic || topic.isArchived) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: userId },
      { ...updateData, updatedAt: new Date() },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    await syncTopicCounts([existingNote.topicId, note?.topicId]);

    return NextResponse.json({
      note: {
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
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const existingNote = await Note.findOne({
      _id: id,
      userId: userId,
    }).lean();

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await Note.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    await syncTopicCounts([existingNote.topicId]);

    return NextResponse.json({ message: 'Note deleted successfully' });

  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
