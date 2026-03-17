// Fake patient service backed by mock data (simulates an API)

import { patients as initialPatients } from '../mock/patients'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let patients = [...initialPatients]

const findNextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

export const getPatients = async () => {
  await delay()
  return [...patients]
}

export const getPatientById = async (id) => {
  await delay()
  return patients.find((p) => p.id === Number(id)) || null
}

export const createPatient = async (patient) => {
  await delay()
  const newPatient = { ...patient, id: findNextId(patients) }
  patients = [...patients, newPatient]
  return newPatient
}

export const updatePatient = async (id, patient) => {
  await delay()
  const idx = patients.findIndex((p) => p.id === Number(id))
  if (idx < 0) return null
  patients[idx] = { ...patients[idx], ...patient }
  return patients[idx]
}

export const deletePatient = async (id) => {
  await delay()
  const exists = patients.some((p) => p.id === Number(id))
  patients = patients.filter((p) => p.id !== Number(id))
  return exists
}
