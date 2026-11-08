//! `rsvelte corpus <dir>... [--task <identifier>]...` runs tasks over every corpus unit below
//! the given directories, in one run, and writes `actual/<task>.<ext>` next to `expected/`.
//! `rsvelte run <file> --task <identifier>` prints one task's outputs for one file.
//! `rsvelte benchmark <dir> [--task <identifier>]... [rounds=N] [json=<file>]` measures the
//! pipeline (see `commands/benchmark.rs`).
//! `rsvelte performance <dir>... [--task <identifier>]... [rounds=N] [json=<file>]` prints the
//! deterministic counters CI ratchets (see `commands/performance.rs`).
//!
//! `svelte.check` also needs a type checker and `--svelte <svelte package dir>`, `vue.check` a type
//! checker and `--vue <vue package dir>`; `ts.check` checks components and standalone TypeScript
//! files with one type checker run. The type checker is `--type-checker <program>` (or `--tsc`),
//! with `--type-checker-arg <argument>` for each of its own arguments, or else the configuration
//! file's `typeChecker.command`: TypeScript 7.1's `tsc`, or a product with its command line. The
//! project configuration is `--tsconfig <file>`, by default the first directory's `tsconfig.json`.
//! Without `--task`, `corpus` and `run` run every task, the checks included, so they then need all
//! of these; `benchmark` and `performance` run the document tasks.

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
use rsvelte_kernel::computation::pipeline::Registry;

#[cfg(feature = "metrics")]
#[global_allocator]
static ALLOC: rsvelte_kernel::performance::measurement::CountingAllocator =
    rsvelte_kernel::performance::measurement::CountingAllocator;

/// Every language plugin, each with its own configuration.
fn registry(
    svelte: &rsvelte_svelte_typecheck::Configuration,
    vue: &rsvelte_vue_check::Configuration,
) -> Registry {
    let mut reg = Registry::new();
    rsvelte_typescript_compile::register(&mut reg);
    rsvelte_typescript_format::register(&mut reg);
    rsvelte_typescript_lint::register(&mut reg);
    rsvelte_typescript_check::register(&mut reg);
    rsvelte_svelte_compile::register(&mut reg);
    rsvelte_svelte_format::register(&mut reg);
    rsvelte_svelte_lint::register(&mut reg);
    #[cfg(feature = "lint-typed")]
    rsvelte_svelte_lint_typed::register(&mut reg);
    rsvelte_svelte_typescript_projection::register(&mut reg);
    rsvelte_svelte_typecheck::register(&mut reg, svelte);
    rsvelte_vue_compile::register(&mut reg);
    rsvelte_vue_format::register(&mut reg);
    rsvelte_vue_lint::register(&mut reg);
    rsvelte_vue_check::register(&mut reg, vue);
    rsvelte_svue::register(&mut reg);
    rsvelte_svelte_compile_vapor::register(&mut reg);
    reg
}

/// The type checker a run used, for the measurement reports.
#[derive(Clone, Debug)]
pub(crate) struct Identity {
    pub(crate) command: String,
    pub(crate) version: String,
}

impl Identity {
    /// `type_checker`: `{ command, version }`, or null when no task ran one.
    pub(crate) fn write(
        identity: Option<&Self>,
        w: &mut rsvelte_kernel::output::structured_data::StructuredDataWriter,
    ) {
        w.key("type_checker");
        match identity {
            Some(i) => {
                w.begin_object()
                    .key("command")
                    .write_string(&i.command)
                    .key("version")
                    .write_string(&i.version)
                    .end_object();
            }
            None => {
                w.null();
            }
        }
    }
}

