'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { useOrganization } from '../../../contexts/OrganizationContext'
import Dashboard from '../../../components/Dashboard'
import FileUploadModal from '../../../components/FileUploadModal'
import { FileMetadata } from '../../../lib/storage'

// Mock data for organizations
const mockOrganizations = {
  'Fee Schedule': {
    name: 'Fee Schedule Organization',
    orp_name: 'Carelon Behavioral Health',
    orp_npi: '1234567890',
    payer_type: 'Fee Schedule',
    status: 'Active',
    effective_date: '2024-01-01',
    contact_email: 'admin@carelon.com'
  },
  'LEA-BOP': {
    name: 'LEA-BOP Organization',
    orp_name: 'Medi-Cal LEA-BOP',
    orp_npi: '0987654321',
    payer_type: 'LEA-BOP',
    status: 'Active',
    effective_date: '2024-01-01',
    contact_email: 'admin@medi-cal.ca.gov'
  }
}

const mockQualifications = {
  'Fee Schedule': [
    { type: 'License', code: 'AMFT', description: 'Registered Associate Marriage and Family Therapists', status: 'Active' },
    { type: 'Credential', code: 'AOD', description: 'Alcohol and Other Drug Counselors', status: 'Active' },
    { type: 'Credential', code: 'APCC', description: 'Registered Associate Professional Clinical Counselors', status: 'Active' },
    { type: 'License', code: 'ASW', description: 'Registered Associate Social Workers', status: 'Active' },
    { type: 'License', code: 'CHW', description: 'Community Health Workers', status: 'Archived' }
  ],
  'LEA-BOP': [
    { type: 'License', code: 'LCSW', description: 'Licensed Clinical Social Worker', status: 'Active' },
    { type: 'License', code: 'LMFT', description: 'Licensed Marriage and Family Therapist', status: 'Active' },
    { type: 'Credential', code: 'BCBA', description: 'Board Certified Behavior Analyst', status: 'Active' }
  ]
}

const mockBillingCodes = {
  'Fee Schedule': [
    { code: 'H2027', type: 'Treatment', description: 'Individual - Health behavior intervention', unit: '15 minutes', rate: 20.11, eligible_practitioners: ['MD', 'PA', 'NP', 'RN', 'PSYCH', 'LCSW'], status: 'Active' },
    { code: 'H2027', type: 'Assessment', description: 'Group - Health behavior intervention', unit: '15 minutes', rate: 8.04, eligible_practitioners: ['MD', 'PA', 'NP', 'RN', 'PSYCH', 'LCSW'], status: 'Active' },
    { code: '98960', type: 'Treatment', description: 'Individual - Education and training for patient self-management', unit: '30 minutes', rate: 26.66, eligible_practitioners: ['CHW'], status: 'Active' }
  ],
  'LEA-BOP': [
    { code: '90834', type: 'Individual Therapy', description: 'Individual psychotherapy, 45 minutes', unit: '45 minutes', rate: 150.00, eligible_practitioners: ['LCSW', 'LMFT', 'LPCC'], status: 'Active' },
    { code: '90837', type: 'Individual Therapy', description: 'Individual psychotherapy, 60 minutes', unit: '60 minutes', rate: 200.00, eligible_practitioners: ['LCSW', 'LMFT', 'LPCC'], status: 'Active' },
    { code: '90847', type: 'Family Therapy', description: 'Family psychotherapy with patient present', unit: '50 minutes', rate: 175.00, eligible_practitioners: ['LMFT', 'LCSW'], status: 'Active' }
  ]
}

const mockPermissionTypes = [
  { type: 'System', code: 'ADMIN', description: 'System Administrator permissions', status: 'Active' },
  { type: 'System', code: 'SUPERVISOR', description: 'Supervisor permissions', status: 'Active' },
  { type: 'System', code: 'PRACTITIONER', description: 'Practitioner permissions', status: 'Active' }
]

