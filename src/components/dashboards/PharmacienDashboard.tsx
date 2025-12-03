import { useState, useEffect } from 'react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, ShoppingCart, Loader2 } from 'lucide-react';
import { medicamentApi, Medicament } from '@/lib/api';
import { orderApi, Order } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const PharmacienDashboard = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [medicamentsData, ordersData] = await Promise.all([
          medicamentApi.getAllMedicaments(),
          orderApi.getPendingOrders()
        ]);
        
        // Filter out archived medicaments
        const activeMedicaments = medicamentsData.filter(m => !m.archived);
        setMedicaments(activeMedicaments);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du dashboard',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate statistics
  const lowStock = medicaments.filter(m => {
    if (m.alertThreshold === undefined || m.alertThreshold === null) {
      return false;
    }
    return m.quantity <= m.alertThreshold;
  });

  const pendingOrders = orders.filter(o => o.statut === 'en_attente');

  // Handle order actions
  const handleValidateOrder = async (orderId: string) => {
    try {
      await orderApi.validateOrder(orderId);
      toast({
        title: 'Succès',
        description: 'Commande validée avec succès',
      });
      // Refresh orders
      const updatedOrders = await orderApi.getPendingOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error validating order:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de valider la commande',
        variant: 'destructive',
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir refuser cette commande ?')) {
      return;
    }
    try {
      await orderApi.rejectOrder(orderId);
      toast({
        title: 'Succès',
        description: 'Commande refusée',
      });
      // Refresh orders
      const updatedOrders = await orderApi.getPendingOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de refuser la commande',
        variant: 'destructive',
      });
    }
  };

  const getMedicamentName = (medicationId: string) => {
    const medicament = medicaments.find(m => m.id === medicationId);
    return medicament?.name || 'Médicament inconnu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pharmacie</h1>
        <p className="text-muted-foreground">Gestion du stock et des commandes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Médicaments"
          value={medicaments.length}
          icon={Package}
          variant="primary"
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alertes de Stock</CardTitle>
                <CardDescription>Médicaments sous le seuil d'alerte</CardDescription>
              </div>
              {lowStock.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/stock-alerts')}
                >
                  Voir tout
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Tous les stocks sont au niveau optimal
                </p>
              ) : (
                lowStock.slice(0, 5).map(med => {
                  const threshold = med.alertThreshold!;
                  const percentage = med.quantity > 0 ? (med.quantity / threshold) * 100 : 0;
                  return (
                    <div key={med.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {med.description || 'Aucune description'}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-warning">
                          {med.quantity} / {threshold}
                        </span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Commandes en Attente</CardTitle>
                <CardDescription>Demandes à traiter</CardDescription>
              </div>
              {pendingOrders.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/orders')}
                >
                  Voir tout
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune commande en attente
                </p>
              ) : (
                pendingOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="p-4 rounded-lg border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Commande #{order.id.slice(0, 8)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.urgence === 'urgente' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.urgence}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        Médicament: {getMedicamentName(order.medicationId)}
                      </p>
                      <p className="text-muted-foreground">Quantité: {order.quantite}</p>
                      <p className="text-muted-foreground">
                        Date: {new Date(order.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleValidateOrder(order.id)}
                      >
                        Valider
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleRejectOrder(order.id)}
                      >
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventaire Complet</CardTitle>
              <CardDescription>Liste de tous les médicaments en stock</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/inventory')}
            >
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {medicaments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun médicament dans l'inventaire
              </p>
            ) : (
              medicaments.slice(0, 5).map(med => (
                <div key={med.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.description || 'Aucune description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">{med.quantity} unités</p>
                      {med.alertThreshold !== undefined && med.alertThreshold !== null && (
                        <p className="text-xs text-muted-foreground">
                          Seuil: {med.alertThreshold}
                        </p>
                      )}
                    </div>
                    {med.price !== undefined && med.price !== null && (
                      <div className="text-right">
                        <p className="text-sm font-semibold">{med.price.toFixed(2)} DT</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
