import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import CreateOrganizationForm from '@/components/ui/CreateOrganizationForm';
import MemberManagement from '@/components/ui/MemberManagement'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Briefcase, GraduationCap, ArrowLeft, Users, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Organization {
  id: string;
  name: string;
  type: 'School' | 'Nonprofit' | 'Business';
  school_district: string | null;
  created_at: string;
  // Safely captures the server-side aggregation payload from Supabase
  organization_members: { count: number }[];
}

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // 1. Fetching organizations with a sub-query count of their members
  const { data: organizations, isLoading, isError } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          type,
          school_district,
          created_at,
          organization_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Organization[];
    },
  });

  const getTypeIcon = (type: Organization['type']) => {
    switch (type) {
      case 'School': return <GraduationCap className="h-5 w-5 text-indigo-400" />;
      case 'Nonprofit': return <Building2 className="h-5 w-5 text-emerald-400" />;
      case 'Business': return <Briefcase className="h-5 w-5 text-amber-400" />;
      default: return <Building2 className="h-5 w-5 text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-zinc-800">
      <Navbar 
        onTitleClick={() => setSelectedOrg(null)}
        actions={
          !selectedOrg && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 font-medium transition-all hover:scale-[1.02] px-3 sm:px-4">
                  <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> 
                  <span className="sm:hidden">New</span>
                  <span className="hidden sm:inline-block">New Organization</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl sm:max-w-md shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Register Organization</DialogTitle>
                  <DialogDescription>
                    Set up a new isolated organizational workspace context.
                  </DialogDescription>
                </DialogHeader>
                <CreateOrganizationForm onSuccess={() => setIsOpen(false)} />
              </DialogContent>
            </Dialog>
          )
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {selectedOrg ? (
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedOrg(null)}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to directory Overview
            </button>
            <MemberManagement 
              organizationId={selectedOrg.id} 
              organizationName={selectedOrg.name} 
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-semibold tracking-tight text-white">Organizations</h1>
              <p className="text-xs text-zinc-400">Manage your active workspaces and connected networks.</p>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-32 w-full animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/20" />
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400">
                Failed to retrieve your organization profiles.
              </div>
            )}

            {!isLoading && !isError && organizations?.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
                <Building2 className="h-8 w-8 text-zinc-600 mb-3" />
                <h3 className="text-sm font-medium text-zinc-300">No organizations found</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-4">
                  Get started by establishing your very first organizational data container.
                </p>
              </div>
            )}

            {!isLoading && !isError && organizations && organizations.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => {
                  const memberCount = org.organization_members?.[0]?.count || 0;
                  const formattedDate = new Date(org.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <Card 
                      key={org.id} 
                      onClick={() => setSelectedOrg(org)}
                      className="border-zinc-900 bg-zinc-900/30 transition-all hover:border-zinc-800 cursor-pointer group flex flex-col justify-between min-h-[160px]"
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-medium text-white group-hover:text-zinc-200 transition-colors">
                            {org.name}
                          </CardTitle>
                          <CardDescription className="inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-800/60">
                            {org.type}
                          </CardDescription>
                        </div>
                        <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-900 group-hover:border-zinc-800 transition-all">
                          {getTypeIcon(org.type)}
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-col justify-between flex-1 pt-2">
                        {org.type === 'School' && org.school_district ? (
                          <div className="text-xs text-zinc-500 mb-4">
                            District: <span className="text-zinc-300 font-medium">{org.school_district}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-600 italic mb-4">
                            Click to manage team roster
                          </div>
                        )}

                        {/* Integrated Directory Metadata Footer */}
                        <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3 text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}