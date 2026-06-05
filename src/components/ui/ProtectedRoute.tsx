import { Navigate, Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const queryClient = useQueryClient();

  // 1. Core Mandate: Fetch and cache the auth token via TanStack Query (Zero useEffect fetching)
  const { data: session, isLoading } = useQuery({
    queryKey: ['supabase-session'],
    queryFn: async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      return currentSession;
    },
  });

  // 2. Synchronization Layer: Listen to global authentication events (Sign in / Sign out)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Instantly tell TanStack Query its cached session data is old, forcing a clean background refetch
      queryClient.invalidateQueries({ queryKey: ['supabase-session'] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // 3. Render States
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="text-xs font-medium tracking-widest uppercase animate-pulse">
          Authenticating Terminal Link...
        </div>
      </div>
    );
  }

  // Intercept if no active token is present in the TanStack cache
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Render child components seamlessly if authenticated successfully
  return <Outlet context={{ session }} />;
}