import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import Login from '@/pages/Login';

// Setup query client with global 5-minute cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, 
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Secure Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <div className="min-h-screen bg-background p-8 text-foreground">
                <div className="mx-auto max-w-6xl space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome to your dashboard overview.</p>
                </div>
              </div>
            } />
          </Route>

          {/* Route Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}