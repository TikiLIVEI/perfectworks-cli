import {Command, Flags} from '@oclif/core'
import {cli} from 'cli-ux'
import * as fs from 'node:fs'
import {basename, dirname, extname, join} from 'node:path'

import {FileService} from '../../services/file-service.js'

interface AccessibilityFlags {
  'api-key': string
  force: boolean
  input: string
  output: string
  verbose: boolean
}

export default class AccessibilityStart extends Command {
  static args = {}
  static description = 'Make files accessible by processing them through the PerfectWorks API'
  static examples = [
    `<%= config.bin %> <%= command.id %> --input ./documents --output ./accessible-docs --api-key your-api-key`,
    `<%= config.bin %> <%= command.id %> --input document.pdf --output accessible-document.pdf --api-key your-api-key`,
    `<%= config.bin %> <%= command.id %> -i ./files -o ./output -k your-api-key`,
  ]
  static flags = {
    'api-key': Flags.string({
      char: 'k',
      description: 'PerfectWorks API key',
      required: true,
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

    // Get API key from flag
    const apiKey = flags['api-key']

    if (flags.verbose) {
      this.log('Starting accessibility processing...')
      this.log(`Input: ${flags.input}`)
      this.log(`Output: ${flags.output}`)
      this.log(`API Key: ${apiKey?.slice(0, 8)}...`)
    }

    try {
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
        await this.processFile(flags.input, flags.output, apiKey, flags)
      } else if (inputStats.isDirectory()) {
        await this.processDirectory(flags.input, flags.output, apiKey, flags)
      } else {
        this.error(`Input path is neither a file nor a directory: ${flags.input}`)
      }

      this.log('✅ Accessibility processing completed successfully!')
    } catch (error) {
      this.error(`Failed to process files: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async makeAccessible(
    inputFile: string,
    outputFile: string,
    apiKey: string,
    flags: AccessibilityFlags,
  ): Promise<void> {
    // Simulate API processing time
    if (flags.verbose) {
      this.log(`Making API call for: ${basename(inputFile)}`)
    }

    // Simulate processing delay
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500)
    })

    // For now, just copy the file to demonstrate the flow
    // In a real implementation, this would be replaced with actual API calls
    try {
      const inputContent = fs.readFileSync(inputFile)

      // Simulate processing by adding a comment/metadata
      const fileExtension = extname(inputFile).toLowerCase()
      let processedContent: Buffer

      if (fileExtension === '.html') {
        // For HTML files, add accessibility metadata as comment
        const textContent = inputContent.toString('utf8')
        const accessibleContent = `<!-- ACCESSIBLE VERSION - Processed by PerfectWorks API -->\n${textContent}`
        processedContent = Buffer.from(accessibleContent, 'utf8')
      } else {
        // For PDF and other binary files, just copy for now
        processedContent = inputContent
      }

      fs.writeFileSync(outputFile, processedContent)

      if (flags.verbose) {
        this.log(`✓ Processed: ${basename(inputFile)} -> ${basename(outputFile)}`)
      } else {
        this.log(`✓ ${basename(inputFile)}`)
      }
    } catch (error) {
      this.error(`Failed to process ${inputFile}: ${error instanceof Error ? error.message : String(error)}`)
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

    // Process only files in the directory
    const filePromises = files.map(async (file) => {
      const inputPath = join(inputDir, file.name)
      const outputPath = join(outputDir, file.name)

      if (file.isFile()) {
        // Check if it's a supported file type (only HTML and PDF)
        const supportedExtensions = ['.pdf', '.html']
        const ext = extname(file.name).toLowerCase()

        if (supportedExtensions.includes(ext)) {
          await this.processFile(inputPath, outputPath, apiKey, flags)
        } else if (flags.verbose) {
          this.log(`Skipping unsupported file type: ${file.name}`)
        }
      }
    })

    await Promise.all(filePromises)
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

    // Simulate API call (replace with actual API call later)
    await this.makeAccessible(inputFile, outputFile, apiKey, flags)
  }
}
