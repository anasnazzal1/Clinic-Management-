# Clinic Management System - Backend Testing Plan

## Overview
This document outlines the testing strategy for the Clinic Management System backend, covering unit tests, integration tests, and end-to-end (E2E) tests for all modules.

## Testing Framework & Tools
- **Unit Testing**: Jest with `@nestjs/testing`
- **Mocking**: Jest mock functions and `jest.mock()`
- **E2E Testing**: Supertest + Jest
- **Coverage Target**: 80% overall, 90% for critical paths (auth, payments, appointments)

---

## 1. AUTH MODULE TESTING

### 1.1 Unit Tests - Auth Service

**File**: `src/modules/auth/auth.service.spec.ts`

#### Test Cases
```
✓ register()
  ✓ should create a new patient user with hashed password
  ✓ should throw ConflictException if email already exists
  ✓ should generate and save email verification token
  ✓ should send verification email (mocked)
  ✓ should set user verification status to false initially

✓ login()
  ✓ should return JWT token and user on valid credentials
  ✓ should throw NotFoundException if user doesn't exist
  ✓ should throw BadRequestException if password is incorrect
  ✓ should exclude passwordHash from response

✓ verifyEmail()
  ✓ should mark user as verified when token is valid
  ✓ should throw NotFoundException if token is invalid
  ✓ should throw BadRequestException if token is expired
  ✓ should delete token after successful verification

✓ validateUser()
  ✓ should return user if credentials are valid
  ✓ should return null if credentials are invalid
```

### 1.2 Controller Tests - Auth Controller

**File**: `src/modules/auth/auth.controller.spec.ts`

#### Test Cases
```
✓ POST /auth/register
  ✓ should return 201 with user and JWT token
  ✓ should validate required fields (name, email, password)
  ✓ should return 400 if validation fails

✓ POST /auth/login
  ✓ should return 200 with JWT token
  ✓ should return 400 if email/password missing
  ✓ should return 400 if unverified user attempts login
  ✓ should return 401 for invalid credentials
```

### 1.3 Integration Tests

**File**: `src/modules/auth/auth.integration.spec.ts`

#### Test Scenarios
```
✓ Complete registration flow
  ✓ Register → Verify email → Login should succeed
  ✓ Register → Login without verification should fail

✓ JWT token validation
  ✓ Valid token should grant access to protected routes
  ✓ Expired token should return 401
  ✓ Invalid token format should return 401
```

---

## 2. USERS MODULE TESTING

### 2.1 Unit Tests - Users Service

**File**: `src/modules/users/users.service.spec.ts`

#### Test Cases
```
✓ create()
  ✓ should create admin user with hashed password
  ✓ should throw BadRequestException if role is not admin
  ✓ should throw ConflictException if email exists
  ✓ should lowercase email before saving

✓ findAll()
  ✓ should return all users excluding passwordHash
  ✓ should return empty array if no users exist

✓ findById()
  ✓ should return user by ID excluding passwordHash
  ✓ should throw NotFoundException if user doesn't exist

✓ findByEmail()
  ✓ should return user by email (case-insensitive)
  ✓ should throw NotFoundException if email doesn't exist

✓ findByLinkedId()
  ✓ should return user linked to doctor/patient/receptionist
  ✓ should throw NotFoundException if linkedId doesn't exist

✓ update()
  ✓ should update user fields
  ✓ should throw ConflictException if new email already exists
  ✓ should throw NotFoundException if user doesn't exist
  ✓ should not allow updating role or linkedId

✓ delete()
  ✓ should delete user by ID
  ✓ should throw NotFoundException if user doesn't exist

✓ createUserForRole()
  ✓ should create user with linkedId for role-based creations
  ✓ should auto-set role from parameter
```

### 2.2 Controller Tests - Users Controller

**File**: `src/modules/users/users.controller.spec.ts`

#### Test Cases
```
✓ GET /users (admin only)
  ✓ should return list of all users
  ✓ should return 403 if not admin

✓ GET /users/:id (admin or self)
  ✓ should return specific user
  ✓ should return 403 if not admin and not self
  ✓ should exclude passwordHash

✓ GET /users/by-linked/:linkedId (admin only)
  ✓ should return user linked to entity
  ✓ should return 404 if not found

✓ POST /users (admin only)
  ✓ should create admin user (role must be admin)
  ✓ should return 403 if not admin
  ✓ should validate input

✓ PUT /users/:id (admin or self)
  ✓ should update user
  ✓ should return 403 if not admin and not self

✓ DELETE /users/:id (admin only)
  ✓ should delete user
  ✓ should return 403 if not admin
```

