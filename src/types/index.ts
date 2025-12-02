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

export interface Appointment {
  id: string;
  patientId: string;
  medecinId: string;
  date: string;
  heure: string;
  motif: string;
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
  notes?: string;
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

export interface Order {
  id: string;
  medecinId: string;
  medicationId: string;
  quantite: number;
  date: string;
  statut: 'en_attente' | 'validee' | 'livree' | 'annulee';
  urgence: 'normale' | 'urgente';
}

export interface Donation {
  id: string;
  donateurId: string;
  type: 'argent' | 'materiel' | 'sang';
  montant?: number;
  description?: string;
  date: string;
  statut: 'en_attente' | 'acceptee' | 'traitee';
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
