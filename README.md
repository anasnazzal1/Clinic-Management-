# Outpatient Clinic Management System

A **frontend-first React application** for managing outpatient clinics in a medical center. This system is designed to handle clinics, doctors, patients, appointments, medical records, and communication between users.

> 🧪 This project is currently built without a backend and uses **mock data and fake services**. It is designed to be easily integrated later with a backend (e.g., NestJS + MongoDB).

---

## 🚀 Features

### 👨‍⚕️ Admin (Super Admin)

- Manage Clinics (add, edit, delete)
- Manage Doctors (assign to clinics, set schedules)
- Manage Patients (add, update, delete)
- Manage Reception Staff
- View all medical records
- Manage appointments

### 🧑‍💼 Receptionist

- Register new patients
- Book appointments
- View doctor schedules

### 🩺 Doctor

- View assigned patients
- Add medical records (diagnosis, prescription)
- Set follow-up appointments

### 🧑 Patient

- Register and verify account (email simulation)
- Login to view personal dashboard
- View medical records
- Book appointments
- Chat with doctor or reception

---

## 🧱 Tech Stack

- **Frontend:** React (Vite)
- **UI:** Material UI (MUI)
- **Routing:** React Router
- **State Management:** React Hooks / Context API
- **Data Handling:** Mock Data + Fake Services
- **Future Backend:** NestJS
- **Database (planned):** MongoDB

---

## 🗂 Project Structure

```bash
src/
│
├── components/
├── pages/
├── layouts/
├── services/
├── mock/
├── contexts/
├── routes/
└── App.jsx
```

---

## 🏁 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/clinic-management.git
cd clinic-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the project

```bash
npm run dev
```

---

## 🧪 Demo Accounts (Mock)

```text
Admin:
email: admin@test.com
password: 1234

Reception:
email: reception@test.com
password: 1234

Doctor:
email: doctor@test.com
password: 1234

Patient:
email: patient@test.com
password: 1234
```

---

## 🔧 Future Improvements

- Connect to real backend APIs (NestJS)
- Implement JWT authentication
- Real email verification
- Real-time chat using WebSockets
- Advanced dashboard analytics

---

## ✍️ Author

Developed by: Your Name

---

## 📜 License

This project is for educational purposes and can be extended into a production-ready system.
