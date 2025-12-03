import { useEffect, useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, Pill, Clock } from 'lucide-react';
import { mockMedicalRecords, mockOrders } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentApi, userApi } from '@/lib/api';
import type { Appointment, User } from '@/types';

export const MedecinDashboard = () => {
  const { user } = useAuth();
  const myRecords = mockMedicalRecords.filter(r => r.medecinId === user?.id);
  const myOrders = mockOrders.filter(o => o.medecinId === user?.id);

  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      try {
        const [patientsData, appointmentsData] = await Promise.all([
          userApi.getMedecinPatients(user.id),
          appointmentApi.getMedecinAppointments(user.id),
        ]);
        setPatients(patientsData);
        setAppointments(appointmentsData);
      } catch (e) {
        // en cas d'erreur, on garde 0 pour les compteurs du dashboard
        console.error('Failed to load medecin dashboard data', e);
      }
    };
    loadData();
  }, [user?.id]);

  const today = new Date().toISOString().split('T')[0];
  const todaysConfirmedAppointments = appointments.filter(
    a => a.date === today && a.statut === 'confirme'
  );

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
          value={todaysConfirmedAppointments.length}
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="Dossiers"
          value={myRecords.length}
          icon={FileText}
          variant="success"
        />
        <StatCard
          title="Commandes"
          value={myOrders.filter(o => o.statut === 'en_attente').length}
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
            <div className="space-y-3">
              {todaysConfirmedAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun rendez-vous aujourd'hui
                </p>
              ) : (
                todaysConfirmedAppointments.slice(0, 5).map(apt => (
                  <div key={apt.id} className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{apt.motif}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {apt.heure}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Patient #{apt.patientId}</p>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Voir le dossier
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes Médicaments</CardTitle>
            <CardDescription>Demandes en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune commande en cours
                </p>
              ) : (
                myOrders.map(order => (
                  <div key={order.id} className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Commande #{order.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.statut === 'validee' ? 'bg-success/10 text-success' :
                        order.statut === 'en_attente' ? 'bg-warning/10 text-warning' :
                        order.statut === 'livree' ? 'bg-info/10 text-info' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {order.statut}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantité: {order.quantite}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        order.urgence === 'urgente' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.urgence}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <Button className="w-full gap-2">
                <Pill className="h-4 w-4" />
                Nouvelle commande
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