---

## 3. CLINICS MODULE TESTING

### 3.1 Unit Tests - Clinics Service

**File**: `src/modules/clinics/clinics.service.spec.ts`

#### Test Cases
```
✓ create()
  ✓ should create clinic with valid data
  ✓ should validate required fields (name, workingDays, workingHours)

✓ findAll()
  ✓ should return all clinics
  ✓ should return empty array if none exist

✓ findOne()
  ✓ should return clinic by ID
  ✓ should throw NotFoundException if not found

✓ update()
  ✓ should update clinic fields
  ✓ should throw NotFoundException if clinic doesn't exist

✓ remove()
  ✓ should delete clinic
  ✓ should throw NotFoundException if doesn't exist
  ✓ should cascade delete doctors in clinic (test relationship)
```

### 3.2 Controller Tests - Clinics Controller

**File**: `src/modules/clinics/clinics.controller.spec.ts`

#### Test Cases
```
✓ GET /clinics (public)
  ✓ should return all clinics without auth

✓ GET /clinics/:id (public)
  ✓ should return specific clinic

✓ POST /clinics (admin only)
  ✓ should create clinic
  ✓ should return 403 if not admin

✓ PUT /clinics/:id (admin only)
  ✓ should update clinic
  ✓ should return 403 if not admin

✓ DELETE /clinics/:id (admin only)
  ✓ should delete clinic
  ✓ should return 403 if not admin
```

---

## 4. DOCTORS MODULE TESTING

### 4.1 Unit Tests - Doctors Service

**File**: `src/modules/doctors/doctors.service.spec.ts`

#### Test Cases (Critical Path)
```
✓ create()
  ✓ should create doctor and linked user account
  ✓ should throw ConflictException if doctor already exists in clinic
  ✓ should create user with linkedId = doctor._id
  ✓ should rollback doctor creation if user creation fails
  ✓ should validate clinicId exists before creating

✓ findAll()
  ✓ should return all doctors

✓ findOne()
  ✓ should return doctor by ID
  ✓ should throw NotFoundException if not found

✓ update()
  ✓ should update doctor (not username/password)
  ✓ should throw NotFoundException if not found

✓ remove()
  ✓ should delete doctor
  ✓ should cascade delete associated appointments/visits
```

### 4.2 Controller Tests - Doctors Controller

**File**: `src/modules/doctors/doctors.controller.spec.ts`

#### Test Cases
```
✓ GET /doctors (public)
  ✓ should return all doctors

✓ POST /doctors (admin only)
  ✓ should create doctor and user account
  ✓ should return 201 with doctor data
  ✓ should return 403 if not admin
  ✓ should validate all required fields

✓ PUT /doctors/:id (admin only)
  ✓ should update doctor details
  ✓ should not allow updating linked user via doctor endpoint

✓ DELETE /doctors/:id (admin only)
  ✓ should delete doctor
  ✓ should return 403 if not admin
```

---

## 5. PATIENTS MODULE TESTING

### 5.1 Unit Tests - Patients Service

**File**: `src/modules/patients/patients.service.spec.ts`

#### Test Cases (Critical Path)
```
✓ create()
  ✓ should create patient and linked user account
  ✓ should throw ConflictException if email already exists
  ✓ should create user with linkedId = patient._id
  ✓ should rollback patient creation if user creation fails

✓ findAll()
  ✓ should return all patients

✓ findOne()
  ✓ should return patient by ID
  ✓ should throw NotFoundException if not found

✓ update()
  ✓ should update patient fields
  ✓ should throw ConflictException if new email exists
  ✓ should throw NotFoundException if patient doesn't exist

✓ remove()
  ✓ should delete patient
  ✓ should cascade delete appointments and visits
```

### 5.2 Controller Tests - Patients Controller

**File**: `src/modules/patients/patients.controller.spec.ts`

