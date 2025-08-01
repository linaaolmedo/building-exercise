import { supabase } from './supabase'

export type StorageBucket = 'kcsos-storage-bucket'
export type StorageFolder = 'batch-files' | 'spi-files' | 'user-documents' | 'student-documents'

export interface FileUploadOptions {
  bucket: StorageBucket
  folder: StorageFolder
  makePublic?: boolean
}

export interface FileMetadata {
  id?: number
  entity_table: string
  entity_id: number
  document_type: string
  file_name: string
  mime_type: string
  storage_path: string
  file_size_bytes: number
  checksum?: string
  notes?: string
  uploaded_by: number
  uploaded_at?: string
}

export const storageUtils = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File, 
    options: FileUploadOptions,
    onProgress?: (progress: number) => void
  ) {
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}_${sanitizedName}`
      const fullPath = `${options.folder}/${fileName}`

      console.log('Uploading file:', { fileName, fullPath, bucket: options.bucket })

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath || fullPath
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  },

  /**
   * Save file metadata to database
   */
  async saveFileMetadata(metadata: Omit<FileMetadata, 'id' | 'uploaded_at'>) {
    try {
      console.log('Saving file metadata:', metadata)

      const { data, error } = await supabase
        .from('file_metadata')
        .insert([metadata])
        .select()
        .single()

      if (error) {
        console.error('Metadata save error:', error)
        throw error
      }

      console.log('Metadata saved:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Metadata save error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save metadata'
      }
    }
  },

  /**
   * Get file metadata from database
   */
  async getFileMetadata(entityTable: string, entityId: number, documentType?: string) {
    try {
      let query = supabase
        .from('file_metadata')
        .select('*')
        .eq('entity_table', entityTable)
        .eq('entity_id', entityId)
        .order('uploaded_at', { ascending: false })

      if (documentType) {
        query = query.eq('document_type', documentType)
      }

      const { data, error } = await query
      if (error) {
        console.error('Metadata fetch error:', error)
        throw error
      }

      return { success: true, data }
    } catch (error) {
      console.error('Metadata fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metadata'
      }
    }
  },

  /**
   * Get signed URL for file download
   */
  async getSignedUrl(bucket: StorageBucket, path: string, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('Signed URL error:', error)
        throw error
      }

      return { success: true, signedUrl: data.signedUrl }
    } catch (error) {
      console.error('Signed URL error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get signed URL'
      }
    }
  },

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: StorageBucket, path: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        console.error('Delete error:', error)
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  },

  /**
   * Delete file and its metadata completely
   */
  async deleteFileComplete(metadataId: number) {
    try {
      // First get the file metadata
      const { data: metadata, error: fetchError } = await supabase
        .from('file_metadata')
        .select('*')
        .eq('id', metadataId)
        .single()

      if (fetchError) {
        console.error('Fetch metadata error:', fetchError)
        throw fetchError
      }

      // Delete from storage
      const deleteResult = await this.deleteFile('kcsos-storage-bucket', metadata.storage_path)
      if (!deleteResult.success) {
        console.warn('Failed to delete file from storage:', deleteResult.error)
      }

      // Delete metadata
      const { error: deleteError } = await supabase
        .from('file_metadata')
        .delete()
        .eq('id', metadataId)

      if (deleteError) {
        console.error('Delete metadata error:', deleteError)
        throw deleteError
      }

      return { success: true }
    } catch (error) {
      console.error('Complete delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      }
    }
  },

  /**
   * Generate checksum for file integrity
   */
  async generateChecksum(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.error('Checksum generation error:', error)
      return ''
    }
  }
}

// Helper functions for specific use cases
export const organizationFileUtils = {
  /**
   * Get all SPI files for an organization
   */
  async getSpiFiles(organizationId: number) {
    return await storageUtils.getFileMetadata('organization', organizationId, 'SPI File')
  },

  /**
   * Get all batch files for an organization
   */
  async getBatchFiles(organizationId: number) {
    return await storageUtils.getFileMetadata('organization', organizationId, 'Batch File')
  },

  /**
   * Upload SPI file
   */
  async uploadSpiFile(file: File, organizationId: number, uploadedBy: number) {
    const uploadResult = await storageUtils.uploadFile(file, {
      bucket: 'kcsos-storage-bucket',
      folder: 'spi-files'
    })

    if (!uploadResult.success) {
      return uploadResult
    }

    const metadata: Omit<FileMetadata, 'id' | 'uploaded_at'> = {
      entity_table: 'organization',
      entity_id: organizationId,
      document_type: 'SPI File',
      file_name: file.name,
      mime_type: file.type,
      storage_path: uploadResult.data.path,
      file_size_bytes: file.size,
      uploaded_by: uploadedBy,
      checksum: await storageUtils.generateChecksum(file)
    }

    return await storageUtils.saveFileMetadata(metadata)
  },

  /**
   * Upload batch file
   */
  async uploadBatchFile(file: File, organizationId: number, uploadedBy: number) {
    const uploadResult = await storageUtils.uploadFile(file, {
      bucket: 'kcsos-storage-bucket',
      folder: 'batch-files'
    })

    if (!uploadResult.success) {
      return uploadResult
    }

    const metadata: Omit<FileMetadata, 'id' | 'uploaded_at'> = {
      entity_table: 'organization',
      entity_id: organizationId,
      document_type: 'Batch File',
      file_name: file.name,
      mime_type: file.type,
      storage_path: uploadResult.data.path,
      file_size_bytes: file.size,
      uploaded_by: uploadedBy,
      checksum: await storageUtils.generateChecksum(file)
    }

    return await storageUtils.saveFileMetadata(metadata)
  }
}