/**
 * File Management Endpoints
 *
 * Base URL: /api/v0/files
 * All endpoints require authentication (Firebase JWT or API Key)
 * Organization context is required for all operations
 *
 * Endpoints:
 * - POST   /api/v0/files/upload-url            - Generate pre-signed upload URL
 * - POST   /api/v0/files                       - Create file record after upload
 * - GET    /api/v0/files                       - List files (user's own files or all org files)
 * - GET    /api/v0/files/:fileId               - Get file details by ID
 * - PUT    /api/v0/files/:fileId               - Update file metadata
 * - DELETE /api/v0/files/:fileId               - Soft delete file
 * - POST   /api/v0/files/:fileId/download-url  - Generate signed download URL
 * - POST   /api/v0/files/:fileId/analysis      - Analyze file for issues
 * - POST   /api/v0/files/:fileId/accessibility - Process file for accessibility
 *
 * Authentication & Access Control:
 * - User JWT/API Key: Can access own files within active organization
 * - Organization JWT/API Key: Can access all files within organization
 * - All operations require organization context
 *
 * Query Parameters (GET /api/v0/files):
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - sort: string (e.g., "createdAt:desc", "uploadDate:desc", "filename:asc", "fileSize:desc")
 * - fileType: FileType (filter by file type: original, accessible, converted)
 * - fileFormat: FileFormat (filter by format: pdf, html)
 * - status: FileStatus (filter by status: uploaded, processing, processed, failed, deleted)
 * - search: string (search in filename)
 */

// Define File-specific enums
export enum FileType {
  ACCESSIBLE = 'accessible',
  CONVERTED = 'converted',
  ORIGINAL = 'original',
}

export enum FileFormat {
  HTML = 'html',
  PDF = 'pdf',
}

export enum FileStatus {
  DELETED = 'deleted',
  FAILED = 'failed',
  PROCESSED = 'processed',
  PROCESSING = 'processing',
  UPLOADED = 'uploaded',
}

// Define enums for common MIME types (moved from file module)
export enum MimeType {
  HTML = 'text/html',
  PDF = 'application/pdf',
}

export enum IssueSeverity {
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export enum IssueCategory {
  ACCESSIBILITY = 'accessibility',
  BEST_PRACTICES = 'best_practices',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance',
  SEO = 'seo',
}

export enum TestStatus {
  FAIL = 'fail',
  MANUAL = 'manual',
  NOT_APPLICABLE = 'not_applicable',
  PASS = 'pass',
}

/**
 * Data transfer object for requesting a signed upload URL
 * @example {
 *   "filename": "document.pdf",
 *   "contentType": "application/pdf",
 *   "sizeBytes": 1048576
 * }
 */
export interface SignedUploadUrlRequestDto {
  /**
   * MIME type of the file
   * @example "application/pdf"
   */
  contentType: MimeType

  /**
   * Original filename
   * @example "document.pdf"
   */
  filename: string

  /**
   * File size in bytes
   * @example 1048576
   */
  sizeBytes: number
}

/**
 * Data transfer object for signed upload URL response
 * @example {
 *   "uploadUrl": "https://storage.googleapis.com/bucket/object?uploadId=123&signature=abc",
 *   "objectKey": "507f191e810c19729de860ea/document_1642247400000.pdf",
 *   "expiresAt": "2024-01-15T11:30:00.000Z"
 * }
 */
export interface SignedUploadUrlResponseDto {
  /**
   * URL expiration timestamp (ISO 8601 format)
   * @format date-time
   * @example "2024-01-15T11:30:00.000Z"
   */
  expiresAt: string

  /**
   * Object key where the file will be stored
   * @example "507f191e810c19729de860ea/document_1642247400000.pdf"
   */
  objectKey: string

