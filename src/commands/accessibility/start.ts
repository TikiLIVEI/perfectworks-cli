import {Command, Flags} from '@oclif/core'
import {cli} from 'cli-ux'
import * as fs from 'node:fs'
import {basename, dirname, extname, join} from 'node:path'

import {FileService} from '../../services/file-service.js'
import {ConsoleLogger, ProcessingLogger} from '../../services/logger.js'
import {PerfectWorksAPI} from '../../services/perfectworks-api.js'

interface AccessibilityFlags {
  'api-key': string
  'base-url': string
  concurrency: number
  force: boolean
  input: string
  output: string
  verbose: boolean
}

export default class AccessibilityStart extends Command {
  static args = {}
  static description = 'Make files accessible by processing them through the PerfectWorks API'
  static examples = [
    'perfectworks-cli accessibility start --input ./documents --output ./accessible-docs --api-key your-api-key',
    'perfectworks-cli accessibility start --input document.pdf --output accessible-document.pdf --api-key your-api-key',
    'perfectworks-cli accessibility start -i ./files -o ./output -k your-api-key -m doc-lumen -c 5',
    'perfectworks-cli accessibility start -i ./docs -o ./accessible -k your-api-key --concurrency 2 --verbose',
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
    concurrency: Flags.integer({
      char: 'c',
      default: 3,
      description: 'Number of files to process in parallel (1-10)',
      max: 10,
      min: 1,
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

    // Setup logging
    const theme = this.config.theme as Record<string, string> | undefined
    const logger = new ConsoleLogger(flags.verbose, theme)
    const processingLogger = new ProcessingLogger(logger)

    // Get API key from flag
    const apiKey = flags['api-key']

    logger.info('Starting accessibility processing...')

    if (flags.verbose) {
      logger.debug(`Input: ${flags.input}`)
      logger.debug(`Output: ${flags.output}`)
      logger.debug(`API Key: ${apiKey?.slice(0, 8)}...`)
      logger.debug(`API Base URL: ${flags['base-url']}`)

      logger.debug(`Concurrency: ${flags.concurrency}`)
    }

    logger.debug('Analyzing files...')

    // Analyze files to show confirmation info
    const analysis = await FileService.filesStats(flags.input)

    logger.debug('Analysis completed successfully')

    // Show file analysis
    processingLogger.showAnalysis(analysis)

    if (analysis.pdfCount === 0 && analysis.htmlCount === 0) {
      logger.warning('No PDF or HTML files found for processing.')
      return
    }

    // Ask for confirmation
    const confirmed = await cli.confirm('\n❓ Do you want to proceed with accessibility processing?')
    if (!confirmed) {
      logger.info('Operation cancelled by user.')
      return
    }

    const startTime = Date.now()

    // Validate input path exists
    if (!fs.existsSync(flags.input)) {
      this.error(`Input path does not exist: ${flags.input}`)
    }

    // Get input stats to determine if it's a file or directory
    const inputStats = fs.statSync(flags.input)

    if (inputStats.isFile()) {
      const accessibilityFlags: AccessibilityFlags = {
        ...flags,
      }
      await this.processFile({
        apiKey,
        flags: accessibilityFlags,
        inputFile: flags.input,
        logger,
        outputFile: flags.output,
      })
      logger.success('File processed successfully!')
    } else if (inputStats.isDirectory()) {
      const accessibilityFlags: AccessibilityFlags = {
        ...flags,
      }
      await this.processDirectory({
        apiKey,
        flags: accessibilityFlags,
        inputDir: flags.input,
        logger,
        outputDir: flags.output,
        processingLogger,
        startTime,
      })
    } else {
      this.error(`Input path is neither a file nor a directory: ${flags.input}`)
    }
  }

  private async makeAccessible(params: {
    apiKey: string
    flags: AccessibilityFlags
    inputFile: string
    logger: ConsoleLogger
    outputFile: string
  }): Promise<void> {
    const {apiKey, flags, inputFile, logger, outputFile} = params

    logger.progress(`Processing ${basename(inputFile)} via PerfectWorks API`)

    try {
      // Initialize PerfectWorks API client
      const api = new PerfectWorksAPI(apiKey, flags['base-url'])

      // Process the file using the complete workflow
      const result = await api.processFileComplete(inputFile, outputFile, {
        logger,
        verbose: flags.verbose,
      })

      logger.debug(`Original file ID: ${result.originalFile.id}`)
      logger.debug(`Processed file ID: ${result.processedFile.id}`)
      logger.success(`Processed: ${basename(inputFile)} -> ${basename(outputFile)}`)
    } catch (error) {
      // Add filename to error context and display error
      const filename = basename(inputFile)
      const errorMessage = error instanceof Error ? error.message : String(error)

      throw new Error(`Failed to process ${filename}: ${errorMessage}`)
    }
  }

  private async processDirectory(params: {
    apiKey: string
    flags: AccessibilityFlags
    inputDir: string
    logger: ConsoleLogger
    outputDir: string
    processingLogger: ProcessingLogger
    startTime: number
  }): Promise<void> {
    const {apiKey, flags, inputDir, logger, outputDir, processingLogger, startTime} = params

    logger.debug(`Processing directory: ${inputDir}`)

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true})
      logger.debug(`Created output directory: ${outputDir}`)
    }

