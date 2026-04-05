# Clinic Management System - Frontend Analysis

## Project Overview

- Frontend built with React + TypeScript + Vite.
- Uses `react-router-dom` for routes and role-based protected pages in `src/App.tsx`.
- API clients in `src/lib/api.ts` with Axios base URL `http://localhost:3000/api` and JWT interceptor.
- Auth state in `src/contexts/AuthContext.tsx`, stored in `localStorage` as `token` and `clinicUser`.
- UI components based on value from `src/components/ui/*` (shadcn-style components).

## Data Models (from actual app code)

### 1. User
```ts
{
  _id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  linkedId?: string;
}
```

### 2. Clinic (Department)
```ts
{
  _id: string;
  name: string;
  workingDays: string; // e.g. "Mon, Tue, Wed"
  workingHours: string; // e.g. "09:00 - 17:00"
}
```

### 3. Doctor
```ts
{
  _id: string;
  name: string;
  specialization: string;
  clinicId: string | { _id: string; name: string };
  workingDays?: string;
  workingHours?: string;
  phone?: string;
  email?: string;
}
```

### 4. Patient
```ts
{
  _id: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
}
```

### 5. Appointment
```ts
{
  _id: string;
  patientId: any;
  doctorId: any;
  clinicId: any;
  date: string;
  time: string;
  status: string; // pending, completed, cancelled
}
```

### 6. Visit / Medical Record
```ts
{
  _id: string;
  patientId: any;
  doctorId: any;
  date: string;
  diagnosis?: string;
  notes?: string;
}
```

---

## Frontend Directory Structure

- `src/App.tsx` (routing + ProtectedRoute for roles)
- `src/main.tsx` (React app bootstrap)
- `src/pages/` (all routes)
  - `Landing.tsx` (public homepage, doctors + clinics browse)
  - `Login.tsx` (no register page in current code)
  - `NotFound.tsx`
  - `admin/` (Admin management pages)
  - `doctor/` (doctor pages)
  - `patient/` (patient pages)
  - `receptionist/` (receptionist pages)
- `src/components/` (shared layout + UI)
- `src/contexts/AuthContext.tsx` (auth provider)
- `src/lib/api.ts` (API clients)
- `src/lib/validateCredentials.ts` (credentials rules)
- `src/hooks/` (mobile, toast hooks)

---

## Page Details

### 1. Landing (`src/pages/Landing.tsx`)
- Public page with clinic and doctor listing.
- APIs used: `clinicsApi.getAll()`, `doctorsApi.getAll()`.
- Features:
  - search + filter by specialization
  - expand/collapse clinics
  - contact/doctor card modal

### 2. Login (`src/pages/Login.tsx`)
- Public page for authentication.
- Calls `AuthContext.login`, which uses `authApi.login`.
- On success, redirects by role:
  - admin → `/admin`
  - doctor → `/doctor`
  - receptionist → `/reception`
  - patient → `/patient`
- Demo credentials built into UI.

### 3. Admin routes
- `AdminDashboard` - summary cards for counts.
- `ClinicsManagement` - CRUD clinics (department fields plus working hours/days).
- `DoctorsManagement` - CRUD doctors and optional user account linking.
- `PatientsManagement` - list & delete patient records.
- `ReceptionistsManagement` - manage receptionists (likely via user service).
- `AdminAppointments` - appointment list/status.

### 4. Doctor routes
- `DoctorDashboard` - simple cards for appointments.
- `DoctorAppointmentsPage` - doctor-specific appointment listing.

### 5. Receptionist routes
- `ReceptionistDashboard` - pending appointments + counts.
- `AddPatientPage` - create patient + user login account.
- `BookAppointmentPage` - appointment booking by selecting patient, clinic, doctor, date/time.
- `ReceptionAppointmentsPage` - list of all appointments.

### 6. Patient routes
- `PatientDashboard` - summary of upcoming/completed visits.
- `PatientAppointmentsPage` - list user-specific appointments.
- `PatientHistoryPage` - shows visit record entries from `visitsApi.getAll()`.

---

## API Client Endpoints (current `src/lib/api.ts`)

