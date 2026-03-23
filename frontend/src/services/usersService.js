// Fake user service backed by mock data (simulates an API)

import { users as initialUsers } from '../mock/users'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let users = [...initialUsers]

const findNextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

export const getUsers = async () => {
  await delay()
  return [...users]
}

export const getUserById = async (id) => {
  await delay()
  return users.find((u) => u.id === Number(id)) || null
}

export const createUser = async (user) => {
  await delay()
  const newUser = { ...user, id: findNextId(users) }
  users = [...users, newUser]
  return newUser
}

export const updateUser = async (id, user) => {
  await delay()
  const idx = users.findIndex((u) => u.id === Number(id))
  if (idx < 0) return null
  users[idx] = { ...users[idx], ...user }
  return users[idx]
}

export const deleteUser = async (id) => {
  await delay()
  const exists = users.some((u) => u.id === Number(id))
  users = users.filter((u) => u.id !== Number(id))
  return exists
}
