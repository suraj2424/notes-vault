import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '../../../lib/mongodb';
import Note from '../../../models/Note';
import Topic from '../../../models/Topic';
import { auth } from '@clerk/nextjs/server';
import { syncTopicCounts } from '@/lib/topics';

const createNoteSchema = z.object({
  type: z.enum(['dsa', 'qa', 'general']),
  title: z.string().min(1, 'Title is required'),
  isFavorite: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  topicId: z.string().trim().optional().nullable(),
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
     content: z.string(),
     importantPoints: z.array(z.string()).optional().default([]),
   }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const favorite = searchParams.get('favorite');
    const topicId = searchParams.get('topicId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const fields = searchParams.get('fields'); // comma-separated list of fields to include

    let query: any = { userId: userId };

    if (type) {
      query.type = type;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (topicId) {
      query.topicId = topicId;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * pageSize;

    // Build projection for selective fields
    let projection: any = {};
    if (fields) {
      const fieldList = fields.split(',').map(f => f.trim());
      fieldList.forEach(f => projection[f] = 1);
    }

    const [notes, total] = await Promise.all([
      Note.find(query, projection)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Note.countDocuments(query),
    ]);

    // Convert _id to id and format dates
    const formattedNotes = notes.map(note => ({
      id: note._id.toString(),
      userId: note.userId,
      type: note.type,
      title: note.title,
      isFavorite: note.isFavorite,
      tags: note.tags,
      topicId: note.topicId ?? null,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      // Only include dsa/qa/content if explicitly requested
      ...(projection.dsa !== undefined && { dsa: note.dsa }),
      ...(projection.qa !== undefined && { qa: note.qa }),
      ...(projection.content !== undefined && { content: note.content }),
    }));

    return NextResponse.json({ 
      notes: formattedNotes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }
    });

  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const noteData = createNoteSchema.parse(body);

    if (noteData.topicId) {
      const topic = await Topic.findOne({ _id: noteData.topicId, userId }).lean();
      if (!topic || topic.isArchived) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
    }

    const note = await Note.create({
      userId: userId,
      ...noteData,
    });

    await syncTopicCounts([note.topicId]);

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
    }, { status: 201 });

   } catch (error) {
     if (error instanceof z.ZodError) {
       return NextResponse.json(
         { error: 'Validation error', details: error.issues },
         { status: 400 }
       );
     }

     console.error('Create note error:', error);
     if (error instanceof Error) {
       console.error('Error name:', error.name);
       console.error('Error message:', error.message);
       console.error('Error stack:', error.stack);
     }
     return NextResponse.json({ 
       error: 'Internal server error', 
       details: process.env.NODE_ENV === 'development' ? { message: error instanceof Error ? error.message : 'Unknown error' } : undefined 
     }, { status: 500 });
   }
}
