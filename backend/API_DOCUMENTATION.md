# Complete API Reference Documentation

*Auto-generated from NestJS + Swagger. Interactive documentation available at `/api`*

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Common Response Formats](#common-response-formats)
4. [Error Handling](#error-handling)
5. [Authentication Guide](#authentication-guide)

---

## Authentication Endpoints

Base URL: `http://localhost:3001/auth`

### 1. Register New User

**POST** `/auth/register`

Create a new user account (patient registration).

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name of the user |
| `email` | string | Yes | Email address (must be unique) |
| `password` | string | Yes | Password (minimum 6 characters) |
| `phone` | string | No | Phone number in international format |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "patient",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "verificationToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  },
  "message": "Registration successful. Please verify your email."
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Email already registered | Email is not unique |
| `400` | Invalid email format | Email validation failed |
| `400` | Password too short | Password must be 6+ characters |
| `500` | Internal server error | Database connection issue |

#### Notes
- Patient accounts are created with `isVerified: false`
- Verification token expires in 24 hours
- Email must be verified before login

---

### 2. Verify Email

**POST** `/auth/verify-email`

Verify user email address using the verification token received during registration.

#### Request Body

```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Email verification token from registration |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "patient",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:01.000Z"
  },
  "message": "Email verified successfully. You can now login."
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Invalid token | Token is malformed or doesn't exist |
| `400` | Token expired | Token is older than 24 hours |
| `404` | User not found | User associated with token deleted |
| `500` | Internal server error | Database error |

#### Notes
- Token is valid for 24 hours only
- After verification, user can proceed to login
- One-time use only (token deleted after verification)

---

### 3. User Login

**POST** `/auth/login`

Authenticate user with email and password to receive JWT token.

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |
| `password` | string | Yes | User password |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoicGF0aWVudCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcwNTA0NDAwMCwiZXhwIjoxNzA1MTMwNDAwfQ.signature"
  },
  "message": "Login successful"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `401` | Invalid credentials | Email or password is incorrect |
| `401` | Email not verified | User hasn't verified email yet |
| `404` | User not found | Email doesn't exist |
| `500` | Internal server error | Database error |

#### JWT Token Details

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { 
  "sub": "user_id",
  "email": "user@example.com",
  "role": "patient|doctor|reception|admin",
  "name": "Full Name",
  "iat": 1705044000,
  "exp": 1705130400
}
```

**Token Expiration:** 24 hours (86400 seconds)

#### Usage
- Include token in all subsequent requests with: `Authorization: Bearer {token}`
- Token is required to access protected endpoints
- Token expires after 24 hours (user must login again)

#### Notes
- Password comparison is done securely with bcryptjs
- Token valid for exactly 24 hours
- No refresh token mechanism (simplified for Phase 1)

---

## User Management Endpoints

Base URL: `http://localhost:3001/users`

**⚠️ All User Management endpoints require:**
- Valid JWT token in `Authorization: Bearer {token}` header
- Admin role

### 1. Create User (Admin Only)

**POST** `/users`

Create a new user account (for doctors, receptionists, or admins).

#### Authentication

```
Authorization: Bearer {JWT_TOKEN}
```

#### Request Body

```json
{
  "name": "Dr. Sarah Smith",
  "email": "sarah@clinic.com",
  "password": "securePassword123",
  "phone": "+9876543210",
  "role": "doctor"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name |
| `email` | string | Yes | Email (must be unique) |
| `password` | string | Yes | Password (6+ chars) |
| `phone` | string | No | Phone number |
| `role` | enum | Yes | One of: `admin`, `reception`, `doctor`, `patient` |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Dr. Sarah Smith",
    "email": "sarah@clinic.com",
    "phone": "+9876543210",
    "role": "doctor",
    "isVerified": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "User created successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Email already exists | Email not unique |
| `400` | Invalid role | Role not in enum list |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing or invalid JWT token |
| `500` | Server error | Database issue |

#### Notes
- Non-patient users are auto-verified (`isVerified: true`)
- Use this to create doctors, receptionists, and admins
- Patients should use `/auth/register` instead

---

### 2. Get All Users (Admin Only)

**GET** `/users`

Retrieve list of all users in the system.

#### Authentication

```
Authorization: Bearer {JWT_TOKEN}
```

#### Query Parameters

None

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "patient",
      "isVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Dr. Sarah Smith",
      "email": "sarah@clinic.com",
      "phone": "+9876543210",
      "role": "doctor",
      "isVerified": true,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |
| `500` | Server error | Database issue |

#### Notes
- Returns all users regardless of role
- Password field is excluded from response
- Empty array if no users exist

---

### 3. Get User by ID (Admin Only)

**GET** `/users/:id`

Retrieve a specific user by their MongoDB ID.

#### Authentication

```
Authorization: Bearer {JWT_TOKEN}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId (24-character hex) |

#### Example

```
GET /users/507f1f77bcf86cd799439011
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "patient",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | User ID doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |
| `500` | Server error | Invalid ID format |

#### Notes
- ID must be valid MongoDB ObjectId (24 hex characters)
- Returns `404` if user doesn't exist

---

### 4. Get User by Email (Admin Only)

**GET** `/users/email/:email`

Retrieve a user by their email address.

#### Authentication

```
Authorization: Bearer {JWT_TOKEN}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `email` | string | User email address |

#### Example

```
GET /users/email/john@example.com
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "patient",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Email doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

#### Notes
- Email search is case-insensitive (normalized to lowercase)
- Returns `404` if no user found with that email

---

### 5. Update User (Admin Only)

**PUT** `/users/:id`

Update user details (name, email, phone). Password cannot be changed via this endpoint.

#### Authentication

```
Authorization: Bearer {JWT_TOKEN}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+9876543210"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated full name |
| `email` | string | No | Updated email (must remain unique) |
| `phone` | string | No | Updated phone number |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+9876543210",
    "role": "patient",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "User updated successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | User doesn't exist |
| `400` | Email already exists | New email is not unique |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

#### Notes
- All fields in request body are optional
- Password cannot be changed via this endpoint
- Email updates must maintain uniqueness constraint
- Updated fields are merged with existing data

---

### 6. Delete User (Admin Only)

**DELETE** `/users/:id`

Permanently delete a user from the system.

#### Authentication

```
Authorization: Bearer {JWT_TOKEN}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Example

```
DELETE /users/507f1f77bcf86cd799439011
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  },
  "message": "User deleted successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | User doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

#### Notes
- **Action is permanent** - deleted user cannot be recovered
- Cannot delete own admin account (prevents system lockout)

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Description of operation"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### List Response

```json
{
  "success": true,
  "data": [
    { /* item 1 */ },
    { /* item 2 */ }
  ],
  "message": "Items retrieved successfully"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | OK | Success - request completed |
| `201` | Created | Success - resource created |
| `400` | Bad Request | Check request body and parameters |
| `401` | Unauthorized | Login required or token invalid |
| `403` | Forbidden | Insufficient permissions/role |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Backend error - contact admin |

### Common Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| "Invalid credentials" | Wrong password or email | Verify email and password |
| "User not found" | Email/ID doesn't exist | Check if user was created |
| "Email already exists" | Email is not unique | Use different email |
| "Invalid token" | JWT is malformed | Login again for new token |
| "Token expired" | JWT older than 24 hours | Login again |
| "Forbidden" | Not admin role | Ask admin to perform action |

---

## Authentication Guide

### JWT Bearer Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature
```

**Important:** Always include `Bearer ` prefix!

### Getting a Token

1. Register: `POST /auth/register`
2. Verify: `POST /auth/verify-email` (with verification token)
3. Login: `POST /auth/login` (with email & password)
4. Response includes `accessToken`

### Using the Token

Include in all protected endpoint requests:

```bash
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer {token_here}"
```

### Token Lifecycle

- **Created:** Upon successful login
- **Valid:** 24 hours from creation
- **Expires:** Automatically after 24 hours
- **Extended Session:** Login again (no refresh token in Phase 1)

### Token Security

✅ **Do:**
- Store securely (HttpOnly cookies on frontend)
- Include in all protected endpoint requests
- Request new token when current expires
- Keep JWT_SECRET safe

❌ **Don't:**
- Share token publicly
- Store in localStorage (XSS vulnerability)
- Use same token for multiple sessions
- Expose JWT_SECRET

---

## FAQ

### Q1: How do I test endpoints?
**A:** Use Swagger UI at `http://localhost:3001/api` - no tools needed!

### Q2: What if my token expired?
**A:** Login again to get a new token (24-hour expiration).

### Q3: Can I change my own password?
**A:** Not in Phase 1. Admin must create new user or reset via DB.

### Q4: How do roles work?
**A:**
- `admin`: Full system access
- `reception`: Clinic management
- `doctor`: Patient care
- `patient`: Self-service access

### Q5: Do I need to verify email every time?
**A:** Only during initial registration. Email verification is one-time.

### Q6: What happens if I delete a user?
**A:** User is permanently removed. All associated data should be handled by Phase 2+ modules.

---

## Rate Limiting

Currently **no rate limiting** in Phase 1. Will be added in Phase 4 for production.

---

## Support

For issues:
1. Check [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md)
2. Review error response in Swagger UI
3. Check application logs in terminal
4. Verify MongoDB connection

---

*Last Updated: Current Phase*
*API Version: 1.0.0*
*Status: Phase 1 (Core Implementation)*

