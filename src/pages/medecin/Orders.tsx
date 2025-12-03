import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Pill, Loader2 } from 'lucide-react';
import { orderApi, Order } from '@/lib/api';
import { medicamentApi, Medicament } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [selectedMedicamentId, setSelectedMedicamentId] = useState<string>('');
  const [quantite, setQuantite] = useState<string>('');
  const [urgence, setUrgence] = useState<'normale' | 'urgente'>('normale');

  // Fetch orders and medicaments
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const [ordersData, medicamentsData] = await Promise.all([
          orderApi.getOrdersByMedecin(user.id),
          medicamentApi.getAllMedicaments()
        ]);
        
        // Filter active medicaments
        const activeMedicaments = medicamentsData.filter(m => !m.archived);
        setOrders(ordersData);
        setMedicaments(activeMedicaments);
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
  }, [user, toast]);

  const handleNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour créer une commande',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMedicamentId || !quantite) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newOrder = await orderApi.createOrder({
        medecinId: user.id,
        medicationId: selectedMedicamentId,
        quantite: parseInt(quantite),
        urgence: urgence,
        date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: 'Succès',
        description: 'Commande créée avec succès',
      });

      // Reset form
      setSelectedMedicamentId('');
      setQuantite('');
      setUrgence('normale');
      setIsDialogOpen(false);

      // Refresh orders
      const updatedOrders = await orderApi.getOrdersByMedecin(user.id);
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer la commande',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    try {
      await orderApi.cancelOrder(orderId);
      toast({
        title: 'Succès',
        description: 'Commande annulée avec succès',
      });

      // Refresh orders
      if (user?.id) {
        const updatedOrders = await orderApi.getOrdersByMedecin(user.id);
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'annuler la commande',
        variant: 'destructive',
      });
    }
  };

  const getMedicamentName = (medicationId: string) => {
    const medicament = medicaments.find(m => m.id === medicationId);
    return medicament?.name || 'Médicament inconnu';
  };

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case 'validee':
        return 'bg-success/10 text-success';
      case 'livree':
        return 'bg-primary/10 text-primary';
      case 'en_attente':
        return 'bg-warning/10 text-warning';
      case 'refusee':
      case 'annulee':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Commandes</h1>
            <p className="text-muted-foreground">Gérez vos commandes de médicaments</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle commande
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Commander des Médicaments</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle commande à la pharmacie
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicament">Médicament *</Label>
                  <Select 
                    required 
                    value={selectedMedicamentId}
                    onValueChange={setSelectedMedicamentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un médicament" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicaments.map(med => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} - Stock: {med.quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité *</Label>
                  <Input 
                    id="quantite" 
                    type="number" 
                    min="1"
                    placeholder="Ex: 50"
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgence">Urgence *</Label>
                  <Select 
                    required
                    value={urgence}
                    onValueChange={(value) => setUrgence(value as 'normale' | 'urgente')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer la commande'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucune commande en cours
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map(order => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Pill className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {getMedicamentName(order.medicationId)}
                        </CardTitle>
                        <CardDescription>
                          Commande #{order.id}
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.statut)}`}>
                      {order.statut}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantité</p>
                      <p className="text-lg font-semibold">{order.quantite} unités</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-lg font-semibold">
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.urgence === 'urgente' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {order.urgence === 'urgente' ? '🔴 Urgente' : 'Normale'}
                    </span>
                    {order.statut === 'en_attente' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
