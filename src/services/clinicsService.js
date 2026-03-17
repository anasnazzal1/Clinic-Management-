// Fake clinic service backed by mock data (simulates an API)

import { clinics as initialClinics } from '../mock/clinics'
import { doctors as initialDoctors } from '../mock/doctors'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let clinics = [...initialClinics]
let doctors = [...initialDoctors]

const findNextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

const attachDoctors = (clinic) => ({
  ...clinic,
  doctors: doctors.filter((doc) => doc.clinicId === clinic.id),
})

export const getClinics = async () => {
  await delay()
  return clinics.map(attachDoctors)
}

export const getClinicById = async (id) => {
  await delay()
  const clinic = clinics.find((c) => c.id === Number(id)) || null
  return clinic ? attachDoctors(clinic) : null
}

export const createClinic = async (clinic) => {
  await delay()
  const newClinic = { ...clinic, id: findNextId(clinics) }
  clinics = [...clinics, newClinic]
  return attachDoctors(newClinic)
}

export const updateClinic = async (id, clinic) => {
  await delay()
  const idx = clinics.findIndex((c) => c.id === Number(id))
  if (idx < 0) return null
  clinics[idx] = { ...clinics[idx], ...clinic }
  return attachDoctors(clinics[idx])
}

export const deleteClinic = async (id) => {
  await delay()
  const exists = clinics.some((c) => c.id === Number(id))
  clinics = clinics.filter((c) => c.id !== Number(id))
  return exists
}