- Auth: `POST /auth/login`
- Clinics: `GET /clinics`, `POST /clinics`, `PUT /clinics/:id`, `DELETE /clinics/:id`
- Doctors: `GET /doctors`, `POST /doctors`, `PUT /doctors/:id`, `DELETE /doctors/:id`
- Patients: `GET /patients`, `GET /patients/:id`, `POST /patients`, `PUT /patients/:id`, `DELETE /patients/:id`
- Receptionists: `GET /receptionists`, `POST /receptionists`, `PUT /receptionists/:id`, `DELETE /receptionists/:id`
- Appointments: `GET /appointments`, `GET /appointments/:id`, `POST /appointments`, `PUT /appointments/:id`, `DELETE /appointments/:id`
- Visits: `GET /visits`, `POST /visits`
- Users: `GET /users`, `GET /users/by-linked/:linkedId`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`, `POST /auth/register`

---

## Notes on divergence from previous analysis

- No `src/pages/Register.tsx` or `src/pages/Verify.tsx` routes currently exist.
- Role-based routing is in `App.tsx` + `AuthContext` rather than auth pages.
- Models are MongoDB-style `_id` with nested population (e.g., `patientId?.name`).
- Backend endpoints in API layer include `/visits`, not directly `/medical-records`.
- Components are mostly admin-heavy, with strong frontend validation logic in `DoctorsManagement` and `Receptionist` workflows.

### 1. **Home Page** (`src/pages/Home.jsx`)
- **Purpose**: Public landing page showing available clinics
- **Data Needed**:
  - List of all clinics with attached doctors
- **User Type**: Public (unauthenticated)
- **Key Features**: 
  - Displays clinics overview
  - Link to login/register

### 2. **Login Page** (`src/pages/Login.jsx`)
- **Purpose**: User authentication
- **Data Needed**:
  - User credentials validation
- **User Type**: Public (unauthenticated)
- **Key Features**:
  - Email/password authentication
  - Role-based redirect (admin → /admin, doctor → /doctor, patient → /patient, reception → /reception)
  - Unverified user warning

### 3. **Register Page** (`src/pages/Register.jsx`)
- **Purpose**: Patient account creation
- **Data Needed**:
  - Create new patient user
- **User Type**: Public (unauthenticated)
- **Key Features**:
  - Patient registration with: name, email, password, phone
  - Email verification token generation
  - Password confirmation validation

### 4. **Verify Page** (`src/pages/Verify.jsx`)
- **Purpose**: Email verification on signup
- **Data Needed**:
  - Verify token validity
  - Update user verification status
- **User Type**: Public (via email link)
- **Key Features**:
  - Token validation
  - Mark user as verified

### 5. **Admin Dashboard** (`src/pages/AdminDashboard.jsx`)
- **Purpose**: Complete system management panel
- **Data Needed**:
  - Clinics (full CRUD)
  - Doctors (full CRUD)
  - Patients (read/update)
  - Appointments (read)
  - Medical Records (read)
- **User Type**: Admin only
- **Key Features**:
  - Manage Clinics (create, read, update, delete)
  - Manage Doctors (create, update, delete with specialization & schedule)
  - View Patients list
  - View Appointments
  - View Medical Records
  - Sidebar navigation with sections

### 6. **Doctor Dashboard** (`src/pages/DoctorDashboard.jsx`)
- **Purpose**: Doctor view (minimal implementation)
- **Data Needed**:
  - Current user info
- **User Type**: Doctor only
- **Key Features**:
  - Placeholder for future features:
    - View upcoming appointments
    - Patient charts
    - Messages

### 7. **Patient Dashboard** (`src/pages/PatientDashboard.jsx`)
- **Purpose**: Patient appointment & medical record management
- **Data Needed**:
  - Patient's appointments
  - Patient's medical records
  - List of all doctors
  - Create new appointment
- **User Type**: Patient only
- **Key Features**:
  - View personal appointments
  - View medical records
  - Book new appointment (select doctor, date, time)
  - Appointment booking form

### 8. **Reception Dashboard** (`src/pages/ReceptionDashboard.jsx`)
- **Purpose**: Reception staff operations (minimal implementation)
- **Data Needed**:
  - Current user info
  - Appointments (day view)
- **User Type**: Reception only
- **Key Features**:
  - Placeholder with appointment list view
  - Check-in status tracking (minimal)

---

## Required API Endpoints

### **Authentication & Users**
| Method | Endpoint | Purpose | Required Data |
|--------|----------|---------|----------------|
| POST | `/auth/login` | Authenticate user | email, password |
| POST | `/auth/register` | Register new patient | name, email, password, phone |
| POST | `/auth/verify-token` | Verify email token | token |
| GET | `/users` | Get all users | - |
| GET | `/users/:id` | Get user by ID | - |
| GET | `/users/email/:email` | Get user by email | - |

### **Clinics**
| Method | Endpoint | Purpose | Required Data |
|--------|----------|---------|----------------|
| GET | `/clinics` | Get all clinics (with doctors) | - |
| GET | `/clinics/:id` | Get clinic by ID | - |
| POST | `/clinics` | Create clinic | name, floor, description, image |
| PUT | `/clinics/:id` | Update clinic | name, floor, description, image |
| DELETE | `/clinics/:id` | Delete clinic | - |

### **Doctors**
| Method | Endpoint | Purpose | Required Data |
|--------|----------|---------|----------------|
| GET | `/doctors` | Get all doctors | - |
| GET | `/doctors/:id` | Get doctor by ID | - |
| GET | `/doctors/clinic/:clinicId` | Get doctors by clinic | - |
| POST | `/doctors` | Create doctor | name, specialization, clinicId, schedule |
| PUT | `/doctors/:id` | Update doctor | name, specialization, clinicId, schedule |
| DELETE | `/doctors/:id` | Delete doctor | - |

### **Patients**
| Method | Endpoint | Purpose | Required Data |
|--------|----------|---------|----------------|
| GET | `/patients` | Get all patients | - |
| GET | `/patients/:id` | Get patient by ID | - |
| POST | `/patients` | Create patient | name, gender, dateOfBirth, phone, email, address |
| PUT | `/patients/:id` | Update patient | name, gender, dateOfBirth, phone, email, address |
| DELETE | `/patients/:id` | Delete patient | - |

### **Appointments**
| Method | Endpoint | Purpose | Required Data |
|--------|----------|---------|----------------|
| GET | `/appointments` | Get all appointments | - |
| GET | `/appointments/patient/:patientId` | Get patient's appointments | - |
| GET | `/appointments/doctor/:doctorId` | Get doctor's appointments | - |
| POST | `/appointments` | Create appointment | patientId, doctorId, clinicId, date, time |
| PUT | `/appointments/:id` | Update appointment | patientId, doctorId, clinicId, date, time, status |
| PUT | `/appointments/:id/cancel` | Cancel appointment | - |

### **Medical Records**
| Method | Endpoint | Purpose | Required Data |
|--------|----------|---------|----------------|
| GET | `/medical-records` | Get all records | - |
| GET | `/medical-records/patient/:patientId` | Get patient's records | - |
| POST | `/medical-records` | Create record | patientId, doctorId, diagnosis, prescription, notes, visitDate |
| PUT | `/medical-records/:id` | Update record | patientId, doctorId, diagnosis, prescription, notes, visitDate |

### **Messages**
| Method | Endpoint | Purpose | Required Data |
|--------|----------|---------|----------------|
| GET | `/messages` | Get all messages | - |
| GET | `/messages/conversation` | Get conversation between two users | user1Id, user2Id |
| POST | `/messages` | Send message | senderId, receiverId, message |

---

## Page-to-Endpoint Mapping

### Home
- `GET /clinics` (with doctors attached)

### Login
- `POST /auth/login`

### Register
- `POST /auth/register`
- `POST /auth/verify-token` (after email verification)

### Verify
- `POST /auth/verify-token`

### Admin Dashboard
- `GET /clinics`
- `GET /doctors`
- `GET /patients`
- `GET /appointments`
- `GET /medical-records`
- `POST /clinics`
- `PUT /clinics/:id`
- `DELETE /clinics/:id`
- `POST /doctors`
- `PUT /doctors/:id`
- `DELETE /doctors/:id`
- `GET /users` (for reception staff)

### Doctor Dashboard
- (Minimal - just displays user info from localStorage)

### Patient Dashboard
- `GET /users` (to get list of doctors)
- `GET /appointments/patient/:patientId`
- `GET /medical-records/patient/:patientId`
- `POST /appointments`

### Reception Dashboard
- (Minimal - just displays appointments from state)

---

## Authentication & Authorization

- **Storage**: Users stored with role enum
- **Current User**: Stored in localStorage as `clinicUser`
- **Token Strategy**: Email verification tokens generated on registration
- **Role-Based Routes**:
  - `/admin` → Admin Dashboard (role: 'admin')
  - `/doctor` → Doctor Dashboard (role: 'doctor')
  - `/patient` → Patient Dashboard (role: 'patient')
  - `/reception` → Reception Dashboard (role: 'reception')

---

## Frontend Services (Existing Mock Services)

- `authService.js` - Auth & user operations
- `clinicsService.js` - Clinic CRUD
- `doctorsService.js` - Doctor CRUD
- `patientsService.js` - Patient CRUD
- `appointmentsService.js` - Appointment CRUD
- `medicalRecordsService.js` - Medical Record CRUD
- `messagesService.js` - Message operations

All currently use localStorage for persistence and can be swapped to backend API calls with the endpoints listed above.

---

## Backend Implementation Checklist

- [ ] User authentication (login, register, verify email)
- [ ] User management (CRUD operations)
- [ ] Clinic management (CRUD operations)
- [ ] Doctor management with schedule (CRUD operations)
- [ ] Patient management (CRUD operations)
- [ ] Appointment management (CRUD, cancel operations)
- [ ] Medical records management (CRUD operations)
- [ ] Message system (send, retrieve conversations)
- [ ] Role-based access control for all endpoints
- [ ] Email verification token generation & validation
- [ ] Database schema for all models