const mockServiceTypes = {
  'Fee Schedule': [
    { code: 'MHS-01', type: 'Mental Health', description: 'Individual Mental Health Services', eligible_practitioners: ['MD', 'PA', 'NP', 'RN', 'PSYCH', 'LCSW', 'LMFT', 'LPSS'], status: 'Active' },
    { code: 'MHS-02', type: 'Mental Health', description: 'Group Mental Health Services', eligible_practitioners: ['MD', 'PA', 'NP', 'RN', 'PSYCH', 'LCSW', 'LMFT', 'LPSS'], status: 'Active' },
    { code: 'BHS-01', type: 'Behavioral Health', description: 'Behavioral Health Intervention Services', eligible_practitioners: ['CHW', 'LCSW', 'LMFT', 'LPSS'], status: 'Active' },
    { code: 'AS-01', type: 'Assessment', description: 'Comprehensive Assessment Services', eligible_practitioners: ['MD', 'NP', 'PA', 'PSYCH', 'PSY ASSOC', 'PPS'], status: 'Active' },
    { code: 'CS-01', type: 'Crisis', description: 'Crisis Intervention Services', eligible_practitioners: ['MD', 'PA', 'NP', 'RN', 'PSYCH'], status: 'Active' }
  ],
  'LEA-BOP': [
    { code: 'IND-01', type: 'Individual', description: 'Individual Therapy Services', eligible_practitioners: ['LCSW', 'LMFT', 'LPCC'], status: 'Active' },
    { code: 'GRP-01', type: 'Group', description: 'Group Therapy Services', eligible_practitioners: ['LCSW', 'LMFT', 'LPCC'], status: 'Active' },
    { code: 'FAM-01', type: 'Family', description: 'Family Therapy Services', eligible_practitioners: ['LMFT', 'LCSW'], status: 'Active' }
  ]
}

