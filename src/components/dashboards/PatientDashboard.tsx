import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Clock, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentApi } from '@/lib/api';
import { Appointment } from '@/types';
import { toast } from 'sonner';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allAppointments, next] = await Promise.all([
        appointmentApi.getPatientAppointments(user!.id),
        appointmentApi.getNextPatientAppointment(user!.id),
      ]);
      setAppointments(allAppointments);
      setNextAppointment(next);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(a => a.statut !== 'termine' && a.statut !== 'annule');
  const pendingAppointments = appointments.filter(a => a.statut === 'en_attente');
  const completedAppointments = appointments.filter(a => a.statut === 'termine');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Espace Patient</h1>
        <p className="text-muted-foreground">Gérez vos rendez-vous et consultez votre dossier médical</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Rendez-vous à venir"
          value={upcomingAppointments.length}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Consultations"
          value={completedAppointments.length}
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="En attente"
          value={pendingAppointments.length}
          icon={Clock}
          variant="warning"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Rendez-vous</CardTitle>
                <CardDescription>Prochaine consultation</CardDescription>
              </div>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => navigate('/appointments')}
              >
                <Plus className="h-4 w-4" />
                Nouveau RDV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : nextAppointment ? (
              <div className="p-4 rounded-lg border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{nextAppointment.motif}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    nextAppointment.statut === 'confirme' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    nextAppointment.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {nextAppointment.statut === 'confirme' ? 'Confirmé' :
                     nextAppointment.statut === 'en_attente' ? 'En attente' : nextAppointment.statut}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(nextAppointment.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {nextAppointment.heure}
                  </span>
                </div>
                {nextAppointment.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{nextAppointment.notes}</p>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => navigate('/appointments')}
                >
                  Voir tous mes rendez-vous
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Aucun rendez-vous planifié
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/appointments')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Prendre un rendez-vous
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon Dossier Médical</CardTitle>
            <CardDescription>Historique de vos consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : completedAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune consultation terminée
              </p>
            ) : (
              <div className="space-y-3">
                {completedAppointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{apt.motif}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(apt.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Consultation terminée le {new Date(apt.date).toLocaleDateString('fr-FR')} à {apt.heure}
                    </p>
                    {apt.notes && (
                      <p className="text-sm text-muted-foreground italic">Note: {apt.notes}</p>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate('/medical-records')}
                    >
                      Voir les détails
                    </Button>
                  </div>
                ))}
                {completedAppointments.length > 3 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/medical-records')}
                  >
                    Voir toutes les consultations ({completedAppointments.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
