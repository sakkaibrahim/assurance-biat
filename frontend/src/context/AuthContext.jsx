import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const value = useMemo(
    () => ({
      user,
      setUser: (next) => {
        if (next) {
          localStorage.setItem('user', JSON.stringify(next))
        } else {
          localStorage.removeItem('user')
          localStorage.removeItem('access_token')
        }
        setUser(next)
      },
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_admin),
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
