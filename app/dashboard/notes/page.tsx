import { getCurrentUser } from '@/lib/auth';
import { NotesLibraryClient } from './NotesLibraryClient';
import { redirect } from 'next/navigation';

export default async function NotesLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {
    page: pageParam,
    pageSize: pageSizeParam,
    type: typeParam,
    search: searchParam,
    filter: filterParam,
  } = await searchParams;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Dynamically import mongoose to avoid bundling in client
  const { connectToDatabase } = await import('@/lib/mongodb');
  const Note = (await import('@/models/Note')).default;

  const page = parseInt((pageParam as string) || '1');
  const pageSize = parseInt((pageSizeParam as string) || '20');
  const type = typeParam as 'dsa' | 'qa' | 'general' | undefined;
  const search = searchParam as string | undefined;
  const favorite = filterParam === 'favorites';

  const query: any = { userId: user.userId };
  if (type) query.type = type;
  if (favorite) query.isFavorite = true;
  if (search) query.$text = { $search: search };

  const projection = {
    _id: 1,
    userId: 1,
    title: 1,
    type: 1,
    isFavorite: 1,
    tags: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  const [notes, total] = await Promise.all([
    Note.find(query, projection)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Note.countDocuments(query),
  ]);

  const formattedNotes = notes.map(note => ({
    id: note._id.toString(),
    userId: note.userId,
    title: note.title,
    type: note.type,
    isFavorite: note.isFavorite,
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));

  const totalPages = Math.ceil(total / pageSize);

  return (
    <NotesLibraryClient
      user={{ name: user.name, email: user.email }}
      initialNotes={formattedNotes}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}
