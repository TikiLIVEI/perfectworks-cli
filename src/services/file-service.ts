import * as fs from 'node:fs'
import {extname, join} from 'node:path'

export interface FileInfo {
  extension: string
  path: string
  size: number
}

export interface FileAnalysis {
  htmlCount: number
  htmlFiles: FileInfo[]
  pdfCount: number
  pdfFiles: FileInfo[]
}

export class FileService {
  /**
   * Analyzes files in a directory or single file
   */
  static async filesStats(inputPath: string): Promise<FileAnalysis> {
    const analysis: FileAnalysis = {
      htmlCount: 0,
      htmlFiles: [],
      pdfCount: 0,
      pdfFiles: [],
    }

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input path does not exist: ${inputPath}`)
    }

    const stats = fs.statSync(inputPath)

    if (stats.isFile()) {
      await this.fileStats(inputPath, analysis)
    } else if (stats.isDirectory()) {
      await this.analyzeDirectory(inputPath, analysis)
    }

    return analysis
  }

  private static async analyzeDirectory(dirPath: string, analysis: FileAnalysis): Promise<void> {
    const files = fs.readdirSync(dirPath, {withFileTypes: true})

    const promises = files.map(async (file) => {
      const filePath = join(dirPath, file.name)

      // Only analyze files, skip directories
      if (file.isFile()) {
        await this.fileStats(filePath, analysis)
      }
    })

    await Promise.all(promises)
  }

  private static async fileStats(filePath: string, analysis: FileAnalysis): Promise<void> {
    const ext = extname(filePath).toLowerCase()
    const stats = fs.statSync(filePath)

    const fileInfo: FileInfo = {
      extension: ext,
      path: filePath,
      size: stats.size,
    }

    if (ext === '.pdf') {
      analysis.pdfFiles.push(fileInfo)
      analysis.pdfCount++
    } else if (ext === '.html') {
      analysis.htmlFiles.push(fileInfo)
      analysis.htmlCount++
    }
  }
}
