import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Clock, Plus } from 'lucide-react';
import { mockAppointments, mockMedicalRecords } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const myAppointments = mockAppointments.filter(a => a.patientId === user?.id);
  const myRecords = mockMedicalRecords.filter(r => r.patientId === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Espace Patient</h1>
        <p className="text-muted-foreground">Gérez vos rendez-vous et consultez votre dossier médical</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Rendez-vous à venir"
          value={myAppointments.filter(a => a.statut !== 'termine').length}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Consultations"
          value={myRecords.length}
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="En attente"
          value={myAppointments.filter(a => a.statut === 'en_attente').length}
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
                <CardDescription>Prochaines consultations</CardDescription>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau RDV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun rendez-vous planifié
                </p>
              ) : (
                myAppointments.map(apt => (
                  <div key={apt.id} className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{apt.motif}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.statut === 'confirme' ? 'bg-success/10 text-success' :
                        apt.statut === 'en_attente' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {apt.statut === 'confirme' ? 'Confirmé' :
                         apt.statut === 'en_attente' ? 'En attente' : apt.statut}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(apt.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {apt.heure}
                      </span>
                    </div>
                    {apt.notes && (
                      <p className="text-sm text-muted-foreground">{apt.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon Dossier Médical</CardTitle>
            <CardDescription>Historique de vos consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun dossier médical
                </p>
              ) : (
                myRecords.map(record => (
                  <div key={record.id} className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{record.diagnostic}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.traitement}</p>
                    {record.ordonnances.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium mb-1">Ordonnances:</p>
                        {record.ordonnances.map(ord => (
                          <p key={ord.id} className="text-xs text-muted-foreground">
                            • {ord.medicament} - {ord.dosage}
                          </p>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Voir les détails
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
