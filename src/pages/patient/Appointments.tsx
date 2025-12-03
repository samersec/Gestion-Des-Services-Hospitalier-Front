import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appointmentApi, userApi } from '@/lib/api';
import { Appointment, User } from '@/types';

const Appointments = () => {
  const { user } = useAuth();
  const isMedecin = user?.role === 'medecin';
  const isPatient = user?.role === 'patient';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [selectedMedecinId, setSelectedMedecinId] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [motif, setMotif] = useState('');

  // Edit form state
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editHeure, setEditHeure] = useState('');
  const [editMotif, setEditMotif] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Load appointments and data on mount
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isMedecin) {
        // For medecin: load medecin appointments and patients list
        const [appointmentsData, patientsData] = await Promise.all([
          appointmentApi.getMedecinAppointments(user!.id),
          userApi.getPatients(),
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData);
      } else if (isPatient) {
        // For patient: load patient appointments and doctors list
        const [appointmentsData, doctorsData] = await Promise.all([
          appointmentApi.getPatientAppointments(user!.id),
          userApi.getDoctors(),
        ]);
        setAppointments(appointmentsData);
        setDoctors(doctorsData);
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Vous devez être connecté pour créer un rendez-vous');
      return;
    }

    if (isMedecin) {
      // Medecin creates appointment: need patient selection
      if (!selectedPatientId || !date || !heure || !motif) {
        toast.error('Veuillez remplir tous les champs requis');
        return;
      }

      setIsCreating(true);
      try {
        await appointmentApi.createAppointmentByMedecin({
          patientId: selectedPatientId,
          medecinId: user.id,
          date,
          heure,
          motif,
        });

        toast.success('Rendez-vous créé avec succès !');
        
        // Reset form
        setSelectedPatientId('');
        setDate('');
        setHeure('');
        setMotif('');
        setIsDialogOpen(false);
        
        // Reload appointments
        await loadData();
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la création du rendez-vous');
      } finally {
        setIsCreating(false);
      }
    } else if (isPatient) {
      // Patient creates appointment: need medecin selection
      if (!selectedMedecinId || !date || !heure || !motif) {
        toast.error('Veuillez remplir tous les champs requis');
        return;
      }

      setIsCreating(true);
      try {
        await appointmentApi.createAppointment({
          patientId: user.id,
          medecinId: selectedMedecinId,
          date,
          heure,
          motif,
        });

        toast.success('Rendez-vous créé avec succès !');
        
        // Reset form
        setSelectedMedecinId('');
        setDate('');
        setHeure('');
        setMotif('');
        setIsDialogOpen(false);
        
        // Reload appointments
        await loadData();
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la création du rendez-vous');
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      await appointmentApi.updateAppointmentStatus(appointmentId, 'annule');
      toast.success('Rendez-vous annulé avec succès');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'annulation du rendez-vous');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Supprimer définitivement ce rendez-vous ?')) {
      return;
    }

    try {
      await appointmentApi.deleteAppointment(appointmentId);
      toast.success('Rendez-vous supprimé définitivement');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditDate(appointment.date || '');
    setEditHeure(appointment.heure || '');
    setEditMotif(appointment.motif || '');
    setEditNote('');
    setIsEditDialogOpen(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    if (!editDate || !editHeure || !editMotif) {
      toast.error('Veuillez remplir la date, l\'heure et le motif');
      return;
    }

    setIsUpdating(true);
    try {
      await appointmentApi.updateAppointmentDetails(editingAppointment.id, {
        date: editDate,
        heure: editHeure,
        motif: editMotif,
      });

      if (editNote.trim()) {
        await appointmentApi.addAppointmentNote(editingAppointment.id, {
          message: editNote.trim(),
          authorId: user.id,
          authorRole: isMedecin ? 'medecin' : 'patient',
        });
      }

      toast.success('Rendez-vous mis à jour');
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du rendez-vous');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNoteInputChange = (appointmentId: string, value: string) => {
    setNoteInputs((prev) => ({
      ...prev,
      [appointmentId]: value,
    }));
  };

  const handleAddNote = async (appointmentId: string) => {
    const message = noteInputs[appointmentId]?.trim();
    if (!message) {
      toast.error('Veuillez saisir une note');
      return;
    }
    if (!user?.id) {
      toast.error('Vous devez être connecté');
      return;
    }

    setIsAddingNoteId(appointmentId);
    try {
      await appointmentApi.addAppointmentNote(appointmentId, {
        message,
        authorId: user.id,
        authorRole: isMedecin ? 'medecin' : 'patient',
      });
      toast.success('Note ajoutée');
      setNoteInputs((prev) => ({
        ...prev,
        [appointmentId]: '',
      }));
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout de la note');
    } finally {
      setIsAddingNoteId(null);
    }
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(a => a.statut === filterStatus);

  // Helper function to get doctor name
  const getDoctorName = (medecinId: string): string => {
    const doctor = doctors.find(d => d.id === medecinId);
    if (doctor) {
      return `Dr. ${doctor.prenom} ${doctor.nom}`;
    }
    // If medecin viewing, might need to fetch doctor name
    if (isMedecin && medecinId === user?.id) {
      return `Dr. ${user.prenom} ${user.nom}`;
    }
    return `Médecin #${medecinId}`;
  };

  // Helper function to get patient name
  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient.prenom} ${patient.nom}`;
    }
    return `Patient #${patientId}`;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
            <p className="text-muted-foreground">
              {isMedecin ? 'Gérez les rendez-vous de vos patients' : 'Gérez vos consultations médicales'}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isMedecin ? 'Créer un Rendez-vous pour un Patient' : 'Prendre un Rendez-vous'}
                </DialogTitle>
                <DialogDescription>
                  {isMedecin 
                    ? 'Planifiez un rendez-vous pour un de vos patients'
                    : 'Planifiez votre prochaine consultation'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewAppointment} className="space-y-4">
                {isMedecin ? (
                  // Medecin form: show patient selection
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select 
                      value={selectedPatientId} 
                      onValueChange={setSelectedPatientId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.prenom} {patient.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  // Patient form: show medecin selection
                  <div className="space-y-2">
                    <Label htmlFor="medecin">Médecin</Label>
                    <Select 
                      value={selectedMedecinId} 
                      onValueChange={setSelectedMedecinId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un médecin" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.prenom} {doctor.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={getMinDate()}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure">Heure</Label>
                  <Input 
                    id="heure" 
                    type="time" 
                    value={heure}
                    onChange={(e) => setHeure(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motif">Motif</Label>
                  <Textarea 
                    id="motif"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Décrivez le motif de la consultation..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Confirmer le RDV'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit appointment dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le rendez-vous</DialogTitle>
              <DialogDescription>Disponible uniquement pour les rendez-vous en attente</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  min={getMinDate()}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-heure">Heure</Label>
                <Input
                  id="edit-heure"
                  type="time"
                  value={editHeure}
                  onChange={(e) => setEditHeure(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-motif">Motif</Label>
                <Textarea
                  id="edit-motif"
                  value={editMotif}
                  onChange={(e) => setEditMotif(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-note">Note (optionnel)</Label>
                <Textarea
                  id="edit-note"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Ajouter une note liée à ce rendez-vous..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

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

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Chargement...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
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
                          {isMedecin 
                            ? `Patient: ${getPatientName(apt.patientId)}`
                            : `Médecin: ${getDoctorName(apt.medecinId)}`}
                        </CardDescription>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.statut === 'confirme' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        apt.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        apt.statut === 'termine' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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
                    <div className="mt-3 space-y-2 text-sm max-h-32 overflow-y-auto pr-1">
                      {apt.notesHistory && apt.notesHistory.length > 0 ? (
                        apt.notesHistory.map((note) => {
                          const role = (note.authorRole || '').toLowerCase();
                          return (
                            <div
                              key={note.id}
                              className="rounded-md border p-2 bg-muted/40"
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={
                                    role === 'medecin'
                                      ? 'font-semibold text-sky-700'
                                      : 'font-semibold text-blue-600'
                                  }
                                >
                                  {role === 'medecin' ? 'Médecin' : 'Patient'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(note.createdAt).toLocaleString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-muted-foreground mt-1">
                                {note.message}
                              </p>
                            </div>
                          );
                        })
                      ) : apt.notes ? (
                        <p className="text-muted-foreground">Note : {apt.notes}</p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          Aucune note pour le moment
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 flex-wrap">
                      {/* Actions pour les statuts différents */}
                      {apt.statut === 'annule' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAppointment(apt.id)}
                        >
                          Supprimer
                        </Button>
                      ) : (
                        <>
                          {apt.statut === 'en_attente' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(apt)}
                            >
                              Modifier
                            </Button>
                          )}
                          {/* Le médecin peut modifier le statut uniquement si le RDV n'est pas annulé */}
                          {isMedecin && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Update status logic for medecin
                                const newStatus = apt.statut === 'en_attente' ? 'confirme' : 
                                                apt.statut === 'confirme' ? 'termine' : apt.statut;
                                if (newStatus !== apt.statut) {
                                  appointmentApi.updateAppointmentStatus(apt.id, newStatus as any)
                                    .then(() => {
                                      toast.success('Statut mis à jour');
                                      loadData();
                                    })
                                    .catch((error: any) => {
                                      toast.error(error.message || 'Erreur lors de la mise à jour');
                                    });
                                }
                              }}
                            >
                              {apt.statut === 'en_attente' ? 'Confirmer' :
                              apt.statut === 'confirme' ? 'Marquer comme terminé' :
                              'Modifier le statut'}
                            </Button>
                          )}

                          {/* Annulation :
                             - Patient : peut annuler uniquement en attente
                             - Médecin : peut annuler en attente ou confirmé, mais pas terminé/annulé */}
                          {(
                            (apt.statut === 'en_attente') ||
                            (isMedecin && (apt.statut === 'confirme'))
                          ) && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancelAppointment(apt.id)}
                            >
                              Annuler
                            </Button>
                          )}
                        </>
                      )}

                      {apt.statut === 'termine' && isPatient && (
                        <Button variant="outline" size="sm">
                          Voir le compte-rendu
                        </Button>
                      )}
                    </div>
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

export default Appointments;
