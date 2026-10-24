import { createContext, useContext } from 'react'
import { useAuthStore } from '../store/authStore'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const auth = useAuthStore()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
