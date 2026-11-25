use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_plugin_interface::{
    CallError, Extension, Settings, TaskKind, installed_package, program_path,
};
use serde::Deserialize;

use crate::registration::TASK;
use crate::{Configuration, TypeCheckConfiguration};

pub static EXTENSION: Extension = Extension {
    identifier: "svelte.check",
    install,
};

/// The content mapper that projects every component, including one a package ships.
const MAPPER: &str = "rsvelte-svelte-content-mapper";

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    /// The installed `svelte` package directory; by default the one the project resolves.
    svelte: Option<PathBuf>,
    /// The content mapper executable; by default [`MAPPER`] among the host's programs, else
    /// looked up as a type checker is.
    #[serde(default, rename = "contentMapper")]
    content_mapper: Option<String>,
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    let runs = settings.runs(TASK, TaskKind::Finish);
    let tsc = rsvelte_typescript_check::type_checker(settings, runs)?;
    let options = settings.options::<Options>(EXTENSION.identifier)?;
    let check = match (tsc, options) {
        (Some(tsc), Some(options)) => {
            let base = &options.base;
            let error = |e: std::io::Error| CallError(format!("options of `svelte.check`: {e}"));
            let content_mapper = match options.value.content_mapper.as_deref() {
                Some(mapper) => program_path(mapper, base).map_err(error)?,
                None => match installed_mapper(settings.programs()) {
                    Some(mapper) => mapper,
                    None => program_path(MAPPER, base).map_err(error)?,
                },
            };
            let svelte = match options.value.svelte {
                Some(svelte) => Some(std::path::absolute(base.join(svelte)).map_err(error)?),
                None => installed_package("svelte", base).map_err(error)?,
            };
            match svelte {
                Some(svelte) => Some(TypeCheckConfiguration {
                    tsc,
                    content_mapper,
                    svelte,
                }),
                // A project without Svelte has no component to check.
                None if !runs => None,
                None => {
                    return Err(CallError(
                        "options of `svelte.check`: the project does not install `svelte`; name \
                         its directory with `svelte`"
                            .to_owned(),
                    ));
                }
            }
        }
        (None, _) if runs => {
            return Err(settings.missing(TASK, rsvelte_typescript_check::NEEDS_TYPE_CHECKER));
        }
        (_, None) if runs => {
            return Err(settings.missing(
                TASK,
                "the svelte package: the options of `svelte.check`, `{}` to use the project's",
            ));
        }
        _ => None,
    };
    crate::register(registry, &Configuration { check });
    Ok(())
}

/// [`MAPPER`] among the programs a release installs with the host.
fn installed_mapper(programs: Option<&Path>) -> Option<PathBuf> {
    let mapper = programs?
        .join(MAPPER)
        .with_extension(std::env::consts::EXE_EXTENSION);
    mapper.is_file().then_some(mapper)
}

#[cfg(test)]
mod tests;
