// Fake appointment service backed by mock data (simulates an API)

import { appointments as initialAppointments } from '../mock/appointments'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let appointments = [...initialAppointments]

const findNextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

export const getAppointments = async () => {
  await delay()
  return [...appointments]
}

export const getAppointmentsByDoctor = async (doctorId) => {
  await delay()
  return appointments.filter((appt) => appt.doctorId === Number(doctorId))
}

export const getAppointmentsByPatient = async (patientId) => {
  await delay()
  return appointments.filter((appt) => appt.patientId === Number(patientId))
}

export const createAppointment = async (appointment) => {
  await delay()
  const newAppointment = { ...appointment, id: findNextId(appointments) }
  appointments = [...appointments, newAppointment]
  return newAppointment
}

export const updateAppointment = async (id, appointment) => {
  await delay()
  const idx = appointments.findIndex((a) => a.id === Number(id))
  if (idx < 0) return null
  appointments[idx] = { ...appointments[idx], ...appointment }
  return appointments[idx]
}

export const cancelAppointment = async (id) => {
  await delay()
  const idx = appointments.findIndex((a) => a.id === Number(id))
  if (idx < 0) return null
  appointments[idx] = { ...appointments[idx], status: 'cancelled' }
  return appointments[idx]
}
