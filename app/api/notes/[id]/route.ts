import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '../../../../lib/mongodb';
import Note from '../../../../models/Note';
import { getCurrentUser } from '../../../../lib/auth';

const updateNoteSchema = z.object({
  type: z.enum(['dsa', 'qa', 'general']).optional(),
  title: z.string().min(1, 'Title is required').optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  content: z.string().optional(),
  dsa: z.object({
    platform: z.string(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    pattern: z.string(),
    problemStatement: z.string(),
    implementations: z.array(z.object({
      language: z.string(),
      code: z.string(),
    })),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const note = await Note.findOne({
      _id: id,
      userId: user.userId,
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const body = await request.json();
    const updateData = updateNoteSchema.parse(body);

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const result = await Note.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!result) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' });

  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}