'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import Dashboard from '../../../components/Dashboard'

interface Claim {
  id: number
  claim_number: string
  batch_number?: string
  status: string
  service_date?: string
  billed_amount?: number
  paid_amount?: number
  finalized_date?: string
  service_code?: string
  service_description?: string
  rendering_provider?: string
  district?: string
  student_ssid?: string
  student_name?: string
  student_dob?: string
  insurance_type?: string
  insurance_carrier?: string
  modifiers?: string[]
  created_at: string
  updated_at: string
}

type ClaimStatus = 'Not Paid' | 'Paid' | 'Ready to Submit' | 'Incomplete' | 'Remittance Overview'

export default function ClaimsPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const [claims, setClaims] = useState<Claim[]>([])
  const [activeTab, setActiveTab] = useState<ClaimStatus>('Not Paid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClaims, setSelectedClaims] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null)
  const [formData, setFormData] = useState({
    claim_number: '',
    batch_number: '',
    status: 'Incomplete',
    service_date: '',
    billed_amount: '',
    service_code: '',
    service_description: '',
    rendering_provider: '',
    district: '',
    student_ssid: '',
    student_name: '',
    insurance_type: '',
    insurance_carrier: ''
  })

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
      
      fetchClaims()
    }
  }, [user, appUser, loading, router])

  const fetchClaims = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('claim')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClaims(data || [])
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getClaimsByStatus = (status: ClaimStatus) => {
    let statusFilter: string[]
    
    switch (status) {
      case 'Not Paid':
        statusFilter = ['Submitted', 'Rejected']
        break
      case 'Paid':
        statusFilter = ['Paid']
        break
      case 'Ready to Submit':
        statusFilter = ['Needs Approval', 'Approved']
        break
      case 'Incomplete':
        statusFilter = ['Incomplete', 'Draft']
        break
      case 'Remittance Overview':
        statusFilter = ['Submitted', 'Paid', 'Rejected']
        break
      default:
        statusFilter = []
    }

    return claims.filter(claim => 
      statusFilter.includes(claim.status) &&
      (searchTerm === '' || 
       claim.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       claim.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       claim.rendering_provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       claim.district?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  const getTabCounts = () => {
    return {
      'Not Paid': getClaimsByStatus('Not Paid').length,
      'Paid': getClaimsByStatus('Paid').length,
      'Ready to Submit': getClaimsByStatus('Ready to Submit').length,
      'Incomplete': getClaimsByStatus('Incomplete').length,
      'Remittance Overview': getClaimsByStatus('Remittance Overview').length,
    }
  }

  const handleSelectClaim = (claimId: number) => {
    setSelectedClaims(prev => 
      prev.includes(claimId) 
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    )
  }

  const handleSelectAll = () => {
    const currentClaims = getClaimsByStatus(activeTab)
    const currentClaimIds = currentClaims.map(claim => claim.id)
    
    if (selectedClaims.length === currentClaimIds.length) {
      setSelectedClaims([])
    } else {
      setSelectedClaims(currentClaimIds)
    }
  }

  const handleApproveClaims = async () => {
    if (selectedClaims.length === 0) return

    try {
      const { error } = await supabase
        .from('claim')
        .update({ status: 'Approved', updated_at: new Date().toISOString() })
        .in('id', selectedClaims)

      if (error) throw error
      
      await fetchClaims()
      setSelectedClaims([])
      alert('Claims approved successfully!')
    } catch (error) {
      console.error('Error approving claims:', error)
      alert('Error approving claims')
    }
  }

  const handleSubmitClaims = async () => {
    if (selectedClaims.length === 0) return

    try {
      const { error } = await supabase
        .from('claim')
        .update({ status: 'Submitted', updated_at: new Date().toISOString() })
        .in('id', selectedClaims)

      if (error) throw error
      
      await fetchClaims()
      setSelectedClaims([])
      alert('Claims submitted for billing successfully!')
    } catch (error) {
      console.error('Error submitting claims:', error)
      alert('Error submitting claims')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Submitted': 'bg-teal-100 text-teal-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Paid': 'bg-green-100 text-green-800',
      'Needs Approval': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Incomplete': 'bg-orange-100 text-orange-800',
      'Draft': 'bg-gray-100 text-gray-800'
    }

    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    )
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const resetForm = () => {
    setFormData({
      claim_number: '',
      batch_number: '',
      status: 'Incomplete',
      service_date: '',
      billed_amount: '',
      service_code: '',
      service_description: '',
      rendering_provider: '',
      district: '',
      student_ssid: '',
      student_name: '',
      insurance_type: '',
      insurance_carrier: ''
    })
    setEditingClaim(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (claim: Claim) => {
    setFormData({
      claim_number: claim.claim_number,
      batch_number: claim.batch_number || '',
      status: claim.status,
      service_date: claim.service_date || '',
      billed_amount: claim.billed_amount?.toString() || '',
      service_code: claim.service_code || '',
      service_description: claim.service_description || '',
      rendering_provider: claim.rendering_provider || '',
      district: claim.district || '',
      student_ssid: claim.student_ssid || '',
      student_name: claim.student_name || '',
      insurance_type: claim.insurance_type || '',
      insurance_carrier: claim.insurance_carrier || ''
    })
    setEditingClaim(claim)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const claimData = {
        ...formData,
        billed_amount: formData.billed_amount ? parseFloat(formData.billed_amount) : null,
        service_date: formData.service_date || null,
        updated_at: new Date().toISOString(),
        updated_by: appUser?.id
      }

      if (editingClaim) {
        // Update existing claim
        const { error } = await supabase
          .from('claim')
          .update(claimData)
          .eq('id', editingClaim.id)

        if (error) throw error
        alert('Claim updated successfully!')
      } else {
        // Create new claim
        const { error } = await supabase
          .from('claim')
          .insert({
            ...claimData,
            created_by: appUser?.id
          })

        if (error) throw error
        alert('Claim created successfully!')
      }

      await fetchClaims()
      closeModal()
    } catch (error) {
      console.error('Error saving claim:', error)
      alert('Error saving claim')
    }
  }

  const handleDeleteClaim = async (claimId: number) => {
    if (!confirm('Are you sure you want to delete this claim?')) return

    try {
      const { error } = await supabase
        .from('claim')
        .delete()
        .eq('id', claimId)

      if (error) throw error
      
      await fetchClaims()
      alert('Claim deleted successfully!')
    } catch (error) {
      console.error('Error deleting claim:', error)
      alert('Error deleting claim')
    }
  }

  if (loading || isLoading) {
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

  const tabCounts = getTabCounts()
  const currentClaims = getClaimsByStatus(activeTab)

  return (
    <Dashboard title="Claims" role="Administrator">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(Object.keys(tabCounts) as ClaimStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab} ({tabCounts[tab]})
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Claim
            </button>

            {activeTab === 'Ready to Submit' && (
              <>
                <button
                  onClick={handleApproveClaims}
                  disabled={selectedClaims.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve claims
                </button>
                <button
                  onClick={handleSubmitClaims}
                  disabled={selectedClaims.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit approved claims for billing
                </button>
              </>
            )}
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'Ready to Submit' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedClaims.length === currentClaims.length && currentClaims.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {activeTab === 'Paid' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Finalized Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Date
                      </th>
                    </>
                  )}
                  {activeTab !== 'Paid' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Date
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practitioner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SSID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  {activeTab === 'Paid' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Amount
                    </th>
                  )}
                  {activeTab === 'Remittance Overview' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Denied Claims
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    {activeTab === 'Ready to Submit' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedClaims.includes(claim.id)}
                          onChange={() => handleSelectClaim(claim.id)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(claim.status)}
                    </td>
                    {activeTab === 'Paid' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(claim.finalized_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(claim.service_date)}
                        </td>
                      </>
                    )}
                    {activeTab !== 'Paid' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(claim.service_date)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 hover:text-teal-900">
                      <a href="#" className="hover:underline">
                        {claim.batch_number || '-'}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 hover:text-teal-900">
                      <a href="#" className="hover:underline">
                        {claim.claim_number}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 hover:text-teal-900">
                      <a href="#" className="hover:underline">
                        {claim.rendering_provider || '-'}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.district || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.student_ssid || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 hover:text-teal-900">
                      <a href="#" className="hover:underline">
                        {claim.student_name || '-'}
                      </a>
                    </td>
                    {activeTab === 'Paid' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(claim.paid_amount)}
                      </td>
                    )}
                    {activeTab === 'Remittance Overview' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {claim.status === 'Rejected' ? '1' : '0'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openEditModal(claim)}
                          className="text-teal-600 hover:text-teal-900"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
            </div>
                    </td>
                  </tr>
                ))}
                {currentClaims.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'Ready to Submit' ? 11 : 10} className="px-6 py-4 text-center text-sm text-gray-500">
                      No claims found for this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Create/Edit Claim */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingClaim ? 'Edit Claim' : 'Create New Claim'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSaveClaim} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="claim_number" className="block text-sm font-medium text-gray-700">
                        Claim Number *
                      </label>
                      <input
                        type="text"
                        name="claim_number"
                        id="claim_number"
                        required
                        value={formData.claim_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        name="batch_number"
                        id="batch_number"
                        value={formData.batch_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status *
                      </label>
                      <select
                        name="status"
                        id="status"
                        required
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="Incomplete">Incomplete</option>
                        <option value="Draft">Draft</option>
                        <option value="Needs Approval">Needs Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Paid">Paid</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="service_date" className="block text-sm font-medium text-gray-700">
                        Service Date
                      </label>
                      <input
                        type="date"
                        name="service_date"
                        id="service_date"
                        value={formData.service_date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="billed_amount" className="block text-sm font-medium text-gray-700">
                        Billed Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="billed_amount"
                        id="billed_amount"
                        value={formData.billed_amount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="service_code" className="block text-sm font-medium text-gray-700">
                        Service Code
                      </label>
                      <input
                        type="text"
                        name="service_code"
                        id="service_code"
                        value={formData.service_code}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="service_description" className="block text-sm font-medium text-gray-700">
                        Service Description
                      </label>
                      <textarea
                        name="service_description"
                        id="service_description"
                        rows={3}
                        value={formData.service_description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="rendering_provider" className="block text-sm font-medium text-gray-700">
                        Rendering Provider
                      </label>
                      <input
                        type="text"
                        name="rendering_provider"
                        id="rendering_provider"
                        value={formData.rendering_provider}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        id="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="student_ssid" className="block text-sm font-medium text-gray-700">
                        Student SSID
                      </label>
                      <input
                        type="text"
                        name="student_ssid"
                        id="student_ssid"
                        value={formData.student_ssid}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="student_name" className="block text-sm font-medium text-gray-700">
                        Student Name
                      </label>
                      <input
                        type="text"
                        name="student_name"
                        id="student_name"
                        value={formData.student_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700">
                        Insurance Type
                      </label>
                      <input
                        type="text"
                        name="insurance_type"
                        id="insurance_type"
                        value={formData.insurance_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="insurance_carrier" className="block text-sm font-medium text-gray-700">
                        Insurance Carrier
                      </label>
                      <input
                        type="text"
                        name="insurance_carrier"
                        id="insurance_carrier"
                        value={formData.insurance_carrier}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      {editingClaim ? 'Update Claim' : 'Create Claim'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}