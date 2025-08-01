'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Dashboard from '../../../components/Dashboard'
import { supabase } from '../../../lib/supabase'

interface Student {
  id: number
  ssid: string
  local_id?: string
  first_name: string
  last_name: string
  birthdate: string
  gender?: string
  grade?: number
  district: string
  school?: string
  status: string
  practitioner_id?: number
  practitioner?: {
    first_name: string
    last_name: string
  }
}

interface ServiceGroup {
  id: number
  name: string
  description?: string
  service_type?: string
  meeting_frequency?: string
  duration?: string
  location?: string
  status: string
  practitioner_id?: number
  practitioner?: {
    first_name: string
    last_name: string
  }
  group_memberships?: {
    student: {
      id: number
      ssid: string
      first_name: string
      last_name: string
      district: string
    }
  }[]
}

type TabType = 'caseload' | 'groups'

export default function SupervisorCaseloadPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('caseload')
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<ServiceGroup[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedGroupStudents, setSelectedGroupStudents] = useState<number[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [showAddToCaseloadModal, setShowAddToCaseloadModal] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

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

      loadCaseloadData()
    }
  }, [user, appUser, loading, router])

  const loadCaseloadData = async () => {
    if (!appUser) return

    setIsLoading(true)
    try {
      console.log('Loading caseload data for supervisor:', appUser.id)
      console.log('Full appUser object:', appUser)
      
      // First, let's try a simple query to see if the tables exist
      const { data: studentsData, error: studentsError } = await supabase
        .from('student')
        .select('*')
        .eq('practitioner_id', appUser.id)
        .order('last_name', { ascending: true })

      console.log('Students query result:', { studentsData, studentsError })

      if (studentsError) {
        console.error('Students error details:', studentsError)
        throw studentsError
      }

      // Try to load groups with a simple query first
      const { data: groupsData, error: groupsError } = await supabase
        .from('service_group')
        .select('*')
        .eq('practitioner_id', appUser.id)
        .order('name', { ascending: true })

      console.log('Groups query result:', { groupsData, groupsError })

      if (groupsError) {
        console.error('Groups error details:', groupsError)
        throw groupsError
      }

      setStudents(studentsData || [])
      setGroups(groupsData || [])
    } catch (error) {
      console.error('Error loading caseload data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    const filteredStudents = getFilteredStudents()
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.ssid.includes(searchTerm) ||
        student.district.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !appUser) return

    setIsCreatingGroup(true)
    try {
      // Create the service group
      const { data: groupData, error: groupError } = await supabase
        .from('service_group')
        .insert([{
          name: groupName.trim(),
          practitioner_id: appUser.id,
          status: 'Active',
          created_by: appUser.id,
          updated_by: appUser.id
        }])
        .select()
        .single()

      if (groupError) throw groupError

      // Create group memberships for selected students
      if (selectedGroupStudents.length > 0) {
        const memberships = selectedGroupStudents.map(studentId => ({
          group_id: groupData.id,
          student_id: studentId,
          join_date: new Date().toISOString().split('T')[0],
          status: 'Active',
          created_by: appUser.id,
          updated_by: appUser.id
        }))

        const { error: membershipError } = await supabase
          .from('group_membership')
          .insert(memberships)

        if (membershipError) throw membershipError
      }

      // Reset form and close modal
      setGroupName('')
      setSelectedGroupStudents([])
      setShowCreateGroupModal(false)
      
      // Reload data to show new group
      await loadCaseloadData()
      
      // Switch to groups tab to show the new group
      setActiveTab('groups')
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Failed to create group. Please try again.')
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const handleAddCurrentCaseload = () => {
    setSelectedGroupStudents(students.map(s => s.id))
  }

  const handleGroupStudentSelect = (studentId: number) => {
    setSelectedGroupStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const loadAvailableStudents = async () => {
    if (!appUser) return

    setIsLoadingStudents(true)
    try {
      // Get all students that are NOT assigned to this supervisor
      const { data: availableStudentsData, error } = await supabase
        .from('student')
        .select('*')
        .or(`practitioner_id.is.null,practitioner_id.neq.${appUser.id}`)
        .order('last_name', { ascending: true })

      if (error) throw error

      setAvailableStudents(availableStudentsData || [])
    } catch (error) {
      console.error('Error loading available students:', error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleAddToCaseload = async (studentId: number) => {
    if (!appUser) return

    try {
      const { error } = await supabase
        .from('student')
        .update({ 
          practitioner_id: appUser.id,
          updated_by: appUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)

      if (error) throw error

      // Refresh both lists
      await loadCaseloadData()
      await loadAvailableStudents()
    } catch (error) {
      console.error('Error adding student to caseload:', error)
      alert('Failed to add student to caseload. Please try again.')
    }
  }

  const handleRemoveFromCaseload = async (studentId: number) => {
    if (!appUser) return

    if (!confirm('Are you sure you want to remove this student from your caseload?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('student')
        .update({ 
          practitioner_id: null,
          updated_by: appUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)

      if (error) throw error

      // Refresh both lists
      await loadCaseloadData()
      await loadAvailableStudents()
    } catch (error) {
      console.error('Error removing student from caseload:', error)
      alert('Failed to remove student from caseload. Please try again.')
    }
  }

  const getFilteredAvailableStudents = () => {
    return availableStudents.filter(student => {
      const matchesSearch = studentSearchTerm === '' || 
        student.first_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        student.ssid.includes(studentSearchTerm) ||
        (student.local_id && student.local_id.includes(studentSearchTerm))
      
      const matchesDistrict = districtFilter === 'all' || student.district === districtFilter
      
      return matchesSearch && matchesDistrict
    })
  }

  const getUniqueDistricts = () => {
    const districts = new Set(availableStudents.map(s => s.district))
    return Array.from(districts).sort()
  }

  const formatBirthdate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status.toLowerCase()) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading caseload...</p>
        </div>
      </div>
    )
  }

  if (!user || !appUser || appUser.role !== 'Supervisor') {
    return null
  }

  const filteredStudents = getFilteredStudents()

  return (
    <Dashboard title="Caseload" role="Supervisor">
      <div className="space-y-6">
        {/* Header with Navigation and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Tab Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('caseload')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'caseload'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Caseload
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'groups'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Groups
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              onClick={() => setShowCreateGroupModal(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Create a group
            </button>
            
            <button
              className="inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              onClick={() => {/* TODO: Implement schedule service */}}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule service
            </button>
            
            <button
              className="inline-flex items-center px-4 py-2 bg-teal-600 border border-transparent text-sm font-medium rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              onClick={() => {
                setShowAddToCaseloadModal(true)
                loadAvailableStudents()
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add to caseload
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        {activeTab === 'caseload' && (
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
              Filter
            </button>
                </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'caseload' ? (
          /* Caseload View */
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SSID ↑↓
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Practitioner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District ↑↓
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birthdate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender ↑↓
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status ↑↓
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentSelect(student.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.ssid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 font-medium cursor-pointer hover:text-teal-800">
                          {student.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 font-medium cursor-pointer hover:text-teal-800">
                          {student.first_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.practitioner ? 
                            `${student.practitioner.first_name} ${student.practitioner.last_name}` : 
                            '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatBirthdate(student.birthdate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.gender || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(student.status)}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleRemoveFromCaseload(student.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No students are currently assigned to your caseload'}
                    </p>
              </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Groups View */
          <div className="space-y-6">
            {groups.length === 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't created any service groups yet. Create your first group to get started.
                  </p>
                </div>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-teal-900">
                      {group.name}
                    </h3>
                    <button className="text-teal-600 hover:text-teal-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
            </div>
            
                  {group.group_memberships && group.group_memberships.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-xs font-medium text-teal-700 uppercase tracking-wider pb-3">
                              SSID
                            </th>
                            <th className="text-left text-xs font-medium text-teal-700 uppercase tracking-wider pb-3">
                              Student Name
                            </th>
                            <th className="text-left text-xs font-medium text-teal-700 uppercase tracking-wider pb-3">
                              District
                            </th>
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          {group.group_memberships.map((membership) => (
                            <tr key={membership.student.id} className="border-b border-teal-200 last:border-b-0">
                              <td className="py-2 text-sm text-gray-900">
                                {membership.student.ssid}
                              </td>
                              <td className="py-2 text-sm text-teal-600 font-medium">
                                {membership.student.first_name} {membership.student.last_name}
                              </td>
                              <td className="py-2 text-sm text-gray-900">
                                {membership.student.district}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-teal-600">No students in this group</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
              </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Create New Group</h3>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>

            {/* Group Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 border-2 border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            {/* Add Students Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">Add Students to Group</h4>
                <button
                  onClick={handleAddCurrentCaseload}
                  className="inline-flex items-center px-3 py-1 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Current Caseload
                </button>
              </div>

              {/* Students List */}
              <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                {students.length > 0 ? (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedGroupStudents.includes(student.id)}
                          onChange={() => handleGroupStudentSelect(student.id)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mr-3"
                        />
              <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SSID: {student.ssid}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.district}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No students in your caseload
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={isCreatingGroup}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || isCreatingGroup}
                className="px-4 py-2 bg-teal-600 border border-transparent text-sm font-medium rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingGroup ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Caseload Modal */}
      {showAddToCaseloadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-7xl shadow-lg rounded-md bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Caseload</h3>
              <button
                onClick={() => {
                  setShowAddToCaseloadModal(false)
                  setStudentSearchTerm('')
                  setDistrictFilter('all')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Panel - Search for student */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-6">Search for student</h4>
                
                {/* Search Controls */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={districtFilter}
                      onChange={(e) => setDistrictFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Districts</option>
                      {getUniqueDistricts().map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="Search"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                      Search
                    </button>
                  </div>
                </div>

                {/* Available Students Table */}
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SSID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Local ID
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingStudents ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            Loading students...
                          </td>
                        </tr>
                      ) : getFilteredAvailableStudents().length > 0 ? (
                        getFilteredAvailableStudents().map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.ssid}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.local_id || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleAddToCaseload(student.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            No students found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Panel - Current Caseload */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-6">Current Caseload</h4>
                
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SSID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          District
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.length > 0 ? (
                        students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.ssid}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.district}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            No students in your caseload
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddToCaseloadModal(false)
                  setStudentSearchTerm('')
                  setDistrictFilter('all')
                }}
                className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAddToCaseloadModal(false)
                  setStudentSearchTerm('')
                  setDistrictFilter('all')
                }}
                className="px-6 py-2 bg-teal-600 border border-transparent text-sm font-medium rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  )
}