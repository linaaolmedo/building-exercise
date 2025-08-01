'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Dashboard from '../../../components/Dashboard'
import { supabase } from '../../../lib/supabase'

// Interface matching the database schema
interface Student {
  id: number
  ssid: string
  local_id: string | null
  first_name: string
  last_name: string
  preferred_name: string | null
  birthdate: string
  status: string
  last_modified_at: string
  gender: string | null
  grade: number | null
  district: string
  school: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  primary_contact_name: string | null
  primary_contact_phone: string | null
  transportation_team: string | null
  transportation_needs: string | null
  practitioner_id: number | null
  primary_disability: string | null
  parental_consent_on_file: boolean
  parental_consent_in_bill: boolean
  parental_consent_given: boolean
  parental_consent_date: string | null
  comments: string | null
  insurance_type: string | null
  insurance_carrier: string | null
  insurance_group_number: string | null
  insurance_policy_number: string | null
  insurance_effective_date: string | null
  medi_cal_eligible: boolean
  medi_cal_benefits_id: string | null
  copay_id: string | null
  iep_date: string | null
  next_review_date: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

interface FileUpload {
  id: number
  entity_table: string
  entity_id: number
  document_type: string
  file_name: string
  mime_type: string | null
  storage_path: string
  file_size_bytes: number | null
  checksum: string | null
  notes: string | null
  uploaded_by: number | null
  uploaded_at: string
}

export default function StudentsPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'upload'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([])

  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch students from database
  const fetchStudents = async () => {
    try {
      setDataLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('student')
        .select('*')
        .order('last_name', { ascending: true })

      if (fetchError) {
        console.error('Error fetching students:', fetchError)
        setError('Failed to load students. Please try again.')
        return
      }

      setStudents(data || [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred.')
    } finally {
      setDataLoading(false)
    }
  }

  // Fetch file uploads for upload history
  const fetchFileUploads = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('file_metadata')
        .select(`
          *,
          uploader:uploaded_by (
            first_name,
            last_name
          )
        `)
        .eq('entity_table', 'student')
        .order('uploaded_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching file uploads:', fetchError)
        return
      }

      setFileUploads(data || [])
    } catch (err) {
      console.error('Error fetching file uploads:', err)
    }
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format datetime for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([fetchStudents(), fetchFileUploads()])
  }

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

      // Fetch data when authentication is complete
      fetchStudents()
      fetchFileUploads()
    }
  }, [user, appUser, loading, router])

  if (loading || dataLoading) {
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

  // Show error state if data failed to load
  if (error) {
  return (
    <Dashboard title="Manage Students" role="Administrator">
      <div className="min-h-96 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
        <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchStudents}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </Dashboard>
    )
  }

  const allStudents = students
  const activeStudents = students.filter(s => s.status === 'Active')
  const inactiveStudents = students.filter(s => s.status === 'Inactive')

  const getCurrentData = () => {
    if (activeTab === 'upload') return fileUploads
    
    let filteredStudents = allStudents
    if (activeTab === 'active') filteredStudents = activeStudents
    if (activeTab === 'inactive') filteredStudents = inactiveStudents
    
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.ssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.local_id && student.local_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.school && student.school.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    return filteredStudents
  }

  const currentData = getCurrentData()

  return (
    <Dashboard title="Manage Students" role="Administrator">
      <div className="bg-white">
        {/* Fixed Header with action buttons - Always visible */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 pb-4 mb-4">
          <div className="flex justify-end items-center min-h-[44px]">
            <div className="flex gap-3 items-center">
              <button
                onClick={refreshData}
                disabled={dataLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap font-medium text-sm h-10"
              >
                <svg className={`w-4 h-4 flex-shrink-0 ${dataLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => router.push('/administrator/students/search')}
                className="px-4 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors whitespace-nowrap font-medium text-sm h-10 flex items-center"
              >
                Individually Add
              </button>
              <button
                onClick={() => router.push('/administrator/students/add?tab=bulk')}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center gap-2 whitespace-nowrap font-medium text-sm h-10"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Add
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="relative">

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Students ({allStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active ({activeStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inactive'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inactive ({inactiveStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload History ({fileUploads.length})
            </button>
          </nav>
        </div>

        {/* Search and Filter */}
        {activeTab !== 'upload' && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filter
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {activeTab === 'upload' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fileUploads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">No upload history</p>
                        <p className="text-sm text-gray-500">Student data upload history will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (currentData as FileUpload[]).map((upload) => (
                    <tr key={upload.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-900">{upload.file_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(upload.uploaded_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(upload as any).uploader ? 
                          `${(upload as any).uploader.first_name} ${(upload as any).uploader.last_name}` : 
                          'Unknown User'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {upload.document_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SSID ↑↓
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local ID ↑↓
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District ↑↓
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School ↑↓
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Birthdate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status ↑↓
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">No students found</p>
                        <p className="text-sm text-gray-500">Get started by adding your first student.</p>
                      </div>
                    </td>
                  </tr>
                ) : (currentData as Student[]).length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">No results found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (currentData as Student[]).map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                        {student.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.ssid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.local_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.district}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.school || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(student.birthdate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.primary_contact_phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(student.last_modified_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{currentData.length}</span> of{' '}
                <span className="font-medium">{currentData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
        </div> {/* End main content area */}
      </div>


    </Dashboard>
  )
}