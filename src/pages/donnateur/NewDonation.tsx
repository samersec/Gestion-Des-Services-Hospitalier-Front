import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, Droplet, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { donationApi } from '@/lib/api';

const NewDonation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donationType, setDonationType] = useState<'argent' | 'materiel' | 'sang'>('argent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [dateSang, setDateSang] = useState('');
  const [heureSang, setHeureSang] = useState('');

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
      
      // Reset form
      setMontant('');
      setDescription('');
      setDateSang('');
      setHeureSang('');
      
      navigate('/donations');
    } catch (error: any) {
      console.error('Error creating donation:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement du don');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Faire un Don</h1>
          <p className="text-muted-foreground">Soutenez l'hôpital par votre générosité</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <CardTitle>Pourquoi donner ?</CardTitle>
            </div>
            <CardDescription>
              Vos dons permettent d'améliorer les soins, d'acheter du matériel médical et de sauver des vies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground">Vies sauvées</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-2xl font-bold text-accent">50k€</p>
                <p className="text-xs text-muted-foreground">Dons collectés</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-2xl font-bold text-success">100%</p>
                <p className="text-xs text-muted-foreground">Transparence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Choisissez votre type de don</CardTitle>
            <CardDescription>Sélectionnez comment vous souhaitez contribuer</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={donationType} onValueChange={(v) => setDonationType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="argent" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Don Financier
                </TabsTrigger>
                <TabsTrigger value="materiel" className="gap-2">
                  <Package className="h-4 w-4" />
                  Don Matériel
                </TabsTrigger>
                <TabsTrigger value="sang" className="gap-2">
                  <Droplet className="h-4 w-4" />
                  Don de Sang
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmitDonation} className="space-y-6 mt-6">
                <TabsContent value="argent" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="montant">Montant du don (€)</Label>
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
                        onClick={() => setMontant(amount.toString())}
                      >
                        {amount}€
                      </Button>
                    ))}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-2">Impact de votre don :</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 50€ = Fournitures médicales pour 5 patients</li>
                      <li>• 100€ = Équipement de protection pour le personnel</li>
                      <li>• 500€ = Matériel médical spécialisé</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="materiel" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description du matériel</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le matériel que vous souhaitez donner (type, quantité, état...)..."
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium mb-2">Matériel accepté :</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Équipements médicaux neufs ou en bon état</li>
                      <li>• Mobilier hospitalier</li>
                      <li>• Matériel informatique</li>
                      <li>• Fournitures de bureau</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="sang" className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-accent" />
                      Don de sang - Informations importantes
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Le don de sang sauve des vies</li>
                      <li>• Durée : environ 45 minutes</li>
                      <li>• Âge : entre 18 et 70 ans</li>
                      <li>• Poids minimum : 50 kg</li>
                      <li>• Intervalles : tous les 2 mois minimum</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-sang">Date souhaitée pour le don</Label>
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
                </TabsContent>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/donations')}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        Confirmer le don
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewDonation;
