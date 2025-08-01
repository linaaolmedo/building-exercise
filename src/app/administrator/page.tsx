'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Dashboard from '../../components/Dashboard'

export default function AdministratorPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!loading) {
      if (!user || !appUser) {
        router.push('/')
        return
      }
      
      if (appUser.role !== 'Administrator') {
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

  if (!user || !appUser || appUser.role !== 'Administrator') {
    return null
  }

  return (
    <Dashboard title="" role="Administrator">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-teal-700 mb-2">Administrator Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here&apos;s an overview of your activities and quick access to key features.
            </p>
          </div>
        </div>

        {/* Overview/Analytics Tabs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Analytics
              </button>
              <div className="ml-auto flex items-center">
                <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                  <option>📅 Last Year</option>
                  <option>Last Month</option>
                  <option>Last Week</option>
                </select>
              </div>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Dashboard Overview Header */}
                <div>
                  <h2 className="text-xl font-semibold text-teal-700 mb-2">Dashboard Overview</h2>
                  <p className="text-gray-600">
                    Comprehensive view of your system status, claims processing, recent activities, and key performance indicators. Monitor real-time metrics and stay informed about critical alerts and team performance.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* System Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-semibold text-2xl">247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Practitioners</span>
                        <span className="font-semibold text-green-600 text-xl">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Supervisors</span>
                        <span className="font-semibold text-blue-600 text-xl">43</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Students</span>
                        <span className="font-semibold text-purple-600 text-xl">1,284</span>
                      </div>
                    </div>
                  </div>

                  {/* Claims Status */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Claims Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Claims</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">124</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ready to Submit</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">67</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid Claims</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rejected Claims</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">12</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-gray-900">New User Registration</div>
                        <div className="text-sm text-gray-600">Sarah Mitchell - Practitioner</div>
                        <div className="text-xs text-gray-500">2 hours ago</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Configuration Update</div>
                        <div className="text-sm text-gray-600">Billing codes updated</div>
                        <div className="text-xs text-gray-500">4 hours ago</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Bulk Student Import</div>
                        <div className="text-sm text-gray-600">45 new students added</div>
                        <div className="text-xs text-gray-500">1 day ago</div>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">⚠️ Alerts</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-gray-900">Overdue Claims</div>
                        <div className="text-sm text-gray-600">23 claims need attention</div>
                        <div className="text-xs text-red-600 font-medium">High priority</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Processing Delays</div>
                                                 <div className="text-sm text-gray-600">15 claims aging &gt;30 days</div>
                        <div className="text-xs text-yellow-600 font-medium">Medium priority</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">System Maintenance</div>
                        <div className="text-sm text-gray-600">Scheduled for weekend</div>
                        <div className="text-xs text-blue-600 font-medium">Low priority</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics and Practitioner Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-cyan-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-700 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Processing Time</span>
                        <span className="font-semibold text-teal-600 text-xl">3.2 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-semibold text-green-600 text-xl">98.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Volume</span>
                        <span className="font-semibold text-blue-600 text-xl">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue Impact</span>
                        <span className="font-semibold text-purple-600 text-xl">$156K</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-700 mb-4">Practitioner Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Top Performer</span>
                        <span className="font-semibold text-purple-600 text-lg">Sarah Johnson</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Claims/Week</span>
                        <span className="font-semibold text-green-600 text-xl">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Size</span>
                        <span className="font-semibold text-blue-600 text-xl">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency Score</span>
                        <span className="font-semibold text-purple-600 text-xl">92%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Claims Analytics Overview Header */}
                <div>
                  <h2 className="text-xl font-semibold text-teal-700 mb-2">Claims Analytics Overview</h2>
                  <p className="text-gray-600">
                    Complete analysis of claims processing performance, trends, and operational efficiency. Use the time range selector above to filter data for different periods.
                  </p>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Claims Processing Performance Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Claims Processing Performance Over Time</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Bars show claims volume by status each month. Blue line shows how many days claims take to process.
                    </p>
                    <div className="h-64 bg-white rounded border flex items-center justify-center">
                      <span className="text-gray-400">[Claims Processing Chart Placeholder]</span>
                    </div>
                  </div>

                  {/* Claims Aging Analysis */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">🕐 Claims Aging Analysis</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      How long claims have been in each status - Green is good, Red needs attention
                    </p>
                    <div className="h-64 bg-white rounded border flex items-center justify-center">
                      <span className="text-gray-400">[Claims Aging Chart Placeholder]</span>
                    </div>
                  </div>
                </div>

                {/* Claims Performance Summary */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">1445</div>
                      <div className="text-sm text-gray-600">Total Claims</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">89%</div>
                      <div className="text-sm text-gray-600">Avg Completion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">14</div>
                      <div className="text-sm text-gray-600">Avg Processing Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">20</div>
                      <div className="text-sm text-gray-600">Claims/Day</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-4">Claims by Status</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Pending (59)</span>
                          <div className="text-sm">
                            <span className="text-green-600">✓ Recent (0-7 days): 37</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Ready to Submit (56)</span>
                          <div className="text-sm">
                            <span className="text-green-600">✓ Recent (0-7 days): 21</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Under Review (63)</span>
                          <div className="text-sm">
                            <span className="text-green-600">✓ Recent (0-7 days): 26</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-4">Aging Details</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>338 Total Claims</span>
                          <span className="font-semibold">Current Status</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">39.3% Recent (0-7 days)</span>
                          <span>133 claims</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">50 Aged (31+ days)</span>
                          <span>14.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">6.8% Overdue Rate</span>
                          <span>23 claims</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Impact Analysis */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">💲 Claims Financial Impact Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Shows total claim value (light), actual payments received (dark), and pending amounts (medium) over time.
                  </p>
                  
                  <div className="h-64 bg-white rounded border flex items-center justify-center mb-6">
                    <span className="text-gray-400">[Financial Impact Chart Placeholder]</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">$2.8M</div>
                      <div className="text-sm text-gray-600">Total Claim Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">$1.4M</div>
                      <div className="text-sm text-gray-600">Revenue Realized</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">$0.3M</div>
                      <div className="text-sm text-gray-600">Value at Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">50.1%</div>
                      <div className="text-sm text-gray-600">Realization Rate</div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">📈 Financial Insights</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-green-700 font-semibold mb-2">✅ Revenue Performance</div>
                        <div className="text-2xl font-bold text-green-600 mb-1">$2,216</div>
                        <div className="text-sm text-gray-600">Average Claim Value</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-orange-700 font-semibold mb-2">⚠️ Financial Risk</div>
                        <div className="text-2xl font-bold text-orange-600 mb-1">$262K</div>
                        <div className="text-sm text-gray-600">Lost Revenue (Rejections)</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-3">Latest Month Breakdown</h5>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-100 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-blue-600">$248K</div>
                          <div className="text-xs text-gray-600">Total Claims</div>
                        </div>
                        <div className="bg-green-100 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600">$190K</div>
                          <div className="text-xs text-gray-600">Approved</div>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-purple-600">$147K</div>
                          <div className="text-xs text-gray-600">Paid</div>
                        </div>
                        <div className="bg-orange-100 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-orange-600">$32K</div>
                          <div className="text-xs text-gray-600">Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Reports Access */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Reports Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium text-gray-900">User History</div>
                </div>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-medium text-gray-900">Qualifications</div>
                </div>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-gray-900">Report Builder</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
} 