// Authentication context for the Clinic Management System.
// Holds current user info, auth state, and helper actions (login/logout).

import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (credentials) => {
    setIsLoading(true)
    try {
      // TODO: wire up to auth service
      setUser({ id: 'example', role: 'patient', name: 'Example User' })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
