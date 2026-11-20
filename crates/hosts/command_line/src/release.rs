//! `rsvelte`, the command people install: `lint`, `format` and `typecheck` over the Svelte and
//! TypeScript files of a project.

use std::collections::BTreeMap;
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;

use rsvelte_plugin_interface::{Extension, Selection};

use crate::commands::{files, format, lint, typecheck};
use crate::formatting::{Refusal, Resolution, Resolved, Resolver};
use crate::{Installation, configuration, configured_registry, install, usage};

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

/// `rsvelte format`, with each file's options resolved from the project's formatter
/// configuration, for the plugins `rsvelte.config` does not configure.
fn format_project(config: &configuration::Options, paths: &[&str], check: bool) -> ExitCode {
    match format_resolved(config, paths, check) {
        Ok(code) => code,
        Err(error) => usage(&error),
    }
}

/// A plugin's options, as JSON, out of a file's resolved options.
type OptionsOf = fn(&Resolved) -> String;

/// The plugins `format` gives the resolved options, with the options each takes.
const FORMAT_PLUGINS: &[(&str, OptionsOf)] = &[
    ("svelte.format", Resolved::svelte),
    ("typescript.format", Resolved::typescript),
];

fn format_resolved(
    config: &configuration::Options,
    paths: &[&str],
    check: bool,
) -> Result<ExitCode, String> {
    let loaded = config.load().map_err(|error| error.to_string())?;
    let named = |plugin: &str| {
        (loaded.as_ref()).is_some_and(|(_, l)| l.configuration.plugins.contains_key(plugin))
    };
    let resolved_plugins: Vec<(&str, OptionsOf)> = (FORMAT_PLUGINS.iter())
        .filter(|(plugin, _)| !named(plugin))
        .copied()
        .collect();
    let installation = |tasks: &[&str], options: &Resolved| Installation {
        extensions: EXTENSIONS,
        selection: Selection::Named(tasks.iter().map(|&task| (*task).to_owned()).collect()),
        defaults: (resolved_plugins.iter())
            .map(|&(plugin, options_of)| (plugin, options_of(options)))
            .collect(),
    };
    let (selector, _) = install(
        loaded.as_ref(),
        &[],
        installation(FORMAT, &Resolved::default()),
    )?;
    let here = std::env::current_dir().map_err(|e| format!("current directory: {e}"))?;
    let resolver = Arc::new(Resolver::new(here, !resolved_plugins.is_empty()));
    let prune: Arc<dyn files::Prune> = Arc::<Resolver>::clone(&resolver);
    let walk = files::Walk {
        ignore_files: format::IGNORE_FILES,
        prune: Some(prune),
    };
    let found = files::find(paths, &walk, &|path| {
        files::applies(&selector, FORMAT, path)
    })?;
    let mut groups: BTreeMap<Resolved, Vec<PathBuf>> = BTreeMap::new();
    for file in found {
        if let Resolution::Formatted(options) = resolver.resolve(&file) {
            groups.entry(options).or_default().push(file);
        }
    }
    for warning in resolver.warnings() {
        eprintln!("rsvelte: {warning}");
    }
    // Every group is installed, and so refused, before any file is formatted.
    let mut installed = Vec::new();
    let mut left = Vec::new();
    for (options, files) in groups {
        let refused = refusal(&options, &resolved_plugins)?;
        let tasks = if refused.is_some() {
            &FORMAT[1..]
        } else {
            FORMAT
        };
        let (reg, _) = install(loaded.as_ref(), &[], installation(tasks, &options))
            .map_err(|error| format!("{error} (from {})", sources(&options)))?;
        let (formatted, svelte): (Vec<PathBuf>, Vec<PathBuf>) = files
            .into_iter()
            .partition(|file| files::applies(&reg, tasks, file));
        if let Some(refused) = refused
            && !svelte.is_empty()
        {
            left.push((svelte.len(), refused));
        }
        installed.push((reg, tasks, formatted));
    }
    let mut batches = Vec::new();
    for (reg, tasks, formatted) in &installed {
        let documents = (formatted.iter())
            .map(|file| files::read(reg, file.clone()))
            .collect::<Result<_, _>>()?;
        batches.push(format::Batch {
            reg,
            tasks,
            documents,
        });
    }
    let code = format::format(&batches, check);
    for (count, refusal) in &left {
        eprintln!("rsvelte: {count} Svelte files were not formatted: {refusal}");
    }
    Ok(if left.is_empty() {
        code
    } else {
        ExitCode::from(2)
    })
}

/// What a plugin that takes the resolved options cannot format with them: the TypeScript
/// formatter's refusal refuses the run, and the Svelte formatter's, returned, leaves the Svelte
/// files. A refusal of the sources is both formatters'.
fn refusal(options: &Resolved, plugins: &[(&str, OptionsOf)]) -> Result<Option<Refusal>, String> {
    let resolves = |plugin: &str| plugins.iter().any(|&(p, _)| p == plugin);
    let refusal = |unprinted: Option<&str>, formatter: &str| {
        (options.refused().cloned())
            .or_else(|| unprinted.map(|name| options.refusal(name, formatter)))
    };
    if resolves("typescript.format") {
        let typescript =
            serde_json::from_str::<rsvelte_typescript_format::Options>(&options.typescript());
        let unprinted = typescript.ok().and_then(|o| o.formatter().err());
        if let Some(refused) = refusal(unprinted, "TypeScript") {
            return Err(refused.to_string());
        }
    }
    if !resolves("svelte.format") {
        return Ok(None);
    }
    let svelte = serde_json::from_str(&options.svelte()).ok();
    Ok(refusal(
        svelte.as_ref().and_then(rsvelte_svelte_format::unported),
        "Svelte",
    ))
}

fn sources(options: &Resolved) -> String {
    let sources: Vec<String> = options.sources().iter().map(ToString::to_string).collect();
    sources.join(", ")
}

#[cfg(test)]
mod tests;
