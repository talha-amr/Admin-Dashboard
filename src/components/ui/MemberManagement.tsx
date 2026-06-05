import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, UserPlus } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface MemberManagementProps {
  organizationId: string;
  organizationName: string;
}

interface MemberRosterItem {
  id: string;
  email: string;
  status: 'invited' | 'active';
  invited_at: string; 
}

export default function MemberManagement({ organizationId, organizationName }: MemberManagementProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' }
  });

  // 1. Fetch current members for the roster layout
  const { data: members, isLoading } = useQuery<MemberRosterItem[]>({
    queryKey: ['members', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('id, email, status, invited_at')
        .eq('organization_id', organizationId)
        .order('invited_at', { ascending: true });

      if (error) throw error;
      return data as MemberRosterItem[];
    },
  });

  // 2. Mutation shifted to route through the mandatory Supabase Edge Function
  const inviteMutation = useMutation({
    mutationFn: async (formData: InviteFormData) => {
      // Client-side duplicate check to stop unnecessary network overhead
      const isDuplicate = members?.some(m => m.email.toLowerCase() === formData.email.toLowerCase());
      if (isDuplicate) {
        throw new Error('This email address has already been invited or is an active member.');
      }

      // Invoke the Edge Function directly as required by the specifications
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { 
          email: formData.email.toLowerCase(), 
          organizationId: organizationId 
        },
      });

      // Catch function deployment errors or execution layer rejections
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Instantly clear client query cache to draw new server values seamlessly
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      reset(); 
    }
  });

  const onSubmit = (data: InviteFormData) => {
    inviteMutation.mutate(data);
  };

  return (
    <div className="space-y-8 text-zinc-100 animate-in fade-in duration-200">
      <div className="border-b border-zinc-900 pb-4">
        <h2 className="text-lg font-medium text-white">{organizationName} Roster</h2>
        <p className="text-xs text-zinc-400">Manage user access control lists and invitation cycles.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Invitation Form Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-5 space-y-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-zinc-400" /> Send Team Invitation
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {inviteMutation.isError && (
                <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3 text-xs text-red-400">
                  {(inviteMutation.error as any)?.message || 'Failed to process request.'}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-zinc-300">User Email Address</Label>
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="collaborator@domain.com"
                  className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-700"
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="w-full bg-zinc-100 font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Dispatch Invite'}
              </Button>
            </form>
          </div>
        </div>

        {/* Roster Table Panel */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-zinc-500 animate-pulse">Loading workspace directory...</div>
            ) : members?.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Mail className="h-6 w-6 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">No team members registered yet</p>
                <p className="text-[11px] text-zinc-600">Invite colleagues to securely share data assets.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900/40 border-b border-zinc-900">
                  <TableRow className="hover:bg-transparent border-zinc-900">
                    <TableHead className="text-zinc-400 text-xs font-medium">Account Email</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium text-right">Status State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((member) => (
                    <TableRow key={member.id} className="border-zinc-900/60 hover:bg-zinc-900/20">
                      <TableCell className="font-medium text-xs text-zinc-200">{member.email}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide border transition-colors ${
                          member.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className={`mr-1 h-1 w-1 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {member.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}