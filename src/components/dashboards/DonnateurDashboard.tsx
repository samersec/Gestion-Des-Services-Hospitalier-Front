import { useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, DollarSign, Package, Droplet, Plus } from 'lucide-react';
import { mockDonations } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DonnateurDashboard = () => {
  const { user } = useAuth();
  const myDonations = mockDonations.filter(d => d.donateurId === user?.id);
  const [donationType, setDonationType] = useState<'argent' | 'materiel' | 'sang'>('argent');

  const totalDonated = myDonations
    .filter(d => d.type === 'argent')
    .reduce((sum, d) => sum + (d.montant || 0), 0);

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Merci pour votre générosité ! Votre don a été enregistré.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Espace Donateur</h1>
        <p className="text-muted-foreground">Soutenez l'hôpital par vos dons</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Mes Dons"
          value={myDonations.length}
          icon={Heart}
          variant="primary"
        />
        <StatCard
          title="Total Donné"
          value={`${totalDonated}€`}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Impact"
          value="Excellent"
          icon={Heart}
          variant="default"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faire un Don</CardTitle>
            <CardDescription>Choisissez le type de don que vous souhaitez faire</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={donationType} onValueChange={(v) => setDonationType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="argent" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Argent
                </TabsTrigger>
                <TabsTrigger value="materiel" className="gap-2">
                  <Package className="h-4 w-4" />
                  Matériel
                </TabsTrigger>
                <TabsTrigger value="sang" className="gap-2">
                  <Droplet className="h-4 w-4" />
                  Sang
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmitDonation} className="space-y-4 mt-4">
                <TabsContent value="argent" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="montant">Montant (€)</Label>
                    <Input
                      id="montant"
                      type="number"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 250, 500].map(amount => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById('montant') as HTMLInputElement;
                          if (input) input.value = amount.toString();
                        }}
                      >
                        {amount}€
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materiel" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description du matériel</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le matériel que vous souhaitez donner..."
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sang" className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-accent" />
                      Don de sang
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Le don de sang sauve des vies. Vous pouvez prendre rendez-vous pour un don de sang.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="date-sang">Date souhaitée</Label>
                      <Input
                        id="date-sang"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Confirmer le don
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique de mes Dons</CardTitle>
            <CardDescription>Tous vos dons précédents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas encore fait de don
                  </p>
                </div>
              ) : (
                myDonations.map(donation => (
                  <div key={donation.id} className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {donation.type === 'argent' && <DollarSign className="h-4 w-4 text-success" />}
                        {donation.type === 'materiel' && <Package className="h-4 w-4 text-primary" />}
                        {donation.type === 'sang' && <Droplet className="h-4 w-4 text-accent" />}
                        <p className="font-medium capitalize">{donation.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donation.statut === 'traitee' ? 'bg-success/10 text-success' :
                        donation.statut === 'acceptee' ? 'bg-primary/10 text-primary' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {donation.statut}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {donation.type === 'argent' && `Montant: ${donation.montant}€`}
                      {donation.type === 'materiel' && donation.description}
                      {donation.type === 'sang' && 'Don de sang'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(donation.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
