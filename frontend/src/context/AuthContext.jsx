import { createContext, useState, useCallback } from 'react'
import { authApi } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('hotel_token'))
  const [cashier, setCashier] = useState(() => {
    const info = sessionStorage.getItem('cashier_info')
    return info ? JSON.parse(info) : null
  })

  const login = useCallback(async (username, password) => {
    const data = await authApi.login({ username, password })

    sessionStorage.setItem('hotel_token', data.token)
    sessionStorage.setItem('cashier_info', JSON.stringify(data.cashier))

    setToken(data.token)
    setCashier(data.cashier)

    return data
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('hotel_token')
    sessionStorage.removeItem('cashier_info')
    setToken(null)
    setCashier(null)
  }, [])

  const value = {
    token,
    cashier,
    isAuthenticated: !!token,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
