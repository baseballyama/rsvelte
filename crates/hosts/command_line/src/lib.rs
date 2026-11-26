//! The command line, as two programs that share it: `rsvelte`, which people install, runs
//! `lint`, `format` and `typecheck` (see `release.rs`); `rsvelte-dev` runs every task and the
//! commands that measure and test rsvelte:
//!
//! `rsvelte-dev corpus <dir>... [--task <identifier>]...` runs tasks over every corpus unit below
//! the given directories, in one run, and writes `actual/<task>.<ext>` next to `expected/`.
//! `rsvelte-dev run <file> --task <identifier>` prints one task's outputs for one file.
//! `rsvelte-dev run <file>... --task <identifier>` runs the tasks over every file in one run, as a
//! project, and labels each output with its file.
//! `rsvelte-dev lint [<path>...] [--task <identifier>]...` lints the files below the paths, by
//! default the current directory, and prints the problems as `ESLint` does.
//! `rsvelte-dev format [<path>...] [--check]` formats the files below the paths, by default the
//! current directory, and writes the ones that change; `--check` only lists them.
//! `rsvelte-dev check [--task <identifier>]...` runs the tasks, by default `ts.check/default`, over
//! the files of the project they check, as its checker selects them from the tsconfig.
//! `rsvelte-dev benchmark <dir> [--task <identifier>]... [rounds=N] [json=<file>]` measures the
//! pipeline (see `commands/benchmark.rs`).
//! `rsvelte-dev performance <dir>... [--task <identifier>]... [rounds=N] [every=N] [json=<file>]`
//! prints the deterministic counters CI ratchets (see `commands/performance.rs`).
//!
//! Each plugin reads its own options: the configuration file's `plugins.<plugin>`, replaced by
//! `--options <plugin> <json>`, whose relative paths are relative to the current directory. A
//! plugin refuses the run when a task of it that will run lacks an option. Without `--task`,
//! `corpus` and `run` run every task; `benchmark` and `performance` run the document tasks.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a command-line tool reports on stdout and stderr"
)]

mod commands;
mod configuration;
mod release;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

use commands::corpus::corpus;
use commands::run::{run_file, run_files, run_project};
use commands::{benchmark, format, lint, performance};
pub use release::{release, release_with};
use rsvelte_configuration_loading::LoadedConfiguration;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_plugin_interface::{Extension, Selection};

// The allocation counters need the counting allocator, so mimalloc only serves the plain build.
#[cfg(not(feature = "metrics"))]
#[global_allocator]
static MIMALLOC: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[cfg(feature = "metrics")]
#[global_allocator]
static ALLOC: rsvelte_kernel::performance::measurement::CountingAllocator =
    rsvelte_kernel::performance::measurement::CountingAllocator;

/// The directory of the programs a release installs with the command, such as the content mapper:
/// the command's own directory, unless the host that runs the command names another.
static PROGRAMS: std::sync::OnceLock<Option<PathBuf>> = std::sync::OnceLock::new();

fn programs() -> Option<PathBuf> {
    let beside = || Some(std::env::current_exe().ok()?.parent()?.to_owned());
    PROGRAMS.get_or_init(beside).clone()
}

/// What `check` runs without `--task`.
const PROJECT_CHECK: &str = "ts.check/default";

/// Every plugin `rsvelte-dev` installs, in installation order.
static EXTENSIONS: &[&Extension] = &[
    &rsvelte_typescript_compile::EXTENSION,
    &rsvelte_typescript_format::EXTENSION,
    &rsvelte_typescript_lint::EXTENSION,
    &rsvelte_typescript_check::EXTENSION,
    &rsvelte_svelte_compile::EXTENSION,
    &rsvelte_svelte_format::EXTENSION,
    &rsvelte_svelte_lint::EXTENSION,
    &rsvelte_svelte_typescript_projection::EXTENSION,
    &rsvelte_svelte_check::EXTENSION,
    &rsvelte_vue_compile::EXTENSION,
    &rsvelte_vue_format::EXTENSION,
    &rsvelte_vue_lint::EXTENSION,
    &rsvelte_vue_check::EXTENSION,
    &rsvelte_vue_to_svelte::EXTENSION,
    &rsvelte_svelte_to_vue_vapor::EXTENSION,
];

