use std::collections::BTreeMap;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::interning::static_name;
use rsvelte_lint_runner::configuration::RuleEntryList;
use rsvelte_plugin_interface::{CallError, Extension, FunctionReference, Settings};
use serde::Deserialize;
use serde_json::value::RawValue;

use crate::external::{CONTRACT, ExternalRule};
use crate::rule::{Files, LintPlugins};
use crate::{Configuration, LintSettings};

pub static EXTENSION: Extension = Extension {
    identifier: "svelte.lint",
    install,
};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    rules: Option<BTreeMap<String, Box<RawValue>>>,
    #[serde(default)]
    settings: LintSettings,
    /// Host functions as rules, by plugin prefix and then rule name.
    #[serde(default)]
    plugins: BTreeMap<String, BTreeMap<String, FunctionReference>>,
}

/// Configures `svelte.lint` from its options. Plugins that add rules ([`LintPlugins`]) install
/// before it.
fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    let Some(options) = settings.options::<Options>(EXTENSION.identifier)? else {
        crate::register(registry);
        return Ok(());
    };
    let Options {
        rules,
        settings: lint_settings,
        plugins: functions,
    } = options.value;
    let Some(rules) = rules else {
        if !functions.is_empty() {
            return Err(CallError(
                "svelte.lint: `plugins` needs `rules` that turn them on".to_owned(),
            ));
        }
        crate::register_with_configuration(
            registry,
            Configuration::with_default_rules(lint_settings),
        );
        return Ok(());
    };
    let mut configuration = Configuration::new(lint_settings);
    let mut external = BTreeMap::new();
    for (prefix, rules) in functions {
        if prefix.is_empty() || prefix.contains('/') || prefix == "svelte" {
            return Err(CallError(format!(
                "svelte.lint: `{prefix}` cannot prefix plugin rules"
            )));
        }
        for (rule, reference) in rules {
            external.insert(format!("{prefix}/{rule}"), reference);
        }
    }
    let plugins = registry.contributions::<LintPlugins>().to_vec();
    for (name, raw) in rules {
        let error = |e: String| CallError(format!("svelte.lint rule `{name}`: {e}"));
        let entry: RuleEntryList<Box<RawValue>> =
            serde_json::from_str(raw.get()).map_err(|e| error(e.to_string()))?;
        let reference = external.remove(&name);
        // As `ESLint`, an unknown rule fails even when it is off; an off rule's options are not read.
        if reference.is_none() && crate::definition(&name, &plugins).is_none() {
            return Err(CallError(format!("unknown Svelte lint rule `{name}`")));
        }
        let Some(severity) = entry.level.severity() else {
            continue;
        };
        if let Some(reference) = reference {
            let function = settings.functions().resolve(&reference, &CONTRACT)?;
            let options = format!(
                "[{}]",
                entry
                    .options
                    .iter()
                    .map(|o| o.get())
                    .collect::<Vec<_>>()
                    .join(",")
            );
            configuration
                .push(
                    static_name(&name),
                    Files::All,
                    severity,
                    Box::new(ExternalRule { function, options }),
                )
                .map_err(error)?;
            continue;
        }
        configuration
            .rule(&name, severity, &entry.options, &plugins)
            .map_err(|e| CallError(format!("svelte.lint: {e}")))?;
    }
    crate::register_with_configuration(registry, configuration);
    Ok(())
}
