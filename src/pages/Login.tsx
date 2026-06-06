import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// shadcn/ui basic component imports
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Zod validation schema
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  fullName: z.string().optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName || 'User' },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Account created successfully! You can now sign in.');
        setIsSignUp(false);
      }
    } else {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        queryClient.clear();
        queryClient.setQueryData(['supabase-session'], authData.session);
        navigate('/dashboard');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 selection:bg-primary/30 overflow-hidden">
      {/* Background ambient light effects for premium feel */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      <div className="absolute -top-[500px] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/5 opacity-50 blur-[100px] pointer-events-none"></div>

      <Card className="relative z-10 w-full max-w-md border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp ? 'Enter your details below to get started' : 'Enter your credentials to access your dashboard'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <CardContent className="space-y-5 pb-8">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  {...register('fullName')}
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="bg-background/50 focus-visible:ring-primary/50 transition-all h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="name@example.com"
                className="bg-background/50 focus-visible:ring-primary/50 transition-all h-11"
              />
              {errors.email && <p className="text-[11px] font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register('password')}
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-background/50 focus-visible:ring-primary/50 transition-all h-11"
              />
              {errors.password && <p className="text-[11px] font-medium text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 py-6 px-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}