fn main() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let mut tasks = Vec::new();
    let mut config = configuration::Options::default();
    let mut positional = Vec::new();
    let (mut svelte, mut vue, mut tsconfig) = (None, None, None);
    let (mut program, mut checker_arguments) = (None, Vec::new());
    let mut it = arguments.iter();
    while let Some(a) = it.next() {
        if configuration::Options::accepts(a) {
            let Some(value) = it.next() else {
                return usage(&format!("{a} needs a value"));
            };
            config.argument(a, value);
            continue;
        }
        if matches!(
            a.as_str(),
            "--tsc" | "--type-checker" | "--type-checker-arg"
        ) {
            let Some(value) = it.next() else {
                return usage(&format!("{a} needs a value"));
            };
            if a == "--type-checker-arg" {
                checker_arguments.push(value.clone());
            } else {
                let here = match std::env::current_dir() {
                    Ok(here) => here,
                    Err(e) => return usage(&format!("{a} {value}: {e}")),
                };
                match configuration::program_path(value, &here) {
                    Ok(p) => program = Some(p),
                    Err(e) => return usage(&format!("{a} {value}: {e}")),
                }
            }
            continue;
        }
        let slot = match a.as_str() {
            "--task" => None,
            "--svelte" => Some(&mut svelte),
            "--vue" => Some(&mut vue),
            "--tsconfig" => Some(&mut tsconfig),
            // Taken as a directory, a mistyped option would only find no units.
            _ if a.starts_with("--") => return usage(&format!("unknown option {a}")),
            _ => {
                positional.push(a.as_str());
                continue;
            }
        };
        let Some(value) = it.next() else {
            return usage(&format!("{a} needs a value"));
        };
        match slot {
            Some(s) => match std::path::absolute(value) {
                Ok(p) => *s = Some(p),
                Err(e) => return usage(&format!("{a} {value}: {e}")),
            },
            None => tasks.push(value.as_str()),
        }
    }
    if let (None, ["corpus", dir, ..]) = (&tsconfig, positional.as_slice()) {
        let default = Path::new(dir).join("tsconfig.json");
        tsconfig = default
            .is_file()
            .then(|| std::path::absolute(&default).expect("a non-empty path"));
    }
    let loaded = match config.load() {
        Ok(loaded) => loaded,
        Err(error) => return usage(&error.to_string()),
    };
    let tsc = match type_checker(program, checker_arguments, loaded.as_ref()) {
        Ok(checker) => checker,
        Err(error) => return usage(&error),
    };
    // With no `--task`, these run every task, check tasks included; the others run document tasks.
    let every_task = tasks.is_empty() && matches!(positional.first(), Some(&("corpus" | "run")));
    let identity = match identify(
        &tasks,
        every_task,
        tsc.as_ref(),
        svelte.is_some(),
        vue.is_some(),
    ) {
        Ok(identity) => identity,
        Err(error) => return usage(&error),
    };
    let (svelte, vue, polyglot) = check_configurations(tsc, svelte, vue, tsconfig);
    let reg = match configured_registry(&svelte, &vue, polyglot, loaded.as_ref().map(|(_, l)| l)) {
        Ok(registry) => registry,
        Err(error) => return usage(&error),
    };
    if let Err(e) = reg.check_task_identifiers(&tasks) {
        return usage(&e.to_string());
    }
    dispatch(&reg, &positional, &tasks, identity)
}

/// The check tasks' configurations: Svelte's, Vue's and `ts.check`'s, which share one type checker.
fn check_configurations(
    tsc: Option<rsvelte_typescript_check::TypeChecker>,
    svelte: Option<std::path::PathBuf>,
    vue: Option<std::path::PathBuf>,
    tsconfig: Option<std::path::PathBuf>,
) -> (
    rsvelte_svelte_typecheck::Configuration,
    rsvelte_vue_check::Configuration,
    Option<rsvelte_typescript_check::Tsc>,
) {
    let svelte = rsvelte_svelte_typecheck::Configuration {
        check: tsc.clone().zip(svelte).map(|(tsc, svelte)| {
            rsvelte_svelte_typecheck::TypeCheckConfiguration {
                checker: tsc,
                content_mapper: std::env::var_os("RSVELTE_TYPESCRIPT_CONTENT_MAPPER").map_or_else(
                    || "rsvelte-typescript-content-mapper".into(),
                    std::path::PathBuf::from,
                ),
                tsconfig: tsconfig.clone(),
                svelte,
            }
        }),
    };
    let polyglot = tsc.clone().map(|checker| rsvelte_typescript_check::Tsc {
        checker,
        tsconfig: tsconfig.clone(),
    });
    let vue = rsvelte_vue_check::Configuration {
        check: tsc
            .zip(vue)
            .map(|(checker, vue)| rsvelte_vue_check::TypeCheckConfiguration {
                checker,
                tsconfig,
                vue,
            }),
    };
    (svelte, vue, polyglot)
}

/// The tasks that run a type checker, and what else each needs.
const CHECKS: [(&str, Option<&str>); 3] = [
    (
        "svelte.check/default",
        Some("--svelte <svelte package dir>"),
    ),
    ("vue.check/default", Some("--vue <vue package dir>")),
    ("ts.check/default", None),
];

