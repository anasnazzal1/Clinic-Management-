// Simple auth/storage layer for the mock clinic app.
// Uses localStorage to persist users, verification tokens, and appointments.

import { users as seedUsers } from '../mock/users'

const STORAGE_USERS = 'clinicUsers'
const STORAGE_CURRENT = 'clinicUser'
const STORAGE_TOKENS = 'clinicVerificationTokens'
const STORAGE_APPOINTMENTS = 'clinicAppointments'
const STORAGE_MEDICAL_RECORDS = 'clinicMedicalRecords'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

function readJson(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function seed() {
  const existing = readJson(STORAGE_USERS, null)
  if (!existing) {
    // ensure seeded users are verifiable by default
    const seeded = seedUsers.map((u) => ({ ...u, isVerified: true }))
    writeJson(STORAGE_USERS, seeded)
    return seeded
  }
  return existing
}

export async function getUsers() {
  await delay()
  return seed()
}

export async function getUserByEmail(email) {
  const normalized = email?.trim().toLowerCase()
  const users = await getUsers()
  return users.find((u) => u.email.toLowerCase() === normalized) || null
}

export async function getUserById(id) {
  const users = await getUsers()
  return users.find((u) => Number(u.id) === Number(id)) || null
}

export async function registerPatient({ name, email, password, phone }) {
  await delay()
  const users = await getUsers()

  const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (existing) {
    throw new Error('Email already in use')
  }

  const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
  const newUser = {
    id: nextId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: phone?.trim() || '',
    role: 'patient',
    isVerified: false,
  }

  const updated = [...users, newUser]
  writeJson(STORAGE_USERS, updated)

  return newUser
}

export async function createVerificationToken(userId) {
  await delay(150)
  const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const tokens = readJson(STORAGE_TOKENS, {})
  writeJson(STORAGE_TOKENS, { ...tokens, [token]: Number(userId) })
  return token
}

export async function verifyToken(token) {
  await delay(200)
  const tokens = readJson(STORAGE_TOKENS, {})
  const userId = tokens?.[token]
  if (!userId) return null

  const users = await getUsers()
  const idx = users.findIndex((u) => Number(u.id) === Number(userId))
  if (idx < 0) return null

  users[idx] = { ...users[idx], isVerified: true }
  writeJson(STORAGE_USERS, users)

  const updatedTokens = { ...tokens }
  delete updatedTokens[token]
  writeJson(STORAGE_TOKENS, updatedTokens)

  return users[idx]
}

export async function authenticate(email, password) {
  await delay()
  const user = await getUserByEmail(email)
  if (!user || user.password !== password) return { status: 'invalid' }
  if (!user.isVerified) return { status: 'unverified', user }
  return { status: 'ok', user }
}

export function setCurrentUser(user) {
  writeJson(STORAGE_CURRENT, user)
}

export function getCurrentUser() {
  return readJson(STORAGE_CURRENT, null)
}

export function logout() {
  localStorage.removeItem(STORAGE_CURRENT)
}

export async function getAppointments() {
  await delay()
  return readJson(STORAGE_APPOINTMENTS, [])
}

export async function getAppointmentsByPatient(patientId) {
  const appts = await getAppointments()
  return appts.filter((a) => Number(a.patientId) === Number(patientId))
}

export async function createAppointment(appointment) {
  await delay()
  const appts = await getAppointments()
  const nextId = appts.length ? Math.max(...appts.map((a) => a.id)) + 1 : 1
  const newAppt = { ...appointment, id: nextId }
  const updated = [...appts, newAppt]
  writeJson(STORAGE_APPOINTMENTS, updated)
  return newAppt
}

export async function getMedicalRecordsByPatient(patientId) {
  await delay()
  const records = readJson(STORAGE_MEDICAL_RECORDS, null)
  if (!records) {
    // Seed a few example records for ease of demo
    const seeded = [
      {
        id: 1,
        patientId: 3,
        date: '2026-02-20',
        title: 'Annual physical exam',
        notes: 'Vitals normal. Recommended follow-up in 1 year.',
      },
      {
        id: 2,
        patientId: 3,
        date: '2026-03-03',
        title: 'Flu-like symptoms',
        notes: 'Prescribed rest and hydration. Returned to baseline within 3 days.',
      },
    ]
    writeJson(STORAGE_MEDICAL_RECORDS, seeded)
    return seeded.filter((r) => Number(r.patientId) === Number(patientId))
  }
  return records.filter((r) => Number(r.patientId) === Number(patientId))
}
