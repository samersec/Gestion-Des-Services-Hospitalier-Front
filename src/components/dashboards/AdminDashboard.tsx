import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, TrendingUp, UserPlus, MoreVertical } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';

export const AdminDashboard = () => {
  const stats = {
    totalUsers: mockUsers.length,
    patients: mockUsers.filter(u => u.role === 'patient').length,
    medecins: mockUsers.filter(u => u.role === 'medecin').length,
    pharmaciens: mockUsers.filter(u => u.role === 'pharmacien').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground">Gérez les utilisateurs et supervisez l'hôpital</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Patients"
          value={stats.patients}
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Médecins"
          value={stats.medecins}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Pharmaciens"
          value={stats.pharmaciens}
          icon={TrendingUp}
          variant="default"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>Liste de tous les utilisateurs du système</CardDescription>
            </div>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {user.prenom[0]}{user.nom[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.prenom} {user.nom}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {user.role}
                  </span>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
