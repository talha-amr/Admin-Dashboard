import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import CreateOrganizationForm from '@/components/ui/CreateOrganizationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, School, Briefcase, GraduationCap } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  type: 'School' | 'Nonprofit' | 'Business';
  school_district: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Fetching server state securely via TanStack Query
  const { data: organizations, isLoading, isError } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Organization[];
    },
  });

  // Helper icon selector based on organization type
  const getTypeIcon = (type: Organization['type']) => {
    switch (type) {
      case 'School': return <GraduationCap className="h-5 w-5 text-indigo-400" />;
      case 'Nonprofit': return <School className="h-5 w-5 text-emerald-400" />;
      case 'Business': return <Briefcase className="h-5 w-5 text-amber-400" />;
      default: return <Building2 className="h-5 w-5 text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-zinc-800">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-900 bg-zinc-900/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-white" />
            <span className="font-medium tracking-tight text-white">Workspace Console</span>
          </div>
          
          {/* Create Workspace Trigger Modal */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 bg-zinc-100 text-xs font-medium text-zinc-950 hover:bg-zinc-200">
                <Plus className="h-3.5 w-3.5" /> New Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Register Organization</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Set up a new isolated organizational workspace context.
                </DialogDescription>
              </DialogHeader>
              <CreateOrganizationForm onSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-white">Organizations</h1>
          <p className="text-xs text-zinc-400">Manage your active workspaces and connected networks.</p>
        </div>

        {/* 2. Dynamic Handling of Fetching States */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 w-full animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/20" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400">
            Failed to retrieve your organization profiles. Please try reloading the system interface.
          </div>
        )}

        {/* Empty State Card */}
        {!isLoading && !isError && organizations?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
            <Building2 className="h-8 w-8 text-zinc-600 mb-3" />
            <h3 className="text-sm font-medium text-zinc-300">No organizations found</h3>
            <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-4">
              Get started by establishing your very first organizational data container.
            </p>
          </div>
        )}

        {/* 3. Rendered Grid Data List */}
        {!isLoading && !isError && organizations && organizations.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Card key={org.id} className="border-zinc-900 bg-zinc-900/30 transition-all hover:border-zinc-800">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-white">{org.name}</CardTitle>
                    <CardDescription className="inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-800/60">
                      {org.type}
                    </CardDescription>
                  </div>
                  <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-900">
                    {getTypeIcon(org.type)}
                  </div>
                </CardHeader>
                <CardContent>
                  {org.type === 'School' && org.school_district ? (
                    <div className="mt-2 text-xs text-zinc-500">
                      District: <span className="text-zinc-300 font-medium">{org.school_district}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-zinc-600 italic">
                      Standard data pipeline active
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}