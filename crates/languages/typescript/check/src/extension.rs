use std::num::NonZeroUsize;
use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::{ProjectFiles, Registry};
use rsvelte_plugin_interface::{
    CallError, Extension, Settings, TaskKind, installed_bin, installed_package, program_path,
};
use serde::Deserialize;

use crate::check::version_before_7_1;
use crate::{Check, Documents, MappedLanguages, Tsc, TypeChecker};

pub static EXTENSION: Extension = Extension {
    identifier: "typescript.check",
    install,
};

/// The task that checks every document some plugin gives a TypeScript view, in one project.
const TASK: &str = "ts.check/default";

/// What a check task needs when no type checker is configured.
pub const NEEDS_TYPE_CHECKER: &str =
    "a type checker: `command` in the options of `typescript.check`";

/// The checkers looked for when the options name none, by package and command, in order.
const INSTALLED: [(&str, &str); 3] = [
    ("tsrs", "tsrs"),
    ("@typescript/native-preview", "tsgo"),
    ("typescript", "tsc"),
];

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    /// The program, then the arguments that start it, such as `["node", "tsc.js"]`. rsvelte
    /// adds `--api`, so they are not compiler options. By default, the first of [`INSTALLED`]
    /// the project installs.
    command: Option<Vec<String>>,
    /// The project's tsconfig.json; by default `tsconfig.json` next to the options, if any.
    tsconfig: Option<PathBuf>,
    /// How many checker processes share the documents; see [`Tsc::processes`].
    processes: Option<NonZeroUsize>,
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    crate::register(registry);
    let runs = settings.runs(TASK, TaskKind::Finish);
    let tsc = type_checker(settings, runs)?;
    if runs && tsc.is_none() {
        return Err(settings.missing(TASK, NEEDS_TYPE_CHECKER));
    }
    if let Some(tsc) = tsc.clone() {
        registry.contribute::<ProjectFiles>((
            TASK,
            Box::new(move |registry: &Registry| {
                tsc.project_files(registry.contributions::<MappedLanguages>())
            }),
        ));
    }
    registry.finish_task(Check {
        identifier: TASK,
        documents: Documents::WithTypeScriptView,
        tsc,
        stand_in: None,
        imported: None,
    });
    Ok(())
}

/// The type checker the options of `typescript.check` name, for every check task. `runs`: a task
/// that runs it will run, so the run records it and refuses one that cannot run.
///
/// # Errors
///
/// The options do not decode, name no program, or (when `runs`) name a checker that cannot run.
pub fn type_checker(settings: &mut Settings, runs: bool) -> Result<Option<Tsc>, CallError> {
    let Some(options) = settings.options::<Options>(EXTENSION.identifier)? else {
        return Ok(None);
    };
    let error = |e: String| CallError(format!("options of `typescript.check`: {e}"));
    let base = &options.base;
    let (program, arguments) = match &options.value.command {
        Some(command) => {
            let Some((program, arguments)) = command.split_first() else {
                return Err(error("`command` needs a program".to_owned()));
            };
            let program =
                program_path(program, base).map_err(|e| error(format!("{program}: {e}")))?;
            (program, arguments.to_vec())
        }
        None => installed(base)?.map_err(|older| CallError(no_checker_installed(base, &older)))?,
    };
    let tsconfig = options.value.tsconfig.map_or_else(
        || Some(base.join("tsconfig.json")).filter(|default| default.is_file()),
        |path| Some(base.join(path)),
    );
    let tsconfig = tsconfig
        .map(std::path::absolute)
        .transpose()
        .map_err(|e| error(e.to_string()))?;
    let checker = TypeChecker { program, arguments };
    if runs {
        settings.tool(checker.to_string(), || {
            checker.identify().map_err(CallError)
        })?;
    }
    Ok(Some(Tsc {
        checker,
        tsconfig,
        processes: options.value.processes,
    }))
}

/// The error when no installed checker has the API: what it found, and the command that installs
/// one with the package manager the project uses, so it can be pasted.
fn no_checker_installed(base: &Path, older: &[String]) -> String {
    let found = if older.is_empty() {
        String::new()
    } else {
        format!(" (found {}, which are older)", older.join(", "))
    };
    format!(
        "no type checker with the API of TypeScript 7.1 or later is installed{found}. \
         Install tsrs in the project:\n\n    {}\n\nor name a type checker with `command` in \
         the options of `typescript.check`",
        install_command(base)
    )
}

/// `<manager> add -D tsrs` for the package manager whose lockfile is nearest to `base`.
fn install_command(base: &Path) -> &'static str {
    const LOCKFILES: [(&str, &str); 5] = [
        ("pnpm-lock.yaml", "pnpm add -D tsrs"),
        ("yarn.lock", "yarn add -D tsrs"),
        ("bun.lock", "bun add -d tsrs"),
        ("bun.lockb", "bun add -d tsrs"),
        ("package-lock.json", "npm install -D tsrs"),
    ];
    let base = std::path::absolute(base).unwrap_or_else(|_| base.to_owned());
    base.ancestors()
        .find_map(|directory| {
            LOCKFILES
                .iter()
                .find(|(lockfile, _)| directory.join(lockfile).is_file())
        })
        .map_or("npm install -D tsrs", |(_, command)| command)
}

/// A program and the arguments that start it.
type Command = (PathBuf, Vec<String>);

/// `node` and the script of the first of [`INSTALLED`] that `base` resolves and that has the API;
/// otherwise the TypeScript packages it resolves that are older than 7.1, as `<name> <version>`.
fn installed(base: &Path) -> Result<Result<Command, Vec<String>>, CallError> {
    let mut older = Vec::new();
    for (package, bin) in INSTALLED {
        let failed =
            |e: std::io::Error| CallError(format!("options of `typescript.check`: {package}: {e}"));
        let Some(script) = installed_bin(package, bin, base).map_err(failed)? else {
            continue;
        };
        if package != "tsrs"
            && let Some(version) = package_version(package, base).map_err(failed)?
            && version_before_7_1(&version)
        {
            older.push(format!("{package} {version}"));
            continue;
        }
        return Ok(Ok((
            "node".into(),
            vec![script.to_string_lossy().into_owned()],
        )));
    }
    Ok(Err(older))
}

/// The `version` in the `package.json` of package `name` as `base` resolves it.
fn package_version(name: &str, base: &Path) -> std::io::Result<Option<String>> {
    let Some(package) = installed_package(name, base)? else {
        return Ok(None);
    };
    let manifest = std::fs::read(package.join("package.json"))?;
    let manifest: serde_json::Value =
        serde_json::from_slice(&manifest).map_err(std::io::Error::other)?;
    Ok(manifest["version"].as_str().map(str::to_owned))
}

#[cfg(test)]
mod tests;
