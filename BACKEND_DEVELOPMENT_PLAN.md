# Clinic Management System - Backend Development Plan

> Runtime note: the backend should expose all routes under a global `/api` prefix. The frontend uses `http://localhost:3000/api` as the base URL, so actual runtime routes are `/api/...`.
> Backend should run on port `3000` to match frontend expectations.

## 1. FINAL CONFIRMED DATABASE SCHEMA (MongoDB + Mongoose)

### 1.1 Users Collection
```javascript
// users.schema.ts
const userSchema = new Schema({
  _id: ObjectId,
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'receptionist', 'patient'], required: true },
  linkedId: { type: Schema.Types.ObjectId }, // References doctor/patient/receptionist record
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ linkedId: 1 });
```

### 1.2 Clinics Collection
```javascript
const clinicSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  workingDays: { type: String, required: true }, // e.g. "Mon, Tue, Wed"
  workingHours: { type: String, required: true }, // e.g. "09:00 - 17:00"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

clinicSchema.index({ name: 1 });
```

### 1.3 Doctors Collection
```javascript
const doctorSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  workingDays: { type: String },
  workingHours: { type: String },
  phone: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

doctorSchema.index({ clinicId: 1 });
doctorSchema.index({ specialization: 1 });
```

### 1.4 Patients Collection
```javascript
const patientSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

patientSchema.index({ name: 1 });
patientSchema.index({ email: 1 });
```

### 1.5 Appointments Collection
```javascript
const appointmentSchema = new Schema({
  _id: ObjectId,
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });
```

### 1.6 Visits Collection (Medical Records)
```javascript
const visitSchema = new Schema({
  _id: ObjectId,
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  diagnosis: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

visitSchema.index({ patientId: 1 });
visitSchema.index({ doctorId: 1 });
visitSchema.index({ date: 1 });
```

### 1.7 Receptionists Collection
```javascript
const receptionistSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

receptionistSchema.index({ name: 1 });
receptionistSchema.index({ email: 1 });
```

### 1.8 Email Verification Tokens Collection
```javascript
const emailVerificationTokenSchema = new Schema({
  _id: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, unique: true, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

emailVerificationTokenSchema.index({ token: 1 });
emailVerificationTokenSchema.index({ userId: 1 });
emailVerificationTokenSchema.index({ expiresAt: 1 });
```



---

## 2. NESTJS MODULES STRUCTURE

```
src/
├── auth/                          # Authentication & Authorization
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
│
├── users/                         # User Management
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       └── user.dto.ts
│
├── clinics/                       # Clinic Management
│   ├── clinics.module.ts
│   ├── clinics.service.ts
│   ├── clinics.controller.ts
│   ├── entities/
│   │   └── clinic.entity.ts
│   └── dto/
│       ├── create-clinic.dto.ts
│       └── update-clinic.dto.ts
│
├── doctors/                       # Doctor Management
│   ├── doctors.module.ts
│   ├── doctors.service.ts
│   ├── doctors.controller.ts
│   ├── entities/
│   │   └── doctor.entity.ts
│   └── dto/
│       ├── create-doctor.dto.ts
│       └── update-doctor.dto.ts
│
├── patients/                      # Patient Management
│   ├── patients.module.ts
│   ├── patients.service.ts
│   ├── patients.controller.ts
│   ├── entities/
│   │   └── patient.entity.ts
│   └── dto/
│       ├── create-patient.dto.ts
│       └── update-patient.dto.ts
│
├── receptionists/                 # Receptionist Management
│   ├── receptionists.module.ts
│   ├── receptionists.service.ts
│   ├── receptionists.controller.ts
│   ├── entities/
│   │   └── receptionist.entity.ts
│   └── dto/
│       ├── create-receptionist.dto.ts
│       └── update-receptionist.dto.ts
│
├── appointments/                  # Appointment Management
│   ├── appointments.module.ts
│   ├── appointments.service.ts
│   ├── appointments.controller.ts
│   ├── entities/
│   │   └── appointment.entity.ts
│   └── dto/
│       ├── create-appointment.dto.ts
│       └── update-appointment.dto.ts
│
├── visits/                        # Visit Records (Medical Records)
│   ├── visits.module.ts
│   ├── visits.service.ts
│   ├── visits.controller.ts
│   ├── entities/
│   │   └── visit.entity.ts
│   └── dto/
│       ├── create-visit.dto.ts
│       └── update-visit.dto.ts
│
├── database/                      # Database Configuration
│   └── database.module.ts
│
├── common/                        # Shared Utilities
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── interceptors/
│   ├── filters/
│   └── constants/
│       └── roles.constant.ts
│
└── app.module.ts
```

