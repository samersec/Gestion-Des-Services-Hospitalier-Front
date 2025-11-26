import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';
import { mockMedicalRecords } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

const MedicalRecords = () => {
  const { user } = useAuth();
  const myRecords = mockMedicalRecords.filter(r => r.patientId === user?.id);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Dossier Médical</h1>
          <p className="text-muted-foreground">Consultez votre historique médical complet</p>
        </div>

        <div className="grid gap-6">
          {myRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun dossier médical disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            myRecords.map(record => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{record.diagnostic}</CardTitle>
                      <CardDescription className="mt-1">
                        Consultation du {new Date(record.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Traitement prescrit</h4>
                    <p className="text-sm text-muted-foreground">{record.traitement}</p>
                  </div>

                  {record.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes du médecin</h4>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}

                  {record.ordonnances.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Ordonnances</h4>
                      <div className="space-y-3">
                        {record.ordonnances.map(ord => (
                          <div key={ord.id} className="p-4 rounded-lg border bg-muted/30">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{ord.medicament}</p>
                                <p className="text-sm text-muted-foreground">
                                  Dosage : {ord.dosage}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {ord.duree}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ord.instructions}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full gap-2">
                    <Eye className="h-4 w-4" />
                    Voir les détails complets
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MedicalRecords;
