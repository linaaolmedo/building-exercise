'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Dashboard from '../../components/Dashboard'

export default function PractitionerPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !appUser) {
        router.push('/')
        return
      }
      
      if (appUser.role !== 'Practitioner') {
        router.push('/')
        return
      }
    }
  }, [user, appUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !appUser || appUser.role !== 'Practitioner') {
    return null
  }

  return (
    <Dashboard title="Practitioner Dashboard" role="Practitioner">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Welcome back, {appUser.first_name}!
            </h2>
            <p className="text-gray-600">
              Manage your caseload, document services, and track student progress from your practitioner dashboard.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Caseload</dt>
                    <dd className="text-lg font-medium text-gray-900">23</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">📅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today&apos;s Sessions</dt>
                    <dd className="text-lg font-medium text-gray-900">7</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">📝</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Notes</dt>
                    <dd className="text-lg font-medium text-gray-900">5</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">⚡</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                    <dd className="text-lg font-medium text-gray-900">34 hrs</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Main Functions */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Student Management */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Management</h3>
              <div className="space-y-3">
                <a href="/practitioner/caseload" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">My Caseload</div>
                  <div className="text-sm text-gray-500">View and manage assigned students</div>
                </a>
                <a href="/practitioner/student-services" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Student Services</div>
                  <div className="text-sm text-gray-500">Create and update individual service plans</div>
                </a>
                <a href="/practitioner/student-services" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Progress Tracking</div>
                  <div className="text-sm text-gray-500">Monitor student progress and outcomes</div>
                </a>
              </div>
            </div>
          </div>

          {/* Clinical Documentation */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Documentation</h3>
              <div className="space-y-3">
                <a href="/practitioner/log-service" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Log a Service</div>
                  <div className="text-sm text-gray-500">Document service delivery and observations</div>
                </a>
                <a href="/practitioner/log-service" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Service Claims</div>
                  <div className="text-sm text-gray-500">Submit and track billing claims</div>
                </a>
                <a href="/practitioner/reports" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Reports</div>
                  <div className="text-sm text-gray-500">Generate progress and compliance reports</div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Today&apos;s Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">9:00 AM - Individual Session</p>
                  <p className="text-sm text-gray-600">Emma Rodriguez - Speech Therapy</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Scheduled
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">10:30 AM - Group Session</p>
                  <p className="text-sm text-gray-600">Social Skills Group (4 students)</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Scheduled
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">2:00 PM - Assessment</p>
                  <p className="text-sm text-gray-600">Marcus Chen - Initial Evaluation</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
} 