import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { 
  LogOut, 
  User, 
  FileText,
  Pill,
  Heart,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <Users className="h-5 w-5" />;
      case 'patient': return <User className="h-5 w-5" />;
      case 'medecin': return <FileText className="h-5 w-5" />;
      case 'pharmacien': return <Pill className="h-5 w-5" />;
      case 'donnateur': return <Heart className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrateur';
      case 'patient': return 'Patient';
      case 'medecin': return 'Médecin';
      case 'pharmacien': return 'Pharmacien';
      case 'donnateur': return 'Donateur';
      default: return '';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 w-full border-b bg-card">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold hidden sm:block">HôpitalApp</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                  {getRoleIcon()}
                  <div className="text-sm">
                    <div className="font-medium">{user?.prenom} {user?.nom}</div>
                    <div className="text-xs text-muted-foreground">{getRoleLabel()}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