/// `rsvelte-dev`.
pub fn development() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let mut tasks = Vec::new();
    let mut config = configuration::Options::default();
    let mut overrides = Vec::new();
    let mut positional = Vec::new();
    let mut fix = false;
    let mut check = false;
    let mut it = arguments.iter();
    while let Some(a) = it.next() {
        if a == "--fix" {
            fix = true;
            continue;
        }
        if a == "--check" {
            check = true;
            continue;
        }
        if a == "--options" {
            let (Some(plugin), Some(options)) = (it.next(), it.next()) else {
                return usage("--options needs a plugin and its options as JSON");
            };
            overrides.push((plugin.as_str(), options.as_str()));
            continue;
        }
        if !a.starts_with("--") {
            positional.push(a.as_str());
            continue;
        }
        // Taken as a directory, a mistyped option would only find no units.
        if a != "--task" && !configuration::Options::accepts(a) {
            return usage(&format!("unknown option {a}"));
        }
        let Some(value) = it.next() else {
            return usage(&format!("{a} needs a value"));
        };
        if a == "--task" {
            tasks.push(value.as_str());
        } else {
            config.argument(a, value);
        }
    }
    if fix && positional.first() != Some(&"run") {
        return usage("--fix applies to `run` only");
    }
    if check && positional.first() != Some(&"format") {
        return usage("--check applies to `format` only");
    }
    let command = positional.first().copied();
    if tasks.is_empty() {
        tasks.extend_from_slice(default_tasks(command));
    }
    let selection = match command {
        _ if !tasks.is_empty() => Selection::Named(tasks.iter().map(|&t| t.to_owned()).collect()),
        Some("corpus" | "run") => Selection::Every,
        _ => Selection::DocumentTasks,
    };
    let installation = Installation {
        extensions: EXTENSIONS,
        selection,
        defaults: Vec::new(),
    };
    let configured = current_directory()
        .and_then(|here| configured_registry(&config, &overrides, installation, &here));
    let (reg, tools) = match configured {
        Ok(configured) => configured,
        Err(error) => return usage(&error),
    };
    if let Err(e) = reg.check_task_identifiers(&tasks) {
        return usage(&e.to_string());
    }
    dispatch(&reg, &positional, &tasks, tools, (fix, check))
}

/// The tasks a subcommand runs without `--task`; none for one that runs every task it can.
fn default_tasks(command: Option<&str>) -> &'static [&'static str] {
    match command {
        Some("lint") => lint::TASKS,
        Some("format") => format::TASKS,
        Some("check") => &[PROJECT_CHECK],
        _ => &[],
    }
}

/// What a program installs: its plugins, the tasks that will run, and the options, as JSON, of
/// the plugins that neither the configuration nor `--options` gives any.
struct Installation {
    extensions: &'static [&'static Extension],
    selection: Selection,
    defaults: Vec<(&'static str, String)>,
}

/// The directory a command runs in.
fn current_directory() -> Result<PathBuf, String> {
    std::env::current_dir().map_err(|e| format!("current directory: {e}"))
}

/// Installs the plugins with their options, as run in `directory`, and returns the programs their
/// tasks will run. Every mistake is reported here, once, not on each file.
fn configured_registry(
    config: &configuration::Options,
    overrides: &[(&str, &str)],
    installation: Installation,
    directory: &Path,
) -> Result<(Registry, Vec<rsvelte_plugin_interface::Tool>), String> {
    let loaded = config.load(directory).map_err(|error| error.to_string())?;
    install(loaded.as_ref(), overrides, installation, directory)
}

