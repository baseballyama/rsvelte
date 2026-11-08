use std::path::PathBuf;

use rsvelte_kernel::computation::functions::CallError;
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_plugin_interface::{Extension, Settings, TaskKind};
use serde::Deserialize;

use crate::{Configuration, TypeCheckConfiguration};

pub static EXTENSION: Extension = Extension {
    identifier: "vue.check",
    install,
};

const TASK: &str = "vue.check/default";

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    /// The installed `vue` package directory.
    vue: PathBuf,
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    let runs = settings.runs(TASK, TaskKind::Finish);
    let tsc = rsvelte_typescript_check::type_checker(settings, runs)?;
    let options = settings.options::<Options>(EXTENSION.identifier)?;
    let check = match (tsc, options) {
        (Some(tsc), Some(options)) => Some(TypeCheckConfiguration {
            tsc,
            vue: std::path::absolute(options.base.join(options.value.vue))
                .map_err(|e| CallError(format!("options of `vue.check`: {e}")))?,
        }),
        (None, _) if runs => {
            return Err(settings.missing(TASK, rsvelte_typescript_check::NEEDS_TYPE_CHECKER));
        }
        (_, None) if runs => {
            return Err(
                settings.missing(TASK, "the vue package: `vue` in the options of `vue.check`")
            );
        }
        _ => None,
    };
    crate::register(registry, &Configuration { check });
    Ok(())
}
