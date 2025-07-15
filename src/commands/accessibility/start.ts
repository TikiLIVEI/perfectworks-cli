import {Command, Flags} from '@oclif/core'
import {cli} from 'cli-ux'
import * as fs from 'node:fs'
import {basename, dirname, extname, join} from 'node:path'

import {FileService} from '../../services/file-service.js'
import {PerfectWorksAPI} from '../../services/perfectworks-api.js'
import {AIModel} from '../../types/files.js'

interface AccessibilityFlags {
  'api-key': string
  'base-url': string
  force: boolean
  input: string
  model?: AIModel
  output: string
  verbose: boolean
}

export default class AccessibilityStart extends Command {
  static args = {}
  static description = 'Make files accessible by processing them through the PerfectWorks API'
  static examples = [
    `<%= config.bin %> <%= command.id %> --input ./documents --output ./accessible-docs --api-key your-api-key`,
    `<%= config.bin %> <%= command.id %> --input document.pdf --output accessible-document.pdf --api-key your-api-key --model doc-veritas`,
    `<%= config.bin %> <%= command.id %> -i ./files -o ./output -k your-api-key -m doc-lumen`,
  ]
  static flags = {
    'api-key': Flags.string({
      char: 'k',
      description: 'PerfectWorks API key',
      required: true,
    }),
    'base-url': Flags.string({
      default: 'https://api.perfectworks.io/api/v0',
      description: 'API base URL (for development/testing)',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing output files',
    }),
    input: Flags.string({
      char: 'i',
      description: 'Input file or directory path',
      required: true,
    }),
    model: Flags.string({
      char: 'm',
      description: 'AI model for PDF processing (doc-veritas, doc-lumen, doc-aurum)',
      options: ['doc-veritas', 'doc-lumen', 'doc-aurum'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file or directory path',
      required: true,
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Enable verbose logging',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(AccessibilityStart)

    // Get API key from flag
    const apiKey = flags['api-key']

    if (flags.verbose) {
      this.log('Starting accessibility processing...')
      this.log(`Input: ${flags.input}`)
      this.log(`Output: ${flags.output}`)
      this.log(`API Key: ${apiKey?.slice(0, 8)}...`)
      this.log(`API Base URL: ${flags['base-url']}`)
      if (flags.model) {
        this.log(`AI Model: ${flags.model}`)
      }
    }

    if (flags.verbose) {
      this.log('Analyzing files...')
    }

    // Analyze files to show confirmation info
    const analysis = await FileService.filesStats(flags.input)

    if (flags.verbose) {
      this.log('Analysis completed successfully')
    }

    // Show file analysis
    this.log('\n📊 Found files info:')
    this.log(`- PDF files count: ${analysis.pdfCount}`)
    this.log(`- HTML files count: ${analysis.htmlCount}`)
    this.log(`- PDF pages: ${analysis.pdfPages}`)
    this.log(`- HTML chars count: ${analysis.htmlCharsCount}`)

    if (analysis.pdfCount === 0 && analysis.htmlCount === 0) {
      this.log('\n⚠️  No PDF or HTML files found for processing.')
      return
    }

    // Ask for confirmation
    const confirmed = await cli.confirm('\nDo you want to proceed with accessibility processing?')
    if (!confirmed) {
      this.log('Operation cancelled by user.')
      return
    }

    // Validate input path exists
    if (!fs.existsSync(flags.input)) {
      this.error(`Input path does not exist: ${flags.input}`)
    }

    // Get input stats to determine if it's a file or directory
    const inputStats = fs.statSync(flags.input)

    if (inputStats.isFile()) {
      await this.processFile(flags.input, flags.output, apiKey, {
        ...flags,
        model: flags.model as AIModel | undefined,
      })
    } else if (inputStats.isDirectory()) {
      await this.processDirectory(flags.input, flags.output, apiKey, {
        ...flags,
        model: flags.model as AIModel | undefined,
      })
    } else {
      this.error(`Input path is neither a file nor a directory: ${flags.input}`)
    }

    this.log('✅ Accessibility processing completed successfully!')
  }

  private async makeAccessible(
    inputFile: string,
    outputFile: string,
    apiKey: string,
    flags: AccessibilityFlags,
  ): Promise<void> {
    if (flags.verbose) {
      this.log(`🚀 Processing ${basename(inputFile)} via PerfectWorks API`)
    }

    try {
      // Initialize PerfectWorks API client
      const api = new PerfectWorksAPI(apiKey, flags['base-url'])

      // Process the file using the complete workflow
      const result = await api.processFileComplete(inputFile, outputFile, {
        aiModel: flags.model,
        verbose: flags.verbose,
      })

      if (flags.verbose) {
        this.log(`✓ Original file ID: ${result.originalFile.id}`)
        this.log(`✓ Processed file ID: ${result.processedFile.id}`)
        this.log(`✓ Processed: ${basename(inputFile)} -> ${basename(outputFile)}`)
      } else {
        this.log(`✓ ${basename(inputFile)}`)
      }
    } catch (error) {
      // Add filename to error context and display error
      const filename = basename(inputFile)
      const errorMessage = error instanceof Error ? error.message : String(error)

      this.log(`❌ Failed to process ${filename}: ${errorMessage}`)
      this.exit(1)
    }
  }

  private async processDirectory(
    inputDir: string,
    outputDir: string,
    apiKey: string,
    flags: AccessibilityFlags,
  ): Promise<void> {
    if (flags.verbose) {
      this.log(`Processing directory: ${inputDir}`)
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true})
      if (flags.verbose) {
        this.log(`Created output directory: ${outputDir}`)
      }
    }

    // Read all files in the input directory
    const files = fs.readdirSync(inputDir, {withFileTypes: true})

    // Process files sequentially to better handle errors
    for (const file of files) {
      const inputPath = join(inputDir, file.name)
      const outputPath = join(outputDir, file.name)

      if (file.isFile()) {
        // Check if it's a supported file type (only HTML and PDF)
        const supportedExtensions = ['.pdf', '.html']
        const ext = extname(file.name).toLowerCase()

        if (supportedExtensions.includes(ext)) {
          // eslint-disable-next-line no-await-in-loop
          await this.processFile(inputPath, outputPath, apiKey, {
            ...flags,
            model: flags.model as AIModel | undefined,
          })
        } else if (flags.verbose) {
          this.log(`Skipping unsupported file type: ${file.name}`)
        }
      }
    }
  }

  private async processFile(
    inputFile: string,
    outputFile: string,
    apiKey: string,
    flags: AccessibilityFlags,
  ): Promise<void> {
    if (flags.verbose) {
      this.log(`Processing file: ${inputFile}`)
    }

    // Check if output file exists and force flag is not set
    if (fs.existsSync(outputFile) && !flags.force) {
      this.error(`Output file already exists: ${outputFile}. Use --force to overwrite.`)
    }

    // Ensure output directory exists
    const outputDir = dirname(outputFile)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true})
      if (flags.verbose) {
        this.log(`Created output directory: ${outputDir}`)
      }
    }

    await this.makeAccessible(inputFile, outputFile, apiKey, flags)
  }
}