#### Test Cases
```
✓ GET /patients (admin, reception only)
  ✓ should return all patients
  ✓ should return 403 if not admin/reception

✓ GET /patients/:id (admin, reception, or self)
  ✓ should return patient details
  ✓ should allow patient to view own record
  ✓ should deny patient viewing other records
  ✓ should deny unauthorized roles

✓ POST /patients (admin, reception only)
  ✓ should create patient and user account
  ✓ should return 403 if not admin/reception
  ✓ should validate required fields

✓ PUT /patients/:id (admin, reception, or self)
  ✓ should allow patient to update own record
  ✓ should deny patient updating other records
  ✓ should allow admin/reception to update any

✓ DELETE /patients/:id (admin only)
  ✓ should delete patient
  ✓ should return 403 if not admin
```

---

## 6. RECEPTIONISTS MODULE TESTING

### 6.1 Unit Tests - Receptionists Service

**File**: `src/modules/receptionists/receptionists.service.spec.ts`

#### Test Cases
```
✓ create()
  ✓ should create receptionist and linked user account
  ✓ should throw ConflictException if email exists
  ✓ should set linkedId correctly

✓ findAll()
  ✓ should return all receptionists

✓ findOne()
  ✓ should return receptionist by ID
  ✓ should throw NotFoundException if not found

✓ update()
  ✓ should update receptionist fields
  ✓ should throw ConflictException if email exists

✓ remove()
  ✓ should delete receptionist
```

### 6.2 Controller Tests - Receptionists Controller

**File**: `src/modules/receptionists/receptionists.controller.spec.ts`

#### Test Cases
```
✓ GET /receptionists (admin only)
  ✓ should return all receptionists
  ✓ should return 403 if not admin

✓ GET /receptionists/:id (admin or self)
  ✓ should return receptionist details
  ✓ should allow receptionist to view own record
  ✓ should deny viewing other receptionists (except admin)

✓ POST /receptionists (admin only)
  ✓ should create receptionist and user account
  ✓ should return 403 if not admin

✓ PUT /receptionists/:id (admin or self)
  ✓ should allow receptionist to update own record
  ✓ should allow admin to update any

✓ DELETE /receptionists/:id (admin only)
  ✓ should delete receptionist
```

---

## 7. APPOINTMENTS MODULE TESTING (CRITICAL)

### 7.1 Unit Tests - Appointments Service

**File**: `src/modules/appointments/appointments.service.spec.ts`

#### Test Cases (High Priority)
```
✓ create()
  ✓ should create appointment with valid data
  ✓ should set status to 'pending' by default
  ✓ should validate patientId, doctorId, clinicId are valid ObjectIds
  ✓ should save date and time as provided

✓ findAll()
  ✓ should return all appointments

✓ findByDoctor()
  ✓ should return only appointments for specific doctor
  ✓ should return empty array if no appointments

✓ findByPatient()
  ✓ should return only appointments for specific patient
  ✓ should return empty array if no appointments

✓ findOne()
  ✓ should return appointment by ID
  ✓ should throw NotFoundException if not found

✓ update()
  ✓ should update appointment status
  ✓ should allow updating date/time if status is pending
  ✓ should throw NotFoundException if doesn't exist

✓ remove()
  ✓ should delete appointment
  ✓ should only delete pending/cancelled appointments
```

### 7.2 Controller Tests - Appointments Controller

**File**: `src/modules/appointments/appointments.controller.spec.ts`

#### Test Cases (High Priority)
```
✓ GET /appointments (admin, reception, doctor)
  ✓ should return all appointments
  ✓ should return 403 for unauthorized roles

✓ GET /appointments/doctor/:doctorId (admin, reception, doctor)
  ✓ should return doctor's appointments
  ✓ should allow doctor to view only own appointments
  ✓ should deny doctor viewing other doctor's appointments

✓ GET /appointments/patient/:patientId (admin, reception, patient)
  ✓ should return patient's appointments
  ✓ should allow patient to view only own appointments
  ✓ should deny patient viewing other patient's appointments

✓ GET /appointments/:id (all authenticated)
  ✓ should return appointment details
  ✓ should enforce role-based access

✓ POST /appointments (admin, reception, patient)
  ✓ should create appointment
  ✓ should set status to 'pending'
  ✓ should validate all required fields
  ✓ should return 403 for doctors trying to create

✓ PUT /appointments/:id (admin, reception, doctor)
  ✓ should allow doctor to update own appointments
  ✓ should deny doctor updating other appointments
  ✓ should allow admin/reception to update any

✓ DELETE /appointments/:id (admin, reception)
  ✓ should delete appointment
  ✓ should return 403 for patients/doctors
```

### 7.3 Integration Tests - Appointments

