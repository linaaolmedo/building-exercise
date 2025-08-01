'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import Dashboard from '../../../../components/Dashboard'
import { supabase } from '../../../../lib/supabase'

interface Student {
  id: number
  ssid: string
  first_name: string
  last_name: string
  district: string
  grade?: number
  status: string
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function ScheduleServicePage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [serviceType, setServiceType] = useState('')
  const [location, setLocation] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [isGroupService, setIsGroupService] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  const timeSlots: TimeSlot[] = [
    { time: '08:00', available: true },
    { time: '08:30', available: true },
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '12:30', available: false },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
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

      loadStudents()
    }
  }, [user, appUser, loading, router])

  const loadStudents = async () => {
    if (!appUser) return

    setIsLoading(true)
    try {
      const { data: studentsData, error } = await supabase
        .from('student')
        .select('*')
        .eq('practitioner_id', appUser.id)
        .eq('status', 'Active')
        .order('last_name', { ascending: true })

      if (error) throw error

      setStudents(studentsData || [])
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateEndTime = (startTime: string, durationMinutes: string) => {
    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(start.getTime() + parseInt(durationMinutes) * 60000)
    return end.toTimeString().slice(0, 5)
  }

  const handleScheduleService = async () => {
    if (!appUser || !selectedStudent || !selectedDate || !selectedTime) return

    setIsScheduling(true)
    try {
      const endTime = calculateEndTime(selectedTime, duration)
      
      const serviceData = {
        student_id: parseInt(selectedStudent),
        practitioner_id: appUser.id,
        service_date: selectedDate,
        service_time: selectedTime,
        end_time: endTime,
        duration_minutes: parseInt(duration),
        service_type: serviceType || null,
        location: location || null,
        status: 'Upcoming',
        appointment_notes: appointmentNotes || null,
        is_group_service: isGroupService,
        group_name: isGroupService ? groupName || null : null,
        created_by: appUser.id,
        updated_by: appUser.id
      }

      const { error } = await supabase
        .from('service')
        .insert([serviceData])

      if (error) throw error

      alert('Service scheduled successfully!')
      router.push('/practitioner/student-services')
    } catch (error) {
      console.error('Error scheduling service:', error)
      alert('Failed to schedule service. Please try again.')
    } finally {
      setIsScheduling(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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

  if (!user || !appUser || appUser.role !== 'Practitioner') {
    return null
  }

  return (
    <Dashboard title="Schedule Service" role="Practitioner">
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Student Services
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Calendar and Time Selection */}
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-teal-900 mb-4">Select Date</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border-2 border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {selectedDate && (
                <p className="mt-2 text-sm text-teal-700">
                  Selected: {formatDate(selectedDate)}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Times</h3>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`
                      p-3 rounded-md text-sm font-medium transition-colors
                      ${selectedTime === slot.time
                        ? 'bg-teal-600 text-white'
                        : slot.available
                          ? 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {formatTime(slot.time)}
                    {!slot.available && (
                      <div className="text-xs text-gray-500 mt-1">Unavailable</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Appointment Information */}
          <div className="space-y-6">
            {/* Appointment Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-teal-900 mb-4">Appointment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-teal-700">Start time:</span>
                    <span className="text-sm font-medium text-teal-900">{formatTime(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-teal-700">Duration:</span>
                    <span className="text-sm font-medium text-teal-900">{duration} minutes</span>
                  </div>
                  {selectedTime && duration && (
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-700">End time:</span>
                      <span className="text-sm font-medium text-teal-900">
                        {formatTime(calculateEndTime(selectedTime, duration))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Student Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
              
              <div className="space-y-4">
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
                    <option value="">Select student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} - {student.ssid}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
              
              <div className="space-y-4">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
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
                    Location of service *
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
                <div>
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
                  <div>
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

                {/* Appointment Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Notes
                  </label>
                  <textarea
                    rows={3}
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    placeholder="Enter appointment notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Button */}
            <div className="flex justify-end">
              <button
                onClick={handleScheduleService}
                disabled={!selectedStudent || !selectedDate || !selectedTime || !serviceType || !location || isScheduling}
                className="px-6 py-3 bg-teal-600 border border-transparent text-sm font-medium rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Service'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
}