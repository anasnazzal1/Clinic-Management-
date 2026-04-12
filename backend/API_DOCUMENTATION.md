# Complete API Reference Documentation

*Auto-generated from NestJS + Swagger. Interactive documentation available at `/api`*

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Clinic Management Endpoints](#clinic-management-endpoints)
4. [Doctor Management Endpoints](#doctor-management-endpoints)
5. [Patient Management Endpoints](#patient-management-endpoints)
6. [Receptionist Management Endpoints](#receptionist-management-endpoints)
7. [Appointment Management Endpoints](#appointment-management-endpoints)
8. [Visit Management Endpoints](#visit-management-endpoints)
9. [Common Response Formats](#common-response-formats)
10. [Error Handling](#error-handling)
11. [Authentication Guide](#authentication-guide)

---

## Base URL

**All endpoints are prefixed with:** `http://localhost:3000/api`

**Example:** `POST /api/auth/login`

---

## Authentication Endpoints

### 1. Register New User

**POST** `/api/auth/register`

Create a new patient user account and linked patient record.

#### Authentication
- **Required:** None (public endpoint)

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
      "username": "john_doe",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "patient",
      "linkedId": "507f1f77bcf86cd799439012",
      "createdAt": "2026-04-05T10:30:00.000Z"
    }
  },
  "message": "Registration successful."
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Email already registered | Email is not unique |
| `400` | Invalid email format | Email validation failed |
| `400` | Password too short | Password must be 6+ characters |
| `500` | Internal server error | Database connection issue |

---

### 2. User Login

**POST** `/api/auth/login`

Authenticate user with email and password to receive JWT token.

#### Authentication
- **Required:** None (public endpoint)

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
      "username": "john_doe",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient",
      "linkedId": "507f1f77bcf86cd799439012"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `401` | Invalid credentials | Email or password is incorrect |
| `404` | User not found | Email doesn't exist |
| `500` | Internal server error | Database error |

#### JWT Token Details

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "user_id",
  "email": "user@example.com",
  "role": "patient|doctor|receptionist|admin",
  "name": "Full Name",
  "linkedId": "linked_entity_id",
  "iat": 1705044000,
  "exp": 1705130400
}
```

**Token Expiration:** 24 hours (86400 seconds)

---

## User Management Endpoints

### 1. Create User (Admin Only)

**POST** `/api/users`

Create a new user account (for doctors, receptionists, or admins). Password is set by admin.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Request Body

```json
{
  "username": "dr_smith",
  "name": "Dr. Sarah Smith",
  "email": "sarah@example.com",
  "password": "securePassword123",
  "phone": "+9876543210",
  "role": "doctor"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Username for the user account |
| `name` | string | Yes | Full name |
| `email` | string | Yes | Email (must be unique) |
| `password` | string | Yes | Password (6+ chars) |
| `phone` | string | No | Phone number |
| `role` | enum | Yes | One of: `admin`, `receptionist`, `doctor`, `patient` |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "dr_smith",
    "name": "Dr. Sarah Smith",
    "email": "sarah@example.com",
    "phone": "+9876543210",
    "role": "doctor",
    "linkedId": null,
    "createdAt": "2026-04-05T11:00:00.000Z"
  },
  "message": "Admin user created successfully"
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

---

### 2. Get All Users (Admin Only)

**GET** `/api/users`

Retrieve list of all users in the system.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "patient",
      "linkedId": "507f1f77bcf86cd799439012",
      "createdAt": "2026-04-05T10:30:00.000Z"
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

---

### 3. Get User by ID (Admin Only)

**GET** `/api/users/:id`

Retrieve a specific user by their ID.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId (24-character hex) |

#### Example

```
GET /api/users/507f1f77bcf86cd799439011
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "patient",
    "linkedId": "507f1f77bcf86cd799439012",
    "createdAt": "2026-04-05T10:30:00.000Z"
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

---

### 4. Get User by Email (Admin Only)

**GET** `/api/users/email/:email`

Retrieve a user by their email address.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `email` | string | User email address |

#### Example

```
GET /api/users/email/john@example.com
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "patient",
    "linkedId": "507f1f77bcf86cd799439012",
    "createdAt": "2026-04-05T10:30:00.000Z"
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

---

### 5. Get User by Linked ID (Admin Only)

**GET** `/api/users/by-linked/:linkedId`

Retrieve a user by their linked ID.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `linkedId` | string | User linked ID |

#### Example

```
GET /api/users/by-linked/507f1f77bcf86cd799439011
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "linkedId": "507f1f77bcf86cd799439012",
    "createdAt": "2026-04-05T10:30:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Linked ID doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 6. Update User (Admin Only)

**PUT** `/api/users/:id`

Update user details (name, email, phone, username, linkedId).

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "username": "john_doe_updated",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+9876543210",
  "linkedId": "507f1f77bcf86cd799439013"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | No | Updated username |
| `name` | string | No | Updated full name |
| `email` | string | No | Updated email (must remain unique) |
| `phone` | string | No | Updated phone number |
| `linkedId` | string | No | Updated linked ID reference |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe_updated",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+9876543210",
    "role": "patient",
    "linkedId": "507f1f77bcf86cd799439013",
    "createdAt": "2026-04-05T10:30:00.000Z",
    "updatedAt": "2026-04-05T12:00:00.000Z"
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

---

### 7. Delete User (Admin Only)

**DELETE** `/api/users/:id`

Permanently delete a user from the system.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Example

```
DELETE /api/users/507f1f77bcf86cd799439011
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

---

## Clinic Management Endpoints

### 1. Get All Clinics

**GET** `/api/clinics`

Retrieve list of all clinics.

#### Authentication
- **Required:** None (public endpoint)

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "City Health Center",
      "workingDays": "Mon, Tue, Wed, Thu, Fri",
      "workingHours": "09:00 - 17:00",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Clinics retrieved successfully"
}
```

---

### 2. Get Clinic by ID

**GET** `/api/clinics/:id`

Retrieve a specific clinic by ID.

#### Authentication
- **Required:** None (public endpoint)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "City Health Center",
    "workingDays": "Mon, Tue, Wed, Thu, Fri",
    "workingHours": "09:00 - 17:00",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Clinic retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Clinic ID doesn't exist |

---

### 3. Create Clinic (Admin Only)

**POST** `/api/clinics`

Create a new clinic.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Request Body

```json
{
  "name": "City Health Center",
  "workingDays": "Mon, Tue, Wed, Thu, Fri",
  "workingHours": "09:00 - 17:00"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Clinic name |
| `workingDays` | string | Yes | Working days of the clinic |
| `workingHours` | string | Yes | Working hours of the clinic |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "City Health Center",
    "workingDays": "Mon, Tue, Wed, Thu, Fri",
    "workingHours": "09:00 - 17:00",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Clinic created successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 4. Update Clinic (Admin Only)

**PUT** `/api/clinics/:id`

Update clinic details.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "name": "Updated Health Center",
  "workingDays": "Mon, Tue, Wed, Thu, Fri, Sat",
  "workingHours": "08:00 - 18:00"
}
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Health Center",
    "workingDays": "Mon, Tue, Wed, Thu, Fri, Sat",
    "workingHours": "08:00 - 18:00",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T11:00:00.000Z"
  },
  "message": "Clinic updated successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Clinic doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 5. Delete Clinic (Admin Only)

**DELETE** `/api/clinics/:id`

Delete a clinic.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "message": "Clinic deleted successfully"
  },
  "message": "Clinic deleted successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Clinic doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

## Doctor Management Endpoints

### 1. Get All Doctors

**GET** `/api/doctors`

Retrieve list of all doctors.

#### Authentication
- **Required:** None (public endpoint)

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Sarah Smith",
      "specialization": "General Practitioner",
      "clinicId": "507f1f77bcf86cd799439012",
      "workingDays": "Mon, Tue, Wed, Thu",
      "workingHours": "09:00 - 17:00",
      "email": "sarah@example.com",
      "phone": "+1234567890",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Doctors retrieved successfully"
}
```

---

### 2. Get Doctor by ID

**GET** `/api/doctors/:id`

Retrieve a specific doctor by ID.

#### Authentication
- **Required:** None (public endpoint)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Smith",
    "specialization": "General Practitioner",
    "clinicId": "507f1f77bcf86cd799439012",
    "workingDays": "Mon, Tue, Wed, Thu",
    "workingHours": "09:00 - 17:00",
    "email": "sarah@example.com",
    "phone": "+1234567890",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Doctor retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Doctor ID doesn't exist |

---

### 3. Create Doctor (Admin Only)

**POST** `/api/doctors`

Create a doctor record and linked user account.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Request Body

```json
{
  "name": "Dr. Sarah Smith",
  "specialization": "General Practitioner",
  "clinicId": "507f1f77bcf86cd799439011",
  "workingDays": "Mon, Tue, Wed, Thu",
  "workingHours": "09:00 - 17:00",
  "email": "sarah@example.com",
  "phone": "+1234567890",
  "username": "dr_sarah",
  "password": "StrongPass123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Doctor name |
| `specialization` | string | Yes | Doctor specialization |
| `clinicId` | string | Yes | Clinic ID where doctor works |
| `workingDays` | string | Yes | Doctor working days |
| `workingHours` | string | Yes | Doctor working hours |
| `email` | string | Yes | Doctor email address |
| `phone` | string | No | Doctor phone number |
| `username` | string | Yes | Username for doctor login |
| `password` | string | Yes | Password for doctor login |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Smith",
    "specialization": "General Practitioner",
    "clinicId": "507f1f77bcf86cd799439012",
    "workingDays": "Mon, Tue, Wed, Thu",
    "workingHours": "09:00 - 17:00",
    "email": "sarah@example.com",
    "phone": "+1234567890",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Doctor created successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Invalid clinicId | Clinic ID doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 4. Update Doctor (Admin Only)

**PUT** `/api/doctors/:id`

Update doctor details.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "name": "Dr. Sarah Johnson",
  "specialization": "Family Medicine",
  "clinicId": "507f1f77bcf86cd799439013",
  "workingDays": "Mon, Tue, Wed, Thu, Fri",
  "workingHours": "08:00 - 16:00",
  "email": "sarah.johnson@example.com",
  "phone": "+9876543210"
}
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Johnson",
    "specialization": "Family Medicine",
    "clinicId": "507f1f77bcf86cd799439013",
    "workingDays": "Mon, Tue, Wed, Thu, Fri",
    "workingHours": "08:00 - 16:00",
    "email": "sarah.johnson@example.com",
    "phone": "+9876543210",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T11:00:00.000Z"
  },
  "message": "Doctor updated successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Doctor doesn't exist |
| `400` | Invalid clinicId | Clinic ID doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 5. Delete Doctor (Admin Only)

**DELETE** `/api/doctors/:id`

Delete a doctor.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "message": "Doctor deleted successfully"
  },
  "message": "Doctor deleted successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Doctor doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 6. Get Doctors by Clinic

