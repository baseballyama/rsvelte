use std::collections::BTreeMap;
use std::sync::Arc;

use rsvelte_config::{FunctionReference, LoadedConfiguration, TextContract};
use rsvelte_kernel::computation::functions::{CallError, Contract, Function};
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_markup::button_type::Allowed;
use rsvelte_svelte_lint::RuleConfiguration;
use serde::Deserialize;
use serde_json::value::RawValue;

use super::{Level, decode};

static STYLESHEET_HASH: TextContract = TextContract {
    identifier: rsvelte_svelte_compile::CssHash::IDENTIFIER,
    version: rsvelte_svelte_compile::CssHash::VERSION,
    arguments: &["name", "filename", "css"],
};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct CompileOptions {
    #[serde(default, rename = "cssHash")]
    stylesheet_hash: Option<FunctionReference>,
}

pub(super) fn compile(
    registry: &mut Registry,
    loaded: &LoadedConfiguration,
    raw: &RawValue,
) -> Result<(), CallError> {
    let options: CompileOptions = decode(raw)?;
    let stylesheet_hash = options
        .stylesheet_hash
        .as_ref()
        .map(|reference| {
            let function = loaded.functions.resolve(reference, &STYLESHEET_HASH)?;
            Ok(Function::<rsvelte_svelte_compile::CssHash>::new(
                move |input| function.call(&[input.name, input.filename, input.css]),
            ))
        })
        .transpose()?;
    let configuration = Arc::new(rsvelte_svelte_compile::Configuration {
        css_hash: stylesheet_hash,
    });
    registry.provide::<rsvelte_svelte_compile::computation::CompileConfiguration>(
        "config",
        rsvelte_svelte::matches,
        move |_| Arc::clone(&configuration),
    );
    Ok(())
}

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct LintOptions {
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

pub(super) fn lint(registry: &mut Registry, raw: &RawValue) -> Result<(), CallError> {
    let options: LintOptions = decode(raw)?;
    let configuration = if let Some(rules) = options.rules {
        let mut configuration = Vec::with_capacity(rules.len());
        for (identifier, raw) in rules {
            let options: RuleOptions = decode(&raw)?;
            let (level, button) = match options {
                RuleOptions::Level(level) => (level, None),
                RuleOptions::WithOptions((level, options)) => (level, Some(options)),
            };
            let known = matches!(
                identifier.as_str(),
                "no-unused-vars" | "svelte/button-has-type" | "svelte/valid-each-key"
            );
            if !known {
                return Err(CallError(format!(
                    "unknown Svelte lint rule `{identifier}`"
                )));
            }
            if button.is_some() && identifier != "svelte/button-has-type" {
                return Err(CallError(format!(
                    "rule `{identifier}` does not accept options"
                )));
            }
            let Some(severity) = level.severity()? else {
                continue;
            };
            configuration.push(match identifier.as_str() {
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
            });
        }
        rsvelte_svelte_lint::Configuration::new(configuration)
            .map_err(|error| CallError(error.into()))?
    } else {
        rsvelte_svelte_lint::Configuration::default()
    };
    let configuration = Arc::new(configuration);
    registry.provide::<rsvelte_svelte_lint::computation::LintConfiguration>(
        "config",
        rsvelte_svelte::matches,
        move |_| Arc::clone(&configuration),
    );
    Ok(())
}

#[cfg(feature = "lint-typed")]
pub(super) fn lint_typed(registry: &mut Registry, raw: &RawValue) -> Result<(), CallError> {
    let options: LintOptions = decode(raw)?;
    let mut configuration = rsvelte_svelte_lint_typed::Configuration::default();
    if let Some(rules) = options.rules {
        configuration.no_unnecessary_condition = None;
        for (identifier, raw) in rules {
            if identifier != "svelte/@typescript-eslint/no-unnecessary-condition" {
                return Err(CallError(format!(
                    "unknown typed Svelte lint rule `{identifier}`"
                )));
            }
            configuration.no_unnecessary_condition = decode::<Level>(&raw)?.severity()?;
        }
    }
    let configuration = Arc::new(configuration);
    registry.provide::<rsvelte_svelte_lint_typed::computation::LintConfiguration>(
        "config",
        rsvelte_svelte::matches,
        move |_| Arc::clone(&configuration),
    );
    Ok(())
}
