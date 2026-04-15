export type UserRole = 'admin' | 'patient' | 'medecin' | 'pharmacien' | 'donnateur';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone?: string;
  avatar?: string;
}

// Extended user type used in admin views (matches backend UserDTO)
export interface AdminUser extends User {
  dateNaissance?: string;
  groupeSanguin?: string;
  isBlocked: boolean;
  isArchived: boolean;
}

export interface AppointmentNote {
  id: string;
  authorId: string;
  authorRole: 'patient' | 'medecin';
  message: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  medecinId: string;
  date: string;
  heure: string;
  motif: string;
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
  // Legacy general note kept for backwards compatibility
  notes?: string;
  notesHistory?: AppointmentNote[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  medecinId: string;
  date: string;
  diagnostic: string;
  traitement: string;
  notes: string;
  ordonnances: Prescription[];
}

export interface Prescription {
  id: string;
  medicament: string;
  dosage: string;
  duree: string;
  instructions: string;
}

export interface Medication {
  id: string;
  nom: string;
  description: string;
  stock: number;
  seuilAlerte: number;
  prix: number;
  categorie: string;
}

// Backend Medicament interface (matches API response)
export interface Medicament {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  price?: number;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  medecinId: string;
  medicationId: string;
  patientId?: string;
  quantite: number;
  date: string;
  statut: 'en_attente' | 'validee' | 'refusee' | 'livree' | 'annulee';
  urgence: 'normale' | 'urgente';
  dateCreation?: string;
  dateModification?: string;
}

export interface Donation {
  id: string;
  donateurId: string;
  type: 'argent' | 'materiel' | 'sang';
  montant?: number;
  description?: string;
  date?: string; // For blood donations - preferred date (YYYY-MM-DD)
  heure?: string; // For blood donations - preferred time (HH:mm)
  statut: 'en_attente' | 'acceptee' | 'traitee' | 'refuse';
  dateCreation?: string;
  dateModification?: string;
}

// Admin statistics about users
export interface AdminUserStatistics {
  totalUsers: number;
  patients: number;
  medecins: number;
  pharmaciens: number;
  blockedUsers: number;
  archivedUsers: number;
}