**GET** `/api/doctors/clinic/:clinicId`

Retrieve all doctors working at a specific clinic.

#### Authentication
- **Required:** None (public endpoint)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `clinicId` | string | MongoDB ObjectId of the clinic |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Sarah Smith",
      "specialization": "General Practitioner",
      "clinicId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "City Medical Center",
        "workingDays": "Mon-Sun",
        "workingHours": "24/7"
      },
      "workingDays": "Mon, Tue, Wed, Thu",
      "workingHours": "09:00 - 17:00",
      "email": "sarah@example.com",
      "phone": "+1234567890",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Dr. Michael Johnson",
      "specialization": "Cardiology",
      "clinicId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "City Medical Center",
        "workingDays": "Mon-Sun",
        "workingHours": "24/7"
      },
      "workingDays": "Mon, Wed, Fri",
      "workingHours": "10:00 - 18:00",
      "email": "michael@example.com",
      "phone": "+1234567891",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Clinic doctors retrieved successfully"
}
```

---

## Patient Management Endpoints

### 1. Get All Patients

**GET** `/api/patients`

Retrieve list of all patients.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin or Receptionist only

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "age": 35,
      "gender": "male",
      "phone": "+1234567890",
      "email": "john@example.com",
      "address": "123 Main St, Anytown",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Patients retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | User is not admin or receptionist |
| `401` | Unauthorized | Missing JWT token |

---

### 2. Get Patient by ID

**GET** `/api/patients/:id`

Retrieve a specific patient by ID.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, or self (patient can view own record)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "age": 35,
    "gender": "male",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St, Anytown",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Patient retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Patient ID doesn't exist |
| `403` | Forbidden | Patient trying to access other patient's record |
| `401` | Unauthorized | Missing JWT token |

---

### 3. Create Patient

**POST** `/api/patients`

Create a patient record and linked user account.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin or Receptionist only

#### Request Body

```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "male",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St, Anytown",
  "username": "john_doe",
  "password": "PatientPass123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Patient full name |
