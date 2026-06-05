import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard'; // Added the structural Dashboard page import

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
            {/* Swapped out the inline placeholder code for your actual Dashboard view component */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Route Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}