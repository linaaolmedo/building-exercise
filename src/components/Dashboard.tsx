'use client'

import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../lib/supabase'

interface DashboardProps {
  title: string
  role: UserRole
  children: React.ReactNode
}

export default function Dashboard({ title, role, children }: DashboardProps) {
  const { appUser, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold">
                  <span className="text-red-500">+</span>
                  <span className="text-teal-500">EDU</span>
                  <span className="text-green-500">claim</span>
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{appUser?.first_name} {appUser?.last_name}</span>
                <span className="text-gray-500 ml-2">({role})</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
} 