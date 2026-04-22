import { auth, currentUser } from '@clerk/nextjs/server';
import { NotesLibraryClient } from './NotesLibraryClient';
import { redirect } from 'next/navigation';

export default async function NotesLibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const {
    page: pageParam,
    pageSize: pageSizeParam,
    type: typeParam,
    search: searchParam,
    filter: filterParam,
  } = resolvedSearchParams;

  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const user = await currentUser();
  const userName = user?.firstName || user?.fullName || 'User';
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';

  // Dynamically import mongoose to avoid bundling in client
  const { connectToDatabase } = await import('@/lib/mongodb');
  const Note = (await import('@/models/Note')).default;

  await connectToDatabase();

  const page = parseInt((pageParam as string) || '1');
  const pageSize = parseInt((pageSizeParam as string) || '20');
  const type = typeParam as 'dsa' | 'qa' | 'general' | undefined;
  const search = searchParam as string | undefined;
  const favorite = filterParam === 'favorites';

  const query: any = { userId: userId };
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
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : String(note.createdAt),
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : String(note.updatedAt),
  }));

  const totalPages = Math.ceil(total / pageSize);

  return (
    <NotesLibraryClient
      user={{ name: userName, email: userEmail }}
      initialNotes={formattedNotes}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}
