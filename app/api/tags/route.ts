import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    // Aggregate unique tags with counts for the user
    const result = await Note.aggregate([
      { $match: { userId: user.userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }, // Sort by count desc, then name
    ]);

    const tags = result.map(item => ({
      name: item._id,
      count: item.count
    }));

    return NextResponse.json({ tags });

  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}