**File**: `src/modules/appointments/appointments.integration.spec.ts`

#### Test Scenarios (Critical)
```
✓ Appointment booking workflow
  ✓ Patient creates appointment → Status is pending
  ✓ Doctor updates appointment status → Changed in database
  ✓ Reception cancels appointment → Status is cancelled

✓ Access control workflow
  ✓ Patient can only access own appointments
  ✓ Doctor can only access own appointments
  ✓ Admin/reception can access all appointments
  ✓ Unauthorized roles get 403 error
```

---

## 8. VISITS MODULE TESTING (CRITICAL)

### 8.1 Unit Tests - Visits Service

**File**: `src/modules/visits/visits.service.spec.ts`

#### Test Cases
```
✓ create()
  ✓ should create visit with patientId, doctorId, date
  ✓ should allow optional diagnosis and notes
  ✓ should validate patientId and doctorId are valid

✓ findAll()
  ✓ should return all visits

✓ findOne()
  ✓ should return visit by ID
  ✓ should throw NotFoundException if not found

✓ update()
  ✓ should update visit diagnosis and notes
  ✓ should allow updating date
  ✓ should throw NotFoundException if doesn't exist

✓ remove()
  ✓ should delete visit
  ✓ should throw NotFoundException if not found
```

### 8.2 Controller Tests - Visits Controller

**File**: `src/modules/visits/visits.controller.spec.ts`

#### Test Cases
```
✓ GET /visits (admin, doctor)
  ✓ should return all visits
  ✓ should return 403 for unauthorized roles

✓ GET /visits/:id (admin, doctor, patient)
  ✓ should return visit details
  ✓ should allow patient to view own visits
  ✓ should deny patient viewing other patient's visits
  ✓ should allow doctor to view own visits
  ✓ should deny doctor viewing other doctor's visits

✓ POST /visits (doctor only)
  ✓ should create visit record
  ✓ should require patientId, doctorId, date
  ✓ should return 403 for non-doctors

✓ PUT /visits/:id (doctor only)
  ✓ should allow doctor to update own visit
  ✓ should deny doctor updating other doctor's visit
  ✓ should return 403 for non-doctors

✓ DELETE /visits/:id (admin only)
  ✓ should delete visit
  ✓ should return 403 for non-admins
```

### 8.3 Integration Tests - Visits

**File**: `src/modules/visits/visits.integration.spec.ts`

#### Test Scenarios
```
✓ Medical record workflow
  ✓ Doctor creates visit for completed appointment
  ✓ Doctor adds diagnosis and notes
  ✓ Patient can view their visit history

✓ Access control workflow
  ✓ Patient can only view own visits
  ✓ Doctor can only view own visits
  ✓ Admin can view all visits
```

---

## 9. END-TO-END (E2E) TESTS

### 9.1 Critical User Flows

**File**: `test/app.e2e-spec.ts`

#### Test Scenarios

**Flow 1: Patient Registration & Appointment Booking**
```
✓ Patient registers with email
✓ Verification email sent (mocked)
✓ Patient verifies email with token
✓ Patient logs in successfully
✓ Patient browses clinics (GET /clinics)
✓ Patient browses doctors (GET /doctors)
✓ Patient creates appointment
✓ Appointment appears in patient's list
✓ Notification sent to receptionist (mocked)
```

**Flow 2: Doctor Workflow**
```
✓ Admin creates doctor with user account
✓ Doctor receives credentials
✓ Doctor logs in
✓ Doctor views own appointments
✓ Doctor completes appointment (updates status)
✓ Doctor creates visit record with diagnosis
✓ Doctor views own visit records
✓ Patient can view the visit
```

**Flow 3: Receptionist Workflow**
```
✓ Admin creates receptionist with user account
✓ Receptionist logs in
✓ Receptionist views all patients
✓ Receptionist creates new patient with account
✓ Receptionist books appointment for patient
✓ Receptionist views all appointments
✓ Receptionist updates appointment status
```

**Flow 4: Admin Operations**
```
✓ Admin creates clinic
✓ Admin creates doctor linked to clinic
✓ Admin creates patient
✓ Admin creates receptionist
✓ Admin views all users
✓ Admin manages all appointments
✓ Admin generates patient visit report
```

---

## 10. TEST EXECUTION & COVERAGE

### 10.1 Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run only E2E tests
npm run test:e2e

