import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { mockMedications, mockOrders } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';

export const PharmacienDashboard = () => {
  const lowStock = mockMedications.filter(m => m.stock < m.seuilAlerte);
  const totalStock = mockMedications.reduce((sum, m) => sum + m.stock, 0);
  const pendingOrders = mockOrders.filter(o => o.statut === 'en_attente');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pharmacie</h1>
        <p className="text-muted-foreground">Gestion du stock et des commandes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Médicaments"
          value={mockMedications.length}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Stock Total"
          value={totalStock}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Alertes Stock"
          value={lowStock.length}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Commandes"
          value={pendingOrders.length}
          icon={ShoppingCart}
          variant="default"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertes de Stock</CardTitle>
            <CardDescription>Médicaments sous le seuil d'alerte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Tous les stocks sont au niveau optimal
                </p>
              ) : (
                lowStock.map(med => {
                  const percentage = (med.stock / med.seuilAlerte) * 100;
                  return (
                    <div key={med.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{med.nom}</p>
                          <p className="text-sm text-muted-foreground">{med.categorie}</p>
                        </div>
                        <span className="text-sm font-semibold text-warning">
                          {med.stock} / {med.seuilAlerte}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes en Attente</CardTitle>
            <CardDescription>Demandes à traiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune commande en attente
                </p>
              ) : (
                pendingOrders.map(order => (
                  <div key={order.id} className="p-4 rounded-lg border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Commande #{order.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.urgence === 'urgente' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.urgence}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">Quantité: {order.quantite}</p>
                      <p className="text-muted-foreground">Date: {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1">
                        Valider
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventaire Complet</CardTitle>
          <CardDescription>Liste de tous les médicaments en stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockMedications.map(med => (
              <div key={med.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{med.nom}</p>
                  <p className="text-sm text-muted-foreground">{med.description}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{med.stock} unités</p>
                    <p className="text-xs text-muted-foreground">{med.categorie}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{med.prix.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
