# Clinic Management System - Backend Development Plan

## 1. FINAL CONFIRMED DATABASE SCHEMA (MongoDB + Mongoose)

### 1.1 Users Collection
```javascript
// users.schema.ts
const userSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'reception', 'doctor', 'patient'], required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
```

### 1.2 Clinics Collection
```javascript
const clinicSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  floor: { type: String },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

clinicSchema.index({ name: 1 });
```

### 1.3 Doctors Collection
```javascript
const doctorSchema = new Schema({
  _id: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

doctorSchema.index({ clinicId: 1 });
doctorSchema.index({ specialization: 1 });
```

### 1.4 Doctor Schedules (Embedded in Doctor)
```javascript
// Embedded within doctorSchema
schedule: [{
  _id: ObjectId,
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String }, // HH:MM format
  endTime: { type: String },    // HH:MM format
}]
```

### 1.5 Patients Collection
```javascript
const patientSchema = new Schema({
  _id: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

patientSchema.index({ userId: 1 });
```

### 1.6 Receptionists Collection
```javascript
const receptionistSchema = new Schema({
  _id: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  assignedClinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

receptionistSchema.index({ assignedClinicId: 1 });
```

### 1.7 Appointments Collection
```javascript
const appointmentSchema = new Schema({
  _id: ObjectId,
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, // HH:MM format
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  notes: { type: String },
  bookedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ paymentStatus: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });
```

### 1.8 Medical Records Collection
```javascript
const medicalRecordSchema = new Schema({
  _id: ObjectId,
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  prescription: { type: String },
  notes: { type: String },
  followUpDate: { type: Date },
  visitDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

medicalRecordSchema.index({ patientId: 1 });
medicalRecordSchema.index({ doctorId: 1 });
medicalRecordSchema.index({ visitDate: 1 });
medicalRecordSchema.index({ followUpDate: 1 });
```

### 1.9 Messages Collection
```javascript
const messageSchema = new Schema({
  _id: ObjectId,
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: 1 });
```

### 1.10 Email Verification Tokens Collection
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
│   │   ├── verify-token.dto.ts
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
│       ├── update-clinic.dto.ts
│       └── clinic.dto.ts
│
├── doctors/                       # Doctor Management
│   ├── doctors.module.ts
│   ├── doctors.service.ts
│   ├── doctors.controller.ts
│   ├── entities/
│   │   ├── doctor.entity.ts
│   │   └── doctor-schedule.entity.ts
│   └── dto/
│       ├── create-doctor.dto.ts
│       ├── update-doctor.dto.ts
│       ├── doctor-schedule.dto.ts
│       └── doctor.dto.ts
│
├── patients/                      # Patient Management
│   ├── patients.module.ts
│   ├── patients.service.ts
│   ├── patients.controller.ts
│   ├── entities/
│   │   └── patient.entity.ts
│   └── dto/
│       ├── create-patient.dto.ts
│       ├── update-patient.dto.ts
│       └── patient.dto.ts
│
├── receptionists/                 # Receptionist Management
│   ├── receptionists.module.ts
│   ├── receptionists.service.ts
│   ├── receptionists.controller.ts
│   ├── entities/
│   │   └── receptionist.entity.ts
│   └── dto/
│       ├── create-receptionist.dto.ts
│       ├── update-receptionist.dto.ts
│       └── receptionist.dto.ts
│
├── appointments/                  # Appointment Management
│   ├── appointments.module.ts
│   ├── appointments.service.ts
│   ├── appointments.controller.ts
│   ├── entities/
│   │   └── appointment.entity.ts
│   ├── dto/
│   │   ├── create-appointment.dto.ts
│   │   ├── update-appointment.dto.ts
│   │   ├── cancel-appointment.dto.ts
│   │   └── appointment.dto.ts
│   └── validators/
│       └── appointment-slot.validator.ts
│
├── medical-records/               # Medical Records Management
│   ├── medical-records.module.ts
│   ├── medical-records.service.ts
│   ├── medical-records.controller.ts
│   ├── entities/
│   │   └── medical-record.entity.ts
│   └── dto/
│       ├── create-medical-record.dto.ts
│       ├── update-medical-record.dto.ts
│       └── medical-record.dto.ts
│
├── messages/                      # Messaging System
│   ├── messages.module.ts
│   ├── messages.service.ts
│   ├── messages.controller.ts
│   ├── entities/
│   │   └── message.entity.ts
│   └── dto/
│       ├── send-message.dto.ts
│       ├── message.dto.ts
│       └── conversation.dto.ts
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

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| POST | `/auth/register` | Register new patient | name, email, password, phone | user + JWT token | Public | 201 |
| POST | `/auth/login` | User login | email, password | user + JWT token | Public | 200 |
| POST | `/auth/verify-email` | Verify email token | token | verified user | Public | 200 |

