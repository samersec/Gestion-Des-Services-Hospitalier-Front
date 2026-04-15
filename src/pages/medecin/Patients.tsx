import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, FileText, Calendar, Upload, Loader2, Download, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentApi, userApi, medicalDocumentApi, type MedicalDocument } from '@/lib/api';
import type { Appointment, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:8081/api';

const Patients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [patientDocuments, setPatientDocuments] = useState<MedicalDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // Form state
  const [titre, setTitre] = useState('');
  const [type, setType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

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
        // Keep UI graceful on error; errors are handled globally where apiCall throws
        console.error('Failed to load medecin patients or appointments', e);
      }
    };
    loadData();
  }, [user?.id]);

  const filteredPatients = patients.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.nom.toLowerCase().includes(term) ||
      p.prenom.toLowerCase().includes(term) ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(term)
    );
  });

  const loadPatientDocuments = async (patientId: string) => {
    setIsLoadingDocuments(true);
    try {
      const documents = await medicalDocumentApi.getMedicalDocumentsByPatient(patientId);
      setPatientDocuments(documents);
    } catch (error) {
      console.error('Error loading patient documents:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les documents du patient',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleOpenDialog = async (patient: User) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
    // Reset form
    setTitre('');
    setType('');
    setDescription('');
    setFile(null);
    // Load patient documents
    await loadPatientDocuments(patient.id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPatient(null);
    setTitre('');
    setType('');
    setDescription('');
    setFile(null);
    setPatientDocuments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !user?.id || !file || !titre || !type) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      await medicalDocumentApi.uploadMedicalDocument(
        titre,
        type,
        selectedPatient.id,
        user.id,
        description || undefined,
        file
      );
      
      toast({
        title: 'Succès',
        description: 'Document médical ajouté avec succès',
      });
      
      // Reload documents and reset form
      if (selectedPatient) {
        await loadPatientDocuments(selectedPatient.id);
      }
      setTitre('');
      setType('');
      setDescription('');
      setFile(null);
    } catch (error) {
      console.error('Error uploading medical document:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'upload du document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

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
            <Input
              placeholder="Rechercher un patient..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
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
            filteredPatients.map(patient => {
              const patientAppointments = appointments.filter(
                a => a.patientId === patient.id && a.medecinId === user?.id
              );
              const patientConsultations = patientAppointments.filter(
                a => a.statut === 'termine'
              );
              const patientConfirmedRdv = patientAppointments.filter(
                a => a.statut === 'confirme'
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
                      <Button 
                        variant="outline"
                        onClick={() => handleOpenDialog(patient)}
                      >
                        Voir le dossier
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{patientConsultations.length} Consultations</p>
                          <p className="text-xs text-muted-foreground">Statut terminé</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium">{patientConfirmedRdv.length} RDV</p>
                          <p className="text-xs text-muted-foreground">Statut confirmé</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Patient Dossier Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dossier médical - {selectedPatient?.prenom} {selectedPatient?.nom}</DialogTitle>
              <DialogDescription>
                Consultez et gérez les documents médicaux de ce patient
              </DialogDescription>
            </DialogHeader>
            
            {/* Existing Documents List */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Documents existants</h3>
                {isLoadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Chargement des documents...</span>
                  </div>
                ) : patientDocuments.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-muted/30">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun document médical pour ce patient</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {patientDocuments.map((doc) => (
                      <Card key={doc.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-primary" />
                              <p className="font-medium">{doc.titre}</p>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                {doc.type}
                              </span>
                            </div>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground mb-1">{doc.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Ajouté le {new Date(doc.dateUpload).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.open(`${API_BASE_URL}/medical-documents/${doc.id}/download`, '_blank');
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t my-4" />

              {/* Add New Document Form */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Ajouter un nouveau document</h3>
                <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titre">Titre du document *</Label>
                  <Input
                    id="titre"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Ex: Ordonnance du 15/01/2024"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Type de document *</Label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordonnance">Ordonnance</SelectItem>
                      <SelectItem value="analyse">Analyse</SelectItem>
                      <SelectItem value="rapport">Rapport</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ajouter une description du document..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">Fichier *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required
                      className="cursor-pointer"
                    />
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Fichier sélectionné: {file.name}
                    </p>
                  )}
                </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                      disabled={isUploading}
                    >
                      Fermer
                    </Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Ajouter le document
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Patients;

