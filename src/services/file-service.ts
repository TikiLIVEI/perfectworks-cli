import * as fs from 'node:fs'
import {extname, join} from 'node:path'

export interface FileInfo {
  extension: string
  path: string
  size: number
}

export interface FileAnalysis {
  htmlCharsCount: number
  htmlCount: number
  htmlFiles: FileInfo[]
  pdfCount: number
  pdfFiles: FileInfo[]
  pdfPages: number
}

export class FileService {
  /**
   * Analyzes files in a directory or single file
   */
  static async filesStats(inputPath: string): Promise<FileAnalysis> {
    const analysis: FileAnalysis = {
      htmlCharsCount: 0,
      htmlCount: 0,
      htmlFiles: [],
      pdfCount: 0,
      pdfFiles: [],
      pdfPages: 0,
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
      // Skip page count analysis for now to avoid pdf-parse issues
      // analysis.pdfPages += 1  // Could add a simple fallback later if needed
    } else if (ext === '.html') {
      analysis.htmlFiles.push(fileInfo)
      analysis.htmlCount++

      try {
        const content = fs.readFileSync(filePath, 'utf8')
        analysis.htmlCharsCount += content.length
      } catch {
        // If we can't read the file, skip character count
        console.warn(`Could not read HTML file: ${filePath}`)
      }
    }
  }
}
