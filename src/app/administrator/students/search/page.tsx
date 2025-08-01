'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../contexts/AuthContext'
import Dashboard from '../../../../components/Dashboard'
import { supabase } from '../../../../lib/supabase'

interface Student {
  id: number
  ssid: string
  local_id: string | null
  first_name: string
  last_name: string
  birthdate: string
  district: string
  school: string | null
}

export default function StudentSearchPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

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

  // Debounced search function
  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        performSearch()
      } else {
        setSearchResults([])
        setHasSearched(false)
      }
    }, 300)

    return () => clearTimeout(searchDebounce)
  }, [searchTerm])

  const performSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const { data, error } = await supabase
        .from('student')
        .select('id, ssid, local_id, first_name, last_name, birthdate, district, school')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,ssid.ilike.%${searchTerm}%,local_id.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%,school.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true })
        .limit(20)

      if (error) {
        console.error('Search error:', error)
        return
      }

      setSearchResults(data || [])
    } catch (err) {
      console.error('Unexpected search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const handleSelectStudent = (student: Student) => {
    // Navigate back to manage students or handle student selection
    router.push('/administrator/students')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
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
    <Dashboard title="Search for student" role="Administrator">
      <div className="max-w-6xl mx-auto">
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

        {/* Search Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearchSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students by name, SSID, local ID, district, or school..."
                  className="w-full px-4 py-3 text-lg border-2 border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!searchTerm.trim() || isSearching}
                className="px-8 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Search
              </button>
            </div>

            {/* Can't find student button */}
            <div className="text-center">
              <Link
                href="/administrator/students/add"
                className="inline-block px-6 py-3 border-2 border-teal-600 text-teal-600 font-medium rounded-lg hover:bg-teal-50 transition-colors"
              >
                Can't find student? Add New Student
              </Link>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {searchResults.length > 0 ? (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Search Results ({searchResults.length} found)
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SSID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Local ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">District</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">School</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">DOB</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResults.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.ssid}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.local_id || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.first_name} {student.last_name}
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleSelectStudent(student)}
                              className="px-4 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors text-sm"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-1">No students found</p>
                <p className="text-sm text-gray-500 mb-4">
                  We couldn't find any students matching "{searchTerm}"
                </p>
                <Link
                  href="/administrator/students/add"
                  className="inline-block px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Add New Student
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Dashboard>
  )
}