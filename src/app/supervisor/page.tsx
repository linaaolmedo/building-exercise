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
        {/* Welcome Message */}
        <div className="text-gray-600">
          Welcome back! Here&apos;s an overview of your activities and quick access to key features.
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-teal-800 mb-6">Today&apos;s Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Samantha Greenfield</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">8:00</div>
                  <div className="text-xs text-gray-500">1h</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Nicole Walker</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">9:30</div>
                  <div className="text-xs text-gray-500">30min</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Zachary Gulgowski</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">10:00</div>
                  <div className="text-xs text-gray-500">1h</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Leonard Reynolds</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">1:00</div>
                  <div className="text-xs text-gray-500">1h</div>
                </div>
              </div>
            </div>
            
            <button className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-teal-300 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>My Calendar</span>
            </button>
          </div>

          {/* Assigned Practitioners */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-teal-800 mb-6">Assigned Practitioners</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Sarah Johnson</span>
                </div>
                <span className="text-gray-600">Active</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Michael Davis</span>
                </div>
                <span className="text-gray-600">Active</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Emma Wilson</span>
                </div>
                <span className="text-gray-600">Active</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Carlos Martinez</span>
                </div>
                <span className="text-gray-600">Active</span>
              </div>
            </div>
            
            <button className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-teal-300 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Manage Practitioners</span>
            </button>
          </div>

          {/* Services Pending Approval */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-teal-800 mb-6">Services Pending Approval</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Johnson, Michael</div>
                    <div className="text-sm text-gray-600">4/20 Speech</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Davis, Sarah</div>
                    <div className="text-sm text-gray-600">4/19 OT</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Wilson, Emma</div>
                    <div className="text-sm text-gray-600">4/18 PT</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Martinez, Carlos</div>
                    <div className="text-sm text-gray-600">4/17 Psych</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-teal-300 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Review & Approve</span>
            </button>
          </div>

          {/* Caseload */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-teal-800 mb-6">Caseload</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Total Students</span>
                </div>
                <span className="text-gray-600">48 students</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Active Groups</span>
                </div>
                <span className="text-gray-600">12 groups</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Team Members</span>
                </div>
                <span className="text-gray-600">8 practitioners</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Pending Assignments</span>
                </div>
                <span className="text-gray-600">3 pending</span>
              </div>
            </div>
            
            <button className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-teal-300 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Caseload</span>
            </button>
          </div>
        </div>

        {/* Team Metrics */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Metrics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Most Active Practitioners */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Practitioners</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Sarah Johnson</span>
                  <span className="text-teal-600 font-medium">24 logins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Michael Davis</span>
                  <span className="text-teal-600 font-medium">21 logins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Emma Wilson</span>
                  <span className="text-teal-600 font-medium">18 logins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Carlos Martinez</span>
                  <span className="text-teal-600 font-medium">16 logins</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">Last 30 days</div>
            </div>

            {/* Most Appointments */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Appointments</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Emma Wilson</span>
                  <span className="text-blue-600 font-medium">47 sessions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Sarah Johnson</span>
                  <span className="text-blue-600 font-medium">42 sessions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Michael Davis</span>
                  <span className="text-blue-600 font-medium">38 sessions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Carlos Martinez</span>
                  <span className="text-blue-600 font-medium">35 sessions</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">This month</div>
            </div>

            {/* Completion Rates */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rates</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Sarah Johnson</span>
                  <span className="text-green-600 font-bold">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Carlos Martinez</span>
                  <span className="text-green-600 font-bold">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Emma Wilson</span>
                  <span className="text-green-600 font-bold">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-medium">Michael Davis</span>
                  <span className="text-yellow-600 font-bold">87%</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">Service documentation</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Pending Approvals by Practitioner */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals by Practitioner</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-teal-600 font-medium">Michael Davis</span>
                <span className="text-orange-600 font-bold">12 pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-teal-600 font-medium">Emma Wilson</span>
                <span className="text-orange-600 font-bold">8 pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-teal-600 font-medium">Carlos Martinez</span>
                <span className="text-orange-600 font-bold">6 pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-teal-600 font-medium">Sarah Johnson</span>
                <span className="text-orange-600 font-bold">2 pending</span>
              </div>
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Practitioners</span>
                <span className="text-gray-900 font-bold text-xl">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Students</span>
                <span className="text-blue-600 font-bold text-xl">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Completion Rate</span>
                <span className="text-green-600 font-bold text-xl">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Services This Month</span>
                <span className="text-purple-600 font-bold text-xl">487</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
} 