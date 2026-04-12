import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('clinicUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

/** Backend wraps payloads as `{ success, data, message }` on `axios`’s `response.data`. */
const extractData = <T>(request: Promise<{ data?: { data?: T } }>) =>
  request.then((res) => ({ data: res.data?.data as T }));

const extractList = <T>(request: Promise<{ data?: { data?: unknown } }>) =>
  request
    .then((res) => {
      const d = res.data?.data;
      return { data: (Array.isArray(d) ? d : []) as T };
    })
    .catch(() => ({ data: [] as unknown as T }));

// Auth
export const authApi = {
  login: (email: string, password: string) => extractData<{ accessToken: string; user: any }>(api.post('/auth/login', { email, password })),
};

// Clinics
export const clinicsApi = {
  getAll: (search?: string) => extractList(api.get('/clinics', { params: { search } })),
  create: (data: any) => extractData(api.post('/clinics', data)),
  update: (id: string, data: any) => extractData(api.put(`/clinics/${id}`, data)),
  delete: (id: string) => extractData(api.delete(`/clinics/${id}`)),
};

// Doctors
export const doctorsApi = {
  getAll: (params?: { clinicId?: string; search?: string }) => extractList(api.get('/doctors', { params })),
  getByClinic: (clinicId: string) => extractList(api.get(`/doctors/clinic/${clinicId}`)),
  create: (data: any) => extractData(api.post('/doctors', data)),
  update: (id: string, data: any) => extractData(api.put(`/doctors/${id}`, data)),
  delete: (id: string) => extractData(api.delete(`/doctors/${id}`)),
};

// Patients
export const patientsApi = {
  getAll: (search?: string) => extractList(api.get('/patients', { params: { search } })),
  getOne: (id: string) => extractData(api.get(`/patients/${id}`)),
  create: (data: any) => extractData(api.post('/patients', data)),
  update: (id: string, data: any) => extractData(api.put(`/patients/${id}`, data)),
  delete: (id: string) => extractData(api.delete(`/patients/${id}`)),
};

// Receptionists
export const receptionistsApi = {
  getAll: (search?: string) => extractList(api.get('/receptionists', { params: { search } })),
  create: (data: any) => extractData(api.post('/receptionists', data)),
  update: (id: string, data: any) => extractData(api.put(`/receptionists/${id}`, data)),
  delete: (id: string) => extractData(api.delete(`/receptionists/${id}`)),
};

// Appointments
export const appointmentsApi = {
  getAll: (params?: { doctorId?: string; patientId?: string; status?: string }) => extractList(api.get('/appointments', { params })),
  getPending: () => extractList(api.get('/appointments/pending')),
  getByDoctor: (doctorId: string) => extractList(api.get(`/appointments/doctor/${doctorId}`)),
  getByPatient: (patientId: string) => extractList(api.get(`/appointments/patient/${patientId}`)),
  getOne: (id: string) => extractData(api.get(`/appointments/${id}`)),
  create: (data: any) => extractData(api.post('/appointments', { status: 'pending', ...data })),
  update: (id: string, data: any) => extractData(api.put(`/appointments/${id}`, data)),
  delete: (id: string) => extractData(api.delete(`/appointments/${id}`)),
};

// Visits
export const visitsApi = {
  getAll: () => extractList(api.get('/visits')),
  getByPatient: (patientId: string) => extractList(api.get(`/visits/patient/${patientId}`)),
  getByDoctor: (doctorId: string) => extractList(api.get(`/visits/doctor/${doctorId}`)),
  getByAppointment: (appointmentId: string) => extractData(api.get(`/visits/appointment/${appointmentId}`)),
  create: (data: any) => extractData(api.post('/visits', data)),
};

// Users (admin)
export const usersApi = {
  getAll: (role?: string) => extractList(api.get('/users', { params: { role } })),
  getByLinkedId: (linkedId: string) => extractData(api.get(`/users/by-linked/${linkedId}`)),
  create: (data: any) => extractData(api.post('/users', data)),
  update: (id: string, data: any) => extractData(api.put(`/users/${id}`, data)),
  delete: (id: string) => extractData(api.delete(`/users/${id}`)),
  register: (data: any) => extractData(api.post('/auth/register', data)),
};
