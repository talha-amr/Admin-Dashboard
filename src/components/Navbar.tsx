import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Building2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavbarProps {
  title?: string;
  onTitleClick?: () => void;
  actions?: React.ReactNode;
}

export default function Navbar({ title = 'Workspace Console', onTitleClick, actions }: NavbarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user?.user_metadata;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate('/login');
  };

  const fullName = profile?.full_name || 'User';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onTitleClick}
            className="flex items-center gap-2 transition-colors hover:opacity-80 group text-foreground"
          >
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary transition-colors group-hover:bg-primary/20 shrink-0">
              <Building2 className="h-5 w-5 shrink-0" />
            </div>
            <span className="font-semibold tracking-tight whitespace-nowrap text-sm sm:text-base">{title}</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {actions}
          
          <div className="h-6 w-px bg-border/50 hidden sm:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-transparent">
                <Avatar className="h-9 w-9 border border-border/50 shadow-sm transition-transform hover:scale-105">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-border/50 bg-card/95 backdrop-blur-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{fullName}</p>
                  <p className="text-xs text-muted-foreground leading-none mt-1">Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
