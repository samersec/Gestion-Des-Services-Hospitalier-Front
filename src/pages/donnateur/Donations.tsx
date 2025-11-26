import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, DollarSign, Package, Droplet, Plus } from 'lucide-react';
import { mockDonations } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Donations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myDonations = mockDonations.filter(d => d.donateurId === user?.id);

  const totalDonated = myDonations
    .filter(d => d.type === 'argent')
    .reduce((sum, d) => sum + (d.montant || 0), 0);

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
                  {myDonations.filter(d => d.statut === 'traitee').length}
                </p>
                <p className="text-sm text-muted-foreground">Dons traités</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Historique complet</h2>
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
              myDonations.map(donation => (
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
                          <CardTitle className="capitalize">{donation.type}</CardTitle>
                          <CardDescription>
                            {new Date(donation.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        donation.statut === 'traitee' ? 'bg-success/10 text-success' :
                        donation.statut === 'acceptee' ? 'bg-primary/10 text-primary' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {donation.statut}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {donation.type === 'argent' && (
                      <p className="text-2xl font-bold text-success">
                        {donation.montant}€
                      </p>
                    )}
                    {donation.type === 'materiel' && donation.description && (
                      <p className="text-sm text-muted-foreground">
                        {donation.description}
                      </p>
                    )}
                    {donation.type === 'sang' && (
                      <p className="text-sm text-muted-foreground">
                        Don de sang effectué
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Donations;
