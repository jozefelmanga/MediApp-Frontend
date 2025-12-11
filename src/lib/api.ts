// API Configuration and Client for MediApp Gateway
// Prefer Vite env vars so the app can be pointed at the Gateway used in Postman.
// - `VITE_GATEWAY_URL` should contain the gateway (e.g. http://localhost:8550)
// - `VITE_API_BASE_URL` can override the full base (e.g. http://localhost:8550/api/v1)
const GATEWAY_URL =
  (import.meta as any).env?.VITE_GATEWAY_URL || "http://localhost:8550";
// Prefer explicit full base when provided. Otherwise default to a relative
// `/api/v1` so Vite dev server can proxy requests and avoid CORS.
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "/api/v1";
// Admin token used by some admin-only endpoints (can be provided via env or stored in localStorage)
const ADMIN_TOKEN =
  (import.meta as any).env?.VITE_ADMIN_TOKEN ||
  localStorage.getItem("admin_token") ||
  "change-me";

// Auth state management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh?: string) => {
  accessToken = access;
  localStorage.setItem("access_token", access);

  if (refresh) {
    refreshToken = refresh;
    localStorage.setItem("refresh_token", refresh);
  } else {
    refreshToken = null;
    localStorage.removeItem("refresh_token");
  }
};

export const getTokens = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem("access_token");
    refreshToken = localStorage.getItem("refresh_token");
  }
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// API Request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const { accessToken } = getTokens();

  // Merge headers: include Authorization if available, but only set
  // Content-Type when a body is present and the caller didn't already set it.
  const baseHeaders: Record<string, string> = {
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  const providedHeaders: Record<string, string> = {};
  if (options.headers) {
    // Normalize HeadersInit into an object
    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => (providedHeaders[k] = v));
    } else if (Array.isArray(options.headers)) {
      (options.headers as [string, string][]).forEach(
        ([k, v]) => (providedHeaders[k] = v)
      );
    } else {
      Object.assign(providedHeaders, options.headers as Record<string, string>);
    }
  }

  const mergedHeaders: Record<string, string> = {
    ...baseHeaders,
    ...providedHeaders,
  };

  const hasContentType = Object.keys(mergedHeaders).some(
    (k) => k.toLowerCase() === "content-type"
  );
  if (!hasContentType && options.body != null) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  const headers: HeadersInit = mergedHeaders;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses (204 No Content) and non-JSON responses gracefully
  if (response.status === 204) return undefined as unknown as T;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    // try to coerce to JSON if possible
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
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
  role: "PATIENT" | "DOCTOR" | "ADMIN";
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
}

export interface AvailabilitySlot {
  slotId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "RESERVED" | "BOOKED";
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
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
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
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  refresh: (token: string) =>
    apiRequest<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    }),

  validate: (token: string) =>
    apiRequest<{ valid: boolean }>("/auth/validate", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
};

// Users API
export const usersApi = {
  registerPatient: (data: RegisterPatientData) =>
    apiRequest<{ data: { userId: number } }>("/users/register/patient", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  registerDoctor: (data: any) =>
    apiRequest<{ data: { userId: number } }>("/users/register/doctor", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "X-Admin-Token": ADMIN_TOKEN,
      },
    }),

  getProfile: async () => {
    const res = await apiRequest<any>("/users/me");
    return res && res.data ? (res.data as User) : (res as User);
  },

  getUserDetails: async (userId: number) => {
    const res = await apiRequest<any>(`/users/details/${userId}`);
    return res && res.data ? (res.data as User) : (res as User);
  },

  getAllPatients: async (page = 0, size = 50) => {
    const res = await apiRequest<any>(
      `/users/all/patients?page=${page}&size=${size}`
    );
    if (!res) return [] as User[];
    // Normalize paginated or raw shapes into an array of users
    let items: any[] = [];
    if (Array.isArray(res)) items = res;
    else if (res.data && Array.isArray(res.data)) items = res.data;
    else if (res.data && res.data.content && Array.isArray(res.data.content))
      items = res.data.content;
    else if (res.content && Array.isArray(res.content)) items = res.content;

    const mapped: User[] = (items || []).map((it) => ({
      userId: it.userId ?? it.patientId ?? it.id,
      email: it.email,
      firstName: it.firstName,
      lastName: it.lastName,
      phoneNumber: it.phoneNumber,
      dateOfBirth: it.dateOfBirth,
      role: it.role ?? "PATIENT",
    }));

    return mapped;
  },

  getAllDoctors: async (page = 0, size = 50) => {
    const res = await apiRequest<any>(
      `/users/all/doctors?page=${page}&size=${size}`
    );
    if (!res) return [] as User[];
    let items: any[] = [];
    if (Array.isArray(res)) items = res;
    else if (res.data && Array.isArray(res.data)) items = res.data;
    else if (res.data && res.data.content && Array.isArray(res.data.content))
      items = res.data.content;
    else if (res.content && Array.isArray(res.content)) items = res.content;

    const mapped: User[] = (items || []).map((it) => ({
      userId: it.userId ?? it.doctorId ?? it.id,
      email: it.email,
      firstName: it.firstName,
      lastName: it.lastName,
      phoneNumber: it.phoneNumber,
      dateOfBirth: it.dateOfBirth,
      role: it.role ?? "DOCTOR",
    }));

    return mapped;
  },
};

