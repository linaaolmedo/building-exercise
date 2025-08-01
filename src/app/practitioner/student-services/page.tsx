'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Dashboard from '../../../components/Dashboard'
import { supabase } from '../../../lib/supabase'

interface Student {
  id: number
  ssid: string
  first_name: string
  last_name: string
  district: string
  grade?: number
  status: string
}

interface Service {
  id: number
  student_id: number
  practitioner_id: number
  service_date: string
  service_time?: string
  end_time?: string
  duration_minutes?: number
  service_type?: string
  location?: string
  status: string
  case_notes?: string
  appointment_notes?: string
  is_group_service: boolean
  group_name?: string
  created_at: string
  updated_at: string
  student?: Student
}

type TabType = 'calendar' | 'services' | 'log'

export default function StudentServicesPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('calendar')
  const [services, setServices] = useState<Service[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Log Service Form State
  const [showLogModal, setShowLogModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
  const [serviceTime, setServiceTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [location, setLocation] = useState('')
  const [caseNotes, setCaseNotes] = useState('')
  const [isGroupService, setIsGroupService] = useState(false)
  const [groupName, setGroupName] = useState('')

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

      loadData()
    }
  }, [user, appUser, loading, router])

  const loadData = async () => {
    if (!appUser) return

    setIsLoading(true)
    try {
      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from('service')
        .select(`
          *,
          student:student_id (
            id,
            ssid,
            first_name,
            last_name,
            district,
            grade,
            status
          )
        `)
        .eq('practitioner_id', appUser.id)
        .order('service_date', { ascending: false })

      if (servicesError) throw servicesError

      // Load students for practitioner
      const { data: studentsData, error: studentsError } = await supabase
        .from('student')
        .select('*')
        .eq('practitioner_id', appUser.id)
        .eq('status', 'Active')
        .order('last_name', { ascending: true })

      if (studentsError) throw studentsError

      setServices(servicesData || [])
      setStudents(studentsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredServices = () => {
    return services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.student?.ssid?.includes(searchTerm) ||
        service.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (time?: string) => {
    if (!time) return '-'
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status.toLowerCase()) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'upcoming':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'incomplete':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handleLogService = async () => {
    if (!appUser || !selectedStudent || !serviceDate) return

    try {
      const serviceData = {
        student_id: parseInt(selectedStudent),
        practitioner_id: appUser.id,
        service_date: serviceDate,
        service_time: serviceTime || null,
        end_time: endTime || null,
        duration_minutes: serviceTime && endTime ? 
          Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${serviceTime}`)) / 60000) : null,
        service_type: serviceType || null,
        location: location || null,
        status: 'Completed',
        case_notes: caseNotes || null,
        is_group_service: isGroupService,
        group_name: isGroupService ? groupName || null : null,
        created_by: appUser.id,
        updated_by: appUser.id
      }

      const { error } = await supabase
        .from('service')
        .insert([serviceData])

      if (error) throw error

      // Reset form
      setSelectedStudent('')
      setServiceDate(new Date().toISOString().split('T')[0])
      setServiceTime('')
      setEndTime('')
      setServiceType('')
      setLocation('')
      setCaseNotes('')
      setIsGroupService(false)
      setGroupName('')
      setShowLogModal(false)

      // Reload data
      await loadData()

      alert('Service logged successfully!')
    } catch (error) {
      console.error('Error logging service:', error)
      alert('Failed to log service. Please try again.')
    }
  }

  const handleScheduleService = () => {
    router.push('/practitioner/student-services/schedule')
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (!user || !appUser || appUser.role !== 'Practitioner') {
    return null
  }

  const filteredServices = getFilteredServices()

  return (
    <Dashboard title="Student Services" role="Practitioner">
      <div className="space-y-6">
        {/* Header with Navigation and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Tab Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Calendar
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'services'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'log'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Log Service
            </button>
          </div>

          {/* Schedule Service Button */}
          <div className="flex gap-3">
            <button
              onClick={handleScheduleService}
              className="inline-flex items-center px-4 py-2 bg-teal-600 border border-transparent text-sm font-medium rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Service
            </button>
          </div>
        </div>

        {/* Search and Filter for Services Tab */}
        {activeTab === 'services' && (
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
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Calendar View</h3>
              <p className="mt-1 text-sm text-gray-500">
                Calendar integration coming soon. Use the "All Services" tab to view your scheduled services.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-teal-600">
                            {service.student?.first_name} {service.student?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SSID: {service.student?.ssid}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(service.service_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.service_time ? (
                            <div>
                              <div>{formatTime(service.service_time)}</div>
                              {service.end_time && (
                                <div className="text-xs text-gray-500">
                                  to {formatTime(service.end_time)}
                                </div>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.service_type || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.location || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(service.status)}>
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.is_group_service ? (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-teal-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-xs">
                                {service.group_name || 'Group'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Individual</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredServices.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No services have been scheduled yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Log Completed Service</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student *
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} - {student.ssid}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Date *
                </label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              {/* Service Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select service type</option>
                  <option value="Speech Therapy">Speech Therapy</option>
                  <option value="Occupational Therapy">Occupational Therapy</option>
                  <option value="Physical Therapy">Physical Therapy</option>
                  <option value="Behavioral Support">Behavioral Support</option>
                  <option value="Counseling">Counseling</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select location</option>
                  <option value="School">School</option>
                  <option value="Home">Home</option>
                  <option value="Community">Community</option>
                  <option value="Telehealth">Telehealth</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Group Service Checkbox */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isGroupService}
                    onChange={(e) => setIsGroupService(e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Group Service</span>
                </label>
              </div>

              {/* Group Name (if group service) */}
              {isGroupService && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              )}

              {/* Case Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Notes
                </label>
                <textarea
                  rows={4}
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  placeholder="Enter service notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleLogService}
                disabled={!selectedStudent || !serviceDate}
                className="px-6 py-2 bg-teal-600 border border-transparent text-sm font-medium rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log Service
              </button>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}