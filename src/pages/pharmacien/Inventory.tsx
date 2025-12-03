import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Package, Search, Plus, Loader2, Edit } from 'lucide-react';
import { medicamentApi, Medicament } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface MedicamentFormData {
  name: string;
  quantity: number;
  description: string;
  price: number;
  alertThreshold: number;
}

const Inventory = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [filteredMedicaments, setFilteredMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMedicament, setEditingMedicament] = useState<Medicament | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addForm = useForm<MedicamentFormData>({
    defaultValues: {
      name: '',
      quantity: 0,
      description: '',
      price: 0,
      alertThreshold: 0,
    },
  });

  const editForm = useForm<MedicamentFormData>({
    defaultValues: {
      name: '',
      quantity: 0,
      description: '',
      price: 0,
      alertThreshold: 0,
    },
  });

  // Fetch medicaments from backend
  const fetchMedicaments = async () => {
    try {
      setLoading(true);
      const data = await medicamentApi.getAllMedicaments();
      // Filter out archived items
      const activeMedicaments = data.filter(m => !m.archived);
      setMedicaments(activeMedicaments);
      setFilteredMedicaments(activeMedicaments);
      
      const count = await medicamentApi.getMedicamentCount();
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching medicaments:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de charger les médicaments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicaments();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMedicaments(medicaments);
      return;
    }

    const searchMedicaments = async () => {
      try {
        const results = await medicamentApi.searchMedicaments(searchQuery);
        const activeResults = results.filter(m => !m.archived);
        setFilteredMedicaments(activeResults);
      } catch (error) {
        console.error('Error searching medicaments:', error);
        // On search error, filter locally as fallback
        const localResults = medicaments.filter(m =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMedicaments(localResults);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchMedicaments();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, medicaments]);

  // Handle add medicament
  const onAddSubmit = async (data: MedicamentFormData) => {
    try {
      setIsSubmitting(true);
      await medicamentApi.createMedicament({
        name: data.name.trim(),
        quantity: data.quantity,
        description: data.description.trim() || undefined,
        price: data.price > 0 ? data.price : undefined,
        alertThreshold: data.alertThreshold,
      });
      
      toast({
        title: 'Succès',
        description: 'Médicament ajouté avec succès',
      });
      
      setIsAddDialogOpen(false);
      addForm.reset();
      await fetchMedicaments();
    } catch (error) {
      console.error('Error creating medicament:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'ajouter le médicament',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit medicament
  const onEditSubmit = async (data: MedicamentFormData) => {
    if (!editingMedicament) return;

    try {
      setIsSubmitting(true);
      await medicamentApi.updateMedicament(editingMedicament.id, {
        name: data.name.trim(),
        quantity: data.quantity,
        description: data.description.trim() || undefined,
        price: data.price > 0 ? data.price : undefined,
        alertThreshold: data.alertThreshold,
      });
      
      toast({
        title: 'Succès',
        description: 'Médicament mis à jour avec succès',
      });
      
      setIsEditDialogOpen(false);
      setEditingMedicament(null);
      editForm.reset();
      await fetchMedicaments();
    } catch (error) {
      console.error('Error updating medicament:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour le médicament',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const handleEditClick = (medicament: Medicament) => {
    setEditingMedicament(medicament);
    editForm.reset({
      name: medicament.name,
      quantity: medicament.quantity,
      description: medicament.description || '',
      price: medicament.price || 0,
      alertThreshold: medicament.alertThreshold || 0,
    });
    setIsEditDialogOpen(true);
  };

  // Handle quantity update
  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      const updated = await medicamentApi.updateQuantity(id, newQuantity);
      setMedicaments(prev =>
        prev.map(m => (m.id === id ? updated : m))
      );
      setFilteredMedicaments(prev =>
        prev.map(m => (m.id === id ? updated : m))
      );
      toast({
        title: 'Succès',
        description: 'Quantité mise à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour la quantité',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des médicaments...</p>
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
            <h1 className="text-3xl font-bold">Stock</h1>
            <p className="text-muted-foreground">Gérez le stock de la pharmacie</p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Ajouter un médicament
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un médicament..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stock Complet</CardTitle>
            <CardDescription>
              {filteredMedicaments.length} médicament(s) affiché(s) sur {totalCount} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMedicaments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Aucun médicament trouvé' : 'Aucun médicament dans l\'inventaire'}
                </p>
              </div>
            ) : (
            <div className="space-y-2">
                {filteredMedicaments.map(med => {
                return (
                  <div 
                    key={med.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/5 transition-colors bg-card"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{med.name}</p>
                        </div>
                          <p className="text-sm text-muted-foreground">
                            {med.description || 'Aucune description'}
                          </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                          <p className="text-sm font-medium">{med.quantity} unités</p>
                          <p className="text-xs text-muted-foreground">Stock</p>
                      </div>
                        {med.price !== undefined && med.price !== null && (
                      <div className="text-right">
                            <p className="text-lg font-semibold">{med.price.toFixed(2)} DT</p>
                            <p className="text-xs text-muted-foreground">Prix unitaire</p>
                      </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(med)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Medicament Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un médicament</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau médicament à l'inventaire.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                rules={{ required: 'Le nom est requis' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du médicament *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Paracétamol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="quantity"
                rules={{
                  required: 'La quantité est requise',
                  min: { value: 0, message: 'La quantité doit être supérieure ou égale à 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité en stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ex: 100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre d'unités disponibles en stock
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description du médicament (optionnel)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="price"
                rules={{
                  min: { value: 0, message: 'Le prix doit être supérieur ou égal à 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (DT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 3.50"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Prix en dinars tunisiens (optionnel)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="alertThreshold"
                rules={{
                  required: 'Le seuil d\'alerte est requis',
                  min: { value: 1, message: 'Le seuil d\'alerte doit être supérieur à 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil d'alerte de stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ex: 25"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Seuil en dessous duquel une alerte sera déclenchée
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    addForm.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Medicament Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le médicament</DialogTitle>
            <DialogDescription>
              Modifiez les informations du médicament.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                rules={{ required: 'Le nom est requis' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du médicament *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Paracétamol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="quantity"
                rules={{
                  required: 'La quantité est requise',
                  min: { value: 0, message: 'La quantité doit être supérieure ou égale à 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité en stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ex: 100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre d'unités disponibles en stock
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description du médicament (optionnel)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="price"
                rules={{
                  min: { value: 0, message: 'Le prix doit être supérieur ou égal à 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (DT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 3.50"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Prix en dinars tunisiens (optionnel)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="alertThreshold"
                rules={{
                  required: 'Le seuil d\'alerte est requis',
                  min: { value: 1, message: 'Le seuil d\'alerte doit être supérieur à 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil d'alerte de stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ex: 25"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Seuil en dessous duquel une alerte sera déclenchée
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingMedicament(null);
                    editForm.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Inventory;
