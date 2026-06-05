import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 1. Dynamic Zod Validation Schema
const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters.'),
  type: z.enum(['School', 'Nonprofit', 'Business']),
  school_district: z.string().optional(),
}).refine((data) => {
  // If the type is School, make sure school_district is not empty
  if (data.type === 'School' && (!data.school_district || data.school_district.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'School district name is required for school organizations.',
  path: ['school_district'], // Attaches the error to the correct field input
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface CreateOrganizationFormProps {
  onSuccess: () => void;
}

export default function CreateOrganizationForm({ onSuccess }: CreateOrganizationFormProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      school_district: '',
    }
  });

  // Watch the "type" field to conditionally render the school district input
  const selectedType = watch('type');

  // 2. TanStack Query Mutation for saving to Supabase
  const mutation = useMutation({
    mutationFn: async (formData: OrganizationFormData) => {
      // Get current authenticated user ID from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User session not found.');

      const { data, error } = await supabase.from('organizations').insert({
        name: formData.name,
        type: formData.type,
        school_district: formData.type === 'School' ? formData.school_district : null,
        created_by: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refresh the organization list query instantly across the app
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onSuccess();
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-zinc-100">
      {mutation.isError && (
        <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3 text-xs text-red-400">
          {mutation.error instanceof Error ? mutation.error.message : 'An error occurred while saving.'}
        </div>
      )}

      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs text-zinc-300">Organization Name</Label>
        <Input
          {...register('name')}
          id="name"
          placeholder="Acme Corporation"
          className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-700"
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
      </div>

      {/* Organization Type Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-xs text-zinc-300">Organization Type</Label>
        <Select onValueChange={(value: 'School' | 'Nonprofit' | 'Business') => setValue('type', value, { shouldValidate: true })}>
          <SelectTrigger className="border-zinc-800 bg-zinc-950 text-zinc-100">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Nonprofit">Nonprofit</SelectItem>
            <SelectItem value="School">School</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
      </div>

      {/* Conditional School District Input */}
      {selectedType === 'School' && (
        <div className="space-y-2">
          <Label htmlFor="school_district" className="text-xs text-zinc-300">School District</Label>
          <Input
            {...register('school_district')}
            id="school_district"
            placeholder="District 5"
            className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-700"
          />
          {errors.school_district && <p className="text-xs text-red-400">{errors.school_district.message}</p>}
        </div>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-zinc-100 font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
      >
        {mutation.isPending ? 'Creating...' : 'Create Organization'}
      </Button>
    </form>
  );
}