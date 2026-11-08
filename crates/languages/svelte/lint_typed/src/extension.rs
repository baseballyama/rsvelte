use std::collections::BTreeMap;

use rsvelte_config::{Extension, Settings};
use rsvelte_kernel::computation::functions::CallError;
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_lint::level::Level;
use serde::Deserialize;

use crate::Configuration;

pub static EXTENSION: Extension = Extension {
    identifier: "svelte.lint.typed",
    install,
};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    rules: Option<BTreeMap<String, Level>>,
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    let Some(rules) = settings
        .options::<Options>(EXTENSION.identifier)?
        .and_then(|options| options.value.rules)
    else {
        crate::register(registry);
        return Ok(());
    };
    let mut configuration = Configuration {
        no_unnecessary_condition: None,
    };
    for (identifier, level) in rules {
        if identifier != "svelte/@typescript-eslint/no-unnecessary-condition" {
            return Err(CallError(format!(
                "unknown typed Svelte lint rule `{identifier}`"
            )));
        }
        configuration.no_unnecessary_condition = level
            .severity()
            .map_err(|e| CallError(format!("svelte.lint.typed rule `{identifier}`: {e}")))?;
    }
    crate::register_with_configuration(registry, configuration);
    Ok(())
}
