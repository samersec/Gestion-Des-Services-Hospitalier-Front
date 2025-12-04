import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  Pill, 
  Heart,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Droplet
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { user } = useAuth();
  const { open } = useSidebar();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
          { title: 'Utilisateurs', url: '/users', icon: Users },
          { title: 'Statistiques', url: '/statistics', icon: TrendingUp },
          { title: 'Gestion des Dons', url: '/donations-management', icon: DollarSign },
        ];
      case 'patient':
        return [
          { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
          { title: 'Mes Rendez-vous', url: '/appointments', icon: Calendar },
          { title: 'Mon Dossier', url: '/medical-records', icon: FileText },
        ];
      case 'medecin':
        return [
          { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
          { title: 'Mes Patients', url: '/patients', icon: Users },
          { title: 'Rendez-vous', url: '/appointments', icon: Calendar },
          { title: 'Commandes', url: '/orders', icon: ShoppingCart },
        ];
      case 'pharmacien':
        return [
          { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
          { title: 'Stock', url: '/inventory', icon: Package },
          { title: 'Commandes', url: '/orders', icon: ShoppingCart },
          { title: 'Alertes Stock', url: '/stock-alerts', icon: Pill },
          { title: 'Dons de Sang', url: '/blood-donations', icon: Droplet },
        ];
      case 'donnateur':
        return [
          { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
          { title: 'Faire un Don', url: '/new-donation', icon: Heart },
          { title: 'Mes Dons', url: '/donations', icon: DollarSign },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className={open ? 'w-64' : 'w-16'} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? 'opacity-0' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-4 border-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