/// [`configured_registry`] with the configuration already loaded, so that one configuration can
/// install several registries.
fn install(
    loaded: Option<&(PathBuf, LoadedConfiguration)>,
    overrides: &[(&str, &str)],
    installation: Installation,
    directory: &Path,
) -> Result<(Registry, Vec<rsvelte_plugin_interface::Tool>), String> {
    let functions: std::sync::Arc<dyn rsvelte_plugin_interface::FunctionResolver> = match loaded {
        Some((_, loaded)) => std::sync::Arc::clone(&loaded.functions),
        None => std::sync::Arc::new(rsvelte_plugin_interface::NoFunctions),
    };
    let mut settings = rsvelte_plugin_interface::Settings::new(installation.selection, functions);
    if let Some(programs) = programs() {
        settings = settings.with_programs(programs);
    }
    let mut given: Vec<String> = overrides
        .iter()
        .map(|&(plugin, _)| plugin.to_owned())
        .collect();
    if let Some((path, loaded)) = loaded {
        let base = path.parent().unwrap_or_else(|| Path::new(".")).to_owned();
        for (plugin, options) in &loaded.configuration.plugins {
            given.push(plugin.clone());
            settings.set(plugin.clone(), options.clone(), base.clone());
        }
    }
    // What the defaults and `--options` name is found from the directory the run is in.
    let here = directory.to_owned();
    for (plugin, options) in installation.defaults {
        if !given.iter().any(|g| g == plugin) {
            let options =
                serde_json::value::RawValue::from_string(options).map_err(|e| e.to_string())?;
            settings.set(plugin.to_owned(), options, here.clone());
        }
    }
    for &(plugin, options) in overrides {
        let options =
            serde_json::from_str(options).map_err(|e| format!("--options {plugin}: {e}"))?;
        settings.set(plugin.to_owned(), options, here.clone());
    }
    let mut registry = Registry::new();
    rsvelte_plugin_interface::install(&mut registry, installation.extensions, &mut settings)
        .map_err(|error| error.to_string())?;
    registry
        .validate_plugins()
        .map_err(|error| error.to_string())?;
    Ok((registry, settings.tools().to_vec()))
}

/// Runs the subcommand.
fn dispatch(
    reg: &Registry,
    positional: &[&str],
    tasks: &[&str],
    tools: Vec<rsvelte_plugin_interface::Tool>,
    (fix, check): (bool, bool),
) -> ExitCode {
    match positional {
        ["corpus", dirs @ ..] if !dirs.is_empty() => {
            let roots: Vec<&Path> = dirs.iter().map(Path::new).collect();
            corpus(reg, &roots, tasks)
        }
        ["run", file] => run_file(reg, Path::new(file), tasks, fix),
        ["run", files @ ..] if !files.is_empty() && !fix => {
            let files: Vec<PathBuf> = files.iter().map(PathBuf::from).collect();
            run_files(reg, files, tasks)
        }
        ["lint", paths @ ..] => lint::lint(reg, paths, tasks),
        ["format", paths @ ..] => {
            let paths = if paths.is_empty() { &["."] } else { paths };
            match commands::files::load(reg, paths, tasks, format::IGNORE_FILES) {
                Ok(documents) => format::format(
                    &[format::Batch {
                        reg,
                        tasks,
                        documents,
                    }],
                    check,
                ),
                Err(e) => usage(&e),
            }
        }
        ["check"] => run_project(reg, tasks),
        ["benchmark", dir, rest @ ..] => match benchmark::Options::parse(rest) {
            Ok(mut options) => {
                options.tools = tools;
                benchmark::benchmark(reg, Path::new(dir), tasks, &options)
            }
            Err(e) => usage(&e),
        },
        ["performance", rest @ ..] => match performance::Options::parse(rest) {
            Ok((roots, mut options)) => {
                options.tools = tools;
                performance::performance(reg, &roots, tasks, &options)
            }
            Err(e) => usage(&e),
        },
        _ => usage(concat!(
            "expected `corpus <dir>...`, `run <file>...`, `lint [<path>...]`, ",
            "`format [<path>...]`, `check`, `benchmark <dir>` or `performance <dir>...`"
        )),
    }
}

fn usage(msg: &str) -> ExitCode {
    eprintln!("rsvelte: {msg}");
    ExitCode::from(2)
}

#[cfg(test)]
mod tests;
