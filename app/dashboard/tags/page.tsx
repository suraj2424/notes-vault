import { getCurrentUser } from '@/lib/auth';
import TagsClient from './TagsClient';
import { redirect } from 'next/navigation';

export default async function TagsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Dynamically import mongoose to avoid client-side bundling
  const { connectToDatabase } = await import('@/lib/mongodb');
  const Note = (await import('@/models/Note')).default;

  await connectToDatabase();

  // Fetch tags with counts using aggregation
  const result = await Note.aggregate([
    { $match: { userId: user.userId } },
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
