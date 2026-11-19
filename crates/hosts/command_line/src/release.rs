//! `rsvelte`, the command people install: `lint`, `format` and `typecheck` over the Svelte and
//! TypeScript files of a project.

use std::process::ExitCode;

use rsvelte_plugin_interface::{Extension, Selection};

use crate::commands::{files, format, lint, typecheck};
use crate::formatting::{self, Formatting};
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
    let tasks = match command {
        "lint" => LINT,
        "format" => FORMAT,
        "typecheck" => TYPECHECK,
        other => return usage(&format!("unknown command `{other}`; see `rsvelte --help`")),
    };
    if check && command != "format" {
        return usage("--check applies to `format` only");
    }
    if command == "typecheck" && !paths.is_empty() {
        return usage("typecheck takes no paths: it checks the files its tsconfig.json selects");
    }
    let paths = if paths.is_empty() { &["."][..] } else { paths };
    if command == "format" {
        return format_project(&config, paths, check);
    }
    let defaults = if command == "typecheck" {
        (TYPECHECK_DEFAULTS.iter())
            .map(|&plugin| (plugin, "{}".to_owned()))
            .collect()
    } else {
        Vec::new()
    };
    let installation = Installation {
        extensions: EXTENSIONS,
        selection: Selection::Named(tasks.iter().map(|&task| task.to_owned()).collect()),
        defaults,
    };
    let (reg, _) = match configured_registry(&config, &[], installation) {
        Ok(configured) => configured,
        Err(error) => return usage(&error),
    };
    if command == "lint" {
        lint::lint(&reg, paths, tasks)
    } else {
        typecheck::typecheck(&reg, tasks)
    }
}

/// `rsvelte format`, with the options of the project's formatter configuration when it has one.
fn format_project(config: &configuration::Options, paths: &[&str], check: bool) -> ExitCode {
    let formatting = match std::env::current_dir()
        .map_err(|e| format!("current directory: {e}"))
        .and_then(|here| formatting::find(&here))
    {
        Ok(formatting) => formatting,
        Err(error) => return usage(&error),
    };
    // The TypeScript files are still formatted when the Svelte formatter cannot honor the options.
    let svelte_refused = formatting.as_ref().and_then(|f| {
        let options = serde_json::from_str(&f.svelte).ok()?;
        rsvelte_svelte_format::unported(&options).map(|name| (name, f.source.clone()))
    });
    let tasks = if svelte_refused.is_some() {
        &FORMAT[1..]
    } else {
        FORMAT
    };
    let defaults = formatting.as_ref().map_or_else(Vec::new, |f| {
        vec![
            ("svelte.format", f.svelte.clone()),
            ("typescript.format", f.typescript.clone()),
        ]
    });
    let installation = Installation {
        extensions: EXTENSIONS,
        selection: Selection::Named(tasks.iter().map(|&task| task.to_owned()).collect()),
        defaults,
    };
    let (reg, _) = match configured_registry(config, &[], installation) {
        Ok(configured) => configured,
        Err(error) => {
            return usage(&match &formatting {
                Some(f) => format!("{error} (from {})", f.source.display()),
                None => error,
            });
        }
    };
    let patterns = match formatting.as_ref().map(ignore_patterns).transpose() {
        Ok(patterns) => patterns,
        Err(error) => return usage(&error),
    };
    let skip = files::Skip {
        patterns: patterns.as_ref(),
        ..format::SKIP
    };
    let code = format::format(&reg, paths, tasks, check, skip);
    match svelte_refused {
        Some((name, source)) => refused_svelte(paths, skip, name, &source).unwrap_or(code),
        None => code,
    }
}

/// Says that the Svelte files below `paths` were left as they are, and fails, if there are any.
fn refused_svelte(
    paths: &[&str],
    skip: files::Skip<'_>,
    name: &str,
    source: &std::path::Path,
) -> Option<ExitCode> {
    let svelte = |path: &std::path::Path| path.extension().is_some_and(|e| e == "svelte");
    let count = match files::find(paths, skip, &svelte) {
        Ok(found) => found.len(),
        Err(error) => return Some(usage(&error)),
    };
    (count > 0).then(|| {
        eprintln!(
            "rsvelte: {count} Svelte files were not formatted: the Svelte formatter does not print \
             this `{name}` value of {} yet",
            source.display()
        );
        ExitCode::from(2)
    })
}

/// The configuration's `ignorePatterns`, rooted at its directory.
fn ignore_patterns(formatting: &Formatting) -> Result<ignore::gitignore::Gitignore, String> {
    let root = formatting
        .source
        .parent()
        .unwrap_or_else(|| std::path::Path::new("."));
    let mut builder = ignore::gitignore::GitignoreBuilder::new(root);
    for pattern in &formatting.ignore_patterns {
        builder
            .add_line(None, pattern)
            .map_err(|e| format!("{}: {e}", formatting.source.display()))?;
    }
    builder
        .build()
        .map_err(|e| format!("{}: {e}", formatting.source.display()))
}

#[cfg(test)]
mod tests;