// Doctors API
export const doctorsApi = {
  getAll: (specialtyId?: number) => {
    const params = specialtyId ? `?specialtyId=${specialtyId}` : "";
    return apiRequest<any>(`/doctors${params}`).then((res) =>
      res && res.data ? (res.data as Doctor[]) : (res as Doctor[])
    );
  },

  getById: (doctorId: number) =>
    apiRequest<any>(`/doctors/${doctorId}`).then((res) =>
      res && res.data ? (res.data as Doctor) : (res as Doctor)
    ),

  getSpecialties: () =>
    apiRequest<any>("/doctors/specialties").then((res) =>
      res && res.data ? (res.data as Specialty[]) : (res as Specialty[])
    ),

  getAvailability: (doctorId: number, from?: string, to?: string) => {
    let params = "";
    if (from && to) {
      params = `?from=${from}&to=${to}`;
    }
    return apiRequest<any>(`/doctors/${doctorId}/availability${params}`).then(
      (res) => {
        const items: any[] = res && res.data ? res.data : res || [];
        // Normalize server shape: server returns `reserved: boolean`; map to `status`
        const normalized: AvailabilitySlot[] = items.map((it) => ({
          slotId: it.slotId,
          doctorId: it.doctorId,
          startTime: it.startTime,
          endTime: it.endTime,
          status: it.reserved === false ? "AVAILABLE" : "RESERVED",
        }));
        return { data: normalized } as { data: AvailabilitySlot[] };
      }
    );
  },

  reserveSlot: (slotId: number, reservationToken: string) =>
    apiRequest(`/doctors/availability/${slotId}/reserve`, {
      method: "PUT",
      body: JSON.stringify({ reservationToken }),
    }),

  releaseSlot: (slotId: number) =>
    apiRequest(`/doctors/availability/${slotId}/release`, {
      method: "PUT",
    }),

  createProfile: (data: {
    userId: number;
    medicalLicenseNumber: string;
    specialtyId: number;
    officeAddress: string;
  }) =>
    apiRequest(`/doctors/profiles`, {
      method: "POST",
      body: JSON.stringify(data),
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
    apiRequest<{ appointmentId: number }>("/bookings/book", {
      method: "POST",
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
    apiRequest(`/bookings/confirm/${appointmentId}`, { method: "PUT" }),

  cancel: (appointmentId: number, reason: string) =>
    apiRequest(
      `/bookings/cancel/${appointmentId}?reason=${encodeURIComponent(reason)}`,
      {
        method: "PUT",
      }
    ),
};

// Notifications API
export const notificationsApi = {
  getUserNotifications: (userId: number, page = 0, size = 10) =>
    apiRequest<any>(
      `/notifications/user/${userId}?page=${page}&size=${size}`
    ).then((res) => {
      // Server may return either a paginated wrapper { content: [...] }
      // or a plain array of notification logs. Normalize both shapes
      // into { content: Notification[] } where Notification matches
      // the frontend interface.
      let items: any[] = [];
      if (!res) return { content: [] };
      if (Array.isArray(res)) {
        items = res;
      } else if (res.data && Array.isArray(res.data)) {
        items = res.data;
      } else if (res.content && Array.isArray(res.content)) {
        items = res.content;
      } else if (res.items && Array.isArray(res.items)) {
        items = res.items;
      }

      const mapped: Notification[] = items.map((it) => ({
        notificationId: it.logId ?? it.notificationId ?? it.id,
        userId: it.recipientUserId ?? it.userId,
        // Prefer server-provided message when available; fall back to messageType
        message:
          it.message || it.body || it.text || String(it.messageType || ""),
        type: it.messageType || it.type || "UNKNOWN",
        read: !!it.read,
        createdAt: it.sentAt || it.createdAt || it.timestamp || null,
      }));

      return { content: mapped } as { content: Notification[] };
    }),

  markAsRead: (notificationId: number) =>
    apiRequest(`/notifications/${notificationId}/read`, { method: "PUT" }),

  getUnreadCount: (userId: number) =>
    apiRequest<{ count: number }>(`/notifications/user/${userId}/unread/count`),
};
