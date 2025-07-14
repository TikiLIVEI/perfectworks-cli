# Copilot Instructions for PerfectWorks CLI

## Project Overview
This is an OCLIF-based TypeScript CLI tool that processes PDF and HTML files to make them accessible via the PerfectWorks API. The project uses ESM modules and follows OCLIF v4 conventions.

## Architecture & Key Components

### Core Structure
- **Commands**: Follow OCLIF pattern in `src/commands/` with topic-based directories (e.g., `accessibility/`)
- **Services**: Business logic in `src/services/` - currently `FileService` handles file analysis and processing
- **Entry Points**: 
  - `bin/run.js` - Production entry using `@oclif/core`
  - `bin/dev.js` - Development entry with ts-node loader for TypeScript execution

### File Processing Flow
1. **Analysis Phase**: `FileService.filesStats()` scans input paths and counts PDF pages + HTML character counts
2. **Confirmation**: CLI shows analysis results and prompts user to proceed
3. **Processing**: Iterates through supported files (`.pdf`, `.html`) and processes them via mock API calls
4. **Output**: Creates accessible versions in specified output directory

## Development Conventions

### Command Structure
Commands extend `Command` from `@oclif/core` and follow this pattern:
```typescript
export default class CommandName extends Command {
  static description = 'Clear description'
  static examples = [/* OCLIF template examples */]
  static flags = {/* Use Flags.string(), Flags.boolean() etc */}
  
  async run(): Promise<void> {
    const {flags} = await this.parse(CommandName)
    // Implementation
  }
}
```

### Flag Patterns
- Use `char` for short aliases (`char: 'i'` for `--input`)
- Mark required flags with `required: true`
- Use descriptive flag names with hyphens (`api-key`, not `apiKey`)
- Boolean flags default to `false` unless specified

### File Operations
- Always check `fs.existsSync()` before processing
- Use `fs.statSync()` to distinguish files vs directories
- Support both single files and directory processing
- Handle force overwrite logic consistently

### Error Handling
- Use `this.error()` for fatal errors (exits process)
- Use `this.log()` for user feedback
- Validate inputs early and provide clear error messages
- Include file paths in error messages for debugging

## Development Workflow

### Build & Run
```bash
npm run build        # Compile TypeScript to dist/
./bin/dev.js         # Run in development with ts-node
./bin/run.js         # Run compiled version
```

### Testing
- Tests configured for `test/**/*.test.ts` pattern (no tests currently exist)
- Uses Mocha with ts-node/esm loader
- Timeout set to 60 seconds for API operations

### Code Quality
- ESLint with OCLIF config
- Prettier for formatting
- TypeScript strict mode enabled
- ESM modules throughout (note `.js` extensions in imports)

## File Service Patterns

### Analysis Operations
The `FileService.filesStats()` method:
- Returns `FileAnalysis` with counts and file lists
- Uses `pdf-parse` to get actual PDF page counts
- Counts HTML character lengths for processing estimates
- Processes directories recursively but only analyzes files (not subdirectories)

### Supported File Types
- **PDF**: Uses `pdf-parse` for metadata extraction
- **HTML**: Character counting for processing estimates
- **Ignored**: All other file types are skipped with optional verbose logging

## API Integration Notes
Current implementation uses mock processing (copying files with metadata injection). The `makeAccessible()` method in commands should be replaced with actual PerfectWorks API calls when implementing real functionality.

### Mock Behavior
- HTML files: Prepends accessibility comment
- PDF files: Copies unchanged (awaiting real API integration)
- Simulates 500ms processing delay per file

## ESM & Import Considerations
- All imports use `.js` extensions (TypeScript ESM requirement)
- `package.json` has `"type": "module"`
- Uses Node16 module resolution
- Development setup uses ts-node/esm loader

## OCLIF Integration
- Manifest generation on `prepack`
- README auto-generation with command documentation
- Plugin system available but not currently used
- Topic-based command organization (accessibility, hello topics defined)

## Common Patterns to Follow
1. Validate all file paths before processing
2. Show analysis/preview before destructive operations
3. Support `--verbose` flag for detailed logging
4. Use `cli.confirm()` for user confirmations
5. Handle both single files and directory batch processing
6. Respect `--force` flag for overwrite behavior
