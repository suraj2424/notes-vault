import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongodb';
import Note from '../../../../models/Note';
import Topic from '../../../../models/Topic';
import UserNoteProgress from '../../../../models/UserNoteProgress';
import { auth } from '@clerk/nextjs/server';
import { syncTopicCounts, renumberTopicSequences } from '@/lib/topics';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

const updateNoteSchema = z.object({
type: z.enum(['dsa', 'qa', 'general']).optional(),
title: z.string().min(1, 'Title is required').optional(),
isFavorite: z.boolean().optional(),
tags: z.array(z.string()).optional(),
topicId: z.string().trim().nullable().optional(),
sequence: z.union([z.number().int().positive(), z.null()]).optional(),
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

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid note ID format' }, { status: 400 });
    }

    const note = await Note.findOne({
_id: id,
userId: userId,
}).lean();

if (!note) {
return NextResponse.json({ error: 'Note not found' }, { status: 404 });
}

if (note.topicId && note.sequence) {
const priorNotes = await Note.find({ topicId: note.topicId, userId, sequence: { $lt: note.sequence } }).lean();
const priorNoteIds = priorNotes.map(n => n._id.toString());
if (priorNoteIds.length > 0) {
const incompleteCount = await UserNoteProgress.countDocuments({ noteId: { $in: priorNoteIds }, completed: false });
if (incompleteCount > 0) {
return NextResponse.json({ error: 'Complete previous notes to access this one.' }, { status: 403 });
}
}
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
sequence: note.sequence ?? null,
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

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid note ID format' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = updateNoteSchema.parse(body);

    const existingNote = await Note.findOne({ _id: id, userId }).lean();
    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

if (updateData.topicId !== null && updateData.topicId !== undefined) {
const topic = await Topic.findOne({ _id: updateData.topicId, userId }).lean();
if (!topic || topic.isArchived) {
return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
}
}

const updateFields: any = { ...updateData, updatedAt: new Date() };
if (updateData.topicId === null) {
updateFields.sequence = null;
} else if (updateData.topicId && updateData.sequence !== undefined) {
updateFields.sequence = updateData.sequence;
}

const note = await Note.findOneAndUpdate(
{ _id: id, userId: userId },
updateFields,
{ returnDocument: 'after', runValidators: true }
).lean();

await syncTopicCounts([existingNote.topicId, note?.topicId]);

if (existingNote.topicId && existingNote.sequence) {
await renumberTopicSequences(existingNote.topicId);
}
if (note?.topicId && updateData.sequence !== undefined && note.topicId !== existingNote.topicId) {
await renumberTopicSequences(note.topicId);
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
sequence: note.sequence ?? null,
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

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid note ID format' }, { status: 400 });
    }

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

if (existingNote.topicId) {
await syncTopicCounts([existingNote.topicId]);
await renumberTopicSequences(existingNote.topicId);
}

return NextResponse.json({ message: 'Note deleted successfully' });

  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