---

## 3. COMPLETE API ENDPOINTS

### 3.1 Authentication Endpoints

All endpoints listed below are exposed under a global `/api` prefix. For example, `POST /auth/register` is available at `POST /api/auth/register`.

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| POST | `/auth/register` | Register new patient | name, email, password, phone | user + JWT token | Public | 201 |
| POST | `/auth/login` | User login | email, password | user + JWT token | Public | 200 |

### 3.2 User Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/users` | Get all users | - | user[] | admin | 200 |
| GET | `/users/:id` | Get user by ID | - | user | admin, self | 200 |
| GET | `/users/by-linked/:linkedId` | Get user by linked ID | - | user | admin | 200 |
| POST | `/users` | Create admin user | username, name, email, password, role=admin | created admin user | admin | 201 |
| PUT | `/users/:id` | Update user | name, email, phone | updated user | admin, self | 200 |
| DELETE | `/users/:id` | Delete user | - | success message | admin | 200 |


#### User creation flow update
- `POST /users`: reserved for creating admin accounts only (role must be `admin`), no `linkedId` provided.
- `POST /doctors`: create a `Doctor` record and corresponding `User` account in one operation; service sets `linkedId` automatically.
- `POST /receptionists`: create a `Receptionist` record and corresponding `User` account in one operation; service sets `linkedId` automatically.
- `POST /patients`: create a `Patient` record and corresponding `User` account in one operation; service sets `linkedId` automatically.

### 3.3 Clinic Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/clinics` | Get all clinics | - | clinic[] | Public | 200 |
| GET | `/clinics/:id` | Get clinic by ID | - | clinic | Public | 200 |
| POST | `/clinics` | Create clinic | name, workingDays, workingHours | created clinic | admin | 201 |
| PUT | `/clinics/:id` | Update clinic | name, workingDays, workingHours | updated clinic | admin | 200 |
| DELETE | `/clinics/:id` | Delete clinic | - | success message | admin | 200 |

### 3.4 Doctor Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/doctors` | Get all doctors | - | doctor[] | Public | 200 |
| GET | `/doctors/:id` | Get doctor by ID | - | doctor | Public | 200 |
| POST | `/doctors` | Create doctor and user account | name, specialization, clinicId, workingDays, workingHours, phone, email, username, password | created doctor + user | admin | 201 |
| PUT | `/doctors/:id` | Update doctor | name, specialization, clinicId, workingDays, workingHours, phone, email | updated doctor | admin | 200 |
| DELETE | `/doctors/:id` | Delete doctor | - | success message | admin | 200 |

### 3.5 Patient Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/patients` | Get all patients | - | patient[] | admin, reception | 200 |
| GET | `/patients/:id` | Get patient by ID | - | patient | admin, reception, self | 200 |
| POST | `/patients` | Create patient and user account | name, age, gender, phone, email, address, username, password | created patient + user | admin, reception | 201 |
| PUT | `/patients/:id` | Update patient | name, age, gender, phone, email, address | updated patient | admin, reception, self | 200 |
| DELETE | `/patients/:id` | Delete patient | - | success message | admin | 200 |

