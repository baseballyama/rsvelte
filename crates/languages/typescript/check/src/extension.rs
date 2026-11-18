use std::num::NonZeroUsize;
use std::path::PathBuf;

use rsvelte_kernel::computation::registry::{ProjectFiles, Registry};
use rsvelte_plugin_interface::{
    CallError, Extension, Settings, TaskKind, installed_bin, program_path,
};
use serde::Deserialize;

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
        None => installed(base)?.ok_or_else(|| error(NO_CHECKER_INSTALLED.to_owned()))?,
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

const NO_CHECKER_INSTALLED: &str = "no type checker installed: add `tsrs` to the project's \
devDependencies, or name one with `command`";

/// `node` and the script of the first of [`INSTALLED`] that `base` resolves.
fn installed(base: &std::path::Path) -> Result<Option<(PathBuf, Vec<String>)>, CallError> {
    for (package, bin) in INSTALLED {
        let script = installed_bin(package, bin, base)
            .map_err(|e| CallError(format!("options of `typescript.check`: {package}: {e}")))?;
        if let Some(script) = script {
            return Ok(Some((
                "node".into(),
                vec![script.to_string_lossy().into_owned()],
            )));
        }
    }
    Ok(None)
}

#[cfg(test)]
mod tests;
