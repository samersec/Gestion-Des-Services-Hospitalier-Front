import { Appointment, AppointmentNote, User, AdminUser, AdminUserStatistics, Donation } from '@/types';

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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = 'Une erreur est survenue';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data: ApiResponse<T> = await response.json();

    if (data.type === 'error') {
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data as T;
  } catch (error: any) {
    // Handle network errors (connection refused, etc.)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Le serveur n\'est pas accessible. Veuillez démarrer le backend sur le port 8081.');
    }
    throw error;
  }
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

  // Forgot password - request reset code
  async forgotPassword(email: string): Promise<{ message: string; type: string; code?: string }> {
    const response = await apiCall<{ message: string; type: string; code?: string }>(
      '/users/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      false // No auth required
    );
    return response;
  },

  // Verify reset code
  async verifyResetCode(email: string, code: string): Promise<{ message: string; type: string }> {
    const response = await apiCall<{ message: string; type: string }>(
      '/users/verify-reset-code',
      {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      },
      false // No auth required
    );
    return response;
  },

  // Reset password with code
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string; type: string }> {
    const response = await apiCall<{ message: string; type: string }>(
      '/users/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ email, code, password: newPassword }),
      },
      false // No auth required
    );
    return response;
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

// Medicament API functions
export interface Medicament {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  price?: number;
  alertThreshold?: number;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicamentApiResponse {
  message: string;
  type: 'success' | 'error';
  count?: number;
  total?: number;
  data: Medicament | Medicament[];
  threshold?: number;
  searchQuery?: string;
}

export const medicamentApi = {
  // Get all medicaments
  async getAllMedicaments(): Promise<Medicament[]> {
    const response = await apiCall<MedicamentApiResponse>(
      '/medicaments',
      {},
      true // Require authentication
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get medicament by ID
  async getMedicamentById(id: string): Promise<Medicament> {
    const response = await apiCall<MedicamentApiResponse>(
      `/medicaments/${id}`,
      {},
      true
    );
    return response.data as Medicament;
  },

  // Search medicaments by name
  async searchMedicaments(name: string): Promise<Medicament[]> {
    const response = await apiCall<MedicamentApiResponse>(
      `/medicaments/search?name=${encodeURIComponent(name)}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get low stock medicaments
  async getLowStockMedicaments(threshold: number): Promise<Medicament[]> {
    const response = await apiCall<MedicamentApiResponse>(
      `/medicaments/low-stock/${threshold}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get medicament count
  async getMedicamentCount(): Promise<number> {
    const response = await apiCall<MedicamentApiResponse>(
      '/medicaments/inventory/count',
      {},
      true
    );
    return response.total || 0;
  },

  // Create medicament
  async createMedicament(medicament: {
    name: string;
    quantity: number;
    description?: string;
    price?: number;
    alertThreshold?: number;
  }): Promise<Medicament> {
    const response = await apiCall<MedicamentApiResponse>(
      '/medicaments',
      {
        method: 'POST',
        body: JSON.stringify(medicament),
      },
      true
    );
    return response.data as Medicament;
  },

  // Update medicament
  async updateMedicament(
    id: string,
    updates: {
      name?: string;
      quantity?: number;
      description?: string;
      price?: number;
      alertThreshold?: number;
    }
  ): Promise<Medicament> {
    const response = await apiCall<MedicamentApiResponse>(
      `/medicaments/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      true
    );
    return response.data as Medicament;
  },

  // Update quantity only
  async updateQuantity(id: string, quantity: number): Promise<Medicament> {
    const response = await apiCall<MedicamentApiResponse>(
      `/medicaments/${id}/quantity`,
      {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      },
      true
    );
    return response.data as Medicament;
  },

  // Archive medicament
  async archiveMedicament(id: string): Promise<Medicament> {
    const response = await apiCall<MedicamentApiResponse>(
      `/medicaments/${id}/archive`,
      {
        method: 'PUT',
      },
      true
    );
    return response.data as Medicament;
  },
};

// Order API functions
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

export interface OrderApiResponse {
  message: string;
  type: 'success' | 'error';
  count?: number;
  data: Order | Order[];
}

export const orderApi = {
  // Create order (by doctor)
  async createOrder(order: {
    medecinId: string;
    medicationId: string;
    patientId?: string;
    quantite: number;
    date?: string;
    urgence: 'normale' | 'urgente';
  }): Promise<Order> {
    const response = await apiCall<OrderApiResponse>(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(order),
      },
      true
    );
    return response.data as Order;
  },

  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    const response = await apiCall<OrderApiResponse>(
      '/orders',
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    const response = await apiCall<OrderApiResponse>(
      `/orders/${id}`,
      {},
      true
    );
    return response.data as Order;
  },

  // Get orders by medecin
  async getOrdersByMedecin(medecinId: string): Promise<Order[]> {
    const response = await apiCall<OrderApiResponse>(
      `/orders/medecin/${medecinId}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get pending orders (for pharmacist)
  async getPendingOrders(): Promise<Order[]> {
    const response = await apiCall<OrderApiResponse>(
      '/orders/pending',
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get validated orders
  async getValidatedOrders(): Promise<Order[]> {
    const response = await apiCall<OrderApiResponse>(
      '/orders/validated',
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get validated orders by patient
  async getValidatedOrdersByPatient(patientId: string): Promise<Order[]> {
    const response = await apiCall<OrderApiResponse>(
      `/orders/patient/${patientId}/validated`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Validate order (pharmacist)
  async validateOrder(id: string): Promise<Order> {
    const response = await apiCall<OrderApiResponse>(
      `/orders/${id}/validate`,
      {
        method: 'PUT',
      },
      true
    );
    return response.data as Order;
  },

  // Reject order (pharmacist)
  async rejectOrder(id: string): Promise<Order> {
    const response = await apiCall<OrderApiResponse>(
      `/orders/${id}/reject`,
      {
        method: 'PUT',
      },
      true
    );
    return response.data as Order;
  },

  // Cancel order (doctor)
  async cancelOrder(id: string): Promise<Order> {
    const response = await apiCall<OrderApiResponse>(
      `/orders/${id}/cancel`,
      {
        method: 'PUT',
      },
      true
    );
    return response.data as Order;
  },

  // Get orders by status
  async getOrdersByStatus(statut: string): Promise<Order[]> {
    const response = await apiCall<OrderApiResponse>(
      `/orders/status/${statut}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },
};

// Notification API functions
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationApiResponse {
  message: string;
  type: 'success' | 'error';
  count?: number;
  data: Notification | Notification[];
}

export const notificationApi = {
  // Get all notifications for a user
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const response = await apiCall<NotificationApiResponse>(
      `/notifications/user/${userId}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get unread notifications for a user
  async getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
    const response = await apiCall<NotificationApiResponse>(
      `/notifications/user/${userId}/unread`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    const response = await apiCall<NotificationApiResponse>(
      `/notifications/user/${userId}/unread/count`,
      {},
      true
    );
    return response.count || 0;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiCall<NotificationApiResponse>(
      `/notifications/${notificationId}/read`,
      {
        method: 'PUT',
      },
      true
    );
    return response.data as Notification;
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    await apiCall<NotificationApiResponse>(
      `/notifications/user/${userId}/read-all`,
      {
        method: 'PUT',
      },
      true
    );
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await apiCall<NotificationApiResponse>(
      `/notifications/${notificationId}`,
      {
        method: 'DELETE',
      },
      true
    );
  },
};

// Medical Document API functions
export interface MedicalDocument {
  id: string;
  titre: string;
  type: string; // ordonnance, analyse, rapport, autre
  urlFichier: string;
  dateUpload: string;
  patientId: string;
  medecinId: string;
  description?: string;
}

export interface MedicalDocumentApiResponse {
  message: string;
  type: 'success' | 'error';
  count?: number;
  data: MedicalDocument | MedicalDocument[];
}

export const medicalDocumentApi = {
  // Upload a medical document
  async uploadMedicalDocument(
    titre: string,
    type: string,
    patientId: string,
    medecinId: string,
    description: string | undefined,
    file: File
  ): Promise<MedicalDocument> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('type', type);
    formData.append('patientId', patientId);
    formData.append('medecinId', medecinId);
    if (description) {
      formData.append('description', description);
    }
    formData.append('file', file);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    // Add JWT token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type header - browser will set it automatically with boundary for FormData

    const response = await fetch(`${API_BASE_URL}/medical-documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error as JSON, but handle cases where response might not be JSON
      let errorMessage = 'Erreur lors de l\'upload du document';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } else {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse successful response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      return result.data;
    } else {
      throw new Error('Réponse inattendue du serveur');
    }
  },

  // Get all medical documents for a patient
  async getMedicalDocumentsByPatient(patientId: string): Promise<MedicalDocument[]> {
    const response = await apiCall<MedicalDocumentApiResponse>(
      `/medical-documents/patient/${patientId}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get all medical documents uploaded by a doctor
  async getMedicalDocumentsByMedecin(medecinId: string): Promise<MedicalDocument[]> {
    const response = await apiCall<MedicalDocumentApiResponse>(
      `/medical-documents/medecin/${medecinId}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Get medical documents for a patient uploaded by a specific doctor
  async getMedicalDocumentsByPatientAndMedecin(patientId: string, medecinId: string): Promise<MedicalDocument[]> {
    const response = await apiCall<MedicalDocumentApiResponse>(
      `/medical-documents/patient/${patientId}/medecin/${medecinId}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Download a medical document
  async downloadMedicalDocument(documentId: string): Promise<Blob> {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    // Add JWT token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/medical-documents/${documentId}/download`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      let errorMessage = 'Erreur lors du téléchargement du document';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } else {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.blob();
  },

  // Delete a medical document
  async deleteMedicalDocument(documentId: string): Promise<void> {
    await apiCall<MedicalDocumentApiResponse>(
      `/medical-documents/${documentId}`,
      {
        method: 'DELETE',
      },
      true
    );
  },
};

// Donation API functions
export interface DonationApiResponse {
  message: string;
  type: 'success' | 'error';
  donation?: Donation;
  data?: Donation[];
  count?: number;
}

export const donationApi = {
  // Create a new donation
  async createDonation(donation: {
    donateurId: string;
    type: 'argent' | 'materiel' | 'sang';
    montant?: number;
    description?: string;
    date?: string;
    heure?: string;
  }): Promise<Donation> {
    const response = await apiCall<DonationApiResponse>(
      '/donations',
      {
        method: 'POST',
        body: JSON.stringify(donation),
      },
      true
    );
    return response.donation!;
  },

  // Get all donations by donateur ID
  async getDonationsByDonateur(donateurId: string): Promise<Donation[]> {
    const response = await apiCall<DonationApiResponse>(
      `/donations/donateur/${donateurId}`,
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  // Get all donations (admin)
  async getAllDonations(): Promise<Donation[]> {
    const response = await apiCall<DonationApiResponse>(
      '/donations',
      {},
      true
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  // Get donation by ID
  async getDonationById(id: string): Promise<Donation> {
    const response = await apiCall<DonationApiResponse>(
      `/donations/${id}`,
      {},
      true
    );
    return response.donation!;
  },

  // Update donation status
  async updateDonationStatus(id: string, statut: 'en_attente' | 'acceptee' | 'traitee' | 'refuse'): Promise<Donation> {
    const response = await apiCall<DonationApiResponse>(
      `/donations/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ statut }),
      },
      true
    );
    return response.donation!;
  },

  // Delete a donation
  async deleteDonation(id: string): Promise<void> {
    await apiCall<DonationApiResponse>(
      `/donations/${id}`,
      {
        method: 'DELETE',
      },
      true
    );
  },
};