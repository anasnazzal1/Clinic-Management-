// Route definitions for the Clinic Management System.
// Each page is mapped to a route, making it easy to add guards and nested layouts.

import { Routes, Route, Navigate } from 'react-router-dom'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Verify from '../pages/Verify'
import AdminDashboard from '../pages/AdminDashboard'
import DoctorDashboard from '../pages/DoctorDashboard'
import PatientDashboard from '../pages/PatientDashboard'
import ReceptionDashboard from '../pages/ReceptionDashboard'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:token" element={<Verify />} />

      {/* Dashboards (protected routes can be added here) */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="/reception" element={<ReceptionDashboard />} />

      {/* Fallback to home for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
