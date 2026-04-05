# Phase 1: Backend Foundation Implementation

## ✅ Completed Setup

### 1. Database Module (MongoDB + Mongoose)
- ✅ MongoDB connection via Mongoose
- ✅ ConfigModule for environment variables
- ✅ Async factory for flexible configuration

**Location:** `src/config/database/database.module.ts`

### 2. Auth Module (Simplified JWT)
- ✅ JWT strategy using Passport
- ✅ JWT Auth Guard for protected routes
- ✅ Roles Guard for role-based access control
- ✅ Login endpoint (email + password)
- ✅ Register endpoint (patient registration)
- ✅ Email verification (token-based)
- ✅ No refresh token (simple 24-hour expiration)

**Key Files:**
- `src/modules/auth/auth.service.ts` - Core authentication logic
- `src/modules/auth/auth.controller.ts` - Auth endpoints
- `src/modules/auth/strategies/jwt.strategy.ts` - JWT validation
- `src/modules/auth/guards/jwt-auth.guard.ts` - Protect endpoints
- `src/modules/auth/guards/roles.guard.ts` - Role-based access

### 3. Users Module (Admin User Management)
- ✅ Create users (admin only - for doctors, receptionists, patients)
- ✅ Get all users (admin only)
- ✅ Get user by ID (admin only)
- ✅ Get user by linked ID (admin only)
- ✅ Update user (admin only)
- ✅ Delete user (admin only)
- ✅ Get users by role

**Location:** `src/modules/users/`

### 4. Common Utilities
- ✅ Role constants (ADMIN, RECEPTION, DOCTOR, PATIENT)
- ✅ Roles decorator (@Roles)
- ✅ Database connection pooling ready

**Locations:**
- `src/common/constants/roles.constant.ts`
- `src/common/decorators/roles.decorator.ts`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string ready
- npm package manager

### Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
The `.env` file is already created with defaults:
```env
MONGODB_URI=mongodb://localhost:27017/clinic_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=86400s
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Change JWT_SECRET in production!**

3. **Start MongoDB** (if local)
```bash
mongod
```

4. **Start Development Server**
```bash
npm run start:dev
```

Server will run on `http://localhost:3001`

---

## 📋 API Endpoints (Phase 1)

### Authentication (Public)
```
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
Response: { user, verificationToken }

POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
Response: { user, accessToken }

POST /auth/verify-email
{
  "token": "verification_token_here"
}
Response: { user, message }
```

### Users Management (Admin Only)
```
POST /users (Create user - for doctors/receptionists/patients)
GET /users (Get all users)
GET /users/:id (Get user by ID)
GET /users/by-linked/:linkedId (Get user by linked ID)
PUT /users/:id (Update user)
DELETE /users/:id (Delete user)
```

**All user endpoints require:**
- Valid JWT token in header: `Authorization: Bearer <token>`
- Admin role

---

## 🔐 How Authentication Works

### 1. Patient Registration Flow
```
1. POST /auth/register
   → User created (role='patient', isVerified=false)
   → Verification token generated (24h expiry)
   → Response includes token

2. Email sent with verification link (frontend handles)

3. POST /auth/verify-email
   → Token validated
   → User marked as verified
   → Ready to login

4. POST /auth/login
   → Email + password checked
   → JWT token returned (24h expiry)
   → Frontend stores token in localStorage
```

### 2. Admin/Doctor/Reception User Creation
```
1. Admin POST /users
   → Creates user with specified role
   → Auto-verified (isVerified=true)
   → Password set by admin

2. User receives credentials

3. User POST /auth/login
   → JWT token returned
   → Can access role-based endpoints
```

### 3. JWT Token Usage
```
Every protected request:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT expires in 24 hours (simple, no refresh needed)
Token contains: user ID, email, role, name
```

### 4. Role-Based Access Control
```
@Roles([UserRole.ADMIN]) - only admin
@Roles([UserRole.DOCTOR]) - only doctor
@Roles([UserRole.RECEPTION]) - only reception
@Roles([UserRole.PATIENT]) - only patient
@Roles([UserRole.ADMIN, UserRole.DOCTOR]) - admin or doctor
```

---

## 📊 Database Schema (Phase 1)

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  name: String,
  email: String (unique, lowercase),
  passwordHash: String,
  phone: String,
  role: 'admin' | 'receptionist' | 'doctor' | 'patient',
  linkedId: ObjectId, // References doctor/patient/receptionist record
  createdAt: Date,
  updatedAt: Date
}
```

### Email Verification Tokens Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  token: String (unique, 24h expiry),
  expiresAt: Date,
  createdAt: Date
}
```

---

## 🧪 Testing the API

### Using cURL

1. **Register as Patient**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Patient",
    "email": "john@test.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Patient",
      "email": "john@test.com",
      "role": "patient"
    },
    "verificationToken": "abc123..."
  },
  "message": "Registration successful. Please verify your email."
}
```

2. **Verify Email**
```bash
curl -X POST http://localhost:3001/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{ "token": "abc123..." }'
```

3. **Login**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "patient" },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

4. **Create Doctor User (Admin)**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Dr. Sarah",
    "email": "doctor@test.com",
    "password": "docpassword123",
    "phone": "+9876543210",
    "role": "doctor"
  }'
```

---

## 🛠️ Development Tips

### Enable Debug Logging
```bash
DEBUG=* npm run start:dev
```

### Run Tests
```bash
npm test           # Run tests
npm run test:cov   # With coverage
npm run test:watch # Watch mode
```

### Format Code
```bash
npm run format
npm run lint
```

---

## 📝 Next Steps: Phase 2

After Phase 1 is working, implement:
- **Clinics Module** - Full CRUD (public read, admin write) with workingDays/workingHours
- **Doctors Module** - Doctor creation with basic info (name, specialization, clinicId, contact)
- **Patients Module** - Patient management (name, age, gender, contact, address)
- **Receptionists Module** - Receptionist account creation
- **Appointments Module** - Appointment booking and management
- **Visits Module** - Visit records with diagnosis and notes

See `BACKEND_DEVELOPMENT_PLAN.md` for complete Phase 2-3 details.

---

## 🔗 Key Files Structure

```
src/
├── main.ts                          ← Entry point
├── app.module.ts                    ← Root module
├── database/
│   └── database.module.ts           ← MongoDB connection
├── common/
│   ├── constants/roles.constant.ts  ← Role enums
│   └── decorators/roles.decorator.ts ← @Roles decorator
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── entities/email-verification-token.entity.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       └── verify-email.dto.ts
└── users/
    ├── users.module.ts
    ├── users.service.ts
    ├── users.controller.ts
    ├── entities/user.entity.ts
    └── dto/
        ├── create-user.dto.ts
        ├── update-user.dto.ts
        └── user.dto.ts
```

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
→ Ensure MongoDB is running: `mongod`

### JWT Validation Error
```
Error: invalid token
```
→ Change JWT_SECRET in production env file

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
→ Frontend URL should match FRONTEND_URL in .env

---

## ✨ Phase 1 Summary

**Status**: ✅ Complete

**Implemented:**
- ✅ Database (MongoDB + Mongoose)
- ✅ Authentication (Register, Login)
- ✅ User Management (Admin CRUD with linkedId support)
- ✅ JWT with 24h expiration
- ✅ Role-based access control
- ✅ Email verification tokens
- ✅ CORS enabled
- ✅ Global validation pipe

**Ready for**: Phase 2 (Clinics, Doctors, Patients, Receptionists, Appointments, Visits)



