//! `rsvelte`, the command people install: `lint`, `format` and `typecheck` over the Svelte and
//! TypeScript files of a project.

mod formatting;

use std::collections::BTreeMap;
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;

use formatting::{Refusal, Resolution, Resolved, Resolver};
use rsvelte_plugin_interface::{Extension, Selection};

use crate::commands::{files, format, lint, typecheck};
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

/// A plugin `format` gives the resolved options.
struct FormatPlugin {
    name: &'static str,
    formatter: &'static str,
    /// The task that formats with it.
    task: &'static str,
    /// The options it takes, as JSON, out of a file's resolved options.
    options: fn(&Resolved) -> String,
    /// Reads them as the plugin does: the option it cannot print, if any.
    read: fn(&str) -> serde_json::Result<Option<&'static str>>,
}

const FORMAT_PLUGINS: &[FormatPlugin] = &[
    FormatPlugin {
        name: "svelte.format",
        formatter: "Svelte",
        task: "svelte.format/default",
        options: Resolved::svelte,
        read: |json| {
            serde_json::from_str(json).map(|options| rsvelte_svelte_format::unported(&options))
        },
    },
    FormatPlugin {
        name: "typescript.format",
        formatter: "TypeScript",
        task: "ts.format/default",
        options: Resolved::typescript,
        read: |json| {
            serde_json::from_str::<rsvelte_typescript_format::Options>(json)
                .map(|options| options.formatter().err())
        },
    },
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
    let resolved_plugins: Vec<&FormatPlugin> = (FORMAT_PLUGINS.iter())
        .filter(|plugin| !named(plugin.name))
        .collect();
    let installation = |plan: &Plan| Installation {
        extensions: EXTENSIONS,
        selection: Selection::Named(plan.tasks.iter().map(|&task| task.to_owned()).collect()),
        defaults: plan.read.clone(),
    };
    let (selector, _) = install(
        loaded.as_ref(),
        &[],
        installation(&plan(&Resolved::default(), &resolved_plugins).0),
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
        let (plan, refused) = plan(&options, &resolved_plugins);
        let mut unformatted = files;
        if !plan.tasks.is_empty() {
            let (reg, _) = install(loaded.as_ref(), &[], installation(&plan))
                .map_err(|error| format!("{error} (from {})", sources(&options)))?;
            let formatted;
            (formatted, unformatted) =
                (unformatted.into_iter()).partition(|file| files::applies(&reg, &plan.tasks, file));
            installed.push((reg, plan.tasks, formatted));
        }
        if let Some(refused) = refused
            && !unformatted.is_empty()
        {
            left.push((unformatted.len(), refused));
        }
    }
    let mut batches = Vec::new();
    for (reg, tasks, formatted) in &installed {
        let documents = files::read_all(reg, formatted.iter().cloned(), tasks)?;
        batches.push(format::Batch {
            reg,
            tasks,
            documents,
        });
    }
    let code = format::format(&batches, check);
    for (count, refusal) in &left {
        let files = if *count == 1 {
            "1 file was".to_owned()
        } else {
            format!("{count} files were")
        };
        eprintln!("rsvelte: {files} not formatted: {refusal}");
    }
    Ok(if left.is_empty() {
        code
    } else {
        ExitCode::from(2)
    })
}

/// What `format` runs on one group's files: the tasks, and the options of each plugin that read
/// them, as JSON. A plugin that cannot read its options is not in `read`, so installing a plan
/// cannot fail on them.
struct Plan {
    tasks: Vec<&'static str>,
    read: Vec<(&'static str, String)>,
}

/// Why a group's files are not all formatted.
enum Refused {
    /// The options cannot be loaded or honored at all, as a configuration that oxfmt cannot load:
    /// no file of the group is formatted.
    Group(Refusal),
    /// One formatter does not print a value yet: the other still formats its files.
    Formatter(Refusal),
}

/// The plan of a group, and the first refusal that leaves some or all of its files, as Prettier
/// and oxfmt leave the files of a configuration they cannot load and format the others.
fn plan(options: &Resolved, plugins: &[&FormatPlugin]) -> (Plan, Option<Refusal>) {
    let mut plan = Plan {
        tasks: FORMAT.to_vec(),
        read: Vec::new(),
    };
    let mut first = None;
    for plugin in plugins {
        let json = (plugin.options)(options);
        let refusal = match refused(options, plugin, &json) {
            None => {
                plan.read.push((plugin.name, json));
                continue;
            }
            Some(Refused::Group(refusal)) => {
                plan.tasks.clear();
                refusal
            }
            Some(Refused::Formatter(refusal)) => {
                plan.tasks.retain(|&task| task != plugin.task);
                refusal
            }
        };
        first.get_or_insert(refusal);
    }
    (plan, first)
}

/// Why `plugin` cannot format with its options, `json`: it cannot read them, their sources are
/// refused, or it does not print one of them.
fn refused(options: &Resolved, plugin: &FormatPlugin, json: &str) -> Option<Refused> {
    let Ok(unprinted) = (plugin.read)(json) else {
        return Some(Refused::Group(unread(options, plugin)));
    };
    if let Some(refusal) = options.refused() {
        return Some(Refused::Group(refusal.clone()));
    }
    unprinted.map(|name| {
        Refused::Formatter(options.refusal(name, |name| {
            let formatter = plugin.formatter;
            format!("the {formatter} formatter does not print this `{name}` value yet")
        }))
    })
}

/// The refusal of options `plugin` cannot read, named by the first option it cannot read alone.
fn unread(options: &Resolved, plugin: &FormatPlugin) -> Refusal {
    let reads = |name: &&str| (plugin.read)(&(plugin.options)(&options.only(name))).is_ok();
    let name = (options.names())
        .find(|name| !reads(name))
        .unwrap_or("options");
    options.refusal(name, |name| {
        format!(
            "the {} formatter cannot read this `{name}` value",
            plugin.formatter
        )
    })
}

fn sources(options: &Resolved) -> String {
    let sources: Vec<String> = options.sources().iter().map(ToString::to_string).collect();
    sources.join(", ")
}

#[cfg(test)]
mod tests;
