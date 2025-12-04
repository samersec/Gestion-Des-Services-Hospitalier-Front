import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, DollarSign, Package, Droplet, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { donationApi } from '@/lib/api';
import { Donation } from '@/types';
import { toast } from 'sonner';

const Donations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Dons</h1>
            <p className="text-muted-foreground">Historique de vos contributions</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/new-donation')}>
            <Plus className="h-4 w-4" />
            Nouveau don
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Statistiques de vos dons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{myDonations.length}</p>
                <p className="text-sm text-muted-foreground">Dons effectués</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{totalDonated}€</p>
                <p className="text-sm text-muted-foreground">Total donné</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">
                  {myDonations.filter(d => d.statut === 'acceptee').length}
                </p>
                <p className="text-sm text-muted-foreground">Dons acceptés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Historique complet</h2>
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Chargement de vos dons...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myDonations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Vous n'avez pas encore fait de don
                      </p>
                      <Button onClick={() => navigate('/new-donation')}>
                        Faire votre premier don
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                myDonations.map(donation => {
                  const donationDate = donation.dateCreation 
                    ? new Date(donation.dateCreation)
                    : donation.date 
                    ? new Date(donation.date)
                    : new Date();

                  return (
                    <Card key={donation.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {donation.type === 'argent' && (
                              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-success" />
                              </div>
                            )}
                            {donation.type === 'materiel' && (
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            {donation.type === 'sang' && (
                              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Droplet className="h-6 w-6 text-accent" />
                              </div>
                            )}
                            <div>
                              <CardTitle>{getTypeLabel(donation.type)}</CardTitle>
                              <CardDescription>
                                {donationDate.toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </CardDescription>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            donation.statut === 'traitee' ? 'bg-success/10 text-success' :
                            donation.statut === 'acceptee' ? 'bg-primary/10 text-primary' :
                            donation.statut === 'refuse' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {getStatutLabel(donation.statut)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {donation.type === 'argent' && donation.montant && (
                          <p className="text-2xl font-bold text-success">
                            {donation.montant}€
                          </p>
                        )}
                        {donation.type === 'materiel' && donation.description && (
                          <div>
                            <p className="text-sm font-medium mb-1">Description :</p>
                            <p className="text-sm text-muted-foreground">
                              {donation.description}
                            </p>
                          </div>
                        )}
                        {donation.type === 'sang' && (
                          <div>
                            {donation.date && donation.heure && (
                              <p className="text-sm text-muted-foreground">
                                Date prévue : {new Date(donation.date).toLocaleDateString('fr-FR')} à {donation.heure}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              Don de sang
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Donations;
