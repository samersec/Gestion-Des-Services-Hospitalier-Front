import { User, Appointment, MedicalRecord, Medication, Order, Donation } from '@/types';

// Users mockés avec mot de passe "password123" pour tous
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@hopital.fr',
    nom: 'Dupont',
    prenom: 'Marie',
    role: 'admin',
    telephone: '0612345678'
  },
  {
    id: '2',
    email: 'patient@hopital.fr',
    nom: 'Martin',
    prenom: 'Pierre',
    role: 'patient',
    telephone: '0623456789'
  },
  {
    id: '3',
    email: 'medecin@hopital.fr',
    nom: 'Dubois',
    prenom: 'Sophie',
    role: 'medecin',
    telephone: '0634567890'
  },
  {
    id: '4',
    email: 'pharmacien@hopital.fr',
    nom: 'Bernard',
    prenom: 'Lucas',
    role: 'pharmacien',
    telephone: '0645678901'
  },
  {
    id: '5',
    email: 'donnateur@hopital.fr',
    nom: 'Leroy',
    prenom: 'Emma',
    role: 'donnateur',
    telephone: '0656789012'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'rdv1',
    patientId: '2',
    medecinId: '3',
    date: '2025-12-01',
    heure: '09:00',
    motif: 'Consultation générale',
    statut: 'confirme',
    notes: 'Premier rendez-vous'
  },
  {
    id: 'rdv2',
    patientId: '2',
    medecinId: '3',
    date: '2025-12-05',
    heure: '14:30',
    motif: 'Suivi traitement',
    statut: 'en_attente'
  }
];

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'dossier1',
    patientId: '2',
    medecinId: '3',
    date: '2025-11-15',
    diagnostic: 'Hypertension artérielle',
    traitement: 'Traitement antihypertenseur',
    notes: 'Patient à surveiller régulièrement',
    ordonnances: [
      {
        id: 'ord1',
        medicament: 'Amlodipine',
        dosage: '5mg',
        duree: '30 jours',
        instructions: '1 comprimé par jour le matin'
      }
    ]
  }
];

export const mockMedications: Medication[] = [
  {
    id: 'med1',
    nom: 'Paracétamol',
    description: 'Antalgique et antipyrétique',
    stock: 500,
    seuilAlerte: 100,
    prix: 3.50,
    categorie: 'Antalgique'
  },
  {
    id: 'med2',
    nom: 'Amoxicilline',
    description: 'Antibiotique à large spectre',
    stock: 45,
    seuilAlerte: 50,
    prix: 8.90,
    categorie: 'Antibiotique'
  },
  {
    id: 'med3',
    nom: 'Ibuprofène',
    description: 'Anti-inflammatoire non stéroïdien',
    stock: 300,
    seuilAlerte: 100,
    prix: 4.20,
    categorie: 'Anti-inflammatoire'
  },
  {
    id: 'med4',
    nom: 'Amlodipine',
    description: 'Inhibiteur calcique',
    stock: 25,
    seuilAlerte: 50,
    prix: 12.50,
    categorie: 'Cardiovasculaire'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'cmd1',
    medecinId: '3',
    medicationId: 'med2',
    quantite: 100,
    date: '2025-11-25',
    statut: 'en_attente',
    urgence: 'urgente'
  },
  {
    id: 'cmd2',
    medecinId: '3',
    medicationId: 'med4',
    quantite: 50,
    date: '2025-11-24',
    statut: 'validee',
    urgence: 'normale'
  }
];

export const mockDonations: Donation[] = [
  {
    id: 'don1',
    donateurId: '5',
    type: 'argent',
    montant: 500,
    date: '2025-11-20',
    statut: 'traitee'
  },
  {
    id: 'don2',
    donateurId: '5',
    type: 'materiel',
    description: 'Matériel médical - 10 lits d\'hôpital',
    date: '2025-11-22',
    statut: 'acceptee'
  }
];