### 3.6 Receptionist Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/receptionists` | Get all receptionists | - | receptionist[] | admin | 200 |
| GET | `/receptionists/:id` | Get receptionist by ID | - | receptionist | admin, self | 200 |
| POST | `/receptionists` | Create receptionist and user account | name, phone, email, username, password | created receptionist + user | admin | 201 |
| PUT | `/receptionists/:id` | Update receptionist | name, phone, email | updated receptionist | admin | 200 |
| DELETE | `/receptionists/:id` | Delete receptionist | - | success message | admin | 200 |

### 3.7 Appointment Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/appointments` | Get all appointments, optionally filtered by `doctorId` or `patientId` query params | - | appointment[] | admin, reception, doctor | 200 |
| GET | `/appointments/doctor/:doctorId` | Get appointments for a specific doctor | - | appointment[] | admin, reception, doctor | 200 |
| GET | `/appointments/patient/:patientId` | Get appointments for a specific patient | - | appointment[] | admin, reception, patient | 200 |
| GET | `/appointments/:id` | Get appointment by ID | - | appointment | admin, reception, doctor, patient | 200 |
| POST | `/appointments` | Create appointment | patientId, doctorId, clinicId, date, time, status | created appointment | admin, reception, patient | 201 |
| PUT | `/appointments/:id` | Update appointment | patientId, doctorId, clinicId, date, time, status | updated appointment | admin, reception, doctor | 200 |
| DELETE | `/appointments/:id` | Delete appointment | - | success message | admin, reception | 200 |

### 3.8 Visits Endpoints (Medical Records)

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/visits` | Get all visits | - | visit[] | admin, doctor | 200 |
| GET | `/visits/:id` | Get visit by ID | - | visit | admin, doctor, patient | 200 |
| POST | `/visits` | Create visit | patientId, doctorId, date, diagnosis, notes | created visit | doctor | 201 |
| PUT | `/visits/:id` | Update visit | patientId, doctorId, date, diagnosis, notes | updated visit | doctor | 200 |
| DELETE | `/visits/:id` | Delete visit | - | success message | admin | 200 |

---

## 4. RESOLVED CONFLICTS SUMMARY

### Conflict 1: Simplified Data Models
**Resolution:** Aligned backend schemas with frontend expectations
- **Users:** Added `username` and `linkedId` fields to match frontend User model
- **Clinics:** Changed from complex fields (floor, description, image) to simple `workingDays` and `workingHours` strings
- **Doctors:** Removed separate userId reference; doctor has direct name/specialization/clinicId fields
- **Patients:** Simplified to match frontend (name, age, gender, phone, email, address)
- **Visits:** Renamed from "Medical Records" to "Visits" to match frontend API expectations

### Conflict 2: API Endpoint Alignment
**Resolution:** Updated all endpoints to exactly match frontend API client expectations
- Changed `/medical-records` to `/visits` endpoints
- Added `GET /users/by-linked/:linkedId` endpoint
- Removed complex filtering endpoints not used by frontend
- Simplified appointment management (removed payment status, booked_by tracking)

### Conflict 3: Removed Over-Engineering
**Resolution:** Eliminated complex features not required by current frontend
- Removed embedded doctor schedules (frontend uses simple workingDays/workingHours strings)
- Removed payment tracking from appointments
- Removed follow-up dates from visits
- Removed messaging system (not implemented in current frontend)
- Simplified receptionist model (no clinic assignment)

### Conflict 4: Direct Entity Relationships
**Resolution:** Frontend expects flat data structures without complex references
- Doctors have direct clinicId reference (not separate userId)
- Patients are standalone entities (not linked to users)
- Appointments reference patient/doctor/clinic directly
- No separate user accounts for doctors/patients/receptionists

---

## 5. RECOMMENDED BUILD ORDER

### Phase 1: Foundation (Core Infrastructure) - ✅ COMPLETE
**Status:** Complete
**Deliverables:**
- Database (MongoDB + Mongoose)
- Authentication (Register, Login)
- User Management (Admin CRUD)
- JWT with role-based access
- Email verification tokens

### Phase 2: Core Resources (Main Entities)
**Priority:** Critical - needed for most features
1. **Clinics Module** - Full CRUD (public read, admin write)
2. **Doctors Module** - Doctor creation with basic info
3. **Patients Module** - Patient management
4. **Receptionists Module** - Receptionist account creation

**Deliverables:**
- All clinic management working
- Doctors can be created with basic info
- Patients properly managed
- Receptionists can be created

### Phase 3: Core Features (Main Functionality)
**Priority:** Critical - main features of the application
1. **Appointments Module** - Create, update, cancel appointments
2. **Visits Module** - Visit records with diagnosis and notes

**Deliverables:**
- Full appointment booking workflow
- Doctor can record patient visits
- Reception can manage appointments
- Patients can view their records

---

### Phase 4: Enhancement & Testing
**Priority:** Important - polish and verify
1. **Validation Enhancement** - Add comprehensive input validation
2. **Error Handling** - Global exception filters, proper error responses
3. **Testing** - Unit tests for services, E2E tests for endpoints
4. **Documentation** - API documentation, setup guide

**Deliverables:**
- All endpoints validated
- Comprehensive error handling
- Test coverage for critical paths
- API documentation complete

---

## 6. STARTUP PRIORITY MATRIX

```
HIGH PRIORITY (Start immediately):
├── Database Setup (MongoDB)
├── Auth Module
├── Users Module
├── Clinics Module
├── Doctors Module
└── Appointments Module

MEDIUM PRIORITY (Start after Phase 2):
├── Patients Module
├── Medical Records Module
└── Receptionists Module

LOWER PRIORITY (Phase 4 or later):
├── Messages Module
└── Advanced Features
```

---

## 7. KEY IMPLEMENTATION NOTES

### Authentication Flow
1. Patient registers → User created (role='patient') → Verification token sent
2. Patient clicks email link → Email verified → Can login
3. Admin creates other roles (doctor, receptionist) → They login with credentials

### Role-Based Access Control
- **Admin:** Full system access (all endpoints except patient personal data)
- **Reception:** Manage patients, appointments, payments (partial access)
- **Doctor:** View own appointments, create/update medical records
- **Patient:** View own appointments, book appointments, view own records

### Appointment Booking Business Logic
1. Patient/Reception selects doctor + date + time
2. System checks if slot is available (not booked, within doctor's schedule)
3. Appointment created with status='scheduled', payment_status='pending'
4. After appointment completes, doctor creates medical record
5. Payment marked as paid (managed by reception)

### Database Relationships
- Users → Doctors (1:1) via user_id
- Users → Patients (1:1) via user_id
- Users → Receptionists (1:1) via user_id
- Clinics → Doctors (1:N) via clinic_id
- Doctors → Doctor_Schedules (1:N) via doctor_id
- Appointments ties together: Patient + Doctor + Clinic + Date/Time
- Medical_Records ties together: Patient + Doctor + Appointment

---

## 8. ENVIRONMENT SETUP REQUIREMENTS

### Dependencies to Install
```bash
npm install @nestjs/core @nestjs/common @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs mongoose @nestjs/mongoose class-validator class-transformer dotenv cors helmet
```

### Environment Variables (.env)
```
MONGODB_URI=mongodb://localhost:27017/clinic_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=86400
NODE_ENV=development
```

### Backend Runtime
- Backend should run on port `3000` to match the frontend base URL `http://localhost:3000/api`.

### Database Setup
1. Ensure MongoDB is running (locally or connection string in .env)
2. Mongoose will auto-create collections on first write
3. No manual migrations needed

---

## 9. API RESPONSE STRUCTURES

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": { ... }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## 10. SECURITY CONSIDERATIONS

- Use bcryptjs for password hashing
- JWT tokens with 24-hour expiration (simple, no refresh tokens)
- Rate limiting on auth endpoints
- CORS configured to frontend origin only
- SQL injection prevention via Mongoose schema validation
- Input validation on all endpoints
- Role-based access control on all protected endpoints
- Hash email verification tokens
- Expire verification tokens after 24 hours


