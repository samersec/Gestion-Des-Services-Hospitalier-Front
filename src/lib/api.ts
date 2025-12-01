import { Appointment, User } from '@/types';

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
};

// User API functions
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
};
