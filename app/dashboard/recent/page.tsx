import { getCurrentUser } from '@/lib/auth';
import RecentClient from './RecentClient';
import { redirect } from 'next/navigation';

export default async function RecentPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Dynamically import mongoose to avoid client-side bundling
  const { connectToDatabase } = await import('@/lib/mongodb');
  const Note = (await import('@/models/Note')).default;

  const recentNotes = await Note.find({ userId: user.userId })
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
    updatedAt: note.updatedAt,
  }));

  return <RecentClient userName={user.name} initialNotes={formattedNotes} />;
}
