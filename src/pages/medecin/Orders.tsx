import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Pill } from 'lucide-react';
import { mockOrders, mockMedications } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Orders = () => {
  const { user } = useAuth();
  const myOrders = mockOrders.filter(o => o.medecinId === user?.id);

  const handleNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Commande créée avec succès !');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Commandes</h1>
            <p className="text-muted-foreground">Gérez vos commandes de médicaments</p>
          </div>
          
          <Dialog>
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
                  <Label htmlFor="medicament">Médicament</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un médicament" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMedications.map(med => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.nom} - Stock: {med.stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité</Label>
                  <Input 
                    id="quantite" 
                    type="number" 
                    min="1"
                    placeholder="Ex: 50"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgence">Urgence</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Créer la commande</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {myOrders.length === 0 ? (
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
            myOrders.map(order => {
              const medication = mockMedications.find(m => m.id === order.medicationId);
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
                            {medication?.nom || 'Médicament inconnu'}
                          </CardTitle>
                          <CardDescription>
                            Commande #{order.id}
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
                        <Button variant="outline" size="sm">
                          Annuler
                        </Button>
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

export default Orders;
