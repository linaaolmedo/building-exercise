'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Dashboard from '../../../components/Dashboard'

export default function SupervisorReportsPage() {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('canned')
  const [selectedReportType, setSelectedReportType] = useState('')
  const [reportName, setReportName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [filters, setFilters] = useState([])
  const [previewReport, setPreviewReport] = useState(null)

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
    }
  }, [user, appUser, loading, router])

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

  if (!user || !appUser || appUser.role !== 'Supervisor') {
    return null
  }

  const cannedReports = [
    {
      name: 'Team Service Claims Report',
      lastGenerated: '3/11/2024',
      formats: ['PDF', 'Excel']
    },
    {
      name: 'Practitioner Progress Report',
      lastGenerated: '3/9/2024',
      formats: ['PDF', 'Excel']
    },
    {
      name: 'Team Caseload Summary Report',
      lastGenerated: '3/10/2024',
      formats: ['PDF', 'Excel']
    },
    {
      name: 'My Service Claims Report',
      lastGenerated: '3/11/2024',
      formats: ['PDF', 'Excel']
    }
  ]

  const reportTypes = [
    { 
      id: 'team-claims', 
      name: 'Team Claims Report', 
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'my-claims', 
      name: 'My Claims Report', 
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'team-services', 
      name: 'Team Services Report', 
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      id: 'my-services', 
      name: 'My Services Report', 
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      id: 'practitioner-progress', 
      name: 'Practitioner Progress Report', 
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'team-caseload', 
      name: 'Team Caseload Report', 
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '', value: '' }])
  }

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handlePreviewReport = (reportName) => {
    setPreviewReport(reportName)
  }

  const handleBackToReports = () => {
    setPreviewReport(null)
  }

  // Report Preview Components
  const TeamServiceClaimsReport = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBackToReports}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-teal-700">Team Service Claims Report</h1>
            <p className="text-gray-600">All claims submitted for services by your team</p>
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Practitioner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claim Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { id: 1, serviceDate: '02/15/2024', practitioner: 'Sarah Johnson', student: 'Emma Rodriguez', serviceType: 'Speech Therapy', amount: '$125.00', district: 'Fruitvale', status: 'Paid' },
              { id: 2, serviceDate: '02/14/2024', practitioner: 'Michael Davis', student: 'Marcus Chen', serviceType: 'Occupational Therapy', amount: '$145.00', district: 'Greenfield', status: 'Pending' },
              { id: 3, serviceDate: '02/13/2024', practitioner: 'Emma Wilson', student: 'Sofia Williams', serviceType: 'Speech Therapy', amount: '$125.00', district: 'Valley View', status: 'Approved' },
              { id: 4, serviceDate: '02/12/2024', practitioner: 'Sarah Johnson', student: 'Emma Rodriguez', serviceType: 'Speech Therapy', amount: '$125.00', district: 'Fruitvale', status: 'Paid' },
              { id: 5, serviceDate: '02/10/2024', practitioner: 'Carlos Martinez', student: 'Lucas Johnson', serviceType: 'Behavioral Support', amount: '$135.00', district: 'Westside', status: 'Rejected' }
            ].map((claim, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    claim.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    claim.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    claim.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {claim.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.serviceDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.practitioner}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.student}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.serviceType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.district}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // Show preview if one is selected
  if (previewReport) {
    return (
      <Dashboard title="" role="Supervisor">
        {previewReport === 'Team Service Claims Report' && <TeamServiceClaimsReport />}
        {previewReport === 'Practitioner Progress Report' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToReports}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-teal-700">Practitioner Progress Report</h1>
                <p className="text-gray-600">Progress tracking for practitioners on your team</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
              <h2 className="text-lg font-medium text-yellow-800 mb-2">Report Preview</h2>
              <p className="text-yellow-700">This report will show detailed progress metrics for each practitioner on your team, including service delivery rates and completion metrics.</p>
            </div>
          </div>
        )}
        {previewReport === 'Team Caseload Summary Report' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToReports}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-teal-700">Team Caseload Summary Report</h1>
                <p className="text-gray-600">Overview of your team's caseload and service delivery statistics</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
              <h2 className="text-lg font-medium text-yellow-800 mb-2">Report Preview</h2>
              <p className="text-yellow-700">This report will provide a comprehensive overview of your team's caseload, including student demographics, service frequencies, and team productivity metrics.</p>
            </div>
          </div>
        )}
        {previewReport === 'My Service Claims Report' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToReports}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-teal-700">My Service Claims Report</h1>
                <p className="text-gray-600">All claims submitted for services you provided as a supervisor</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
              <h2 className="text-lg font-medium text-yellow-800 mb-2">Report Preview</h2>
              <p className="text-yellow-700">This report will show all service claims for services you provided directly as a supervisor, including billing status and payment information.</p>
            </div>
          </div>
        )}
      </Dashboard>
    )
  }

  return (
    <Dashboard title="Reports Dashboard" role="Supervisor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-teal-600 text-lg">Access your team and service reports and generate custom analytics</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('canned')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'canned'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Reports
              </span>
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'builder'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Report Builder
              </span>
            </button>
          </nav>
        </div>

        {/* My Reports Tab */}
        {activeTab === 'canned' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Supervisor Reports</h2>
              <p className="text-gray-600 mb-6">Reports focused on your team's services and overall supervision</p>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Generated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cannedReports.map((report, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.lastGenerated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {report.formats.map((format) => (
                              <span key={format} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {format}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handlePreviewReport(report.name)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Preview
                            </button>
                            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Generate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Report Builder Tab */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            {/* Header with buttons */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Custom Report Builder</h2>
                <p className="text-gray-600">Create custom reports for your team and supervision activities</p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Template
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Report Type */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Report Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {reportTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedReportType(type.id)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          selectedReportType === type.id
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="mr-3">{type.icon}</div>
                          <div>
                            <div className="font-medium text-sm">{type.name}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Report Name */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Report Name</h3>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Date Range */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Select Fields */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Fields</h3>
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 text-sm">Select a report type to choose fields</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={addFilter}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Filter
                    </button>
                  </div>
                  
                  {filters.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No filters applied</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filters.map((filter, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500">
                            <option>Select field...</option>
                          </select>
                          <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500">
                            <option>equals</option>
                            <option>contains</option>
                            <option>greater than</option>
                            <option>less than</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Value..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <button
                            onClick={() => removeFilter(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}