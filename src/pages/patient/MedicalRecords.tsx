import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { medicalDocumentApi, MedicalDocument } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const MedicalRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await medicalDocumentApi.getMedicalDocumentsByPatient(user.id);
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching medical documents:', error);
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : 'Impossible de charger les documents',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user?.id, toast]);

  const handleDownload = async (document: MedicalDocument) => {
    try {
      setDownloadingId(document.id);
      const blob = await medicalDocumentApi.downloadMedicalDocument(document.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.titre}${document.urlFichier.substring(document.urlFichier.lastIndexOf('.'))}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Succès',
        description: 'Document téléchargé avec succès',
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors du téléchargement',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ordonnance':
        return 'Ordonnance';
      case 'analyse':
        return 'Analyse';
      case 'rapport':
        return 'Rapport';
      case 'autre':
        return 'Autre';
      default:
        return type;
    }
  };

  const getTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'ordonnance':
        return 'default';
      case 'analyse':
        return 'secondary';
      case 'rapport':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Dossier Médical</h1>
          <p className="text-muted-foreground">Consultez votre historique médical complet</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">Chargement des documents...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {documents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Aucun document médical disponible
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              documents.map(document => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{document.titre}</CardTitle>
                          <Badge variant={getTypeVariant(document.type)}>
                            {getTypeLabel(document.type)}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          Ajouté le {new Date(document.dateUpload).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownload(document)}
                        disabled={downloadingId === document.id}
                      >
                        {downloadingId === document.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {document.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{document.description}</p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => handleDownload(document)}
                      disabled={downloadingId === document.id}
                    >
                      {downloadingId === document.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Télécharger le document
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MedicalRecords;
