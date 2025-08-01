'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Dashboard from '../../../components/Dashboard'
import { supabase, Student, ServiceGroup, ServiceFormData, FeeScheduleCode } from '../../../lib/supabase'

export default function LogServicePage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  
  // State management
  const [activeTab, setActiveTab] = useState<'student' | 'group'>('student')
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<ServiceGroup[]>([])
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<ServiceFormData>({
    student_id: undefined,
    group_id: undefined,
    service_date: '',
    service_time: '',
    end_time: '',
    service_type: '',
    location: '',
    case_notes: '',
    is_group_service: false
  })

  // Location options (these are standard, but could also be made dynamic if needed)
  const locations = [
    '03 - School',
    '01 - Home',
    '02 - Community',
    '04 - Clinic',
    '05 - Telehealth'
  ]

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
    
    try {
      setLoadingData(true)
      
      // Load ALL students (not filtered by practitioner)
      const { data: studentsData, error: studentsError } = await supabase
        .from('student')
        .select('*')
        .eq('status', 'Active')
        .order('last_name', { ascending: true })

      if (studentsError) {
        console.error('Error loading students:', studentsError)
      } else {
        setStudents(studentsData || [])
      }

      // Load groups for this practitioner
      const { data: groupsData, error: groupsError } = await supabase
        .from('service_group')
        .select('*')
        .eq('practitioner_id', appUser.id)
        .eq('status', 'Active')
        .order('name', { ascending: true })

      if (groupsError) {
        console.error('Error loading groups:', groupsError)
      } else {
        setGroups(groupsData || [])
      }

      // Load service types from fee_schedule_code table
      const { data: feeCodesData, error: feeCodesError } = await supabase
        .from('fee_schedule_code')
        .select('service_description, service_category')
        .order('service_description', { ascending: true })

      if (feeCodesError) {
        console.error('Error loading service types:', feeCodesError)
        // Fallback to basic service types if database query fails
        setServiceTypes([
          'Health behavior intervention',
          'Speech therapy',
          'Occupational therapy',
          'Physical therapy',
          'Counseling',
          'Assessment',
          'Consultation'
        ])
      } else {
        // Extract unique service descriptions
        const uniqueServiceTypes = [...new Set(
          feeCodesData
            ?.map(code => code.service_description)
            .filter(Boolean)
        )] as string[]
        
        setServiceTypes(uniqueServiceTypes.length > 0 ? uniqueServiceTypes : [
          'Health behavior intervention',
          'Speech therapy', 
          'Occupational therapy',
          'Physical therapy',
          'Counseling',
          'Assessment',
          'Consultation'
        ])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Set fallback service types on error
      setServiceTypes([
        'Health behavior intervention',
        'Speech therapy',
        'Occupational therapy', 
        'Physical therapy',
        'Counseling',
        'Assessment',
        'Consultation'
      ])
    } finally {
      setLoadingData(false)
    }
  }

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0
    
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    
    if (end <= start) return 0
    
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }

  const handleFormChange = (field: keyof ServiceFormData, value: any) => {
    const updatedData = { ...formData, [field]: value }
    
    // Set is_group_service based on active tab
    updatedData.is_group_service = activeTab === 'group'
    
    // Clear the opposite selection when switching tabs
    if (activeTab === 'student') {
      updatedData.group_id = undefined
    } else {
      updatedData.student_id = undefined
    }
    
    setFormData(updatedData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!appUser) return
    
    try {
      setSubmitting(true)
      
      const duration = calculateDuration(formData.service_time, formData.end_time)
      
      const serviceData = {
        practitioner_id: appUser.id,
        service_date: formData.service_date,
        service_time: formData.service_time,
        end_time: formData.end_time,
        duration_minutes: duration,
        service_type: formData.service_type,
        location: formData.location,
        case_notes: formData.case_notes,
        is_group_service: activeTab === 'group',
        status: 'Completed',
        created_by: appUser.id,
        updated_by: appUser.id,
        ...(activeTab === 'student' ? { student_id: formData.student_id } : {}),
        ...(activeTab === 'group' ? { group_name: groups.find(g => g.id === formData.group_id)?.name } : {})
      }

      const { error } = await supabase
        .from('service')
        .insert([serviceData])

      if (error) {
        console.error('Error saving service:', error)
        alert('Error saving service. Please try again.')
      } else {
        alert('Service logged successfully!')
        // Reset form
        setFormData({
          student_id: undefined,
          group_id: undefined,
          service_date: '',
          service_time: '',
          end_time: '',
          service_type: '',
          location: '',
          case_notes: '',
          is_group_service: false
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error saving service. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingData) {
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

  const isFormValid = () => {
    const baseValid = formData.service_date && 
                     formData.service_time && 
                     formData.end_time && 
                     formData.service_type && 
                     formData.location

    if (activeTab === 'student') {
      return baseValid && formData.student_id
    } else {
      return baseValid && formData.group_id
    }
  }

  return (
    <Dashboard title="Log a Service" role="Practitioner">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'student'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('group')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'group'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Group
              </button>
            </nav>
          </div>

          {/* Student Information (for Student tab) */}
          {activeTab === 'student' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-lg font-medium">Student Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.student_id || ''}
                      onChange={(e) => handleFormChange('student_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select a student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.last_name}, {student.first_name} ({student.ssid})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-medium">Service Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.service_date}
                    onChange={(e) => handleFormChange('service_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={formData.service_time}
                      onChange={(e) => handleFormChange('service_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      placeholder="--:-- --"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => handleFormChange('end_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      placeholder="--:-- --"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.service_type}
                    onChange={(e) => handleFormChange('service_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select service type</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location of service <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration Display */}
              {formData.service_time && formData.end_time && (
                <div className="mb-6 p-3 bg-teal-50 border border-teal-200 rounded-md">
                  <p className="text-sm text-teal-700">
                    <span className="font-medium">Duration:</span> {calculateDuration(formData.service_time, formData.end_time)} minutes
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.case_notes}
                  onChange={(e) => handleFormChange('case_notes', e.target.value)}
                  placeholder="Enter detailed case notes for this service session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Group Information (for Group tab) */}
          {activeTab === 'group' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-lg font-medium">Group Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.group_id || ''}
                      onChange={(e) => handleFormChange('group_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select a group</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name} {group.description && `- ${group.description}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={!isFormValid() || submitting}
              className={`px-8 py-3 rounded-md font-medium text-white ${
                isFormValid() && !submitting
                  ? 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Dashboard>
  )
}