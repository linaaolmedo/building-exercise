'use client'

import { useState, useRef } from 'react'
import { organizationFileUtils, FileMetadata } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../contexts/OrganizationContext'

export type UploadState = 'selecting' | 'processing' | 'success' | 'error'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (metadata: FileMetadata) => void
  title: string
  uploadType: 'spi' | 'batch'
  processingMessage: string
  successMessage: string
}

export default function FileUploadModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  uploadType,
  processingMessage,
  successMessage
}: FileUploadModalProps) {
  const { appUser } = useAuth()
  const { currentOrganization } = useOrganization()
  const [uploadState, setUploadState] = useState<UploadState>('selecting')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedMetadata, setUploadedMetadata] = useState<FileMetadata | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setUploadState('processing')
    setError(null)

    try {
      if (!appUser) {
        throw new Error('User not authenticated')
      }

      // Mock organization ID - in real app, this would come from the organization context
      const organizationId = currentOrganization === 'Fee Schedule' ? 1 : 2

      console.log('Starting upload:', { file: file.name, uploadType, organizationId })

      let result
      if (uploadType === 'spi') {
        result = await organizationFileUtils.uploadSpiFile(file, organizationId, appUser.id)
      } else {
        result = await organizationFileUtils.uploadBatchFile(file, organizationId, appUser.id)
      }

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      console.log('Upload completed successfully:', result.data)
      setUploadedMetadata(result.data)
      setUploadState('success')
      
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadState('error')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleConfirm = () => {
    if (uploadState === 'success' && uploadedMetadata) {
      onSuccess(uploadedMetadata)
      handleClose()
    }
  }

  const handleClose = () => {
    setUploadState('selecting')
    setSelectedFile(null)
    setError(null)
    setDragActive(false)
    setUploadedMetadata(null)
    onClose()
  }

  const getIcon = () => {
    if (uploadType === 'spi') {
      return (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  }

  const getSubtitle = () => {
    switch (uploadState) {
      case 'selecting':
        return `Select your ${uploadType === 'spi' ? 'SPI' : 'batch'} file to upload`
      case 'processing':
        return processingMessage
      case 'success':
        return successMessage
      case 'error':
        return 'Upload failed. Please try again.'
      default:
        return ''
    }
  }

  const renderSelectingState = () => (
    <div className="p-6">
      <div className="text-center">
        <div
          className={`mx-auto w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer ${
            dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">Drop file here or</p>
          <span className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            browse files
          </span>
        </div>
        
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={uploadType === 'spi' ? '.xml' : '.csv'}
          onChange={handleFileInput}
        />
        
        <p className="mt-4 text-sm text-gray-500">
          {uploadType === 'spi' ? 'Supported format: XML' : 'Supported format: CSV'}
        </p>
      </div>
    </div>
  )

  const renderProcessingState = () => (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
      <p className="text-gray-600 mb-6">{processingMessage}</p>
    </div>
  )

  const renderSuccessState = () => (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <p className="text-gray-600 mb-6">{successMessage}</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <p className="text-red-600 mb-6">{error}</p>
      <button
        onClick={() => setUploadState('selecting')}
        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            {getIcon()}
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">
                {getSubtitle()}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {uploadState === 'selecting' && renderSelectingState()}
        {uploadState === 'processing' && renderProcessingState()}
        {uploadState === 'success' && renderSuccessState()}
        {uploadState === 'error' && renderErrorState()}

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={uploadState === 'success' ? handleConfirm : () => {}}
            disabled={uploadState !== 'success'}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              uploadState === 'success'
                ? 'bg-teal-600 hover:bg-teal-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Confirm Upload
          </button>
        </div>
      </div>
    </div>
  )
}