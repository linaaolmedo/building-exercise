'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

export type OrganizationType = 'Fee Schedule' | 'LEA-BOP'

interface OrganizationContextType {
  currentOrganization: OrganizationType
  setCurrentOrganization: (org: OrganizationType) => void
  canToggleOrganization: boolean
  availableOrganizations: OrganizationType[]
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { appUser } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationType>('Fee Schedule')

  // Determine if user can toggle between organizations
  const canToggleOrganization = appUser?.role === 'Administrator' || appUser?.role === 'Billing Administrator'

  // For now, all users have access to both organizations
  // In a real app, this would be determined by user permissions/assignments
  const availableOrganizations: OrganizationType[] = ['Fee Schedule', 'LEA-BOP']

  // Load saved organization preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrg = localStorage.getItem('currentOrganization') as OrganizationType
      if (savedOrg && availableOrganizations.includes(savedOrg)) {
        setCurrentOrganization(savedOrg)
      }
    }
  }, [])

  // Save organization preference to localStorage
  const handleSetCurrentOrganization = (org: OrganizationType) => {
    setCurrentOrganization(org)
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentOrganization', org)
    }
  }

  const value = {
    currentOrganization,
    setCurrentOrganization: handleSetCurrentOrganization,
    canToggleOrganization,
    availableOrganizations,
  }

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}