### 3.2 User Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/users` | Get all users | - | user[] | admin | 200 |
| GET | `/users/:id` | Get user by ID | - | user | admin, self | 200 |
| GET | `/users/email/:email` | Get user by email | - | user | admin | 200 |
| PUT | `/users/:id` | Update user | name, email, phone | updated user | admin, self | 200 |
| DELETE | `/users/:id` | Delete user | - | success message | admin | 200 |

### 3.3 Clinic Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/clinics` | Get all clinics (with doctors) | - | clinic[] | Public | 200 |
| GET | `/clinics/:id` | Get clinic by ID | - | clinic with doctors | Public | 200 |
| POST | `/clinics` | Create clinic | name, floor, description, image | created clinic | admin | 201 |
| PUT | `/clinics/:id` | Update clinic | name, floor, description, image | updated clinic | admin | 200 |
| DELETE | `/clinics/:id` | Delete clinic | - | success message | admin | 200 |
| GET | `/clinics/:id/doctors` | Get doctors in clinic | - | doctor[] | Public | 200 |

### 3.4 Doctor Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/doctors` | Get all doctors | - | doctor[] | Public | 200 |
| GET | `/doctors/:id` | Get doctor by ID | - | doctor with schedule | Public | 200 |
| GET | `/doctors/clinic/:clinicId` | Get doctors by clinic | - | doctor[] | Public | 200 |
| POST | `/doctors` | Create doctor | user_id, specialization, clinic_id, schedule[] | created doctor | admin | 201 |
| PUT | `/doctors/:id` | Update doctor | specialization, clinic_id, schedule[] | updated doctor | admin, self | 200 |
| DELETE | `/doctors/:id` | Delete doctor | - | success message | admin | 200 |
| GET | `/doctors/:id/schedule` | Get doctor's schedule | - | schedule[] | Public | 200 |
| POST | `/doctors/:id/schedule` | Add schedule slot | day_of_week, start_time, end_time | created schedule | admin, self | 201 |
| DELETE | `/doctors/:id/schedule/:scheduleId` | Remove schedule slot | - | success message | admin, self | 200 |

### 3.5 Patient Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/patients` | Get all patients | - | patient[] | admin, reception | 200 |
| GET | `/patients/:id` | Get patient by ID | - | patient | admin, reception, self | 200 |
| POST | `/patients` | Create patient | user_id, gender, date_of_birth, address | created patient | admin | 201 |
| PUT | `/patients/:id` | Update patient | gender, date_of_birth, address | updated patient | admin, self | 200 |
| DELETE | `/patients/:id` | Delete patient | - | success message | admin | 200 |
| GET | `/patients/:id/appointments` | Get patient's appointments | - | appointment[] | admin, reception, self | 200 |
| GET | `/patients/:id/medical-records` | Get patient's medical records | - | medical-record[] | admin, doctor, self | 200 |

### 3.6 Receptionist Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/receptionists` | Get all receptionists | - | receptionist[] | admin | 200 |
| GET | `/receptionists/:id` | Get receptionist by ID | - | receptionist | admin, self | 200 |
| POST | `/receptionists` | Create receptionist | user_id, assigned_clinic_id | created receptionist | admin | 201 |
| PUT | `/receptionists/:id` | Update receptionist | assigned_clinic_id | updated receptionist | admin | 200 |
| DELETE | `/receptionists/:id` | Delete receptionist | - | success message | admin | 200 |

### 3.7 Appointment Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/appointments` | Get all appointments (filtered) | query: status, date_from, date_to | appointment[] | admin, reception, doctor | 200 |
| GET | `/appointments/:id` | Get appointment by ID | - | appointment | admin, reception, doctor, patient | 200 |
| GET | `/appointments/patient/:patientId` | Get patient's appointments | - | appointment[] | admin, reception, patient | 200 |
| GET | `/appointments/doctor/:doctorId` | Get doctor's appointments | - | appointment[] | admin, reception, doctor | 200 |
| POST | `/appointments` | Create appointment | patient_id, doctor_id, clinic_id, appointment_date, appointment_time, (booked_by_user_id) | created appointment | admin, reception, patient | 201 |
| PUT | `/appointments/:id` | Update appointment | appointment_date, appointment_time, status, payment_status, notes | updated appointment | admin, reception, doctor | 200 |
| PUT | `/appointments/:id/cancel` | Cancel appointment | reason | cancelled appointment | admin, reception, patient | 200 |
| GET | `/appointments/doctor/:doctorId/available-slots` | Get available slots for doctor | query: date | available_slots[] | Public | 200 |
| POST | `/appointments/:id/mark-completed` | Mark appointment as completed | - | updated appointment | doctor | 200 |

