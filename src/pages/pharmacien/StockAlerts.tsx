import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, Loader2 } from 'lucide-react';
import { medicamentApi, Medicament } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const StockAlerts = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch medicaments and filter low stock
  const fetchMedicaments = async () => {
    try {
      setLoading(true);
      const data = await medicamentApi.getAllMedicaments();
      // Filter out archived items and get only low stock items
      const activeMedicaments = data.filter(m => !m.archived);
      
      // Filter by each medicament's alertThreshold (only include medicaments with alertThreshold set)
      const lowStockMedicaments = activeMedicaments.filter(m => {
        // Only include medicaments that have an alertThreshold defined
        if (m.alertThreshold === undefined || m.alertThreshold === null) {
          return false;
        }
        return m.quantity <= m.alertThreshold;
      });
      
      setMedicaments(lowStockMedicaments);
    } catch (error) {
      console.error('Error fetching medicaments:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de charger les alertes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicaments();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des alertes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alertes de Stock</h1>
          <p className="text-muted-foreground">Médicaments sous le seuil d'alerte</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>Médicaments en Alerte</CardTitle>
            </div>
            <CardDescription>
              {medicaments.length} médicament(s) nécessitent une attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {medicaments.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune alerte de stock - Tous les stocks sont au niveau optimal
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicaments.map(med => {
                  // Use the medicament's alertThreshold (should always be set for items in this list)
                  const threshold = med.alertThreshold!;
                  const percentage = med.quantity > 0 ? (med.quantity / threshold) * 100 : 0;
                  
                  return (
                    <div key={med.id} className="space-y-2 p-4 rounded-lg border border-warning bg-warning/5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-5 w-5 text-warning" />
                            <p className="font-medium text-lg">{med.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {med.description || 'Aucune description'}
                          </p>
                        </div>
                        <Badge variant="destructive" className="ml-4">
                          {med.quantity} / {threshold}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Stock restant</span>
                          <span className="font-medium">
                            {med.quantity} unités
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="h-3" 
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Seuil d'alerte: {threshold}</span>
                          <span>
                            {med.quantity < threshold 
                              ? `${threshold - med.quantity} unités manquantes`
                              : 'Stock critique'}
                          </span>
                        </div>
                      </div>
                      {med.price !== undefined && med.price !== null && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">
                            Prix unitaire : <span className="font-medium">{med.price.toFixed(2)} DT</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StockAlerts;

