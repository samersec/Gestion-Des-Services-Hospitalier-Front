import { useEffect, useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, Pill, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentApi, userApi, orderApi, medicalDocumentApi } from '@/lib/api';
import type { Appointment, User, Order, MedicalDocument } from '@/types';
import { useNavigate } from 'react-router-dom';

export const MedecinDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const [patientsData, appointmentsData, ordersData, documentsData] = await Promise.all([
          userApi.getMedecinPatients(user.id),
          appointmentApi.getMedecinAppointments(user.id),
          orderApi.getOrdersByMedecin(user.id),
          medicalDocumentApi.getMedicalDocumentsByMedecin(user.id),
        ]);
        setPatients(patientsData);
        setAppointments(appointmentsData);
        setOrders(ordersData);
        setMedicalDocuments(documentsData);
      } catch (e) {
        console.error('Failed to load medecin dashboard data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter today's appointments - only confirmed ones (not cancelled, not completed)
  const todaysAppointments = appointments.filter(
    a => a.date === today && a.statut === 'confirme'
  ).sort((a, b) => {
    // Sort by time
    if (a.heure && b.heure) {
      return a.heure.localeCompare(b.heure);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Espace Médecin</h1>
        <p className="text-muted-foreground">Gérez vos patients et consultations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Patients"
          value={patients.length}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="RDV Aujourd'hui"
          value={todaysAppointments.length}
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="Dossiers"
          value={medicalDocuments.length}
          icon={FileText}
          variant="success"
        />
        <StatCard
          title="Commandes"
          value={orders.filter(o => o.statut === 'en_attente').length}
          icon={Pill}
          variant="warning"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous du Jour</CardTitle>
            <CardDescription>Planning des consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucun rendez-vous aujourd'hui
                  </p>
                ) : (
                  todaysAppointments.slice(0, 5).map(apt => {
                    const patient = patients.find(p => p.id === apt.patientId);
                    const getStatutLabel = (statut: string) => {
                      switch (statut) {
                        case 'confirme': return 'Confirmé';
                        case 'en_attente': return 'En attente';
                        case 'termine': return 'Terminé';
                        default: return statut;
                      }
                    };
                    
                    return (
                      <div key={apt.id} className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{apt.motif}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              apt.statut === 'confirme' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              apt.statut === 'termine' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {getStatutLabel(apt.statut)}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {apt.heure || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {patient 
                            ? `${patient.prenom} ${patient.nom}`
                            : `Patient #${apt.patientId}`}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate('/patients')}
                        >
                          Voir le dossier
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes Médicaments</CardTitle>
            <CardDescription>Demandes en cours</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune commande en cours
                  </p>
                ) : (
                  orders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-4 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Commande #{order.id.substring(0, 8)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.statut === 'validee' ? 'bg-success/10 text-success' :
                          order.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          order.statut === 'livree' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {order.statut === 'validee' ? 'Validée' :
                           order.statut === 'en_attente' ? 'En attente' :
                           order.statut === 'livree' ? 'Livrée' :
                           order.statut}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quantité: {order.quantite}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          order.urgence === 'urgente' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {order.urgence === 'urgente' ? 'Urgente' : 'Normale'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <Button 
                  className="w-full gap-2"
                  onClick={() => navigate('/orders')}
                >
                  <Pill className="h-4 w-4" />
                  Voir toutes les commandes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
