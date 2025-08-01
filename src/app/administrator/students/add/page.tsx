'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../contexts/AuthContext'
import Dashboard from '../../../../components/Dashboard'
import { supabase } from '../../../../lib/supabase'

interface FormData {
  firstName: string
  lastName: string
  ssid: string
  localId: string
  district: string
  school: string
  birthDate: string
  contactNumber: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  ssid: '',
  localId: '',
  district: '',
  school: '',
  birthDate: '',
  contactNumber: ''
}

export default function AddStudentPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Set initial tab based on query parameter
    const tab = searchParams.get('tab')
    if (tab === 'bulk') {
      setActiveTab('bulk')
    }
  }, [searchParams])

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.ssid.trim()) {
      newErrors.ssid = 'SSID is required'
    }
    if (!formData.district.trim()) {
      newErrors.district = 'District is required'
    }
    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Birth date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('student')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          ssid: formData.ssid,
          local_id: formData.localId || null,
          district: formData.district,
          school: formData.school || null,
          birthdate: formData.birthDate,
          primary_contact_phone: formData.contactNumber || null,
          status: 'Active',
          created_by: appUser.id,
          updated_by: appUser.id
        }])

      if (error) {
        console.error('Error adding student:', error)
        if (error.code === '23505') {
          setErrors({ ssid: 'A student with this SSID already exists' })
        } else {
          setErrors({ general: 'Failed to add student. Please try again.' })
        }
        return
      }

      // Success - redirect back to students list
      router.push('/administrator/students')
    } catch (err) {
      console.error('Unexpected error:', err)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setErrors({})
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

  if (!user || !appUser || appUser.role !== 'Administrator') {
    return null
  }

  return (
    <Dashboard title="Add Students" role="Administrator">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link
            href="/administrator/students"
            className="flex items-center text-teal-700 hover:text-teal-800 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('individual')}
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'individual'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Individual Add
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'bulk'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Bulk Add
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'individual' ? (
              <div>
                {/* Individual Add Form */}
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-900">Add Individual Student</h2>
                  </div>
                  <p className="text-gray-600">
                    Enter student information to add a single student to the system. Required fields: First Name, Last Name, Birthdate, SSID, and District.
                  </p>
                </div>

                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Second row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="ssid" className="block text-sm font-medium text-gray-700 mb-2">
                        SSID *
                      </label>
                      <input
                        type="text"
                        id="ssid"
                        value={formData.ssid}
                        onChange={(e) => handleInputChange('ssid', e.target.value)}
                        placeholder="Enter SSID"
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.ssid ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.ssid && <p className="mt-1 text-sm text-red-600">{errors.ssid}</p>}
                    </div>

                    <div>
                      <label htmlFor="localId" className="block text-sm font-medium text-gray-700 mb-2">
                        Local ID
                      </label>
                      <input
                        type="text"
                        id="localId"
                        value={formData.localId}
                        onChange={(e) => handleInputChange('localId', e.target.value)}
                        placeholder="Enter local ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Third row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                      </label>
                      <select
                        id="district"
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.district ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select district</option>
                        <option value="Fruitvale">Fruitvale</option>
                        <option value="Bakersfield">Bakersfield</option>
                        <option value="Delano">Delano</option>
                        <option value="Arvin">Arvin</option>
                      </select>
                      {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
                    </div>

                    <div>
                      <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                        School
                      </label>
                      <select
                        id="school"
                        value={formData.school}
                        onChange={(e) => handleInputChange('school', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select school</option>
                        <option value="Fruitvale Elementary School">Fruitvale Elementary School</option>
                        <option value="Fruitvale Middle School">Fruitvale Middle School</option>
                        <option value="Fruitvale High School">Fruitvale High School</option>
                      </select>
                    </div>
                  </div>

                  {/* Fourth row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Birth Date *
                      </label>
                      <input
                        type="date"
                        id="birthDate"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.birthDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
                    </div>

                    <div>
                      <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        placeholder="Enter contact number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Adding Student...' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                {/* Bulk Add Form */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-900">Bulk Add Students</h2>
                  </div>
                  <p className="text-gray-600">
                    Upload a file containing multiple student records to add them all at once.
                  </p>
                </div>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8 hover:border-teal-400 transition-colors">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your files</h3>
                  <p className="text-gray-600 mb-4">
                    Drag your file here or{' '}
                    <button className="text-teal-600 hover:text-teal-700 font-medium">Browse</button>
                  </p>
                  <p className="text-sm text-gray-500">File should be .xls, .xlsx or .csv</p>
                </div>

                {/* File Format Requirements */}
                <div className="bg-teal-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-teal-900 mb-4">File Format Requirements:</h3>
                  <ul className="space-y-2 text-sm text-teal-800">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Supported formats:</strong> Excel (.xls, .xlsx) or CSV (.csv)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Required columns:</strong> SSID, Local ID, First Name, Last Name, District, School, DOB</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Maximum file size:</strong> 10 MB</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>First row should contain column headers</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dashboard>
  )
}