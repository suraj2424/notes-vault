'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();

  const user = useMemo(() => {
    if (!clerkUser) return null;
    return {
      id: clerkUser.id,
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
    };
  }, [clerkUser]);

  const loading = useMemo(() => !isLoaded, [isLoaded]);

  const logout = useCallback(async () => {
    window.location.href = '/';
  }, []);

  return useMemo(() => ({
    user,
    loading,
    logout,
  }), [user, loading, logout]);
}