  /**
   * Signed upload URL for direct upload to storage
   * @example "https://storage.googleapis.com/bucket/object?uploadId=123&signature=abc"
   */
  uploadUrl: string
}

/**
 * Analysis issue interface for file analysis results
 */
export interface AnalysisIssueDto {
  /** Category this issue belongs to */
  category: IssueCategory
  /** Detailed description of the issue */
  description: string
  /** Unique identifier for the rule/audit */
  id: string
  /** Location information if available */
  location?: {
    column?: number
    line?: number
    pageNumber?: number
  }
  /** Severity level */
  severity: IssueSeverity
  /** Human-readable title */
  title: string
}

/**
 * Analysis category result for file analysis
 */
export interface AnalysisCategoryResultDto {
  /** Issues found in this category */
  issues: AnalysisIssueDto[]
  /** Category name */
  name: IssueCategory
  /** Score from 0 to 100 (null if not applicable) */
  score: null | number
  /** Pass/fail status */
  status: TestStatus
  /** Summary statistics */
  summary: {
    errorCount: number
    infoCount: number
    totalIssues: number
    warningCount: number
  }
}

/**
 * Analysis results for a file
 */
export interface AnalyseResultsDto {
  /** Analysis results by category */
  categories?: AnalysisCategoryResultDto[]
  /** Error message if analysis failed */
  error?: string
  /** Overall compliance score (0-100) */
  overallScore?: number
  /** Whether analysis completed successfully */
  success: boolean
}

/**
 * Analysis result stored in database for a file
 */
export interface FileAnalysisResultDto {
  /** When the analysis was performed */
  analysedAt: string
  /** Analysis results */
  results: AnalyseResultsDto
}

/**
 * Data transfer object for updating a file
 * @example {
 *   "isActive": true,
 *   "filename": "updated-document.pdf"
 * }
 */
export interface UpdateFileDto {
  /**
   * Updated filename for the file. The filename will be sanitized to remove
   * invalid characters. Must be between 1 and 255 characters long.
   * @example "updated-document.pdf"
   */
  filename?: string

  /**
   * Whether this file is active
   * @example true
   */
  isActive?: boolean
}

/**
 * Data transfer object for requesting a signed download URL for a file
 * @example {
 *   "expiresIn": 3600
 * }
 */
export interface FileSignedDownloadUrlRequestDto {
  /**
   * URL expiration time in seconds (default: 3600)
   * @example 3600
   */
  expiresIn?: number
}

/**
 * Data transfer object for signed download URL response for a file
 * @example {
 *   "downloadUrl": "https://storage.googleapis.com/bucket/object?signature=abc",
 *   "expiresAt": "2024-01-15T11:30:00.000Z"
 * }
 */
export interface FileSignedDownloadUrlResponseDto {
  /**
   * Signed download URL
   * @example "https://storage.googleapis.com/bucket/object?signature=abc"
   */
  downloadUrl: string

  /**
   * URL expiration timestamp (ISO 8601 format)
   * @format date-time
   * @example "2024-01-15T11:30:00.000Z"
   */
  expiresAt: string
}

/**
 * Data transfer object for file response
 * @example {
 *   "id": "507f1f77bcf86cd799439011",
 *   "userId": "507f191e810c19729de860ea",
 *   "organizationId": "507f191e810c19729de860eb",
 *   "parentFileId": "507f1f77bcf86cd799439012",
 *   "fileType": "accessible",
 *   "filename": "document_accessible.pdf",
 *   "fileFormat": "pdf",
 *   "mimeType": "application/pdf",
 *   "fileSize": 1048576,
 *   "pageCount": 10,
 *   "charsCount": 5432,
 *   "objectKey": "files/507f191e810c19729de860ea/document_accessible_1642247400000.pdf",
 *   "uploadDate": "2024-01-15T10:15:00.000Z",
 *   "processedAt": "2024-01-15T10:30:00.000Z",
 *   "analysisResult": null,
 *   "status": "uploaded",
 *   "isActive": true,
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "updatedAt": "2024-01-15T10:30:00.000Z"
 * }
 */
export interface FileResponseDto {
  /**
   * Analysis result for this file (latest analysis)
   */
  analysisResult: FileAnalysisResultDto | null

  /**
   * Number of characters (for HTML/text files)
   * @example 5432
   */
  charsCount?: number

  /**
   * File creation timestamp (ISO 8601 format)
   * @format date-time
   * @example "2024-01-15T10:30:00.000Z"
   */
  createdAt: string

  /**
   * File format
   * @example "pdf"
   */
  fileFormat: FileFormat

