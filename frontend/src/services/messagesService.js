// Fake message service backed by mock data (simulates an API)

import { messages as initialMessages } from '../mock/messages'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let messages = [...initialMessages]

const findNextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

export const getMessages = async () => {
  await delay()
  return [...messages]
}

export const getConversation = async (user1, user2) => {
  await delay()
  const u1 = Number(user1)
  const u2 = Number(user2)
  return messages
    .filter(
      (m) =>
        (m.senderId === u1 && m.receiverId === u2) ||
        (m.senderId === u2 && m.receiverId === u1),
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

export const sendMessage = async (message) => {
  await delay()
  const newMessage = {
    ...message,
    id: findNextId(messages),
    timestamp: new Date().toISOString(),
  }
  messages = [...messages, newMessage]
  return newMessage
}
