// API Configuration and Client for MediApp Gateway
const API_BASE_URL = 'http://localhost:8550/api/v1';

// Auth state management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const getTokens = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem('access_token');
    refreshToken = localStorage.getItem('refresh_token');
  }
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// API Request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const { accessToken } = getTokens();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPatientData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId?: number;
}

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export interface Specialty {
  specialtyId: number;
  name: string;
  description?: string;
}

export interface Doctor {
  doctorId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  specialtyId: number;
  specialtyName: string;
  medicalLicenseNumber: string;
  officeAddress: string;
  rating?: number;
  reviewCount?: number;
}

export interface AvailabilitySlot {
  slotId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED';
}

export interface Appointment {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  doctorName?: string;
  patientName?: string;
  specialtyName?: string;
  slotId: number;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reason?: string;
}

export interface Notification {
  notificationId: number;
  userId: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  refresh: (token: string) =>
    apiRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: token }),
    }),

  validate: (token: string) =>
    apiRequest<{ valid: boolean }>('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};

// Users API
export const usersApi = {
  registerPatient: (data: RegisterPatientData) =>
    apiRequest<{ data: { userId: number } }>('/users/register/patient', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiRequest<User>('/users/me'),

  getUserDetails: (userId: number) => apiRequest<User>(`/users/details/${userId}`),
};

// Doctors API
export const doctorsApi = {
  getAll: (specialtyId?: number) => {
    const params = specialtyId ? `?specialtyId=${specialtyId}` : '';
    return apiRequest<Doctor[]>(`/doctors${params}`);
  },

  getById: (doctorId: number) => apiRequest<Doctor>(`/doctors/${doctorId}`),

  getSpecialties: () => apiRequest<Specialty[]>('/doctors/specialties'),

  getAvailability: (doctorId: number, from?: string, to?: string) => {
    let params = '';
    if (from && to) {
      params = `?from=${from}&to=${to}`;
    }
    return apiRequest<{ data: AvailabilitySlot[] }>(`/doctors/${doctorId}/availability${params}`);
  },

  reserveSlot: (slotId: number, reservationToken: string) =>
    apiRequest(`/doctors/availability/${slotId}/reserve`, {
      method: 'PUT',
      body: JSON.stringify({ reservationToken }),
    }),

  releaseSlot: (slotId: number) =>
    apiRequest(`/doctors/availability/${slotId}/release`, {
      method: 'PUT',
    }),
};

// Bookings API
export const bookingsApi = {
  book: (data: {
    patientId: number;
    doctorId: number;
    slotId: number;
    appointmentDate: string;
    startTime: string;
  }) =>
    apiRequest<{ appointmentId: number }>('/bookings/book', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (appointmentId: number) =>
    apiRequest<Appointment>(`/bookings/${appointmentId}`),

  getPatientAppointments: (
    patientId: number,
    page = 0,
    size = 10,
    status?: string
  ) => {
    let params = `?page=${page}&size=${size}`;
    if (status) params += `&status=${status}`;
    return apiRequest<{ content: Appointment[]; totalElements: number }>(
      `/bookings/patient/${patientId}${params}`
    );
  },

  getDoctorAppointments: (doctorId: number, date: string) =>
    apiRequest<Appointment[]>(`/bookings/doctor/${doctorId}/date/${date}`),

  confirm: (appointmentId: number) =>
    apiRequest(`/bookings/confirm/${appointmentId}`, { method: 'PUT' }),

  cancel: (appointmentId: number, reason: string) =>
    apiRequest(`/bookings/cancel/${appointmentId}?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT',
    }),
};

// Notifications API
export const notificationsApi = {
  getUserNotifications: (userId: number, page = 0, size = 10) =>
    apiRequest<{ content: Notification[] }>(
      `/notifications/user/${userId}?page=${page}&size=${size}`
    ),

  markAsRead: (notificationId: number) =>
    apiRequest(`/notifications/${notificationId}/read`, { method: 'PUT' }),

  getUnreadCount: (userId: number) =>
    apiRequest<{ count: number }>(`/notifications/user/${userId}/unread/count`),
};
