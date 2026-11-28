//! What `rsvelte --help` and `rsvelte help <command>` print, but for `format` and `lint`, whose
//! help is oxfmt's and oxlint's. The README of `@rsvelte/cli` gives the details these leave out.

/// The overview: every command and option.
pub(super) const OVERVIEW: &str = "\
rsvelte lints, formats and type checks Svelte 5, TypeScript and JavaScript files.

Usage: rsvelte <command> [options]

Commands:
  lint [<oxlint arguments>...]   Lint files as oxlint does, Svelte files included
  format [<oxfmt arguments>...]  Format files as oxfmt does, Svelte files included
  typecheck                      Type check the project of a tsconfig.json
  lsp                            Serve an editor the lint, its fixes, the format and the type check
  version                        Print the versions of the tools rsvelte matches and is built on
  help [<command>]               Print this help, or the guide to one command

  <command> <command>... [<path>...] [--check]
                                 Run several of lint, format and typecheck over the paths.
                                 format runs first

Options:
  -h, --help                     Print this help, or with a command, its guide
  -V, --version                  Print the version

Options of typecheck, which reads rsvelte.config:
  --config <file>                The configuration file (default: rsvelte.config.* found upward)
  --config-runtime <program>     The program that evaluates a JavaScript or TypeScript one
                                 (default: node)
  --config-runtime-arg <arg>     An argument for that program; repeat for more
  --config-loader <program>      A program that prints the configuration as JSON instead
  --config-loader-arg <arg>      An argument for that program; repeat for more

Run `rsvelte help <command>` for what a command reads, prints and exits with.
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

pub(super) const LSP: &str = "\
Usage: rsvelte lsp [--stdio] [--no-typescript]

Serves an editor over the Language Server Protocol, on standard input and output. For the text
in the editor, it reports what rsvelte lint reports and offers its fixes, as oxlint's language
server does with the configuration oxlint reads, and it formats as rsvelte format formats the
file when run in the workspace folder. After each change, it reports the errors that rsvelte
typecheck run in the workspace folder finds in every file of the project, with the editor's
unsaved texts. In Svelte components it offers TypeScript's hover, completion, signature help,
definitions, references, highlights and renames, from the type checker rsvelte typecheck runs.
--stdio, which language clients add, is accepted.

Options:
  --no-typescript  Offers none of TypeScript's features, for an editor whose Svelte extension
                   offers them
";

pub(super) const HELP: &str = "\
Usage: rsvelte help [<command>]

Prints the overview of rsvelte, or the guide to one command: lint, format, typecheck, lsp or
version.
";

pub(super) const VERSION: &str = "\
Usage: rsvelte version [options]

Prints the version of rsvelte; for each command, the versions of the official tools whose
output its tests compare with; the oxfmt and oxc it is built on; and the type checker that
typecheck would run in this directory. -V prints only the version of rsvelte.
";
