// Fake medical record service backed by mock data (simulates an API)

import { medicalRecords as initialMedicalRecords } from '../mock/medicalRecords'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let medicalRecords = [...initialMedicalRecords]

const findNextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

export const getMedicalRecords = async () => {
  await delay()
  return [...medicalRecords]
}

export const getRecordsByPatient = async (patientId) => {
  await delay()
  return medicalRecords.filter((r) => r.patientId === Number(patientId))
}

export const createMedicalRecord = async (record) => {
  await delay()
  const newRecord = { ...record, id: findNextId(medicalRecords) }
  medicalRecords = [...medicalRecords, newRecord]
  return newRecord
}

export const updateMedicalRecord = async (id, record) => {
  await delay()
  const idx = medicalRecords.findIndex((r) => r.id === Number(id))
  if (idx < 0) return null
  medicalRecords[idx] = { ...medicalRecords[idx], ...record }
  return medicalRecords[idx]
}
