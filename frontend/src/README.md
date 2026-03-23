# Clinic Management Frontend Structure

This folder contains the React frontend for the outpatient clinic management system.

## Folder overview

- `components/` — Reusable UI components (buttons, modals, tables, etc.) that can be used throughout the app.
- `pages/` — Top-level pages (routes) such as Home, Login, Register, and dashboards.
- `services/` — API helpers for the backend (Axios instances and collection-specific services).
- `contexts/` — React Context providers for shared state like authentication.
- `routes/` — React Router route definitions and route guards.
- `assets/` — Images, icons, global styles, and other static assets.

## Notes

This project is scaffolded for a clinic management system with collections: Users, Doctors, Patients, Clinics, Appointments, MedicalRecords, Messages.