# Run specific test file
npm run test -- users.service.spec.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should create"
```

### 10.2 Coverage Goals

| Category | Target | Modules |
|----------|--------|---------|
| Services | 85% | All modules |
| Controllers | 80% | All modules |
| Critical Paths | 95% | Auth, Appointments, Visits |
| Overall | 80% | Entire application |

### 10.3 Coverage Report Output

```bash
# Generate HTML coverage report
npm run test:cov -- --coverage

# View report
open coverage/lcov-report/index.html
```

---

## 11. TEST DATA & FIXTURES

### 11.1 Test Database Setup

**File**: `test/setup-db.ts`

```typescript
// Create test MongoDB connection
// Load seed data for testing
// Cleanup after tests
```

### 11.2 Mock Data Factory

**File**: `test/factories/`

```
- user.factory.ts - Generate test users
- clinic.factory.ts - Generate test clinics
- doctor.factory.ts - Generate test doctors
- patient.factory.ts - Generate test patients
- appointment.factory.ts - Generate test appointments
- visit.factory.ts - Generate test visits
```

### 11.3 Test Fixtures

```typescript
// Mock admin user
const adminUser = {
  _id: new ObjectId(),
  username: 'admin',
  email: 'admin@test.com',
  role: 'admin',
  // ...
};

// Mock doctor user
const doctorUser = {
  _id: new ObjectId(),
  username: 'dr_smith',
  email: 'dr.smith@test.com',
  role: 'doctor',
  linkedId: new ObjectId(),
};
```

---

## 12. CI/CD Integration

### 12.1 Pre-commit Hooks

```bash
# Run linting and unit tests before commit
husky install
npm run lint
npm run test
```

### 12.2 GitHub Actions Pipeline

**File**: `.github/workflows/test.yml`

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:cov
      - run: npm run test:e2e
      # Upload coverage to codecov
```

---

## 13. Testing Checklist

### Pre-Implementation
- [ ] All modules have corresponding test files
- [ ] Test database connection configured
- [ ] Mocking strategy defined (Jest mocks, test doubles)

### During Development
- [ ] Write tests alongside code (TDD approach)
- [ ] Maintain >80% coverage
- [ ] Run tests locally before committing
- [ ] All tests pass in CI/CD

### Before Release
- [ ] Run full test suite
- [ ] Coverage >80% overall
- [ ] E2E tests pass
- [ ] Load tests on critical endpoints
- [ ] Security tests (SQL injection, auth bypass, etc.)

---

## 14. Performance Testing

### 14.1 Load Testing (Optional)

**Tools**: Artillery, K6, or Apache JMeter

```
✓ Appointment creation under load
  - Target: 100 requests/sec
  - Expected response time: <500ms

✓ Patient list retrieval under load
  - Target: 1000 requests/sec
  - Expected response time: <200ms

✓ Doctor appointments query under load
  - Target: 500 requests/sec
  - Expected response time: <300ms
```

### 14.2 Database Query Optimization Tests

```
✓ Verify indices are being used
✓ Query execution times <100ms for frequent queries
✓ Bulk operations optimized (batch inserts/updates)
```

---

## 15. Security Testing

### 15.1 Authentication Security

```
✓ Password hashing verification
  - Passwords should never be returned from API
  - Passwords should never be logged

✓ JWT token validation
  - Expired tokens rejected
  - Tampered tokens rejected
  - Missing tokens blocked

✓ SQL/NoSQL injection prevention
  - Mongoose schema validation blocks injection
  - Input sanitization on all endpoints
```

### 15.2 Authorization Security

```
✓ Role-based access control (RBAC)
  - Patient cannot access doctor endpoints
  - Doctor cannot access admin endpoints
  - Receptionist limited to assigned actions

✓ Data access isolation
  - Patient can only view own records
  - Doctor can only modify own appointments/visits
```

---

## Summary

**Total Test Breakdown**:
- Unit Tests: 150+ test cases
- Integration Tests: 30+ test scenarios
- E2E Tests: 15+ critical user flows

**Estimated Timeline**:
- Phase 1 (Unit Tests): 2-3 weeks
- Phase 2 (Integration Tests): 1-2 weeks
- Phase 3 (E2E Tests): 1 week
- Phase 4 (Performance/Security): 1 week

**Success Criteria**:
- All tests passing in CI/CD
- >80% code coverage
- 0 critical security vulnerabilities
- All critical flows verified E2E
