//! `rsvelte`, the command people install: `lint`, `format` and `typecheck` over the Svelte and
//! TypeScript files of a project.

use std::process::ExitCode;

use rsvelte_plugin_interface::{Extension, Selection};

use crate::commands::{format, lint, typecheck};
use crate::{Installation, configuration, configured_registry, usage};

/// The plugins `rsvelte` installs, in installation order.
static EXTENSIONS: &[&Extension] = &[
    &rsvelte_typescript_format::EXTENSION,
    &rsvelte_typescript_lint::EXTENSION,
    &rsvelte_typescript_check::EXTENSION,
    &rsvelte_svelte_format::EXTENSION,
    &rsvelte_svelte_lint::EXTENSION,
    &rsvelte_svelte_typescript_projection::EXTENSION,
    &rsvelte_svelte_check::EXTENSION,
];

const LINT: &[&str] = &["svelte.lint/default", "ts.lint/default"];
const FORMAT: &[&str] = &["svelte.format/default", "ts.format/default"];
const TYPECHECK: &[&str] = &["ts.check/default"];

/// The plugins `typecheck` runs with their defaults when nothing configures them, so that a
/// project needs no configuration.
const TYPECHECK_DEFAULTS: &[&str] = &["typescript.check", "svelte.check"];

const HELP: &str = "\
Usage: rsvelte <command> [options]

Commands:
  lint [<path>...]               Lint the Svelte and TypeScript files below the paths (default: .)
  format [<path>...] [--check]   Format them; with --check, list the files that would change
  typecheck                      Type check the project of tsconfig.json in this directory

Options:
  --config <file>                The configuration file (default: rsvelte.config.* found upward)
  -h, --help                     Print this help
  -V, --version                  Print the version
";

/// `rsvelte`.
#[must_use]
pub fn release() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let mut config = configuration::Options::default();
    let mut positional = Vec::new();
    let mut check = false;
    let mut it = arguments.iter();
    while let Some(argument) = it.next() {
        match argument.as_str() {
            "-h" | "--help" => {
                print!("{HELP}");
                return ExitCode::SUCCESS;
            }
            "-V" | "--version" => {
                println!("rsvelte {}", env!("CARGO_PKG_VERSION"));
                return ExitCode::SUCCESS;
            }
            "--check" => check = true,
            name if configuration::Options::accepts(name) => {
                let Some(value) = it.next() else {
                    return usage(&format!("{name} needs a value"));
                };
                config.argument(name, value);
            }
            name if name.starts_with('-') => {
                return usage(&format!("unknown option {name}; see `rsvelte --help`"));
            }
            path => positional.push(path),
        }
    }
    let Some((&command, paths)) = positional.split_first() else {
        eprint!("{HELP}");
        return ExitCode::from(2);
    };
    let (tasks, defaults) = match command {
        "lint" => (LINT, &[][..]),
        "format" => (FORMAT, &[][..]),
        "typecheck" => (TYPECHECK, TYPECHECK_DEFAULTS),
        other => return usage(&format!("unknown command `{other}`; see `rsvelte --help`")),
    };
    if check && command != "format" {
        return usage("--check applies to `format` only");
    }
    if command == "typecheck" && !paths.is_empty() {
        return usage("typecheck takes no paths: it checks the files its tsconfig.json selects");
    }
    let installation = Installation {
        extensions: EXTENSIONS,
        selection: Selection::Named(tasks.iter().map(|&task| task.to_owned()).collect()),
        defaults,
    };
    let (reg, _) = match configured_registry(&config, &[], installation) {
        Ok(configured) => configured,
        Err(error) => return usage(&error),
    };
    let paths = if paths.is_empty() { &["."][..] } else { paths };
    match command {
        "lint" => lint::lint(&reg, paths, tasks),
        "format" => format::format(&reg, paths, tasks, check),
        _ => typecheck::typecheck(&reg, tasks),
    }
}

#[cfg(test)]
mod tests;
