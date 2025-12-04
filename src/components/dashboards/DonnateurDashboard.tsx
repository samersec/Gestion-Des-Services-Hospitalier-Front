import { useState, useEffect } from 'react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, DollarSign, Package, Droplet, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { donationApi } from '@/lib/api';
import { Donation } from '@/types';

export const DonnateurDashboard = () => {
  const { user } = useAuth();
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationType, setDonationType] = useState<'argent' | 'materiel' | 'sang'>('argent');

  // Form states
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [dateSang, setDateSang] = useState('');
  const [heureSang, setHeureSang] = useState('');

  useEffect(() => {
    const loadDonations = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const donations = await donationApi.getDonationsByDonateur(user.id);
        setMyDonations(donations);
      } catch (error: any) {
        console.error('Error loading donations:', error);
        toast.error('Erreur lors du chargement de vos dons');
      } finally {
        setIsLoading(false);
      }
    };

    loadDonations();
  }, [user?.id]);

  const totalDonated = myDonations
    .filter(d => d.type === 'argent')
    .reduce((sum, d) => sum + (d.montant || 0), 0);

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Vous devez être connecté pour faire un don');
      return;
    }

    // Validate based on donation type
    if (donationType === 'argent') {
      if (!montant || parseFloat(montant) <= 0) {
        toast.error('Veuillez entrer un montant valide');
        return;
      }
    } else if (donationType === 'materiel') {
      if (!description || description.trim().length === 0) {
        toast.error('Veuillez décrire le matériel que vous souhaitez donner');
        return;
      }
    } else if (donationType === 'sang') {
      if (!dateSang || !heureSang) {
        toast.error('Veuillez sélectionner une date et une heure pour le don de sang');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const donationData: any = {
        donateurId: user.id,
        type: donationType,
      };

      if (donationType === 'argent') {
        donationData.montant = parseFloat(montant);
      } else if (donationType === 'materiel') {
        donationData.description = description.trim();
      } else if (donationType === 'sang') {
        donationData.date = dateSang;
        donationData.heure = heureSang;
      }

      await donationApi.createDonation(donationData);
      
      toast.success('Merci pour votre générosité ! Votre don a été enregistré.');
      
      // Reload donations
      const donations = await donationApi.getDonationsByDonateur(user.id);
      setMyDonations(donations);
      
      // Reset form
      setMontant('');
      setDescription('');
      setDateSang('');
      setHeureSang('');
    } catch (error: any) {
      console.error('Error creating donation:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement du don');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'argent':
        return 'Don Financier';
      case 'materiel':
        return 'Don Matériel';
      case 'sang':
        return 'Don de Sang';
      default:
        return type;
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'acceptee':
        return 'Acceptée';
      case 'traitee':
        return 'Traitée';
      case 'refuse':
        return 'Refusée';
      default:
        return statut;
    }
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
          title="Dons Acceptés"
          value={myDonations.filter(d => d.statut === 'acceptee').length}
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
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
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
                        onClick={() => setMontant(amount.toString())}
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                        min={new Date().toISOString().split('T')[0]}
                        value={dateSang}
                        onChange={(e) => setDateSang(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heure-sang">Heure souhaitée</Label>
                      <Input
                        id="heure-sang"
                        type="time"
                        value={heureSang}
                        onChange={(e) => setHeureSang(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Confirmer le don
                    </>
                  )}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {myDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Vous n'avez pas encore fait de don
                    </p>
                  </div>
                ) : (
                  myDonations.slice(0, 5).map(donation => {
                    const donationDate = donation.dateCreation 
                      ? new Date(donation.dateCreation)
                      : donation.date 
                      ? new Date(donation.date)
                      : new Date();

                    return (
                      <div key={donation.id} className="p-4 rounded-lg border bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {donation.type === 'argent' && <DollarSign className="h-4 w-4 text-success" />}
                            {donation.type === 'materiel' && <Package className="h-4 w-4 text-primary" />}
                            {donation.type === 'sang' && <Droplet className="h-4 w-4 text-accent" />}
                            <p className="font-medium">{getTypeLabel(donation.type)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donation.statut === 'traitee' ? 'bg-success/10 text-success' :
                            donation.statut === 'acceptee' ? 'bg-primary/10 text-primary' :
                            donation.statut === 'refuse' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {getStatutLabel(donation.statut)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {donation.type === 'argent' && donation.montant && `Montant: ${donation.montant}€`}
                          {donation.type === 'materiel' && donation.description && donation.description}
                          {donation.type === 'sang' && (
                            donation.date && donation.heure 
                              ? `Date prévue: ${new Date(donation.date).toLocaleDateString('fr-FR')} à ${donation.heure}`
                              : 'Don de sang'
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {donationDate.toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