export default function OrganizationsPage() {
  const { user, appUser, loading } = useAuth()
  const { currentOrganization, setCurrentOrganization, canToggleOrganization } = useOrganization()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('payer-type-info')
  const [showSpiUploadModal, setShowSpiUploadModal] = useState(false)
  const [showBatchUploadModal, setShowBatchUploadModal] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([])

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

  const organization = mockOrganizations[currentOrganization]
  const qualifications = mockQualifications[currentOrganization]
  const billingCodes = mockBillingCodes[currentOrganization]
  const serviceTypes = mockServiceTypes[currentOrganization]
  const lastTabName = currentOrganization === 'Fee Schedule' ? 'Carelon' : 'Medi-Cal'

  const tabs = [
    { id: 'payer-type-info', label: 'Payer Type Info' },
    { id: 'qualifications', label: 'Qualifications' },
    { id: 'billing-codes', label: 'Billing Codes' },
    { id: 'permission-types', label: 'Permission Types' },
    { id: 'service-types', label: 'Service Types' },
    { id: 'last-tab', label: lastTabName }
  ]

  const handleSpiFileUpload = (metadata: FileMetadata) => {
    console.log('SPI file uploaded:', metadata)
    setUploadedFiles(prev => [...prev, metadata])
    // In a real app, you would refresh the file list from the server
  }

  const handleBatchFileUpload = (metadata: FileMetadata) => {
    console.log('Batch file uploaded:', metadata)
    setUploadedFiles(prev => [...prev, metadata])
    // In a real app, you would refresh the file list from the server
  }

  const renderPayerTypeInfo = () => (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Organization Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
          <input
            type="text"
            value={organization.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ORP Name</label>
          <input
            type="text"
            value={organization.orp_name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ORP NPI Number</label>
          <input
            type="text"
            value={organization.orp_npi}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payer Type</label>
          <input
            type="text"
            value={organization.payer_type}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {organization.status}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
          <input
            type="text"
            value={organization.effective_date}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            readOnly
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
          <input
            type="email"
            value={organization.contact_email}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            readOnly
          />
        </div>
      </div>
    </div>
  )

  const renderQualifications = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-80"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium">
            Add Qualification
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {qualifications.map((qual, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{qual.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{qual.code}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{qual.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    qual.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {qual.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderBillingCodes = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-80"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium">
            Add Billing Code
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligible Practitioners</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billingCodes.map((code, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{code.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{code.type}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{code.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{code.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">${code.rate}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{code.eligible_practitioners.join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {code.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPermissionTypes = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-80"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockPermissionTypes.map((permission, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{permission.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{permission.code}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{permission.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {permission.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderServiceTypes = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-80"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligible Practitioners</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serviceTypes.map((service, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.type}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{service.description}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{service.eligible_practitioners.join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {service.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderLastTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SPI Files */}
        <div>
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">SPI Files</h3>
          </div>
          <p className="text-gray-600 mb-6">Manage Service Provider Interface files for claims submission</p>
          
          <button 
            onClick={() => setShowSpiUploadModal(true)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-md font-medium mb-6 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload SPI File
          </button>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Sent Files</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedFiles
                    .filter(file => file.document_type === 'SPI File')
                    .map((file, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-gray-900">{file.file_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{new Date().toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Uploaded
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-teal-600 hover:text-teal-900 text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Mock existing files */}
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-900">SPI_Claims_2024_01_15.xml</td>
                    <td className="px-4 py-4 text-sm text-gray-900">2024-01-15</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Submitted
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-teal-600 hover:text-teal-900 text-sm">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Member Batch Files */}
        <div>
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">Member Batch Files</h3>
          </div>
          <p className="text-gray-600 mb-6">Manage member batch files for enrollment and updates</p>
          
          <button 
            onClick={() => setShowBatchUploadModal(true)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-md font-medium mb-6 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Batch File
          </button>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Sent Files</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedFiles
                    .filter(file => file.document_type === 'Batch File')
                    .map((file, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-gray-900">{file.file_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{new Date().toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Uploaded
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-teal-600 hover:text-teal-900 text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Mock existing files */}
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-900">Member_Batch_2024_01_15.csv</td>
                    <td className="px-4 py-4 text-sm text-gray-900">2024-01-15</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Submitted
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-teal-600 hover:text-teal-900 text-sm">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payer-type-info':
        return renderPayerTypeInfo()
      case 'qualifications':
        return renderQualifications()
      case 'billing-codes':
        return renderBillingCodes()
      case 'permission-types':
        return renderPermissionTypes()
      case 'service-types':
        return renderServiceTypes()
      case 'last-tab':
        return renderLastTab()
      default:
        return renderPayerTypeInfo()
    }
  }

  return (
    <Dashboard title="" role="Administrator">
      <div className="space-y-6">
        {/* Header with organization pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-teal-700">Manage Organization</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
              {currentOrganization}
            </span>
          </div>
          
          {/* Organization Toggle - Only show for users with proper permissions */}
          {canToggleOrganization && (
            <div className="relative">
              <button
                onClick={() => setCurrentOrganization(currentOrganization === 'Fee Schedule' ? 'LEA-BOP' : 'Fee Schedule')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {currentOrganization}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white">
          {renderTabContent()}
        </div>
      </div>

      {/* SPI File Upload Modal */}
      <FileUploadModal
        isOpen={showSpiUploadModal}
        onClose={() => setShowSpiUploadModal(false)}
        onSuccess={handleSpiFileUpload}
        title="Upload SPI File"
        uploadType="spi"
        processingMessage="Please wait while we process your file..."
        successMessage="File processed successfully! Click confirm to complete the upload."
      />

      {/* Batch File Upload Modal */}
      <FileUploadModal
        isOpen={showBatchUploadModal}
        onClose={() => setShowBatchUploadModal(false)}
        onSuccess={handleBatchFileUpload}
        title="Upload Batch File"
        uploadType="batch"
        processingMessage="Please wait while we process your batch file..."
        successMessage="Batch file processed successfully! Click confirm to complete the upload."
      />
    </Dashboard>
  )
}