  /**
   * Filename for this file
   * @example "document_accessible.pdf"
   */
  filename: string

  /**
   * File size in bytes
   * @example 1048576
   */
  fileSize: number

  /**
   * File type
   * @example "accessible"
   */
  fileType: FileType

  /**
   * File's unique identifier
   * @example "507f1f77bcf86cd799439011"
   */
  id: string

  /**
   * Whether this file is active
   * @example true
   */
  isActive: boolean

  /**
   * MIME type of the file
   * @example "application/pdf"
   */
  mimeType: string

  /**
   * Storage object key for the file
   * @example "files/507f191e810c19729de860ea/document_accessible_1642247400000.pdf"
   */
  objectKey: string

  /**
   * Organization ID that the file belongs to
   * @example "507f191e810c19729de860eb"
   */
  organizationId: string

  /**
   * Number of pages (for PDF documents)
   * @example 10
   */
  pageCount?: number

  /**
   * Parent file ID (if derived from another file)
   * @example "507f1f77bcf86cd799439012"
   */
  parentFileId?: string

  /**
   * Processing timestamp (ISO 8601 format)
   * @format date-time
   * @example "2024-01-15T10:30:00.000Z"
   */
  processedAt: string

  /**
   * File status
   * @example "uploaded"
   */
  status: FileStatus

  /**
   * File last update timestamp (ISO 8601 format)
   * @format date-time
   * @example "2024-01-15T10:30:00.000Z"
   */
  updatedAt: string

  /**
   * File upload timestamp (ISO 8601 format)
   * @format date-time
   * @example "2024-01-15T10:15:00.000Z"
   */
  uploadDate: string

  /**
   * User ID that owns the file (optional for organization-only files)
   * @example "507f191e810c19729de860ea"
   */
  userId?: string
}

/**
 * Data transfer object for file response in paginated listings (without analysis result)
 * Used for GET /api/v0/files endpoint to optimize payload size
 * Note: userId is optional for organization-only files
 * @example {
 *   "id": "507f1f77bcf86cd799439011",
 *   "userId": "507f191e810c19729de860ea",
 *   "organizationId": "507f191e810c19729de860eb",
 *   "parentFileId": "507f1f77bcf86cd799439012",
 *   "fileType": "accessible",
 *   "filename": "document_accessible.pdf",
 *   "fileFormat": "pdf",
 *   "mimeType": "application/pdf",
 *   "fileSize": 1048576,
 *   "pageCount": 10,
 *   "charsCount": 5432,
 *   "objectKey": "files/507f191e810c19729de860ea/document_accessible_1642247400000.pdf",
 *   "uploadDate": "2024-01-15T10:15:00.000Z",
 *   "processedAt": "2024-01-15T10:30:00.000Z",
 *   "status": "uploaded",
 *   "isActive": true,
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "updatedAt": "2024-01-15T10:30:00.000Z"
 * }
 */
export type FileListResponseDto = Omit<FileResponseDto, 'analysisResult'>

/**
 * Data transfer object for processing a specific file response
 * @example {
 *   "processedFileId": "507f1f77bcf86cd799439012"
 * }
 */
export interface ProcessFileResponseDto {
  /**
   * ID of the newly created processed file
   * @example "507f1f77bcf86cd799439012"
   */
  processedFileId: string
}

// ConvertFileRequestDto has been removed

/**
 * Data transfer object for creating an original file from uploaded file
 * @example {
 *   "objectKey": "document_4f2a1b3c.pdf",
 *   "filename": "document.pdf"
 * }
 */
export interface CreateOriginalFileDto {
  /**
   * Original filename without the hash
   * @example "document.pdf"
   */
  filename: string

  /**
   * Storage object key for the uploaded file (with random hash)
   * @example "document_4f2a1b3c.pdf"
   */
  objectKey: string
}

/**
 * Data transfer object for requesting file analysis
 * @example {
 *   "forceReanalysis": false
 * }
 */
export interface AnalyzeFileRequestDto {
  /**
   * Whether to force re-analysis if results already exist
   * @example false
   */
  forceReanalysis?: boolean
}

/**
 * Data transfer object for requesting file accessibility processing
 * @example {}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProcessFileAccessibilityRequestDto {}
