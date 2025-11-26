import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, X } from 'lucide-react';
import { mockOrders, mockMedications } from '@/lib/mockData';
import { toast } from 'sonner';

const PharmacienOrders = () => {
  const handleValidateOrder = (orderId: string) => {
    toast.success('Commande validée avec succès !');
  };

  const handleRejectOrder = (orderId: string) => {
    toast.error('Commande refusée');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">Validez ou refusez les demandes de médicaments</p>
        </div>

        <div className="grid gap-4">
          {mockOrders.length === 0 ? (
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
            mockOrders.map(order => {
              const medication = mockMedications.find(m => m.id === order.medicationId);
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {medication?.nom || 'Médicament inconnu'}
                        </CardTitle>
                        <CardDescription>
                          Commande #{order.id} - Médecin #{order.medecinId}
                        </CardDescription>
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
                        <p className="text-lg font-semibold">{medication?.stock || 0} unités</p>
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
                        <p className="text-sm text-muted-foreground">{medication.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Prix unitaire : {medication.prix.toFixed(2)} €
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
                          >
                            <X className="h-4 w-4" />
                            Refuser
                          </Button>
                          <Button 
                            size="sm"
                            className="gap-2"
                            onClick={() => handleValidateOrder(order.id)}
                          >
                            <Check className="h-4 w-4" />
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