| `age` | number | No | Patient age |
| `gender` | string | No | Patient gender |
| `phone` | string | No | Patient phone number |
| `email` | string | Yes | Patient email address |
| `address` | string | No | Patient address |
| `username` | string | Yes | Username for patient login |
| `password` | string | Yes | Password for patient login |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "age": 35,
    "gender": "male",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St, Anytown",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Patient created successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Email already exists | Email not unique |
| `403` | Forbidden | User is not admin or receptionist |
| `401` | Unauthorized | Missing JWT token |

---

### 4. Update Patient

**PUT** `/api/patients/:id`

Update patient details.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, or self (patient can update own record)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "name": "John Smith",
  "age": 36,
  "gender": "male",
  "phone": "+9876543210",
  "email": "john.smith@example.com",
  "address": "456 Oak St, Newtown"
}
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "age": 36,
    "gender": "male",
    "phone": "+9876543210",
    "email": "john.smith@example.com",
    "address": "456 Oak St, Newtown",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T11:00:00.000Z"
  },
  "message": "Patient updated successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Patient doesn't exist |
| `400` | Email already exists | New email is not unique |
| `403` | Forbidden | Patient trying to update other patient's record |
| `401` | Unauthorized | Missing JWT token |

---

### 5. Delete Patient (Admin Only)

