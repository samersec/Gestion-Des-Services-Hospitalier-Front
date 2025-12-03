import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, X, Loader2, Pill } from 'lucide-react';
import { orderApi, Order } from '@/lib/api';
import { medicamentApi, Medicament } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const PharmacienOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  // Fetch pending orders and medicaments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersData, medicamentsData] = await Promise.all([
          orderApi.getPendingOrders(),
          medicamentApi.getAllMedicaments()
        ]);
        
        setOrders(ordersData);
        setMedicaments(medicamentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : 'Impossible de charger les données',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const refreshOrders = async () => {
    try {
      const ordersData = await orderApi.getPendingOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  };

  const handleValidateOrder = async (orderId: string) => {
    try {
      setProcessingOrder(orderId);
      await orderApi.validateOrder(orderId);
      
      toast({
        title: 'Succès',
        description: 'Commande validée avec succès',
      });

      // Refresh orders and medicaments (stock might have changed)
      await Promise.all([
        refreshOrders(),
        medicamentApi.getAllMedicaments().then(data => setMedicaments(data))
      ]);
    } catch (error) {
      console.error('Error validating order:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de valider la commande',
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir refuser cette commande ?')) {
      return;
    }

    try {
      setProcessingOrder(orderId);
      await orderApi.rejectOrder(orderId);
      
      toast({
        title: 'Succès',
        description: 'Commande refusée',
      });

      await refreshOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de refuser la commande',
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const getMedicament = (medicationId: string): Medicament | undefined => {
    return medicaments.find(m => m.id === medicationId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des commandes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">Validez ou refusez les demandes de médicaments</p>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucune commande à traiter
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map(order => {
              const medication = getMedicament(order.medicationId);
              const isProcessing = processingOrder === order.id;
              const hasEnoughStock = medication ? medication.quantity >= order.quantite : false;

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Pill className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {medication?.name || 'Médicament inconnu'}
                          </CardTitle>
                          <CardDescription>
                            Commande #{order.id} - Médecin #{order.medecinId}
                          </CardDescription>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.statut === 'validee' ? 'bg-success/10 text-success' :
                        order.statut === 'livree' ? 'bg-primary/10 text-primary' :
                        order.statut === 'en_attente' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {order.statut}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantité demandée</p>
                        <p className="text-lg font-semibold">{order.quantite} unités</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stock actuel</p>
                        <p className={`text-lg font-semibold ${hasEnoughStock ? 'text-success' : 'text-destructive'}`}>
                          {medication?.quantity || 0} unités
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="text-lg font-semibold">
                          {new Date(order.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {medication && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium mb-1">Information produit</p>
                        <p className="text-sm text-muted-foreground">{medication.description || 'Aucune description'}</p>
                        {medication.price !== undefined && medication.price !== null && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Prix unitaire : {medication.price.toFixed(2)} DT
                          </p>
                        )}
                      </div>
                    )}

                    {!hasEnoughStock && medication && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm font-medium text-destructive">
                          Stock insuffisant ! Stock disponible: {medication.quantity} unités
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.urgence === 'urgente' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.urgence === 'urgente' ? '🔴 Urgente' : 'Normale'}
                      </span>

                      {order.statut === 'en_attente' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2"
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Refuser
                          </Button>
                          <Button 
                            size="sm"
                            className="gap-2"
                            onClick={() => handleValidateOrder(order.id)}
                            disabled={isProcessing || !hasEnoughStock}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Valider
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PharmacienOrders;
