import { auth, currentUser } from '@clerk/nextjs/server';
import RecentClient from './RecentClient';
import { redirect } from 'next/navigation';

export const revalidate = 30;

export default async function RecentPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const user = await currentUser();
  const userName = user?.firstName || user?.fullName || 'User';

  // Dynamically import mongoose to avoid client-side bundling
  const { connectToDatabase } = await import('@/lib/mongodb');
  const Note = (await import('@/models/Note')).default;

  await connectToDatabase();

  const recentNotes = await Note.find({ userId: userId })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select('_id title type isFavorite tags updatedAt')
    .lean();

  const formattedNotes = recentNotes.map(note => ({
    id: note._id.toString(),
    title: note.title,
    type: note.type,
    isFavorite: note.isFavorite,
    tags: note.tags,
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : String(note.updatedAt),
  }));

  return <RecentClient userName={user.name} initialNotes={formattedNotes} />;
}
