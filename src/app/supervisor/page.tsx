'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Dashboard from '../../components/Dashboard'

export default function SupervisorPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !appUser) {
        router.push('/')
        return
      }
      
      if (appUser.role !== 'Supervisor') {
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

  if (!user || !appUser || appUser.role !== 'Supervisor') {
    return null
  }

  return (
    <Dashboard title="Supervisor Dashboard" role="Supervisor">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Welcome back, {appUser.first_name}!
            </h2>
            <p className="text-gray-600">
              Monitor team performance, approve workflows, and ensure quality standards across your supervised practitioners.
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                    <dd className="text-lg font-medium text-gray-900">12</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">⏳</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                    <dd className="text-lg font-medium text-gray-900">18</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">✓</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved Today</dt>
                    <dd className="text-lg font-medium text-gray-900">24</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Compliance Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">94%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Functions */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Team Management */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Management</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">My Team</div>
                  <div className="text-sm text-gray-500">View and manage supervised practitioners</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Performance Reviews</div>
                  <div className="text-sm text-gray-500">Conduct and track performance evaluations</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Training & Development</div>
                  <div className="text-sm text-gray-500">Assign training and professional development</div>
                </button>
              </div>
            </div>
          </div>

          {/* Approval Workflows */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Workflows</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Service Approvals</div>
                  <div className="text-sm text-gray-500">Review and approve service plans and modifications</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Documentation Review</div>
                  <div className="text-sm text-gray-500">Validate clinical documentation and notes</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Quality Assurance</div>
                  <div className="text-sm text-gray-500">Monitor quality standards and compliance</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items Requiring Approval</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-900">Service Plan Modification</p>
                  <p className="text-sm text-gray-600">Emma Rodriguez - Requested by Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Submitted 2 hours ago</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200">
                    Approve
                  </button>
                  <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200">
                    Reject
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-900">Session Documentation</p>
                  <p className="text-sm text-gray-600">Marcus Chen Assessment - Submitted by Dr. Mike Wilson</p>
                  <p className="text-xs text-gray-500">Submitted 4 hours ago</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200">
                    Approve
                  </button>
                  <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200">
                    Reject
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-900">New Student Assignment</p>
                  <p className="text-sm text-gray-600">Caseload adjustment request - Alex Martinez</p>
                  <p className="text-xs text-gray-500">Submitted 6 hours ago</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200">
                    Approve
                  </button>
                  <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
} 