//! What `rsvelte --help` and `rsvelte help <command>` print, but for `format`, whose help is
//! oxfmt's. The README of `@rsvelte/cli` gives the details these leave out.

/// The overview: every command and option.
pub(super) const OVERVIEW: &str = "\
rsvelte lints, formats and type checks Svelte 5, TypeScript and JavaScript files.

Usage: rsvelte <command> [options]

Commands:
  lint [<path>...]               Lint the files below the paths (default: .)
  format [<oxfmt arguments>...]  Format files as oxfmt does, Svelte files included
  typecheck                      Type check the project of a tsconfig.json
  help [<command>]               Print this help, or the guide to one command

Options:
  -h, --help                     Print this help, or with a command, its guide
  -V, --version                  Print the version

Options of lint and typecheck, which read rsvelte.config:
  --config <file>                The configuration file (default: rsvelte.config.* found upward)
  --config-runtime <program>     The program that evaluates a JavaScript or TypeScript one
                                 (default: node)
  --config-runtime-arg <arg>     An argument for that program; repeat for more
  --config-loader <program>      A program that prints the configuration as JSON instead
  --config-loader-arg <arg>      An argument for that program; repeat for more

Run `rsvelte help <command>` for what a command reads, prints and exits with.
";

pub(super) const LINT: &str = "\
Usage: rsvelte lint [<path>...] [options]

Lints the .svelte, .js, .mjs, .cjs, .ts, .mts and .cts files below each path, by default the
current directory, and prints the problems as ESLint's stylish formatter does. It skips
node_modules and what .gitignore skips, but reads a file named on the command line.

The rules of Svelte files are set under svelte.lint, and those of the other files under
typescript.lint, in rsvelte.config.json. A rules object replaces the default rules, which for
Svelte files are no-unused-vars and svelte/button-has-type:

  { \"plugins\": { \"svelte.lint\": { \"rules\": {
      \"no-unused-vars\": \"warn\", \"svelte/button-has-type\": \"error\" } } } }

Exits with 1 when an error is left, and with 2 when it cannot run.

Examples:
  rsvelte lint
  rsvelte lint src tests
";

pub(super) const TYPECHECK: &str = "\
Usage: rsvelte typecheck [options]

Type checks a project and prints the errors that svelte-check reports, one per line, as
tsc --pretty false prints them. It takes no paths: the project's tsconfig.json selects the
files. That is the tsconfig.json in the current directory, or, when rsvelte.config gives
typescript.check options, the one next to rsvelte.config.

It runs a TypeScript 7 type checker from the project's node_modules. Install one:

  npm install --save-dev tsrs                          (recommended)
  npm install --save-dev typescript                    (7.1 or newer)
  npm install --save-dev @typescript/native-preview    (7.1 or newer)

To check another tsconfig, name it, relative to rsvelte.config, in rsvelte.config.json:

  { \"plugins\": { \"typescript.check\": { \"tsconfig\": \"tsconfig.app.json\" } } }

Exits with 1 when it finds an error, and with 2 when it cannot run.
";

pub(super) const HELP: &str = "\
Usage: rsvelte help [<command>]

Prints the overview of rsvelte, or the guide to one command: lint, format or typecheck.
";
