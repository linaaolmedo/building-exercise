'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../contexts/OrganizationContext'
import { UserRole } from '../lib/supabase'
import Logo from './Logo'

interface DashboardProps {
  title: string
  role: UserRole
  children: React.ReactNode
}

export default function Dashboard({ title, role, children }: DashboardProps) {
  const { appUser, signOut } = useAuth()
  const { currentOrganization, setCurrentOrganization, canToggleOrganization } = useOrganization()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen)
  }

  const getProfileRoute = (role: UserRole) => {
    const profileRoutes = {
      'Administrator': '/administrator/profile',
      'Billing Administrator': '/billing-administrator/profile',
      'Supervisor': '/supervisor/profile',
      'Practitioner': '/practitioner/profile'
    }
    return profileRoutes[role] || '/profile'
  }

  const getNavigationItems = (role: UserRole) => {
    if (role === 'Administrator') {
      return [
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ), 
          label: 'Claims', 
          href: '/administrator/claims',
          hasDropdown: true
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ), 
          label: 'Manage Users', 
          href: '/administrator/users',
          hasDropdown: true
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          ), 
          label: 'Manage Students', 
          href: '/administrator/students',
          hasDropdown: true
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ), 
          label: 'Reports', 
          href: '/administrator/reports',
          hasDropdown: true
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ), 
          label: 'Manage Organizations', 
          href: '/administrator/organizations',
          hasDropdown: true
        },
      ]
    }

    if (role === 'Practitioner') {
      return [
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ), 
          label: 'Log a Service', 
          href: '/practitioner/log-service',
          hasDropdown: false
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ), 
          label: 'Caseload', 
          href: '/practitioner/caseload',
          hasDropdown: false
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ), 
          label: 'Student Services', 
          href: '/practitioner/student-services',
          hasDropdown: false
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ), 
          label: 'Reports', 
          href: '/practitioner/reports',
          hasDropdown: false
        },
      ]
    }

    if (role === 'Supervisor') {
      return [
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ), 
          label: 'Log a Service', 
          href: '/supervisor/log-service',
          hasDropdown: false
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ), 
          label: 'Caseload', 
          href: '/supervisor/caseload',
          hasDropdown: false
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ), 
          label: 'Assigned Practitioners', 
          href: '/supervisor/assigned-practitioners',
          hasDropdown: false
        },
        { 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ), 
          label: 'Reports', 
          href: '/supervisor/reports',
          hasDropdown: false
        },
      ]
    }

    // Default fallback for other roles
    return []
  }

  const navigationItems = getNavigationItems(role)

  return (
    <div className="min-h-screen">
      {/* Fixed Header - Full Width */}
      <header className="bg-[#1DBCC4] shadow-lg fixed top-0 left-0 right-0 z-50 h-16">
        <div className="px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo (fixed position) */}
            <div className="flex items-center">
              <div className="flex items-center">
                <Logo 
                  variant="light" 
                  size="medium" 
                  showTagline={false}
                  className="flex-shrink-0"
                />
              </div>
              
              {/* Mobile Menu Button - Only for mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-white/10 p-2 rounded-md transition-colors lg:hidden ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-4">
              {/* Organization Toggle - Only show for admin and billing admin */}
              {canToggleOrganization && (
                <div className="hidden sm:flex items-center">
                  <button 
                    onClick={() => setCurrentOrganization(currentOrganization === 'Fee Schedule' ? 'LEA-BOP' : 'Fee Schedule')}
                    className="flex items-center text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white text-sm mr-2">{currentOrganization}</span>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Show organization label for other users */}
              {!canToggleOrganization && (
                <div className="hidden sm:flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/80 text-sm">{currentOrganization}</span>
                </div>
              )}
              
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-white text-sm font-medium">
                      {appUser?.first_name} {appUser?.last_name}
                    </div>
                    <div className="text-white/80 text-xs">
                      {appUser?.email}
                    </div>
                  </div>
                  
                  <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {role}
                  </div>
                  
                  <svg
                    className={`w-4 h-4 text-white transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href={getProfileRoute(role)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setUserDropdownOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout Container with Sidebar and Main Content */}
      <div className="pt-16 flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed top-16 bottom-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:static lg:flex-shrink-0`}>
          <div className={`flex flex-col h-full bg-[#1DBCC4] shadow-lg ${sidebarOpen ? 'w-64' : 'lg:w-16 w-64'} transition-all duration-300`}>
            {/* Sidebar Toggle Button - positioned at top */}
            <div className="flex justify-end px-3 pt-3 pb-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-white/20 p-2 rounded transition-colors"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-2 py-2 space-y-2">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-3 text-sm font-medium text-white/90 rounded-md hover:bg-white/20 hover:text-white transition-colors group ${!sidebarOpen ? 'lg:justify-center' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-white">
                      {item.icon}
                    </div>
                    <span className={`ml-3 ${sidebarOpen ? 'lg:block' : 'lg:hidden'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.hasDropdown && (
                    <svg 
                      className={`w-4 h-4 text-white/70 ${sidebarOpen ? 'lg:block' : 'lg:hidden'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Logout Section */}
            <div className="flex-shrink-0 px-2 pb-4">
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium text-white/90 rounded-md hover:bg-white/20 hover:text-white transition-colors group ${!sidebarOpen ? 'lg:justify-center' : ''}`}
              >
                <div className="flex-shrink-0 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className={`ml-3 ${sidebarOpen ? 'lg:block' : 'lg:hidden'}`}>
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed top-16 bottom-0 left-0 right-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
          {/* Main Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 bg-gray-50">
            <div className="pb-4">
              <h1 className="text-2xl font-bold text-teal-700">{title}</h1>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}