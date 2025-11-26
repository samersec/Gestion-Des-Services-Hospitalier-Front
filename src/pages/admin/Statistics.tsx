import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Heart, TrendingUp } from 'lucide-react';
import { mockUsers, mockAppointments, mockDonations, mockMedications } from '@/lib/mockData';

const Statistics = () => {
  const stats = {
    totalUsers: mockUsers.length,
    totalAppointments: mockAppointments.length,
    totalDonations: mockDonations.length,
    lowStockItems: mockMedications.filter(m => m.stock < m.seuilAlerte).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statistiques Globales</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité hospitalière</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Utilisateurs Total"
            value={stats.totalUsers}
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Rendez-vous"
            value={stats.totalAppointments}
            icon={Calendar}
            variant="success"
          />
          <StatCard
            title="Dons Reçus"
            value={stats.totalDonations}
            icon={Heart}
            variant="default"
          />
          <StatCard
            title="Alertes Stock"
            value={stats.lowStockItems}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Rôle</CardTitle>
              <CardDescription>Distribution des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['admin', 'patient', 'medecin', 'pharmacien', 'donnateur'].map(role => {
                  const count = mockUsers.filter(u => u.role === role).length;
                  const percentage = (count / mockUsers.length) * 100;
                  return (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{role}</span>
                        <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Dernières actions dans le système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouveau rendez-vous</p>
                    <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouvel utilisateur inscrit</p>
                    <p className="text-xs text-muted-foreground">Il y a 5 heures</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouveau don reçu</p>
                    <p className="text-xs text-muted-foreground">Il y a 1 jour</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
