import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Pill, Loader2 } from 'lucide-react';
import { orderApi, Order } from '@/lib/api';
import { medicamentApi, Medicament } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const PatientOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch validated orders for patient
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [ordersData, medicamentsData] = await Promise.all([
          orderApi.getValidatedOrdersByPatient(user.id),
          medicamentApi.getAllMedicaments()
        ]);
        
        setOrders(ordersData);
        setMedicaments(medicamentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : 'Impossible de charger les commandes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const getMedicamentName = (medicationId: string) => {
    const medicament = medicaments.find(m => m.id === medicationId);
    return medicament?.name || 'Médicament inconnu';
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
          <h1 className="text-3xl font-bold">Mes Commandes Validées</h1>
          <p className="text-muted-foreground">Consultez vos commandes de médicaments validées</p>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucune commande validée pour le moment
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map(order => {
              const medication = getMedicament(order.medicationId);

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                          <Pill className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {getMedicamentName(order.medicationId)}
                          </CardTitle>
                          <CardDescription>
                            Commande #{order.id} - Validée
                          </CardDescription>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        {order.statut}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantité</p>
                        <p className="text-lg font-semibold">{order.quantite} unités</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date de commande</p>
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

                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.urgence === 'urgente' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.urgence === 'urgente' ? '🔴 Urgente' : 'Normale'}
                      </span>
                      {order.dateCreation && (
                        <p className="text-xs text-muted-foreground">
                          Validée le {new Date(order.dateCreation).toLocaleDateString('fr-FR')}
                        </p>
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

export default PatientOrders;

