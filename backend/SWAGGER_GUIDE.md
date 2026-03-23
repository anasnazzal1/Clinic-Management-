# Swagger API Documentation Guide

## 🚀 Accessing the Swagger UI

The Swagger UI is automatically available once the server starts:

```
Local Development: http://localhost:3001/api
```

**Note:** You'll also find:
- **Swagger JSON:** http://localhost:3001/api-json
- **OpenAPI JSON:** http://localhost:3001/api-json-v3
- **YAML Format:** http://localhost:3001/api-yaml

---

## 📖 What is Swagger (OpenAPI)?

Swagger is an interactive API documentation tool that allows you to:
- ✅ View all available endpoints
- ✅ See required parameters and request/response formats
- ✅ Test endpoints directly from the browser
- ✅ Generate code samples
- ✅ View authentication requirements

---

## 🔑 Authentication in Swagger

### Getting Started

1. **Start the Server**
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI**
   ```
   http://localhost:3001/api
   ```

3. **Register a Test Account**
   - Expand `Authentication` section
   - Click `POST /auth/register`
   - Click "Try it out"
   - Fill in user details:
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "phone": "+1234567890"
     }
     ```
   - Click "Execute"
   - Save the `verificationToken` from response

4. **Verify Email**
   - Expand `Authentication` section
   - Click `POST /auth/verify-email`
   - Click "Try it out"
   - Paste the verification token:
     ```json
     {
       "token": "paste_token_here"
     }
     ```
   - Click "Execute"

5. **Login**
   - Click `POST /auth/login`
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Click "Execute"
   - **Save the `accessToken`** (JWT token)

### Using the JWT Token

6. **Set Authorization Token in Swagger**
   - Look for the green **"Authorize"** button at the top of Swagger
   - Click it
   - In the dialog box, paste your JWT token:
     ```
     Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Click "Authorize"
   - Click "Close"

7. **Now You Can Test Protected Endpoints**
   - All endpoints with a lock icon (🔒) require authentication
   - The JWT token is automatically included in all requests
   - Try `GET /users` to see all users (admin only - will fail if not admin)

---

## 🎯 Testing Workflow Examples

### Example 1: Complete User Registration Flow

```
1. POST /auth/register
   Input:
   {
     "name": "Dr. Sarah Smith",
     "email": "sarah@clinic.com",
     "password": "securePass123",
     "phone": "+9876543210"
   }
   
   Response:
   {
     "success": true,
     "data": {
       "user": {...},
       "verificationToken": "abc123def456..."
     },
     "message": "Registration successful. Please verify your email."
   }

2. POST /auth/verify-email
   Input:
   {
     "token": "abc123def456..."
   }
   
   Response:
   {
     "success": true,
     "data": {user},
     "message": "Email verified successfully. You can now login."
   }

3. POST /auth/login
   Input:
   {
     "email": "sarah@clinic.com",
     "password": "securePass123"
   }
   
   Response:
   {
     "success": true,
     "data": {
       "user": {...},
       "accessToken": "eyJhbGciOiJIUzI1NiIs..."
     },
     "message": "Login successful"
   }
```

### Example 2: Admin User Creation and Management

```bash
# Prerequisite: Login as admin and save JWT token

1. POST /users (Create new doctor user)
   Authorization: Bearer {JWT_TOKEN}
   Input:
   {
     "name": "Dr. John Doe",
     "email": "johndoe@clinic.com",
     "password": "doctorPass123",
     "phone": "+1111111111",
     "role": "doctor"
   }

2. GET /users (List all users)
   Authorization: Bearer {JWT_TOKEN}
   Response: Array of all users

3. GET /users/:id (Get specific user)
   Authorization: Bearer {JWT_TOKEN}
   Parameter: 507f1f77bcf86cd799439011

4. PUT /users/:id (Update user)
   Authorization: Bearer {JWT_TOKEN}
   Parameter: 507f1f77bcf86cd799439011
   Input:
   {
     "name": "Dr. John Smith",
     "phone": "+2222222222"
   }

5. DELETE /users/:id (Delete user)
   Authorization: Bearer {JWT_TOKEN}
   Parameter: 507f1f77bcf86cd799439011
```

---

## 📋 Common HTTP Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | User lacks required permissions/role |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Backend error |

---

## 🔒 Security Notes

### JWT Token Safety
- ✅ Tokens expire after **24 hours**
- ✅ Tokens are signed with a secret key
- ✅ Never share tokens publicly
- ✅ Tokens are sent in the `Authorization: Bearer` header

### Production Considerations
- 🔐 Change `JWT_SECRET` in `.env` for production
- 🔐 Use HTTPS instead of HTTP
- 🔐 Store tokens securely (HttpOnly cookies recommended)
- 🔐 Implement token refresh mechanism if needed (not in Phase 1)

