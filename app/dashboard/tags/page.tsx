import { auth } from '@clerk/nextjs/server';
import TagsClient from './TagsClient';
import { redirect } from 'next/navigation';

export const revalidate = 60;

export default async function TagsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  // Dynamically import mongoose to avoid client-side bundling
  const { connectToDatabase } = await import('@/lib/mongodb');
  const Note = (await import('@/models/Note')).default;

  await connectToDatabase();

  // Fetch tags with counts using aggregation
  const result = await Note.aggregate([
    { $match: { userId: userId } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);

  const tags = result.map(item => ({
    name: item._id,
    count: item.count
  }));

  return <TagsClient initialTags={tags} />;
}
