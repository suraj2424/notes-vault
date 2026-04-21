'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  return {
    user: user ? {
      id: user.id,
      name: user.fullName || user.firstName || 'User',
      email: user.primaryEmailAddress?.emailAddress || '',
    } : null,
    loading: !isLoaded,
    logout: async () => {
      window.location.href = '/';
    },
  };
}
