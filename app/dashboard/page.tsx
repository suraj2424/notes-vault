import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const revalidate = 60;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/auth/login');
  }

  // Get user info from Clerk
  const { currentUser } = await import('@clerk/nextjs/server');
  const user = await currentUser();
  const userName = user?.firstName || user?.fullName || 'User';

  // Dynamically import mongoose to avoid bundling it in the client
  const { connectToDatabase } = await import('@/lib/mongodb');
  const Note = (await import('@/models/Note')).default;

  await connectToDatabase();

  // Fetch recent notes (limit 5)
  const recentNotes = await Note.find({ userId: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('_id title type isFavorite tags updatedAt')
    .lean();

  // Fetch stats using aggregation for efficiency
  const statsResult = await Note.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        dsa: { $sum: { $cond: [{ $eq: ['$type', 'dsa'] }, 1, 0] } },
        qa: { $sum: { $cond: [{ $eq: ['$type', 'qa'] }, 1, 0] } },
        favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } }
      }
    }
  ]);

  const stats = statsResult[0] || {
    total: 0,
    dsa: 0,
    qa: 0,
    favorites: 0
  };

  // Map _id to id for client component compatibility
  const formattedRecentNotes = recentNotes.map(note => ({
    id: note._id.toString(),
    title: note.title,
    type: note.type,
    isFavorite: note.isFavorite,
    tags: note.tags,
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : String(note.updatedAt),
  }));

  return (
    <DashboardClient
      userName={userName}
      recentNotes={formattedRecentNotes}
      stats={stats}
    />
  );
}
