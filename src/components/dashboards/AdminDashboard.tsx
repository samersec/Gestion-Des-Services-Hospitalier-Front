import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, TrendingUp, ShieldAlert, UserPlus, BarChart3, Loader2, ArrowRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminUser, AdminUserStatistics } from '@/types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminUserStatistics | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          adminApi.getUserStatistics(),
          adminApi.getAllUsers(),
        ]);

        setStats(statsResponse);
        // Garder seulement quelques utilisateurs récents (ex: 4) différentes catégories
        const limitedUsers = usersResponse.users
          .sort((a, b) => {
            if (a.isBlocked === b.isBlocked) {
              return a.prenom.localeCompare(b.prenom);
            }
            return a.isBlocked ? -1 : 1; // montrer les bloqués en premier
          })
          .slice(0, 4);
        setRecentUsers(limitedUsers);
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors du chargement du tableau de bord admin');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Administrateur</h1>
          <p className="text-muted-foreground">Supervisez les utilisateurs et l&apos;activité de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/statistics')}>
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </Button>
          <Button className="gap-2" onClick={() => navigate('/users')}>
            <UserPlus className="h-4 w-4" />
            Gérer les utilisateurs
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des données...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total Utilisateurs"
              value={stats?.totalUsers ?? 0}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Patients"
              value={stats?.patients ?? 0}
              icon={Activity}
              variant="default"
            />
            <StatCard
              title="Médecins"
              value={stats?.medecins ?? 0}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Pharmaciens"
              value={stats?.pharmaciens ?? 0}
              icon={ShieldAlert}
              variant="secondary"
            />
            <StatCard
              title="Comptes bloqués"
              value={stats?.blockedUsers ?? 0}
              icon={ShieldAlert}
              variant="warning"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Suivi des Utilisateurs</CardTitle>
                    <CardDescription>Comptes récents et statuts sensibles</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/users')}>
                    Voir tout
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Aucun utilisateur à afficher pour le moment
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{user.prenom} {user.nom}</p>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                            {user.isBlocked && (
                              <Badge variant="destructive">Bloqué</Badge>
                            )}
                            {!user.isBlocked && user.isArchived && (
                              <Badge variant="secondary">Archivé</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
                          Gérer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
