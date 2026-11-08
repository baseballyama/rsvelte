use std::path::PathBuf;

use rsvelte_config::extension::program_path;
use rsvelte_config::{Extension, Settings, TaskKind};
use rsvelte_kernel::computation::functions::CallError;
use rsvelte_kernel::computation::pipeline::Registry;
use serde::Deserialize;

use crate::{Configuration, TypeCheckConfiguration};

pub static EXTENSION: Extension = Extension {
    identifier: "svelte.typecheck",
    install,
};

const TASK: &str = "svelte.check/default";

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    /// The installed `svelte` package directory.
    svelte: PathBuf,
    /// The content mapper executable; by default `rsvelte-typescript-content-mapper`, looked up
    /// as a type checker is.
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
            let error =
                |e: std::io::Error| CallError(format!("options of `svelte.typecheck`: {e}"));
            let mapper = options
                .value
                .content_mapper
                .as_deref()
                .unwrap_or("rsvelte-typescript-content-mapper");
            Some(TypeCheckConfiguration {
                tsc,
                content_mapper: program_path(mapper, base).map_err(error)?,
                svelte: std::path::absolute(base.join(options.value.svelte)).map_err(error)?,
            })
        }
        (None, _) if runs => {
            return Err(settings.missing(TASK, rsvelte_typescript_check::NEEDS_TYPE_CHECKER));
        }
        (_, None) if runs => {
            return Err(settings.missing(
                TASK,
                "the svelte package: `svelte` in the options of `svelte.typecheck`",
            ));
        }
        _ => None,
    };
    crate::register(registry, &Configuration { check });
    Ok(())
}
