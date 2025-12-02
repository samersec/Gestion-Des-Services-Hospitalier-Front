import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCircle2, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminUserStatistics } from '@/types';
import { toast } from 'sonner';

const Statistics = () => {
  const [stats, setStats] = useState<AdminUserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getUserStatistics();
        setStats(data);
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const roleDistribution = useMemo(() => {
    if (!stats || stats.totalUsers === 0) {
      return [];
    }

    const entries = [
      { role: 'patient', count: stats.patients },
      { role: 'medecin', count: stats.medecins },
      { role: 'pharmacien', count: stats.pharmaciens },
      { role: 'autres', count: stats.totalUsers - (stats.patients + stats.medecins + stats.pharmaciens) },
    ];

    return entries.map(({ role, count }) => ({
      role,
      count,
      percentage: stats.totalUsers ? (count / stats.totalUsers) * 100 : 0,
    }));
  }, [stats]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statistiques Utilisateurs</h1>
          <p className="text-muted-foreground">Vue d'ensemble des comptes dans le système</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Utilisateurs Totaux"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Patients"
            value={stats?.patients ?? 0}
            icon={UserCircle2}
            variant="default"
          />
          <StatCard
            title="Bloqués"
            value={stats?.blockedUsers ?? 0}
            icon={ShieldAlert}
            variant="warning"
          />
          <StatCard
            title="Archivés"
            value={stats?.archivedUsers ?? 0}
            icon={ShieldCheck}
            variant="secondary"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Rôle</CardTitle>
              <CardDescription>Distribution des utilisateurs par type de compte</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Chargement des statistiques...</span>
                </div>
              ) : !stats || stats.totalUsers === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Aucune donnée utilisateur disponible pour le moment.
                </p>
              ) : (
                <div className="space-y-4">
                  {roleDistribution.map(item => (
                    <div key={item.role} className="space-y-2">
                      <div className="flex items-center justify_between text-sm">
                        <span className="capitalize font-medium">{item.role}</span>
                        <span className="text-muted-foreground">
                          {item.count} ({item.percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résumé Rapide</CardTitle>
              <CardDescription>Vue synthétique de l'état des comptes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Chargement...</span>
                </div>
              ) : !stats ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Impossible de charger les statistiques.
                </p>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Comptes actifs</p>
                      <p className="text-xs text-muted-foreground">
                        Utilisateurs non bloqués et non archivés
                      </p>
                    </div>
                    <span className="font-semibold">
                      {stats.totalUsers - stats.blockedUsers - stats.archivedUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Comptes bloqués</p>
                      <p className="text-xs text-muted-foreground">
                        Ne peuvent plus se connecter à la plateforme
                      </p>
                    </div>
                    <span className="font-semibold text-amber-600">
                      {stats.blockedUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Comptes archivés</p>
                      <p className="text-xs text-muted-foreground">
                        Conservés pour l&apos;historique mais inactifs
                      </p>
                    </div>
                    <span className="font-semibold text-slate-600">
                      {stats.archivedUsers}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
