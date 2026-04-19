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

    // Aggregate stats in a single query for efficiency
    const stats = await Note.aggregate([
      { $match: { userId: user.userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          dsa: {
            $sum: {
              $cond: [{ $eq: ['$type', 'dsa'] }, 1, 0]
            }
          },
          qa: {
            $sum: {
              $cond: [{ $eq: ['$type', 'qa'] }, 1, 0]
            }
          },
          favorites: {
            $sum: {
              $cond: ['$isFavorite', 1, 0]
            }
          }
        }
      }
    ]);

    const data = stats[0] || { total: 0, dsa: 0, qa: 0, favorites: 0 };

    return NextResponse.json({
      stats: {
        total: data.total,
        dsa: data.dsa,
        qa: data.qa,
        favorites: data.favorites,
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
