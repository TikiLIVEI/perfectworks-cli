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
perfectworks-cli/0.0.0 darwin-arm64 node-v22.17.0
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
* [`perfectworks-cli plugins`](#perfectworks-cli-plugins)
* [`perfectworks-cli plugins add PLUGIN`](#perfectworks-cli-plugins-add-plugin)
* [`perfectworks-cli plugins:inspect PLUGIN...`](#perfectworks-cli-pluginsinspect-plugin)
* [`perfectworks-cli plugins install PLUGIN`](#perfectworks-cli-plugins-install-plugin)
* [`perfectworks-cli plugins link PATH`](#perfectworks-cli-plugins-link-path)
* [`perfectworks-cli plugins remove [PLUGIN]`](#perfectworks-cli-plugins-remove-plugin)
* [`perfectworks-cli plugins reset`](#perfectworks-cli-plugins-reset)
* [`perfectworks-cli plugins uninstall [PLUGIN]`](#perfectworks-cli-plugins-uninstall-plugin)
* [`perfectworks-cli plugins unlink [PLUGIN]`](#perfectworks-cli-plugins-unlink-plugin)
* [`perfectworks-cli plugins update`](#perfectworks-cli-plugins-update)

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

_See code: [src/commands/accessibility/start.ts](https://github.com/TikiLIVEI/perfectworks-cli/blob/v0.0.0/src/commands/accessibility/start.ts)_

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

## `perfectworks-cli plugins`

List installed plugins.

```
USAGE
  $ perfectworks-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ perfectworks-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.44/src/commands/plugins/index.ts)_

## `perfectworks-cli plugins add PLUGIN`

Installs a plugin into perfectworks-cli.

```
USAGE
  $ perfectworks-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into perfectworks-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the PERFECTWORKS_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the PERFECTWORKS_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ perfectworks-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ perfectworks-cli plugins add myplugin

  Install a plugin from a github url.

    $ perfectworks-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ perfectworks-cli plugins add someuser/someplugin
```

## `perfectworks-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ perfectworks-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ perfectworks-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.44/src/commands/plugins/inspect.ts)_

## `perfectworks-cli plugins install PLUGIN`

Installs a plugin into perfectworks-cli.

```
USAGE
  $ perfectworks-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into perfectworks-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the PERFECTWORKS_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the PERFECTWORKS_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ perfectworks-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ perfectworks-cli plugins install myplugin

  Install a plugin from a github url.

    $ perfectworks-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ perfectworks-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.44/src/commands/plugins/install.ts)_

## `perfectworks-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ perfectworks-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ perfectworks-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.44/src/commands/plugins/link.ts)_

## `perfectworks-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ perfectworks-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ perfectworks-cli plugins unlink
  $ perfectworks-cli plugins remove

EXAMPLES
  $ perfectworks-cli plugins remove myplugin
```

## `perfectworks-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ perfectworks-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.44/src/commands/plugins/reset.ts)_

## `perfectworks-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ perfectworks-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ perfectworks-cli plugins unlink
  $ perfectworks-cli plugins remove

EXAMPLES
  $ perfectworks-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.44/src/commands/plugins/uninstall.ts)_

## `perfectworks-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ perfectworks-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ perfectworks-cli plugins unlink
  $ perfectworks-cli plugins remove

EXAMPLES
  $ perfectworks-cli plugins unlink myplugin
```

## `perfectworks-cli plugins update`

Update installed plugins.

```
USAGE
  $ perfectworks-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.44/src/commands/plugins/update.ts)_
<!-- commandsstop -->