**DELETE** `/api/patients/:id`

Delete a patient record.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "message": "Patient deleted successfully"
  },
  "message": "Patient deleted successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Patient doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

## Receptionist Management Endpoints

### 1. Get All Receptionists (Admin Only)

**GET** `/api/receptionists`

Retrieve list of all receptionists.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Nina Patel",
      "phone": "+1234567890",
      "email": "nina@example.com",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Receptionists retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 2. Get Receptionist by ID

**GET** `/api/receptionists/:id`

Retrieve a specific receptionist by ID.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin or self (receptionist can view own record)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nina Patel",
    "phone": "+1234567890",
    "email": "nina@example.com",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Receptionist retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Receptionist ID doesn't exist |
| `403` | Forbidden | Receptionist trying to access other receptionist's record |
| `401` | Unauthorized | Missing JWT token |

---

### 3. Create Receptionist (Admin Only)

**POST** `/api/receptionists`

Create a receptionist record and linked user account.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Request Body

```json
{
  "name": "Nina Patel",
  "phone": "+1234567890",
  "email": "nina@example.com",
  "username": "nina_patel",
  "password": "Reception123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Receptionist full name |
| `phone` | string | No | Receptionist phone number |
| `email` | string | Yes | Receptionist email address |
| `username` | string | Yes | Username for receptionist login |
| `password` | string | Yes | Password for receptionist login |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nina Patel",
    "phone": "+1234567890",
    "email": "nina@example.com",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Receptionist created successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Email already exists | Email not unique |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 4. Update Receptionist

**PUT** `/api/receptionists/:id`

Update receptionist details.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin or self (receptionist can update own record)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "name": "Nina Johnson",
  "phone": "+9876543210",
  "email": "nina.johnson@example.com"
}
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nina Johnson",
    "phone": "+9876543210",
    "email": "nina.johnson@example.com",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T11:00:00.000Z"
  },
  "message": "Receptionist updated successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Receptionist doesn't exist |
| `400` | Email already exists | New email is not unique |
| `403` | Forbidden | Receptionist trying to update other receptionist's record |
| `401` | Unauthorized | Missing JWT token |

---

### 5. Delete Receptionist (Admin Only)

**DELETE** `/api/receptionists/:id`

Delete a receptionist record.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "message": "Receptionist deleted successfully"
  },
  "message": "Receptionist deleted successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Receptionist doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

## Appointment Management Endpoints

### 1. Get All Appointments

**GET** `/api/appointments`

Retrieve list of all appointments.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, or Doctor only

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": "507f1f77bcf86cd799439012",
      "doctorId": "507f1f77bcf86cd799439013",
      "clinicId": "507f1f77bcf86cd799439014",
      "date": "2026-05-01",
      "time": "14:00",
      "status": "pending",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Appointments retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | User is not admin, receptionist, or doctor |
| `401` | Unauthorized | Missing JWT token |

---

### 2. Get Appointments by Doctor

**GET** `/api/appointments/doctor/:doctorId`

Retrieve appointments for a specific doctor.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, or self (doctor can view own appointments)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `doctorId` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": "507f1f77bcf86cd799439012",
      "doctorId": "507f1f77bcf86cd799439013",
      "clinicId": "507f1f77bcf86cd799439014",
      "date": "2026-05-01",
      "time": "14:00",
      "status": "pending",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Doctor appointments retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | Doctor trying to access other doctor's appointments |
| `401` | Unauthorized | Missing JWT token |

---

### 3. Get Appointments by Patient

**GET** `/api/appointments/patient/:patientId`

Retrieve appointments for a specific patient.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, or self (patient can view own appointments)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `patientId` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": "507f1f77bcf86cd799439012",
      "doctorId": "507f1f77bcf86cd799439013",
      "clinicId": "507f1f77bcf86cd799439014",
      "date": "2026-05-01",
      "time": "14:00",
      "status": "pending",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Patient appointments retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | Patient trying to access other patient's appointments |
| `401` | Unauthorized | Missing JWT token |

---

### 4. Get Appointment by ID

**GET** `/api/appointments/:id`

Retrieve a specific appointment by ID.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, Doctor, or Patient (with access restrictions)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439012",
    "doctorId": "507f1f77bcf86cd799439013",
    "clinicId": "507f1f77bcf86cd799439014",
    "date": "2026-05-01",
    "time": "14:00",
    "status": "pending",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Appointment retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Appointment ID doesn't exist |
| `403` | Forbidden | User trying to access appointment they don't own |
| `401` | Unauthorized | Missing JWT token |

---

### 5. Create Appointment

**POST** `/api/appointments`

Create a new appointment.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, or Patient

#### Request Body

```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "clinicId": "507f1f77bcf86cd799439013",
  "date": "2026-05-01",
  "time": "14:00",
  "status": "pending"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patientId` | string | Yes | Patient ID |
| `doctorId` | string | Yes | Doctor ID |
| `clinicId` | string | Yes | Clinic ID |
| `date` | string | Yes | Appointment date |
| `time` | string | Yes | Appointment time |
| `status` | enum | Yes | Appointment status (pending, completed, cancelled) |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439012",
    "doctorId": "507f1f77bcf86cd799439013",
    "clinicId": "507f1f77bcf86cd799439014",
    "date": "2026-05-01",
    "time": "14:00",
    "status": "pending",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Appointment created successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Invalid IDs | Patient, doctor, or clinic ID doesn't exist |
| `403` | Forbidden | User is not admin, receptionist, or patient |
| `401` | Unauthorized | Missing JWT token |

---

### 6. Update Appointment

**PUT** `/api/appointments/:id`

Update appointment details.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Receptionist, or self (doctor can update own appointments)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "date": "2026-05-02",
  "time": "15:00",
  "status": "completed"
}
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439012",
    "doctorId": "507f1f77bcf86cd799439013",
    "clinicId": "507f1f77bcf86cd799439014",
    "date": "2026-05-02",
    "time": "15:00",
    "status": "completed",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T11:00:00.000Z"
  },
  "message": "Appointment updated successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Appointment doesn't exist |
| `403` | Forbidden | Doctor trying to update other doctor's appointment |
| `401` | Unauthorized | Missing JWT token |

---

### 7. Delete Appointment

**DELETE** `/api/appointments/:id`

Delete an appointment.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin or Receptionist only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "message": "Appointment deleted successfully"
  },
  "message": "Appointment deleted successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Appointment doesn't exist |
| `403` | Forbidden | User is not admin or receptionist |
| `401` | Unauthorized | Missing JWT token |

---

## Visit Management Endpoints

### 1. Get All Visits

**GET** `/api/visits`

Retrieve list of all visit records.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin or Doctor only

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": "507f1f77bcf86cd799439012",
      "doctorId": "507f1f77bcf86cd799439013",
      "date": "2026-05-01",
      "diagnosis": "Seasonal allergies and cough",
      "notes": "Recommend rest and fluids",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Visits retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | User is not admin or doctor |
| `401` | Unauthorized | Missing JWT token |

---

### 2. Get Visits by Patient

**GET** `/api/visits/patient/:patientId`

Retrieve all visits for a specific patient with role-based access control.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Doctor, or Patient (with access restrictions)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `patientId` | string | MongoDB ObjectId of the patient |

#### Access Control

- **Admin:** Can access visits for any patient
- **Doctor:** Can only access visits for patients they have treated (where doctorId matches their linkedId)
- **Patient:** Can only access their own visits (where patientId matches their linkedId)

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": "507f1f77bcf86cd799439012",
      "doctorId": "507f1f77bcf86cd799439013",
      "date": "2026-05-01",
      "diagnosis": "Seasonal allergies and cough",
      "notes": "Recommend rest and fluids",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "patientId": "507f1f77bcf86cd799439012",
      "doctorId": "507f1f77bcf86cd799439015",
      "date": "2026-06-15",
      "diagnosis": "Follow-up check",
      "notes": "Patient recovering well",
      "createdAt": "2026-05-15T09:30:00.000Z",
      "updatedAt": "2026-05-15T09:30:00.000Z"
    }
  ],
  "message": "Patient visits retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | Patient trying to access another patient's visits |
| `401` | Unauthorized | Missing JWT token |
| `404` | Not found | Patient ID doesn't exist |

---

### 3. Get Visit by ID

**GET** `/api/visits/:id`

Retrieve a specific visit by ID.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin, Doctor, or Patient (with access restrictions)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439012",
    "doctorId": "507f1f77bcf86cd799439013",
    "date": "2026-05-01",
    "diagnosis": "Seasonal allergies and cough",
    "notes": "Recommend rest and fluids",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Visit retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Visit ID doesn't exist |
| `403` | Forbidden | User trying to access visit they don't own |
| `401` | Unauthorized | Missing JWT token |

---

### 3. Create Visit (Doctor Only)

**POST** `/api/visits`

Create a new visit record.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Doctor only

#### Request Body

```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "date": "2026-05-01",
  "diagnosis": "Seasonal allergies and cough",
  "notes": "Recommend rest and fluids"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patientId` | string | Yes | Patient ID |
| `doctorId` | string | Yes | Doctor ID |
| `date` | string | Yes | Visit date |
| `diagnosis` | string | No | Diagnosis notes |
| `notes` | string | No | Visit notes |

#### Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439012",
    "doctorId": "507f1f77bcf86cd799439013",
    "date": "2026-05-01",
    "diagnosis": "Seasonal allergies and cough",
    "notes": "Recommend rest and fluids",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  },
  "message": "Visit created successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Invalid IDs | Patient or doctor ID doesn't exist |
| `403` | Forbidden | User is not a doctor |
| `401` | Unauthorized | Missing JWT token |

---

### 4. Update Visit (Doctor Only)

**PUT** `/api/visits/:id`

Update visit details.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Doctor only (can only update own visits)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Request Body (all optional)

```json
{
  "diagnosis": "Updated diagnosis",
  "notes": "Updated treatment notes"
}
```

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439012",
    "doctorId": "507f1f77bcf86cd799439013",
    "date": "2026-05-01",
    "diagnosis": "Updated diagnosis",
    "notes": "Updated treatment notes",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T11:00:00.000Z"
  },
  "message": "Visit updated successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Visit doesn't exist |
| `403` | Forbidden | Doctor trying to update other doctor's visit |
| `401` | Unauthorized | Missing JWT token |

---

### 5. Delete Visit (Admin Only)

**DELETE** `/api/visits/:id`

Delete a visit record.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin only

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId |

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "message": "Visit deleted successfully"
  },
  "message": "Visit deleted successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `404` | Not found | Visit doesn't exist |
| `403` | Forbidden | User is not admin |
| `401` | Unauthorized | Missing JWT token |

---

### 6. Get Visits by Doctor

**GET** `/api/visits/doctor/:doctorId`

Retrieve all visits for a specific doctor with role-based access control.

#### Authentication
- **Required:** JWT token in `Authorization: Bearer {token}` header
- **Role:** Admin or Doctor (doctors can only access their own visits)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `doctorId` | string | MongoDB ObjectId of the doctor |

#### Access Control

- **Admin:** Can access visits for any doctor
- **Doctor:** Can only access their own visits (where doctorId matches their linkedId)

#### Response (`200 OK`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "doctorId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Dr. Sarah Johnson",
        "specialization": "Cardiology",
        "email": "sarah.johnson@clinic.com",
        "phone": "+1234567891"
      },
      "date": "2026-05-01",
      "diagnosis": "Hypertension follow-up",
      "notes": "Blood pressure improved, continue medication",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "message": "Doctor visits retrieved successfully"
}
```

#### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `403` | Forbidden | Doctor trying to access another doctor's visits |
| `401` | Unauthorized | Missing JWT token |

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
| "Forbidden" | Not authorized for action | Check user role permissions |

---

## Authentication Guide

### JWT Bearer Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature
```

**Important:** Always include `Bearer ` prefix!

### Getting a Token

1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (with email & password)
3. Response includes `accessToken`

### Using the Token

Include in all protected endpoint requests:

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer {token_here}"
```

### Token Lifecycle

- **Created:** Upon successful login
- **Valid:** 24 hours from creation
- **Expires:** Automatically after 24 hours
- **Extended Session:** Login again

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
**A:** Use Swagger UI at `http://localhost:3000/api` - no tools needed!

### Q2: What if my token expired?
**A:** Login again to get a new token (24-hour expiration).

### Q3: Can I change my own password?
**A:** Not in current implementation. Admin must create new user or reset via DB.

### Q4: How do roles work?
**A:**
- `admin`: Full system access
- `receptionist`: Clinic management, patient/appointment management
- `doctor`: View own appointments/visits, create/update visits
- `patient`: View own appointments/visits, book appointments

### Q5: Do I need to verify email every time?
**A:** Only during initial registration. Email verification is one-time.

### Q6: What happens if I delete a user?
**A:** User is permanently removed. All associated data should be handled by Phase 2+ modules.

---

## Support

For issues:
1. Check [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md)
2. Review error response in Swagger UI
3. Check application logs in terminal
4. Verify MongoDB connection

---

*Last Updated: April 5, 2026*
*API Version: 1.0.0*
*Status: Complete Implementation*

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



