'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Dashboard from '../../../components/Dashboard'
import { supabase } from '../../../lib/supabase'

// Extended AppUser interface to match database schema
interface ExtendedAppUser {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  npi?: string
  license_number?: string
  hire_date?: string
  status: string
  last_login?: string
  role: string
  department?: string
  supervisor_id?: number
  districts?: string[]
  user_type?: string
  permission_level?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

type UserRole = 'All Users' | 'Practitioners' | 'Supervisors' | 'Administrators'

export default function UsersPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  
  // State management
  const [users, setUsers] = useState<ExtendedAppUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ExtendedAppUser[]>([])
  const [activeTab, setActiveTab] = useState<UserRole>('All Users')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ExtendedAppUser | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // User form state
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Practitioner',
    permission_level: 'Standard',
    status: 'Active',
    department: '',
    npi: '',
    license_number: ''
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
      
      fetchUsers()
    }
  }, [user, appUser, loading, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('app_user')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error
      
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter users based on active tab and search term
  useEffect(() => {
    let filtered = users

    // Filter by role/tab
    if (activeTab !== 'All Users') {
      const roleMap = {
        'Practitioners': 'Practitioner',
        'Supervisors': 'Supervisor',
        'Administrators': 'Administrator'
      }
      filtered = users.filter(u => u.role === roleMap[activeTab as keyof typeof roleMap])
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, activeTab, searchTerm])

  const getUserCounts = () => {
    return {
      'All Users': users.length,
      'Practitioners': users.filter(u => u.role === 'Practitioner').length,
      'Supervisors': users.filter(u => u.role === 'Supervisor').length,
      'Administrators': users.filter(u => u.role === 'Administrator').length
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getPermissionBadgeColor = (permission?: string) => {
    switch (permission) {
      case 'Full': return 'bg-red-100 text-red-800'
      case 'Advanced': return 'bg-purple-100 text-purple-800'
      case 'Standard': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddUser = async () => {
    try {
      const { data, error } = await supabase
        .from('app_user')
        .insert([{
          ...userForm,
          created_by: appUser?.id,
          updated_by: appUser?.id
        }])
        .select()

      if (error) throw error

      await fetchUsers()
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('app_user')
        .update({
          ...userForm,
          updated_by: appUser?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      await fetchUsers()
      setShowEditModal(false)
      setSelectedUser(null)
      resetForm()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('app_user')
        .delete()
        .eq('id', selectedUser.id)

      if (error) throw error

      await fetchUsers()
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const resetForm = () => {
    setUserForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'Practitioner',
      permission_level: 'Standard',
      status: 'Active',
      department: '',
      npi: '',
      license_number: ''
    })
  }

  const openEditModal = (user: ExtendedAppUser) => {
    setSelectedUser(user)
    setUserForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      permission_level: user.permission_level || 'Standard',
      status: user.status,
      department: user.department || '',
      npi: user.npi || '',
      license_number: user.license_number || ''
    })
    setShowEditModal(true)
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

  const counts = getUserCounts()
  const tabs: UserRole[] = ['All Users', 'Practitioners', 'Supervisors', 'Administrators']

  return (
    <Dashboard title="Manage Users" role="Administrator">
      <div className="space-y-6">
        {/* Header with tabs and actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-teal-600 border border-teal-200 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>

          {/* Search and Add User */}
          <div className="flex items-center gap-4">
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
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filter
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  {activeTab === 'All Users' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-teal-600">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    {activeTab === 'All Users' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.role}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPermissionBadgeColor(user.permission_level)}`}>
                        {user.permission_level || 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button 
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          onClick={() => {
                            const dropdown = document.getElementById(`dropdown-${user.id}`)
                            if (dropdown) {
                              dropdown.classList.toggle('hidden')
                            }
                          }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        <div id={`dropdown-${user.id}`} className="hidden absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => openEditModal(user)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit User
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeleteModal(true)
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                            >
                              Delete User
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={userForm.first_name}
                      onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={userForm.last_name}
                      onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="Practitioner">Practitioner</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                    <select
                      value={userForm.permission_level}
                      onChange={(e) => setUserForm({...userForm, permission_level: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        resetForm()
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddUser}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Add User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={userForm.first_name}
                      onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={userForm.last_name}
                      onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="Practitioner">Practitioner</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                    <select
                      value={userForm.permission_level}
                      onChange={(e) => setUserForm({...userForm, permission_level: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedUser(null)
                        resetForm()
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleEditUser}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">Delete User</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete {selectedUser.first_name} {selectedUser.last_name}? This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </Dashboard>
  )
}