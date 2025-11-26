import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, AlertTriangle, Plus } from 'lucide-react';
import { mockMedications } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Inventory = () => {
  const lowStock = mockMedications.filter(m => m.stock < m.seuilAlerte);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventaire Médicaments</h1>
            <p className="text-muted-foreground">Gérez le stock de la pharmacie</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un médicament
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un médicament..." className="pl-10" />
          </div>
        </div>

        {lowStock.length > 0 && (
          <Card className="border-warning">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle>Alertes de Stock</CardTitle>
              </div>
              <CardDescription>
                {lowStock.length} médicament(s) sous le seuil d'alerte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStock.map(med => {
                  const percentage = (med.stock / med.seuilAlerte) * 100;
                  return (
                    <div key={med.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{med.nom}</p>
                          <p className="text-sm text-muted-foreground">{med.categorie}</p>
                        </div>
                        <Badge variant="destructive">
                          {med.stock} / {med.seuilAlerte}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Stock Complet</CardTitle>
            <CardDescription>
              {mockMedications.length} médicaments référencés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockMedications.map(med => {
                const isLowStock = med.stock < med.seuilAlerte;
                return (
                  <div 
                    key={med.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border hover:bg-accent/5 transition-colors ${
                      isLowStock ? 'border-warning bg-warning/5' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{med.nom}</p>
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{med.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{med.stock} unités</p>
                        <p className="text-xs text-muted-foreground">{med.categorie}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{med.prix.toFixed(2)} €</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Inventory;