    // Read all files in the input directory
    const files = fs.readdirSync(inputDir, {withFileTypes: true})

    // Collect all supported files for processing
    const filesToProcess: Array<{inputPath: string; outputPath: string}> = []

    for (const file of files) {
      const inputPath = join(inputDir, file.name)
      const outputPath = join(outputDir, file.name)

      if (file.isFile()) {
        // Check if it's a supported file type (only HTML and PDF)
        const supportedExtensions = ['.pdf', '.html']
        const ext = extname(file.name).toLowerCase()

        if (supportedExtensions.includes(ext)) {
          filesToProcess.push({inputPath, outputPath})
        } else {
          logger.debug(`Skipping unsupported file type: ${file.name}`)
        }
      }
    }

    if (filesToProcess.length === 0) {
      logger.warning('No supported files found for processing.')
      return
    }

    // Process files in parallel with concurrency limit from flags
    await this.processFilesInParallel({
      apiKey,
      concurrency: flags.concurrency,
      filesToProcess,
      flags,
      logger,
      processingLogger,
      startTime,
    })
  }

  private async processFile(params: {
    apiKey: string
    flags: AccessibilityFlags
    inputFile: string
    logger: ConsoleLogger
    outputFile: string
  }): Promise<void> {
    const {apiKey, flags, inputFile, logger, outputFile} = params

    logger.debug(`Processing file: ${inputFile}`)

    // Check if output file exists and force flag is not set
    if (fs.existsSync(outputFile) && !flags.force) {
      this.error(`Output file already exists: ${outputFile}. Use --force to overwrite.`)
    }

    // Ensure output directory exists
    const outputDir = dirname(outputFile)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true})
      logger.debug(`Created output directory: ${outputDir}`)
    }

    await this.makeAccessible({
      apiKey,
      flags,
      inputFile,
      logger,
      outputFile,
    })
  }

  /**
   * Process files in parallel with a concurrency limit
   */
  private async processFilesInParallel(params: {
    apiKey: string
    concurrency: number
    filesToProcess: Array<{inputPath: string; outputPath: string}>
    flags: AccessibilityFlags
    logger: ConsoleLogger
    processingLogger: ProcessingLogger
    startTime: number
  }): Promise<void> {
    const {apiKey, concurrency, filesToProcess, flags, logger, processingLogger, startTime} = params

    logger.info(`Processing ${filesToProcess.length} files with concurrency limit of ${concurrency}`)

    const results: Array<{error?: string; file: string; success: boolean}> = []
    const totalBatches = Math.ceil(filesToProcess.length / concurrency)

    // Process files in batches with concurrency limit
    for (let i = 0; i < filesToProcess.length; i += concurrency) {
      const batch = filesToProcess.slice(i, i + concurrency)
      const batchNumber = Math.floor(i / concurrency) + 1

      processingLogger.startBatch(batchNumber, totalBatches, batch.length)

      // Process current batch in parallel
      const batchPromises = batch.map(async ({inputPath, outputPath}) => {
        try {
          await this.processFile({
            apiKey,
            flags,
            inputFile: inputPath,
            logger,
            outputFile: outputPath,
          })
          processingLogger.completeFile(basename(inputPath), true)
          return {file: basename(inputPath), success: true}
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          processingLogger.completeFile(basename(inputPath), false, errorMessage)
          return {error: errorMessage, file: basename(inputPath), success: false}
        }
      })

      // Wait for all files in the current batch to complete
      // eslint-disable-next-line no-await-in-loop
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Log batch completion
      const batchSuccesses = batchResults.filter((r) => r.success).length
      const batchFailures = batchResults.filter((r) => !r.success).length

      processingLogger.completeBatch(batchSuccesses, batchFailures)
    }

    // Final summary
    const totalSuccesses = results.filter((r) => r.success).length
    const totalFailures = results.filter((r) => !r.success).length

    processingLogger.showFinalSummary(filesToProcess.length, totalSuccesses, totalFailures, startTime)

    if (totalFailures > 0 && flags.verbose) {
      logger.info('Failed files:')
      for (const result of results.filter((r) => !r.success)) {
        logger.error(`  - ${result.file}: ${result.error}`)
      }
    }
  }
}
