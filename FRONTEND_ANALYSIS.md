# Clinic Management System - Frontend Analysis

## Data Models

### 1. User
```
{
  id: number,
  name: string,
  email: string,
  password: string,
  phone?: string,
  role: 'admin' | 'reception' | 'doctor' | 'patient',
  isVerified: boolean
}
```

### 2. Doctor
```
{
  id: number,
  name: string,
  specialization: string,
  clinicId: number,
  schedule: [
    { day: string, start: string, end: string },
    ...
  ]
}
```

### 3. Patient
```
{
  id: number,
  name: string,
  gender: string,
  dateOfBirth: string (YYYY-MM-DD),
  phone: string,
  email: string,
  address: string
}
```

### 4. Clinic
```
{
  id: number,
  name: string,
  floor: string,
  description: string,
  image: string (URL),
  doctors?: [Doctor] (attached data)
}
```

### 5. Appointment
```
{
  id: number,
  patientId: number,
  doctorId: number,
  clinicId: number,
  date: string (YYYY-MM-DD),
  time: string (HH:MM),
  status: 'scheduled' | 'completed' | 'cancelled',
  doctorName?: string,
  patientName?: string
}
```

### 6. Medical Record
```
{
  id: number,
  patientId: number,
  doctorId: number,
  diagnosis: string,
  prescription: string,
  notes: string,
  visitDate: string (YYYY-MM-DD)
}
```

### 7. Message
```
{
  id: number,
  senderId: number,
  receiverId: number,
  message: string,
  timestamp: string (ISO 8601)
}
```

### 8. Verification Token
```
{
  token: string (unique),
  userId: number
}
```

---

## Pages and Data Requirements

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
