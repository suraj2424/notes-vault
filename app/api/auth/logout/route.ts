import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  // Clerk handles sign-out on the frontend via useAuth().signOut()
  // This API route is kept for compatibility but is not needed with Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({ message: 'Logout handled by Clerk' });
}