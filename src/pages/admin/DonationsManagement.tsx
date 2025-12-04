import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { donationApi } from '@/lib/api';
import { Donation } from '@/types';
import { toast } from 'sonner';

const DonationsManagement = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'argent' | 'materiel'>('argent');

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    setIsLoading(true);
    try {
      const allDonations = await donationApi.getAllDonations();
      // Filter only financial and material donations with status "en_attente"
      const pendingDonations = allDonations.filter(
        d => (d.type === 'argent' || d.type === 'materiel') && d.statut === 'en_attente'
      );
      setDonations(pendingDonations);
    } catch (error: any) {
      console.error('Error loading donations:', error);
      toast.error('Erreur lors du chargement des dons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptDonation = async (donationId: string) => {
    setUpdatingId(donationId);
    try {
      await donationApi.updateDonationStatus(donationId, 'acceptee');
      toast.success('Don accepté avec succès');
      await loadDonations();
    } catch (error: any) {
      console.error('Error accepting donation:', error);
      toast.error(error.message || 'Erreur lors de l\'acceptation du don');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectDonation = async (donationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter ce don ?')) {
      return;
    }
    
    setUpdatingId(donationId);
    try {
      await donationApi.updateDonationStatus(donationId, 'refuse');
      toast.success('Don rejeté');
      await loadDonations();
    } catch (error: any) {
      console.error('Error rejecting donation:', error);
      toast.error(error.message || 'Erreur lors du rejet du don');
    } finally {
      setUpdatingId(null);
    }
  };

  const financialDonations = donations.filter(d => d.type === 'argent');
  const materialDonations = donations.filter(d => d.type === 'materiel');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Dons</h1>
          <p className="text-muted-foreground">Acceptez ou rejetez les dons financiers et matériels</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Chargement des dons...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'argent' | 'materiel')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="argent" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Dons Financiers ({financialDonations.length})
              </TabsTrigger>
              <TabsTrigger value="materiel" className="gap-2">
                <Package className="h-4 w-4" />
                Dons Matériels ({materialDonations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="argent" className="space-y-4 mt-4">
              {financialDonations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Aucun don financier en attente
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {financialDonations.map(donation => (
                    <Card key={donation.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                              <DollarSign className="h-6 w-6 text-success" />
                            </div>
                            <div>
                              <CardTitle>Don Financier</CardTitle>
                              <CardDescription>
                                {donation.dateCreation 
                                  ? new Date(donation.dateCreation).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Date non disponible'}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            En attente
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {donation.montant && (
                            <div>
                              <p className="text-sm font-medium mb-1">Montant :</p>
                              <p className="text-2xl font-bold text-success">
                                {donation.montant}€
                              </p>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAcceptDonation(donation.id)}
                              disabled={updatingId === donation.id}
                              className="flex-1 gap-2"
                            >
                              {updatingId === donation.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Accepter
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectDonation(donation.id)}
                              disabled={updatingId === donation.id}
                              className="flex-1 gap-2"
                            >
                              {updatingId === donation.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  Rejeter
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="materiel" className="space-y-4 mt-4">
              {materialDonations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Aucun don matériel en attente
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {materialDonations.map(donation => (
                    <Card key={donation.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle>Don Matériel</CardTitle>
                              <CardDescription>
                                {donation.dateCreation 
                                  ? new Date(donation.dateCreation).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Date non disponible'}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            En attente
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {donation.description && (
                            <div>
                              <p className="text-sm font-medium mb-1">Description :</p>
                              <p className="text-sm text-muted-foreground">
                                {donation.description}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAcceptDonation(donation.id)}
                              disabled={updatingId === donation.id}
                              className="flex-1 gap-2"
                            >
                              {updatingId === donation.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Accepter
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectDonation(donation.id)}
                              disabled={updatingId === donation.id}
                              className="flex-1 gap-2"
                            >
                              {updatingId === donation.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  Rejeter
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default DonationsManagement;

