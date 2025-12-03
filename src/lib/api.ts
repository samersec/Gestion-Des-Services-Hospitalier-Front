import { Appointment, AppointmentNote, User, AdminUser, AdminUserStatistics } from '@/types';

// API configuration
const API_BASE_URL = 'http://localhost:8081/api';

// Get token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// API Response types
interface ApiResponse<T> {
  message: string;
  type: 'success' | 'error';
  [key: string]: any;
}

// Helper function for API calls with automatic token inclusion
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add JWT token if available and auth is required
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || data.type === 'error') {
    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data as T;
}

// Appointment API functions
export const appointmentApi = {
  // Create appointment (by patient)
  async createAppointment(appointment: {
    patientId: string;
    medecinId: string;
    date: string;
    heure: string;
    motif: string;
    notes?: string;
  }): Promise<Appointment> {
    const response = await apiCall<{ appointment: Appointment }>(
      '/appointments',
      {
        method: 'POST',
        body: JSON.stringify(appointment),
      },
      true // Require authentication
    );
    return response.appointment;
  },

  // Create appointment (by medecin)
  async createAppointmentByMedecin(appointment: {
    patientId: string;
    medecinId: string;
    date: string;
    heure: string;
    motif: string;
    notes?: string;
  }): Promise<Appointment> {
    const response = await apiCall<{ appointment: Appointment }>(
      '/appointments/medecin',
      {
        method: 'POST',
        body: JSON.stringify(appointment),
      },
      true // Require authentication
    );
    return response.appointment;
  },

  // Get appointments by patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const response = await apiCall<{ appointments: Appointment[] }>(
      `/appointments/patient/${patientId}`,
      {},
      true // Require authentication
    );
    return response.appointments || [];
  },

  // Get appointments by medecin
  async getMedecinAppointments(medecinId: string): Promise<Appointment[]> {
    const response = await apiCall<{ appointments: Appointment[] }>(
      `/appointments/medecin/${medecinId}`,
      {},
      true // Require authentication
    );
    return response.appointments || [];
  },

  // Update appointment status
  async updateAppointmentStatus(
    appointmentId: string,
    statut: 'en_attente' | 'confirme' | 'annule' | 'termine'
  ): Promise<Appointment> {
    const response = await apiCall<{ appointment: Appointment }>(
      `/appointments/${appointmentId}/statut`,
      {
        method: 'PUT',
        body: JSON.stringify({ statut }),
      },
      true // Require authentication
    );
    return response.appointment;
  },

  // Update appointment details (date, heure, motif, notes)
  async updateAppointmentDetails(
    appointmentId: string,
    updates: {
      date?: string;
      heure?: string;
      motif?: string;
      notes?: string | null;
    }
  ): Promise<Appointment> {
    const response = await apiCall<{ appointment: Appointment }>(
      `/appointments/${appointmentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      true
    );
    return response.appointment;
  },

  // Delete appointment
  async deleteAppointment(appointmentId: string): Promise<void> {
    await apiCall<{}>(
      `/appointments/${appointmentId}`,
      {
        method: 'DELETE',
      },
      true
    );
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    const response = await apiCall<{ appointment: Appointment }>(
      `/appointments/${appointmentId}`,
      {},
      true // Require authentication
    );
    return response.appointment;
  },

  // Get next appointment for a patient
  async getNextPatientAppointment(patientId: string): Promise<Appointment | null> {
    const response = await apiCall<{ appointment: Appointment | null }>(
      `/appointments/patient/${patientId}/next`,
      {},
      true // Require authentication
    );
    return response.appointment || null;
  },

  // Add note to appointment
  async addAppointmentNote(
    appointmentId: string,
    payload: { message: string; authorId: string; authorRole: 'patient' | 'medecin' }
  ): Promise<AppointmentNote> {
    const response = await apiCall<{ note: AppointmentNote }>(
      `/appointments/${appointmentId}/notes`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true
    );
    return response.note;
  },
};

// User & doctor-related API functions
export const userApi = {
  // Login function
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await apiCall<{ user: User; token: string }>(
      '/users/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false // Login doesn't require auth
    );
    return response;
  },

  // Get all doctors
  async getDoctors(): Promise<User[]> {
    const response = await apiCall<{ data: User[] }>(
      '/admin/users/role/medecin',
      {},
      true // Require authentication
    );
    return response.data || [];
  },

  // Get all patients
  async getPatients(): Promise<User[]> {
    const response = await apiCall<{ data: User[] }>(
      '/admin/users/role/patient',
      {},
      true // Require authentication
    );
    return response.data || [];
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    const response = await apiCall<{ data: User }>(
      `/admin/users/${userId}`,
      {},
      true // Require authentication
    );
    return response.data;
  },

  // Get patients for a specific doctor (patients that had at least one completed appointment)
  async getMedecinPatients(medecinId: string): Promise<User[]> {
    const response = await apiCall<{ patients: User[] }>(
      `/medecins/${medecinId}/patients`,
      {},
      true // Require authentication
    );
    return response.patients || [];
  },
};

// Admin API functions
export const adminApi = {
  // Get all users (for admin management)
  async getAllUsers(): Promise<{ users: AdminUser[]; total: number }> {
    const response = await apiCall<{ data: any[]; total: number }>(
      '/admin/users',
      {},
      true
    );
    const mappedUsers: AdminUser[] = (response.data || []).map((u) => ({
      id: u.id,
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      role: u.role,
      telephone: u.telephone,
      dateNaissance: u.dateNaissance,
      groupeSanguin: u.groupeSanguin,
      isBlocked: u.blocked,
      isArchived: u.archived,
    }));
    return {
      users: mappedUsers,
      total: response.total || mappedUsers.length,
    };
  },

  // Get user statistics for admin dashboard
  async getUserStatistics(): Promise<AdminUserStatistics> {
    const response = await apiCall<AdminUserStatistics>(
      '/admin/statistics',
      {},
      true
    );
    return response;
  },

  // Block a user
  async blockUser(userId: string): Promise<AdminUser> {
    const response = await apiCall<{ data: any }>(
      `/admin/users/${userId}/block`,
      {
        method: 'PUT',
      },
      true
    );
    const u = response.data;
    return {
      id: u.id,
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      role: u.role,
      telephone: u.telephone,
      dateNaissance: u.dateNaissance,
      groupeSanguin: u.groupeSanguin,
      isBlocked: u.blocked,
      isArchived: u.archived,
    };
  },

  // Unblock a user
  async unblockUser(userId: string): Promise<AdminUser> {
    const response = await apiCall<{ data: any }>(
      `/admin/users/${userId}/unblock`,
      {
        method: 'PUT',
      },
      true
    );
    const u = response.data;
    return {
      id: u.id,
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      role: u.role,
      telephone: u.telephone,
      dateNaissance: u.dateNaissance,
      groupeSanguin: u.groupeSanguin,
      isBlocked: u.blocked,
      isArchived: u.archived,
    };
  },

  // Create a new user (by admin)
  async createUser(payload: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: 'patient' | 'medecin' | 'pharmacien' | 'donnateur';
    telephone?: string;
    dateNaissance?: string;
    groupeSanguin?: string;
  }): Promise<AdminUser> {
    const response = await apiCall<{ data: any }>(
      '/admin/users',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true
    );
    const u = response.data;
    return {
      id: u.id,
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      role: u.role,
      telephone: u.telephone,
      dateNaissance: u.dateNaissance,
      groupeSanguin: u.groupeSanguin,
      isBlocked: u.blocked,
      isArchived: u.archived,
    };
  },
};
