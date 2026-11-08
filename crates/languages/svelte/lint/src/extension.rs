use std::collections::BTreeMap;

use rsvelte_kernel::computation::functions::CallError;
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_lint_runner::level::Level;
use rsvelte_markup::button_type::Allowed;
use rsvelte_plugin_interface::{Extension, Settings};
use serde::Deserialize;
use serde_json::value::RawValue;

use crate::{Configuration, RuleConfiguration};

pub static EXTENSION: Extension = Extension {
    identifier: "svelte.lint",
    install,
};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    rules: Option<BTreeMap<String, Box<RawValue>>>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct ButtonOptions {
    #[serde(default = "enabled")]
    button: bool,
    #[serde(default = "enabled")]
    submit: bool,
    #[serde(default = "enabled")]
    reset: bool,
}

const fn enabled() -> bool {
    true
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum RuleOptions {
    Level(Level),
    WithOptions((Level, ButtonOptions)),
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    let Some(rules) = settings
        .options::<Options>(EXTENSION.identifier)?
        .and_then(|options| options.value.rules)
    else {
        crate::register(registry);
        return Ok(());
    };
    let mut configuration = Vec::with_capacity(rules.len());
    for (identifier, raw) in rules {
        if let Some(rule) = rule(&identifier, &raw)? {
            configuration.push(rule);
        }
    }
    let configuration = Configuration::new(configuration).map_err(|e| CallError(e.into()))?;
    crate::register_with_configuration(registry, configuration);
    Ok(())
}

/// Rule `identifier` as `raw` configures it; `None` when it is off.
fn rule(identifier: &str, raw: &RawValue) -> Result<Option<RuleConfiguration>, CallError> {
    let error = |e: String| CallError(format!("svelte.lint rule `{identifier}`: {e}"));
    let options: RuleOptions = serde_json::from_str(raw.get()).map_err(|e| error(e.to_string()))?;
    let (level, button) = match options {
        RuleOptions::Level(level) => (level, None),
        RuleOptions::WithOptions((level, options)) => (level, Some(options)),
    };
    if !matches!(
        identifier,
        "no-unused-vars" | "svelte/button-has-type" | "svelte/valid-each-key"
    ) {
        return Err(CallError(format!(
            "unknown Svelte lint rule `{identifier}`"
        )));
    }
    if button.is_some() && identifier != "svelte/button-has-type" {
        return Err(CallError(format!(
            "rule `{identifier}` does not accept options"
        )));
    }
    let Some(severity) = level.severity().map_err(error)? else {
        return Ok(None);
    };
    Ok(Some(match identifier {
        "no-unused-vars" => RuleConfiguration::NoUnusedVariables(severity),
        "svelte/valid-each-key" => RuleConfiguration::ValidEachKey(severity),
        "svelte/button-has-type" => RuleConfiguration::ButtonHasType {
            severity,
            allowed: button.map_or_else(Allowed::default, |options| Allowed {
                button: options.button,
                submit: options.submit,
                reset: options.reset,
            }),
        },
        _ => unreachable!("rule names were checked"),
    }))
}