### 3.8 Medical Records Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/medical-records` | Get all records (filtered) | query: patient_id, doctor_id | medical-record[] | admin, doctor | 200 |
| GET | `/medical-records/:id` | Get record by ID | - | medical-record | admin, doctor, patient (own) | 200 |
| GET | `/medical-records/patient/:patientId` | Get patient's records | - | medical-record[] | admin, doctor, patient | 200 |
| GET | `/medical-records/doctor/:doctorId` | Get doctor's records | - | medical-record[] | doctor | 200 |
| POST | `/medical-records` | Create medical record | patient_id, doctor_id, appointment_id, diagnosis, prescription, notes, follow_up_date | created record | doctor | 201 |
| PUT | `/medical-records/:id` | Update record | diagnosis, prescription, notes, follow_up_date | updated record | doctor | 200 |
| DELETE | `/medical-records/:id` | Delete record | - | success message | admin | 200 |

### 3.9 Messaging Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Roles | Status Code |
|--------|----------|---------|--------------|----------|-------|------------|
| GET | `/messages` | Get user's messages | query: user_id | message[] | All (self only) | 200 |
| GET | `/messages/conversation/:userId` | Get conversation with user | - | message[] | All (parties only) | 200 |
| POST | `/messages` | Send message | receiver_id, message | created message | doctor, patient, reception | 201 |
| GET | `/messages/:id` | Get message by ID | - | message | All (sender/receiver) | 200 |
| PUT | `/messages/:id/mark-read` | Mark message as read | - | updated message | All (receiver) | 200 |

---

## 4. RESOLVED CONFLICTS SUMMARY

### Conflict 1: Appointment Booking
**Resolution:** Both receptionist AND patient can book appointments
- **Reception Role:** Can book on behalf of any patient (booked_by_user_id = reception user)
- **Patient Role:** Can only book for themselves (booked_by_user_id = patient user)
- **Database:** `booked_by_user_id` tracks who booked the appointment
- **Validator:** Prevent double booking at same doctor+time+date

### Conflict 2: Payment Tracking
**Resolution:** Added `payment_status` field to Appointments table
- Values: `pending`, `paid`, `refunded`
- Also created separate `payments` table for detailed transaction tracking (optional phase 2)

### Conflict 3: Follow-up Dates
**Resolution:** Added `follow_up_date` field to Medical Records table
- Allows doctors to schedule follow-ups
- Optional field (can be NULL)

### Conflict 4: Missing Public Pages
**Resolution:** Added endpoints for public access
- `GET /clinics` - List all clinics (already had this)
- `GET /clinics/:id` - Get clinic details with doctors
- `GET /doctors` - List all doctors
- `GET /doctors/:id` - Get doctor details with schedule
- `GET /doctors/clinic/:clinicId` - Filter doctors by clinic
- `GET /doctors/:id/schedule` - View doctor's availability

### Conflict 5: Receptionist Management
**Resolution:** Added new `receptionists` module and endpoints
- Admin can create/update/delete receptionists
- Receptionists can be assigned to specific clinics (optional)
- Receptionists have their own user profile with role='reception'

### Conflict 6: Enhanced Doctor Dashboard
**Resolution:** Doctor endpoints now support full workflow
- `GET /appointments/doctor/:id` - View own appointments
- `GET /medical-records/doctor/:id` - View own records
- `POST /medical-records` - Create record with diagnosis, prescription, follow-up
- `PUT /medical-records/:id` - Update record (add prescription, follow-up)
- `PUT /appointments/:id/mark-completed` - Mark appointment complete

---

## 5. RECOMMENDED BUILD ORDER

### Phase 1: Foundation (Core Infrastructure)
**Duration:** 2-3 days
**Priority:** Critical - everything depends on this
1. **Database Module** - Set up TypeORM, migrations, connection
2. **Auth Module** - JWT strategy, guards, login/register endpoints
3. **Users Module** - Basic CRUD for user management
4. **Common Module** - Roles decorator, guards, constants

**Deliverables:**
- User registration & login working
- JWT authentication functional
- Role-based access control working
- Database fully configured

---

### Phase 2: Core Resources (Main Entities)
**Duration:** 3-4 days
**Priority:** Critical - needed for most features
1. **Clinics Module** - Full CRUD endpoints (public + admin)
2. **Doctors Module** - Doctor creation with schedules
3. **Patients Module** - Patient management (linked to users)
4. **Receptionists Module** - Create receptionist accounts

**Deliverables:**
- All clinic management working
- Doctors can be created with schedules
- Patients properly linked to user accounts
- Receptionists can be assigned to clinics

---

### Phase 3: Core Features (Main Functionality)
**Duration:** 4-5 days
**Priority:** Critical - main features of the application
1. **Appointments Module** - Create, update, cancel, slot validation
2. **Medical Records Module** - Full CRUD with doctor workflow
3. **Messages Module** - Basic messaging between users

**Deliverables:**
- Full appointment booking workflow
- Doctor can record patient visits with diagnosis/prescription/follow-up
- Reception can manage appointments
- Users can message each other
- Payment status tracked in appointments

---

### Phase 4: Enhancement & Testing
**Duration:** 2-3 days
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

