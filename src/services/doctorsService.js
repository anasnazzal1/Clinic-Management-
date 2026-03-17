// Fake doctor service backed by mock data (simulates an API)

import { doctors as initialDoctors } from '../mock/doctors'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let doctors = [...initialDoctors]

const findNextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

export const getDoctors = async () => {
  await delay()
  return [...doctors]
}

export const getDoctorById = async (id) => {
  await delay()
  return doctors.find((d) => d.id === Number(id)) || null
}

export const getDoctorsByClinic = async (clinicId) => {
  await delay()
  return doctors.filter((d) => d.clinicId === Number(clinicId))
}

export const createDoctor = async (doctor) => {
  await delay()
  const newDoctor = { ...doctor, id: findNextId(doctors) }
  doctors = [...doctors, newDoctor]
  return newDoctor
}

export const updateDoctor = async (id, doctor) => {
  await delay()
  const idx = doctors.findIndex((d) => d.id === Number(id))
  if (idx < 0) return null
  doctors[idx] = { ...doctors[idx], ...doctor }
  return doctors[idx]
}

export const deleteDoctor = async (id) => {
  await delay()
  const exists = doctors.some((d) => d.id === Number(id))
  doctors = doctors.filter((d) => d.id !== Number(id))
  return exists
}
