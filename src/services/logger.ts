import {ux} from '@oclif/core'

export interface Logger {
  debug(message: string): void
  error(message: string): void
  info(message: string): void
  progress(message: string): void
  step(step: number, total: number, message: string): void
  stepWithFile(step: number, total: number, filename: string, action: string): void
  success(message: string): void
  summary(title: string, items: Array<{label: string; value: number | string}>): void
  warning(message: string): void
}

export class ConsoleLogger implements Logger {
  constructor(private verbose: boolean = false, private theme?: Record<string, string>) {}

  debug(message: string): void {
    if (this.verbose) {
      console.log(ux.colorize(this.theme?.info || 'dim', `🔍 ${message}`))
    }
  }

  error(message: string): void {
    console.log(ux.colorize(this.theme?.error || 'red', `❌ ${message}`))
  }

  info(message: string): void {
    console.log(ux.colorize(this.theme?.info || 'blue', `ℹ️  ${message}`))
  }

  progress(message: string): void {
    console.log(ux.colorize(this.theme?.progress || 'magenta', `⚙️  ${message}`))
  }

  step(step: number, total: number, message: string): void {
    const stepNumber = ux.colorize(this.theme?.step || 'cyan', `[${step}/${total}]`)
    console.log(`${stepNumber} ${message}`)
  }

  stepWithFile(step: number, total: number, filename: string, action: string): void {
    const stepNumber = ux.colorize(this.theme?.step || 'cyan', `[${step}/${total}]`)
    const file = ux.colorize(this.theme?.file || 'white', filename)
    console.log(`${stepNumber} ${action} ${file}`)
  }

  success(message: string): void {
    console.log(ux.colorize(this.theme?.success || 'green', `✅ ${message}`))
  }

  summary(title: string, items: Array<{label: string; value: number | string}>): void {
    console.log('')
    console.log(ux.colorize(this.theme?.sectionHeader || 'bold', `📊 ${title}:`))

    for (const item of items) {
      const label = ux.colorize(this.theme?.file || 'white', `  • ${item.label}:`)
      const value = ux.colorize(this.theme?.count || 'blue', String(item.value))
      console.log(`${label} ${value}`)
    }
  }

  warning(message: string): void {
    console.log(ux.colorize(this.theme?.warning || 'yellow', `⚠️  ${message}`))
  }
}

export class ProcessingLogger {
  private logger: Logger
  private startTime: number = 0

  constructor(logger: Logger) {
    this.logger = logger
  }

  completeBatch(successful: number, failed: number): void {
    const elapsed = Date.now() - this.startTime
    const duration = `${(elapsed / 1000).toFixed(1)}s`

    if (failed === 0) {
      this.logger.success(`Batch completed in ${duration}: ${successful} files processed`)
    } else {
      this.logger.warning(`Batch completed in ${duration}: ${successful} successful, ${failed} failed`)
    }
  }

  completeFile(filename: string, success: boolean, error?: string): void {
    if (success) {
      this.logger.debug(`✓ Completed ${filename}`)
    } else {
      this.logger.error(`✗ Failed ${filename}: ${error}`)
    }
  }

  showAnalysis(analysis: {htmlCharsCount: number; htmlCount: number; pdfCount: number; pdfPages: number}): void {
    this.logger.summary('File Analysis', [
      {label: 'PDF files', value: analysis.pdfCount},
      {label: 'HTML files', value: analysis.htmlCount},
      {label: 'PDF pages', value: analysis.pdfPages},
      {label: 'HTML characters', value: analysis.htmlCharsCount.toLocaleString()},
    ])
  }

  showFinalSummary(totalFiles: number, successful: number, failed: number, startTime: number): void {
    const totalDuration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`

    console.log('')
    this.logger.summary('Processing Complete', [
      {label: 'Total files', value: totalFiles},
      {label: 'Successful', value: successful},
      {label: 'Failed', value: failed},
      {label: 'Duration', value: totalDuration},
    ])

    if (failed === 0) {
      this.logger.success('All files processed successfully!')
    } else if (successful > 0) {
      this.logger.warning(`${successful} files processed, ${failed} failed`)
    } else {
      this.logger.error('All files failed to process')
    }
  }

  startBatch(batchNumber: number, totalBatches: number, filesInBatch: number): void {
    this.startTime = Date.now()
    this.logger.step(batchNumber, totalBatches, `Processing batch (${filesInBatch} files)`)
  }

  startFile(filename: string): void {
    this.logger.progress(`Processing ${filename}`)
  }
}
