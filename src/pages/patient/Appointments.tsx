import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, Filter } from 'lucide-react';
import { mockAppointments } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Appointments = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const myAppointments = mockAppointments.filter(a => a.patientId === user?.id);

  const filteredAppointments = filterStatus === 'all' 
    ? myAppointments 
    : myAppointments.filter(a => a.statut === filterStatus);

  const handleNewAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Rendez-vous créé avec succès !');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
            <p className="text-muted-foreground">Gérez vos consultations médicales</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Prendre un Rendez-vous</DialogTitle>
                <DialogDescription>
                  Planifiez votre prochaine consultation
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medecin">Médecin</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un médecin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Dr. Dubois Sophie</SelectItem>
                      <SelectItem value="6">Dr. Martin Jean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure">Heure</Label>
                  <Input id="heure" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motif">Motif</Label>
                  <Textarea 
                    id="motif" 
                    placeholder="Décrivez le motif de votre consultation..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Confirmer le RDV</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="confirme">Confirmé</SelectItem>
              <SelectItem value="termine">Terminé</SelectItem>
              <SelectItem value="annule">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  Aucun rendez-vous trouvé
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map(apt => (
              <Card key={apt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{apt.motif}</CardTitle>
                      <CardDescription className="mt-1">
                        Médecin #{apt.medecinId}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.statut === 'confirme' ? 'bg-success/10 text-success' :
                      apt.statut === 'en_attente' ? 'bg-warning/10 text-warning' :
                      apt.statut === 'termine' ? 'bg-primary/10 text-primary' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {apt.statut === 'confirme' ? 'Confirmé' :
                       apt.statut === 'en_attente' ? 'En attente' :
                       apt.statut === 'termine' ? 'Terminé' : 'Annulé'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(apt.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{apt.heure}</span>
                    </div>
                  </div>
                  {apt.notes && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Note : {apt.notes}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    {apt.statut === 'en_attente' && (
                      <>
                        <Button variant="outline" size="sm">Modifier</Button>
                        <Button variant="destructive" size="sm">Annuler</Button>
                      </>
                    )}
                    {apt.statut === 'termine' && (
                      <Button variant="outline" size="sm">Voir le compte-rendu</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
