# Phase 1 Quick Start Checklist

## Before Running the Backend

### Step 1: Install Dependencies ✓
```bash
cd backend
npm install
```
**Expected output:** `added 200+ packages...`

### Step 2: Verify MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: Docker MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option C: MongoDB Atlas (update .env MONGODB_URI)
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/clinic_management
```
**Expected:** Connection successful (check logs after starting server)

### Step 3: Update .env (if needed)
File: `.env`
```env
MONGODB_URI=mongodb://localhost:27017/clinic_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=86400s
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## Running the Backend

### Start Development Server
```bash
npm run start:dev
```

**Expected output:**
```
[Nest] 12345  - 01/15/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/15/2025, 10:30:01 AM     LOG [InstanceLoader] MongooseModule dependencies initialized
[Nest] 12345  - 01/15/2025, 10:30:01 AM     LOG [InstanceLoader] ConfigModule dependencies initialized
...
[Nest] 12345  - 01/15/2025, 10:30:02 AM     LOG [NestApplication] Nest application successfully started
🚀 Server running on http://localhost:3001
```

---

## Testing Phase 1

### Test 1: Health Check (No Auth Required)
```bash
curl http://localhost:3001
```

### Test 2: Register Patient
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

**Save the `verificationToken` from response**

### Test 3: Verify Email
```bash
curl -X POST http://localhost:3001/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{ "token": "[PASTE_VERIFICATION_TOKEN]" }'
```

### Test 4: Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }'
```

**Save the `accessToken` from response**

### Test 5: Access Protected Route (Admin Only)
```bash
curl http://localhost:3001/users \
  -H "Authorization: Bearer [PASTE_ACCESS_TOKEN]"
```

**Expected:** 403 Forbidden (patient cannot access admin endpoint) ✓

### Test 6: Create Admin User
First, create an admin user directly in database:
```bash
# Using mongosh
mongosh
> use clinic_management
> db.users.insertOne({
    name: "Admin User",
    email: "admin@test.com",
    passwordHash: "$2a$10$...", // bcrypt hash of "admin123"
    role: "admin",
    isVerified: true
  })
```

Then login as admin and test GET /users again.

---

## Verification Checklist

- [ ] `npm install` completed without errors
- [ ] MongoDB is running (check connection in server logs)
- [ ] Server started on port 3001
- [ ] Patient registration successful (got verificationToken)
- [ ] Email verified successfully
- [ ] Login successful (got accessToken)
- [ ] Protected route returned 403 for patient (correct! no admin role)
- [ ] Can view database with `mongosh` or MongoDB Compass

---

## Common Issues & Fixes

### Issue: "Cannot find module '@nestjs/..."
```
Fix: Run npm install again
npm install
```

### Issue: "MongooseConnectionError: connect ECONNREFUSED"
```
Fix 1: Start MongoDB
mongod

Fix 2: Check MONGODB_URI in .env is correct
MONGODB_URI=mongodb://localhost:27017/clinic_management

Fix 3: If using MongoDB Atlas, verify connection string format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic_management
```

### Issue: "JWT malformed"
```
Fix: Ensure Authorization header format is correct
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

NOT: Authorization: eyJhbGciOiJIUzI1NiIs...
NOT: Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Issue: "Unexpected token < in JSON at position 0"
```
Fix: Ensure endpoint exists
GET /users → ✓ Correct
GET /user → ✗ Wrong (doesn't exist)
GET /users/all → ✗ Wrong (doesn't exist)
```

---

## Next Steps After Phase 1 is Working

1. ✅ Phase 1 verified and working
2. → Start Phase 2: Clinics, Doctors, Patients, Receptionists modules
3. → Continue Phase 3: Appointments, Medical Records, Messages
4. → Phase 4: Complete with tests and deployment

See `PHASE_1_SETUP.md` for full Phase 1 documentation.

---

## Suggested Tools for API Testing

### Postman
- Import collections for each module
- Save authentication tokens for reuse
- Test workflows across endpoints

### Insomnia
- Similar to Postman, open-source
- Good for team collaboration

### VS Code REST Client Extension
- Create `.rest` files
- Test endpoints directly in editor
- See: `example.rest` (will be provided)

---

## Getting Help

If Phase 1 doesn't work:
1. Check server logs for error messages
2. Verify MongoDB is running
3. Verify .env configuration
4. Check database with `mongosh`
5. Review error responses from endpoints
6. Check `PHASE_1_SETUP.md` troubleshooting section

Phase 1 is foundation-critical. Get this working before Phase 2!



