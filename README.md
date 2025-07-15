perfectworks-cli
=================

PerfectWorks CLI


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/perfectworks-cli.svg)](https://npmjs.org/package/perfectworks-cli)
[![Downloads/week](https://img.shields.io/npm/dw/perfectworks-cli.svg)](https://npmjs.org/package/perfectworks-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g perfectworks-cli
$ perfectworks-cli COMMAND
running command...
$ perfectworks-cli (--version)
perfectworks-cli/0.0.7 darwin-arm64 node-v22.17.0
$ perfectworks-cli --help [COMMAND]
USAGE
  $ perfectworks-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`perfectworks-cli accessibility start`](#perfectworks-cli-accessibility-start)
* [`perfectworks-cli help [COMMAND]`](#perfectworks-cli-help-command)

## `perfectworks-cli accessibility start`

Make files accessible by processing them through the PerfectWorks API

```
USAGE
  $ perfectworks-cli accessibility start -k <value> -i <value> -o <value> [--base-url
    <value>] [-c <value>] [-f] [-m doc-veritas|doc-lumen|doc-aurum] [-v]

FLAGS
  -c, --concurrency=<value>  [default: 3] Number of files to process in parallel (1-10)
  -f, --force                Overwrite existing output files
  -i, --input=<value>        (required) Input file or directory path
  -k, --api-key=<value>      (required) PerfectWorks API key
  -m, --model=<option>       AI model for PDF processing (doc-veritas, doc-lumen, doc-aurum)
                             <options: doc-veritas|doc-lumen|doc-aurum>
  -o, --output=<value>       (required) Output file or directory path
  -v, --verbose              Enable verbose logging
      --base-url=<value>     [default: https://api.perfectworks.io/api/v0] API base URL (for development/testing)

DESCRIPTION
  Make files accessible by processing them through the PerfectWorks API

EXAMPLES
  $ perfectworks-cli accessibility start --input ./documents --output ./accessible-docs --api-key your-api-key

  $ perfectworks-cli accessibility start --input document.pdf --output accessible-document.pdf --api-key your-api-key --model doc-veritas

  $ perfectworks-cli accessibility start -i ./files -o ./output -k your-api-key -m doc-lumen -c 5

  $ perfectworks-cli accessibility start -i ./docs -o ./accessible -k your-api-key --concurrency 2 --verbose
```

_See code: [src/commands/accessibility/start.ts](https://github.com/TikiLIVEI/perfectworks-cli/blob/v0.0.7/src/commands/accessibility/start.ts)_

## `perfectworks-cli help [COMMAND]`

Display help for perfectworks-cli.

```
USAGE
  $ perfectworks-cli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for perfectworks-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.31/src/commands/help.ts)_
<!-- commandsstop -->
