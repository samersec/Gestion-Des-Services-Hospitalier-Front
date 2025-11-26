import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, FileText, Calendar } from 'lucide-react';
import { mockMedicalRecords, mockAppointments, mockUsers } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

const Patients = () => {
  const { user } = useAuth();
  const myRecords = mockMedicalRecords.filter(r => r.medecinId === user?.id);
  const patientIds = [...new Set(myRecords.map(r => r.patientId))];
  const myPatients = mockUsers.filter(u => patientIds.includes(u.id));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mes Patients</h1>
          <p className="text-muted-foreground">Liste de vos patients en suivi</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un patient..." className="pl-10" />
          </div>
        </div>

        <div className="grid gap-4">
          {myPatients.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun patient en suivi actuellement
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            myPatients.map(patient => {
              const patientRecords = myRecords.filter(r => r.patientId === patient.id);
              const patientAppointments = mockAppointments.filter(
                a => a.patientId === patient.id && a.medecinId === user?.id
              );
              
              return (
                <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl font-semibold text-primary">
                            {patient.prenom[0]}{patient.nom[0]}
                          </span>
                        </div>
                        <div>
                          <CardTitle>{patient.prenom} {patient.nom}</CardTitle>
                          <CardDescription>{patient.email}</CardDescription>
                        </div>
                      </div>
                      <Button variant="outline">Voir le dossier</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{patientRecords.length} Consultations</p>
                          <p className="text-xs text-muted-foreground">Dossiers médicaux</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium">{patientAppointments.length} RDV</p>
                          <p className="text-xs text-muted-foreground">Rendez-vous planifiés</p>
                        </div>
                      </div>
                    </div>
                    {patientRecords.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Dernier diagnostic :</p>
                        <p className="text-sm text-muted-foreground">
                          {patientRecords[patientRecords.length - 1].diagnostic}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Patients;
