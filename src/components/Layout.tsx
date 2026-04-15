import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LogOut, 
  User, 
  FileText,
  Pill,
  Heart,
  Users,
  Bell,
  Check
} from 'lucide-react';
import { notificationApi, Notification } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const [unread, count] = await Promise.all([
        notificationApi.getUnreadNotificationsByUser(user.id),
        notificationApi.getUnreadCount(user.id)
      ]);
      
      setNotifications(unread);
      setUnreadCount(count);

      // Show toast for new notifications (only for pharmacist and medecin)
      if ((user.role === 'pharmacien' || user.role === 'medecin') && count > lastNotificationCount && lastNotificationCount > 0) {
        const newNotifications = unread.slice(0, count - lastNotificationCount);
        newNotifications.forEach(notif => {
          toast({
            title: notif.title,
            description: notif.message,
          });
        });
      }
      
      setLastNotificationCount(count);
    } catch (error) {
      // Silently fail - backend might not be running or notifications endpoint might not exist
      console.error('Error fetching notifications:', error);
      // Set empty state to avoid UI issues
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Poll for notifications every 10 seconds (only for pharmacist and medecin)
  useEffect(() => {
    if (!user?.id) return;
    
    if (user.role === 'pharmacien' || user.role === 'medecin') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationApi.markAllAsRead(user.id);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Navigate based on notification type
  const handleNotificationClick = (notification: Notification) => {
    if (notification.relatedEntityType === 'order' && notification.relatedEntityId) {
      navigate('/orders');
      setIsNotificationOpen(false);
    }
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

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
                {(user?.role === 'pharmacien' || user?.role === 'medecin') && (
                  <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Notifications</h4>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Tout marquer comme lu
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-[300px]">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Aucune notification
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  notification.read 
                                    ? 'bg-card' 
                                    : 'bg-primary/5 border-primary/20'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${!notification.read ? 'text-primary' : ''}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(notification.createdAt).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                )}
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
