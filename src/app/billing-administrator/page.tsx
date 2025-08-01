'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Dashboard from '../../components/Dashboard'

interface ClaimSummary {
  totalClaims: number
  pendingClaims: number
  approvedClaims: number
  deniedClaims: number
  totalBilledAmount: number
  totalPaidAmount: number
  recentClaims: Array<{
    claim_number: string
    status: string
    service_description: string
    student_name: string
    billed_amount: number
    service_date: string
  }>
}

interface BillingMetrics {
  monthlyRevenue: number
  claimsProcessedToday: number
  averageClaimValue: number
  collectionRate: number
}

export default function BillingAdministratorPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const [claimSummary, setClaimSummary] = useState<ClaimSummary | null>(null)
  const [billingMetrics, setBillingMetrics] = useState<BillingMetrics | null>(null)
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user || !appUser) {
        router.push('/')
        return
      }
      
      if (appUser.role !== 'Billing Administrator') {
        router.push('/')
        return
      }

      // Load dashboard data
      loadDashboardData()
    }
  }, [user, appUser, loading, router])

  const loadDashboardData = async () => {
    setLoadingData(true)
    try {
      // In a real implementation, these would be API calls to your backend
      // For now, we'll simulate the data structure based on your schema
      
      // Simulate claim summary data
      const mockClaimSummary: ClaimSummary = {
        totalClaims: 1247,
        pendingClaims: 89,
        approvedClaims: 1098,
        deniedClaims: 60,
        totalBilledAmount: 892340.00,
        totalPaidAmount: 847620.50,
        recentClaims: [
          {
            claim_number: "2024-0892",
            status: "Approved",
            service_description: "Speech Therapy - Individual Session",
            student_name: "Emma Rodriguez",
            billed_amount: 180.00,
            service_date: "2024-01-15"
          },
          {
            claim_number: "2024-0891", 
            status: "Processing",
            service_description: "Group Therapy - Social Skills",
            student_name: "Multiple Students",
            billed_amount: 320.00,
            service_date: "2024-01-15"
          },
          {
            claim_number: "2024-0890",
            status: "Denied",
            service_description: "Psychological Assessment",
            student_name: "Marcus Chen",
            billed_amount: 450.00,
            service_date: "2024-01-14"
          },
          {
            claim_number: "2024-0889",
            status: "Pending Review",
            service_description: "Occupational Therapy - Individual",
            student_name: "Alex Martinez",
            billed_amount: 200.00,
            service_date: "2024-01-14"
          }
        ]
      }

      const mockBillingMetrics: BillingMetrics = {
        monthlyRevenue: 892340.00,
        claimsProcessedToday: 156,
        averageClaimValue: 285.50,
        collectionRate: 94.9
      }

      setClaimSummary(mockClaimSummary)
      setBillingMetrics(mockBillingMetrics)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

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

  if (!user || !appUser || appUser.role !== 'Billing Administrator') {
    return null
  }

  return (
    <Dashboard title="Billing Administrator Dashboard" role="Billing Administrator">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Welcome back, {appUser.first_name}!
            </h2>
            <p className="text-gray-600">
              Manage billing processes, track revenue, and ensure accurate financial reporting for educational services.
            </p>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">$</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${billingMetrics?.monthlyRevenue.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">📋</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Claims</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {claimSummary?.pendingClaims || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">✓</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Processed Today</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {billingMetrics?.claimsProcessedToday || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">%</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Collection Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {billingMetrics?.collectionRate || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claims Status Overview */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Claims Status Overview</h3>
            {claimSummary && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{claimSummary.totalClaims}</div>
                  <div className="text-sm text-gray-500">Total Claims</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{claimSummary.approvedClaims}</div>
                  <div className="text-sm text-gray-500">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{claimSummary.pendingClaims}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{claimSummary.deniedClaims}</div>
                  <div className="text-sm text-gray-500">Denied</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Functions */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Claims Management */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Claims Management</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Process Claims</div>
                  <div className="text-sm text-gray-500">Review and submit insurance claims by batch number</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Claim Tracking</div>
                  <div className="text-sm text-gray-500">Monitor claim status from submission to payment</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Denials & Appeals</div>
                  <div className="text-sm text-gray-500">Manage rejected claims and appeals process</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Service to Claim Mapping</div>
                  <div className="text-sm text-gray-500">Link service records to billing claims</div>
                </button>
              </div>
            </div>
          </div>

          {/* Billing Code Management */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Code Management</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Fee Schedule Codes</div>
                  <div className="text-sm text-gray-500">Manage procedure codes and rates</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Modifier Management</div>
                  <div className="text-sm text-gray-500">Configure billing modifiers and requirements</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Practitioner Authorization</div>
                  <div className="text-sm text-gray-500">Manage authorized services by practitioner type</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Organization Management</div>
                  <div className="text-sm text-gray-500">Manage payer organizations and ORP details</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Claims Activity */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Claims Activity</h3>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading claims...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {claimSummary?.recentClaims.map((claim, index) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'Approved': return 'bg-green-50 border-green-200 text-green-800 bg-green-100'
                      case 'Processing': return 'bg-blue-50 border-blue-200 text-blue-800 bg-blue-100'
                      case 'Denied': return 'bg-red-50 border-red-200 text-red-800 bg-red-100'
                      case 'Pending Review': return 'bg-yellow-50 border-yellow-200 text-yellow-800 bg-yellow-100'
                      default: return 'bg-gray-50 border-gray-200 text-gray-800 bg-gray-100'
                    }
                  }

                  const colorClasses = getStatusColor(claim.status)
                  const [bgColor, borderColor, textColor, badgeColor] = colorClasses.split(' ')

                  return (
                    <div key={index} className={`flex items-center justify-between p-4 ${bgColor} rounded-lg border ${borderColor}`}>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{claim.claim_number}</p>
                          <span className={`px-3 py-1 text-xs font-medium ${badgeColor} ${textColor} rounded-full`}>
                            {claim.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {claim.service_description} - {claim.student_name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            Service Date: {new Date(claim.service_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            ${claim.billed_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analysis</h3>
              {claimSummary && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Billed</span>
                    <span className="text-lg font-medium text-gray-900">
                      ${claimSummary.totalBilledAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Collected</span>
                    <span className="text-lg font-medium text-green-600">
                      ${claimSummary.totalPaidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Outstanding</span>
                    <span className="text-lg font-medium text-yellow-600">
                      ${(claimSummary.totalBilledAmount - claimSummary.totalPaidAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-500">Average Claim Value</span>
                    <span className="text-lg font-medium text-gray-900">
                      ${billingMetrics?.averageClaimValue.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Reports</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Monthly Revenue Report</div>
                  <div className="text-sm text-gray-500">Detailed monthly billing analysis</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Claims Audit Report</div>
                  <div className="text-sm text-gray-500">Review claim processing accuracy</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Compliance Dashboard</div>
                  <div className="text-sm text-gray-500">Regulatory compliance monitoring</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="text-sm font-medium">Batch Process Claims</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <span className="text-sm font-medium">Export Claims Data</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <span className="text-sm font-medium">Audit Log Review</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <span className="text-sm font-medium">Billing Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
} 