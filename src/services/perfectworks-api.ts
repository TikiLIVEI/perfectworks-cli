import axios, {AxiosInstance, AxiosResponse, isAxiosError} from 'axios'
import * as fs from 'node:fs'
import {basename, dirname, extname} from 'node:path'

import {
  AIModel,
  AnalyzeFileRequestDto,
  CreateOriginalFileDto,
  FileFormat,
  FileResponseDto,
  FileSignedDownloadUrlRequestDto,
  FileSignedDownloadUrlResponseDto,
  MimeType,
  ProcessFileAccessibilityRequestDto,
  ProcessFileResponseDto,
  SignedUploadUrlRequestDto,
  SignedUploadUrlResponseDto,
} from '../types/files.js'

export interface APIResponse<T> {
  data: T
  message: string
  success: boolean
}

export class PerfectWorksAPI {
  private client: AxiosInstance

  constructor(apiKey: string, baseURL: string = 'https://api.perfectworks.io/api/v0') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      timeout: 30_000, // 30 seconds timeout
    })
  }

  /**
   * Optional: Analyze file for issues
   */
  async analyzeFile(fileId: string, request?: AnalyzeFileRequestDto): Promise<FileResponseDto> {
    try {
      const response: AxiosResponse<APIResponse<FileResponseDto>> = await this.client.post(
        `/files/${fileId}/analysis`,
        request || {},
      )
      return response.data.data
    } catch (error) {
      throw this.formatError(error, `Failed to analyze file`)
    }
  }

  /**
   * Step 3: Create file record in the system
   */
  async createFile(request: CreateOriginalFileDto): Promise<FileResponseDto> {
    try {
      const response: AxiosResponse<APIResponse<FileResponseDto>> = await this.client.post('/files', request)
      return response.data.data
    } catch (error) {
      throw this.formatError(error, `Failed to create file record`)
    }
  }

  /**
   * Step 7: Download file from signed URL
   */
  async downloadFile(downloadUrl: string, outputPath: string): Promise<void> {
    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 60_000, // 60 seconds for file download
      })

      // Ensure output directory exists
      const outputDir = dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true})
      }

      fs.writeFileSync(outputPath, response.data)
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Step 6: Generate download URL for processed file
   */
  async generateDownloadUrl(
    fileId: string,
    request?: FileSignedDownloadUrlRequestDto,
  ): Promise<FileSignedDownloadUrlResponseDto> {
    try {
      const response: AxiosResponse<APIResponse<FileSignedDownloadUrlResponseDto>> = await this.client.post(
        `/files/${fileId}/download-url`,
        request || {expiresIn: 3600},
      )
      return response.data.data
    } catch (error) {
      throw this.formatError(error, `Failed to generate download URL`)
    }
  }

  /**
   * Step 1: Generate signed upload URL
   */
  async generateUploadUrl(request: SignedUploadUrlRequestDto): Promise<SignedUploadUrlResponseDto> {
    try {
      const response: AxiosResponse<APIResponse<SignedUploadUrlResponseDto>> = await this.client.post(
        '/files/upload-url',
        request,
      )
      return response.data.data
    } catch (error) {
      throw this.formatError(error, `Failed to generate upload URL`)
    }
  }

  /**
   * Step 5: Get file details by ID
   */
  async getFile(fileId: string): Promise<FileResponseDto> {
    try {
      const response: AxiosResponse<APIResponse<FileResponseDto>> = await this.client.get(`/files/${fileId}`)
      return response.data.data
    } catch (error) {
      throw this.formatError(error, `Failed to get file details`)
    }
  }

  /**
   * Step 4: Process file for accessibility
   */
  async processFileAccessibility(
    fileId: string,
    request?: ProcessFileAccessibilityRequestDto,
  ): Promise<ProcessFileResponseDto> {
    try {
      const response: AxiosResponse<APIResponse<ProcessFileResponseDto>> = await this.client.post(
        `/files/${fileId}/accessibility`,
        request || {},
      )
      return response.data.data
    } catch (error) {
      throw this.formatError(error, `Failed to process file for accessibility`)
    }
  }

  /**
   * Complete workflow: Process a single file from start to finish
   */
  async processFileComplete(
    inputFilePath: string,
    outputFilePath: string,
    options?: {
      aiModel?: AIModel
      verbose?: boolean
    },
  ): Promise<{
    originalFile: FileResponseDto
    processedFile: FileResponseDto
  }> {
    const {aiModel, verbose = false} = options || {}

    // Determine file type and content type
    const ext = extname(inputFilePath).toLowerCase()
    let contentType: MimeType
    let fileFormat: FileFormat

    if (ext === '.pdf') {
      contentType = MimeType.PDF
      fileFormat = FileFormat.PDF
    } else if (ext === '.html') {
      contentType = MimeType.HTML
      fileFormat = FileFormat.HTML
    } else {
      throw new Error(`Unsupported file type: ${ext}`)
    }

    const filename = basename(inputFilePath)
    const stats = fs.statSync(inputFilePath)

    if (verbose) console.log(`📤 Step 1: Generating upload URL for ${filename}`)

    // Step 1: Generate upload URL
    const uploadUrlResponse = await this.generateUploadUrl({
      contentType,
      filename,
      sizeBytes: stats.size,
    })

    if (verbose) console.log(`📤 Step 2: Uploading file to cloud storage`)

    // Step 2: Upload file
    await this.uploadFile(uploadUrlResponse.uploadUrl, inputFilePath, contentType)

    if (verbose) console.log(`📝 Step 3: Creating file record`)

    // Step 3: Create file record
    const originalFile = await this.createFile({
      filename,
      objectKey: uploadUrlResponse.objectKey,
    })

    if (verbose) console.log(`⚙️ Step 4: Processing file for accessibility`)

    // Step 4: Process for accessibility
    const processRequest: ProcessFileAccessibilityRequestDto = {}
    if (fileFormat === FileFormat.PDF && aiModel) {
      processRequest.model = aiModel
    }

    const processResponse = await this.processFileAccessibility(originalFile.id, processRequest)

    if (verbose) console.log(`📋 Step 5: Getting processed file details`)

    // Step 5: Get processed file details
    const processedFile = await this.getFile(processResponse.processedFileId)

    if (verbose) console.log(`🔗 Step 6: Generating download URL`)

    // Step 6: Generate download URL
    const downloadUrlResponse = await this.generateDownloadUrl(processedFile.id)

    if (verbose) console.log(`📥 Step 7: Downloading processed file`)

    // Step 7: Download processed file
    await this.downloadFile(downloadUrlResponse.downloadUrl, outputFilePath)

    return {
      originalFile,
      processedFile,
    }
  }

  /**
   * Step 2: Upload file to cloud storage using signed URL
   */
  async uploadFile(uploadUrl: string, filePath: string, contentType: string): Promise<void> {
    try {
      const fileBuffer = fs.readFileSync(filePath)

      await axios.put(uploadUrl, fileBuffer, {
        headers: {
          'Content-Length': fileBuffer.length.toString(),
          'Content-Type': contentType,
        },
        timeout: 60_000, // 60 seconds for file upload
      })
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Helper method to format axios errors into simple Error objects
   */
  private formatError(error: unknown, context: string): Error {
    if (isAxiosError(error)) {
      const status = error.response?.status
      const responseData = error.response?.data

      // Extract error message from API response if available
      const messageObject = {
        context,
        errorMessage: error.message,
        responseData,
        status,
      }

      return new Error(JSON.stringify(messageObject, null, 2))
    }

    // Fallback for non-axios errors
    const message = error instanceof Error ? error.message : String(error)
    return new Error(`${context}: ${message}`)
  }
}
