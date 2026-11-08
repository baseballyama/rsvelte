//! `rsvelte corpus <dir>... [--task <identifier>]...` runs tasks over every corpus unit below
//! the given directories, in one run, and writes `actual/<task>.<ext>` next to `expected/`.
//! `rsvelte run <file> --task <identifier>` prints one task's outputs for one file.
//! `rsvelte benchmark <dir> [--task <identifier>]... [rounds=N] [json=<file>]` measures the
//! pipeline (see `commands/benchmark.rs`).
//! `rsvelte performance <dir>... [--task <identifier>]... [rounds=N] [json=<file>]` prints the
//! deterministic counters CI ratchets (see `commands/performance.rs`).
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
mod input;
mod output;
use std::path::Path;
use std::process::ExitCode;

use commands::corpus::corpus;
use commands::run::run_file;
use commands::{benchmark, performance};
use input::load;
use rsvelte_kernel::computation::registry::Registry;

#[cfg(feature = "metrics")]
#[global_allocator]
static ALLOC: rsvelte_kernel::performance::measurement::CountingAllocator =
    rsvelte_kernel::performance::measurement::CountingAllocator;

/// Every plugin the command installs, in installation order.
static EXTENSIONS: &[&rsvelte_plugin_interface::Extension] = &[
    &rsvelte_typescript_compile::EXTENSION,
    &rsvelte_typescript_format::EXTENSION,
    &rsvelte_typescript_lint::EXTENSION,
    &rsvelte_typescript_check::EXTENSION,
    &rsvelte_svelte_compile::EXTENSION,
    &rsvelte_svelte_format::EXTENSION,
    &rsvelte_svelte_lint::EXTENSION,
    #[cfg(feature = "lint-typed")]
    &rsvelte_svelte_lint_typed::EXTENSION,
    &rsvelte_svelte_typescript_projection::EXTENSION,
    &rsvelte_svelte_check::EXTENSION,
    &rsvelte_vue_compile::EXTENSION,
    &rsvelte_vue_format::EXTENSION,
    &rsvelte_vue_lint::EXTENSION,
    &rsvelte_vue_check::EXTENSION,
    &rsvelte_vue_compile_svelte::EXTENSION,
    &rsvelte_svelte_compile_vapor::EXTENSION,
];

fn main() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let mut tasks = Vec::new();
    let mut config = configuration::Options::default();
    let mut overrides = Vec::new();
    let mut positional = Vec::new();
    let mut it = arguments.iter();
    while let Some(a) = it.next() {
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
    let selection = if !tasks.is_empty() {
        rsvelte_plugin_interface::Selection::Named(tasks.iter().map(|&t| t.to_owned()).collect())
    } else if matches!(positional.first(), Some(&("corpus" | "run"))) {
        rsvelte_plugin_interface::Selection::Every
    } else {
        rsvelte_plugin_interface::Selection::DocumentTasks
    };
    let (reg, tools) = match configured_registry(&config, &overrides, selection) {
        Ok(configured) => configured,
        Err(error) => return usage(&error),
    };
    if let Err(e) = reg.check_task_identifiers(&tasks) {
        return usage(&e.to_string());
    }
    dispatch(&reg, &positional, &tasks, tools)
}

/// Installs every plugin with its options, and returns the programs its tasks will run. Every
/// mistake is reported here, once, not on each file.
fn configured_registry(
    config: &configuration::Options,
    overrides: &[(&str, &str)],
    selection: rsvelte_plugin_interface::Selection,
) -> Result<(Registry, Vec<rsvelte_plugin_interface::Tool>), String> {
    let loaded = config.load().map_err(|error| error.to_string())?;
    let functions: std::sync::Arc<dyn rsvelte_plugin_interface::FunctionResolver> = match &loaded {
        Some((_, loaded)) => std::sync::Arc::clone(&loaded.functions),
        None => std::sync::Arc::new(rsvelte_plugin_interface::NoFunctions),
    };
    let mut settings = rsvelte_plugin_interface::Settings::new(selection, functions);
    if let Some((path, loaded)) = loaded {
        let base = path.parent().unwrap_or_else(|| Path::new(".")).to_owned();
        for (plugin, options) in loaded.configuration.plugins {
            settings.set(plugin, options, base.clone());
        }
    }
    let here = std::env::current_dir().map_err(|e| format!("current directory: {e}"))?;
    for &(plugin, options) in overrides {
        let options =
            serde_json::from_str(options).map_err(|e| format!("--options {plugin}: {e}"))?;
        settings.set(plugin.to_owned(), options, here.clone());
    }
    let mut registry = Registry::new();
    rsvelte_plugin_interface::install(&mut registry, EXTENSIONS, &mut settings)
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
) -> ExitCode {
    match positional {
        ["corpus", dirs @ ..] if !dirs.is_empty() => {
            let roots: Vec<&Path> = dirs.iter().map(Path::new).collect();
            corpus(reg, &roots, tasks)
        }
        ["run", file] => run_file(reg, Path::new(file), tasks),
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
            "expected `corpus <dir>...`, `run <file>`, ",
            "`benchmark <dir>` or `performance <dir>...`"
        )),
    }
}

fn usage(msg: &str) -> ExitCode {
    eprintln!("rsvelte: {msg}");
    ExitCode::from(2)
}

#[cfg(test)]
mod tests;
