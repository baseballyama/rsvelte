use std::path::PathBuf;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_plugin_interface::{CallError, Extension, Settings, TaskKind, program_path};
use serde::Deserialize;

use crate::{Check, Documents, Tsc, TypeChecker};

pub static EXTENSION: Extension = Extension {
    identifier: "typescript.check",
    install,
};

/// The task that checks every document some plugin gives a TypeScript view, in one project.
const TASK: &str = "ts.check/default";

/// What a check task needs when no type checker is configured.
pub const NEEDS_TYPE_CHECKER: &str =
    "a type checker: `command` in the options of `typescript.check`";

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    /// The program, then the arguments that start it, such as `["node", "tsc.js"]`. rsvelte
    /// adds `--api`, so they are not compiler options.
    command: Vec<String>,
    /// The project's tsconfig.json; by default `tsconfig.json` next to the options, if any.
    tsconfig: Option<PathBuf>,
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    crate::register(registry);
    let runs = settings.runs(TASK, TaskKind::Finish);
    let tsc = type_checker(settings, runs)?;
    if runs && tsc.is_none() {
        return Err(settings.missing(TASK, NEEDS_TYPE_CHECKER));
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
    let Some((program, arguments)) = options.value.command.split_first() else {
        return Err(error("`command` needs a program".to_owned()));
    };
    let base = &options.base;
    let program = program_path(program, base).map_err(|e| error(format!("{program}: {e}")))?;
    let tsconfig = options.value.tsconfig.map_or_else(
        || Some(base.join("tsconfig.json")).filter(|default| default.is_file()),
        |path| Some(base.join(path)),
    );
    let tsconfig = tsconfig
        .map(std::path::absolute)
        .transpose()
        .map_err(|e| error(e.to_string()))?;
    let checker = TypeChecker {
        program,
        arguments: arguments.to_vec(),
    };
    if runs {
        settings.tool(checker.to_string(), || {
            checker.identify().map_err(CallError)
        })?;
    }
    Ok(Some(Tsc { checker, tsconfig }))
}

#[cfg(test)]
mod tests;
