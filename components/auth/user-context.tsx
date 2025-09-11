"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  email: string
  role: string
  name: string
}

interface UserContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const rolePermissions = {
  "policy-maker": ["view-all", "edit-all", "export-all", "manage-users", "view-analytics", "upload-records"],
  "state-officer": ["view-state", "edit-state", "export-state", "view-analytics", "upload-records"],
  "district-officer": ["view-district", "edit-district", "export-district", "view-analytics"],
  ngo: ["view-public", "export-public"],
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const permissions = rolePermissions[user.role as keyof typeof rolePermissions] || []
    return permissions.includes(permission)
  }

  return <UserContext.Provider value={{ user, login, logout, hasPermission }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