### CORS Security
- ✅ CORS enabled for frontend URL (from `.env` FRONTEND_URL)
- ✅ Only frontend can make browser requests
- ✅ Backend-to-backend calls not restricted

---

## 🛠️ Advanced Swagger Features

### Downloading API Specification

1. **OpenAPI JSON**
   - Right-click and save from: `http://localhost:3001/api-json`
   - Use with: Postman, Insomnia, Code generators

2. **Generate Client SDK**
   - Use OpenAPI Generator
   - Generate Frontend API client automatically
   - Supported languages: JavaScript, Python, Java, C#, Go, etc.

### Import into Postman/Insomnia

1. Get the OpenAPI JSON URL: `http://localhost:3001/api-json`
2. In Postman: `File → Import → Link → Paste URL`
3. In Insomnia: `File → Import → From URL → Paste URL`
4. All endpoints and examples will be imported!

---

## 📡 Testing with Different Tools

### Option 1: Swagger UI (Browser) ✨ **Recommended for Getting Started**
```
Pros: Visual, interactive, no setup needed
Cons: Limited to basic testing
URL: http://localhost:3001/api
```

### Option 2: Postman
```
Pros: Professional, collection management, advanced features
Cons: Requires installation
Steps:
  1. Import from http://localhost:3001/api-json
  2. Set Environment variables (JWT token)
  3. Test endpoints
```

### Option 3: Insomnia
```
Pros: Lightweight, great UX, free
Cons: Less features than Postman
Steps: Same as Postman
```

### Option 4: cURL (Command Line)
```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","phone":"+1234567890"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get users (with JWT token)
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Option 5: REST Client Extension (VS Code)
```
Install: REST Client extension
Create: test.rest file
Example:

### Register
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+1234567890"
}

### Login
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## 🚨 Troubleshooting

### Problem: "Swagger not showing"
```
Fix: Ensure npm install was run with @nestjs/swagger dependency
npm install @nestjs/swagger swagger-ui-express
npm run start:dev
```

### Problem: "Authorization not working"
```
Fix: Make sure to click the green "Authorize" button and paste token with "Bearer " prefix
Correct format: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Problem: "403 Forbidden on endpoints"
```
Fix: You likely don't have admin role
Solution: 
  1. Check user role in response (should be "admin")
  2. Create admin user via MongoDB directly (temporary)
  3. Or wait for Phase 2 role-based endpoints
```

### Problem: "401 Unauthorized"
```
Fix: JWT token missing or expired
Solution:
  1. Login again to get new token
  2. Copy entire token including any dots
  3. Use format: Bearer {token}
```

### Problem: "Email already exists"
```
Fix: Use a different email for testing
Solution: Each email must be unique in database
```

---

## 📚 API Response Format

All endpoints return responses in this format:

```json
{
  "success": true,
  "data": {
    // The actual response data
  },
  "message": "Description of what happened"
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

---

## 🔄 Complete Testing Checklist

- [ ] Access Swagger at `http://localhost:3001/api`
- [ ] Register new user (POST /auth/register)
- [ ] Copy verification token
- [ ] Verify email (POST /auth/verify-email)
- [ ] Login (POST /auth/login)
- [ ] Copy JWT token
- [ ] Click "Authorize" button in Swagger
- [ ] Paste JWT token with "Bearer " prefix
- [ ] Try GET /users endpoint
- [ ] Try POST /users to create new user
- [ ] Try GET /users/:id with ID from created user
- [ ] Try PUT /users/:id to update user
- [ ] Try DELETE /users/:id to delete user

---

## 📞 Next Steps

After mastering Phase 1 endpoints:
- 👉 **Phase 2:** Clinics, Doctors, Patients, Receptionists modules (will add ~24 more endpoints)
- 👉 **Phase 3:** Appointments, Medical Records, Messages (will add ~21 more endpoints)
- 👉 **Phase 4:** Full test coverage and deployment

All Phase 2+ endpoints will automatically appear in Swagger UI!

---

## ✨ Quick Tips

1. **Bookmark the Swagger URL:** `http://localhost:3001/api`
2. **Keep terminal open:** Server must be running for Swagger to work
3. **Use "Try it out":** Don't waste time with cURL, use the interactive interface
4. **Save responses:** Copy response data for use in next requests
5. **Check status codes:** Green = success, Red = error
6. **Read descriptions:** Each endpoint has detailed descriptions

---

**Happy testing! 🎉**

For complete Phase 1 details, see [PHASE_1_SETUP.md](PHASE_1_SETUP.md).