/// Refuses a check task that will run but cannot check, and returns the type checker's command and
/// version when a task will run it. Every mistake is reported here, once, not on each file.
/// `every_task`: no `--task` was given and the subcommand then runs every task, so every check task
/// runs too.
fn identify(
    tasks: &[&str],
    every_task: bool,
    checker: Option<&rsvelte_typescript_check::TypeChecker>,
    svelte: bool,
    vue: bool,
) -> Result<Option<Identity>, String> {
    if checker.is_none() && (svelte || vue) {
        return Err(
            "--svelte and --vue need a type checker: --type-checker <program> or \
             typeChecker.command in rsvelte.config.json"
                .to_owned(),
        );
    }
    // Without `--task` the user did not ask for the check; say how to leave it out.
    let unless = if every_task {
        "; or choose the tasks to run with --task"
    } else {
        ""
    };
    let mut runs = false;
    for (task, package) in CHECKS {
        if !every_task && !tasks.contains(&task) {
            continue;
        }
        runs = true;
        if checker.is_none() {
            return Err(format!(
                "{task} needs a type checker: --type-checker <program> or typeChecker.command in \
                 rsvelte.config.json{unless}"
            ));
        }
        let given = match task {
            "svelte.check/default" => svelte,
            "vue.check/default" => vue,
            _ => true,
        };
        if let (false, Some(package)) = (given, package) {
            return Err(format!("{task} needs {package}{unless}"));
        }
    }
    match checker {
        Some(checker) if runs => Ok(Some(Identity {
            command: checker.to_string(),
            version: checker.identify()?,
        })),
        _ => Ok(None),
    }
}

/// The command line's type checker, or else the configuration file's.
fn type_checker(
    program: Option<std::path::PathBuf>,
    arguments: Vec<String>,
    loaded: Option<&(std::path::PathBuf, rsvelte_config::LoadedConfiguration)>,
) -> Result<Option<rsvelte_typescript_check::TypeChecker>, String> {
    match (program, loaded) {
        (Some(program), _) => Ok(Some(rsvelte_typescript_check::TypeChecker {
            program,
            arguments,
        })),
        (None, _) if !arguments.is_empty() => {
            Err("--type-checker-arg needs --type-checker".to_owned())
        }
        (None, Some((path, loaded))) => {
            configuration::type_checker(path, loaded).map_err(|error| error.to_string())
        }
        (None, None) => Ok(None),
    }
}

/// Runs the subcommand.
fn dispatch(
    reg: &Registry,
    positional: &[&str],
    tasks: &[&str],
    identity: Option<Identity>,
) -> ExitCode {
    match positional {
        ["corpus", dirs @ ..] if !dirs.is_empty() => {
            let roots: Vec<&Path> = dirs.iter().map(Path::new).collect();
            corpus(reg, &roots, tasks)
        }
        ["run", file] => run_file(reg, Path::new(file), tasks),
        ["benchmark", dir, rest @ ..] => match benchmark::Options::parse(rest) {
            Ok(mut options) => {
                options.type_checker = identity;
                benchmark::benchmark(reg, Path::new(dir), tasks, &options)
            }
            Err(e) => usage(&e),
        },
        ["performance", rest @ ..] => match performance::Options::parse(rest) {
            Ok((roots, mut options)) => {
                options.type_checker = identity;
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

fn configured_registry(
    svelte: &rsvelte_svelte_typecheck::Configuration,
    vue: &rsvelte_vue_check::Configuration,
    polyglot: Option<rsvelte_typescript_check::Tsc>,
    loaded: Option<&rsvelte_config::LoadedConfiguration>,
) -> Result<Registry, String> {
    let mut registry = registry(svelte, vue);
    registry
        .validate_plugins()
        .map_err(|error| error.to_string())?;
    if let Some(loaded) = loaded {
        configuration::apply(&mut registry, loaded).map_err(|error| error.to_string())?;
    }
    registry.finish_task(rsvelte_typescript_check::Check {
        identifier: "ts.check/default",
        matches: |document| {
            rsvelte_typescript::matches(document)
                || rsvelte_svelte::matches(document)
                || rsvelte_vue::matches(document)
        },
        tsc: polyglot,
    });
    Ok(registry)
}

#[cfg(test)]
mod tests;
