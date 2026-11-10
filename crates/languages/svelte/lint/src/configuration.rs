use std::sync::{Arc, LazyLock};

use rsvelte_kernel::diagnostics::Severity;
use rsvelte_lint_runner::rule::{Reporter, Rule};
use serde_json::value::RawValue;

use crate::LintSettings;
use crate::rule::{File, Files, LintPlugin, RuleDefinition, RuleOptions, SvelteRule};

/// The rules that run, in configuration order, and the settings they were configured with.
#[derive(Debug)]
pub struct Configuration {
    rules: Vec<ConfiguredRule>,
    settings: Arc<LintSettings>,
}

#[derive(Debug)]
pub struct ConfiguredRule {
    name: &'static str,
    files: Files,
    severity: Severity,
    rule: Box<dyn SvelteRule>,
}

impl ConfiguredRule {
    #[must_use]
    pub const fn name(&self) -> &'static str {
        self.name
    }

    pub(crate) fn applies(&self, file: &File<'_>) -> bool {
        self.files == Files::All || file.is_component()
    }
}

impl Rule<File<'_>> for ConfiguredRule {
    fn identifier(&self) -> &'static str {
        self.name
    }

    fn severity(&self) -> Severity {
        self.severity
    }

    fn check(&self, context: &File<'_>, reporter: &mut Reporter<'_>) {
        self.rule.check(context, reporter);
    }
}

impl Configuration {
    /// No rules; add them with [`Configuration::rule`]. A rule that is not added is off.
    #[must_use]
    pub fn new(settings: LintSettings) -> Self {
        Self {
            rules: Vec::new(),
            settings: Arc::new(settings),
        }
    }

    /// Turns on rule `name`, a built-in rule or one of `plugins`, with `ESLint`'s options after
    /// the level.
    ///
    /// # Errors
    ///
    /// No rule has the name, the rule is already on, or it rejects the options.
    pub fn rule(
        &mut self,
        name: &str,
        severity: Severity,
        options: &[Box<RawValue>],
        plugins: &[&'static LintPlugin],
    ) -> Result<&mut Self, String> {
        let definition = definition(name, plugins)
            .ok_or_else(|| format!("unknown Svelte lint rule `{name}`"))?;
        let rule = (definition.configure)(&RuleOptions {
            options,
            settings: &self.settings,
        })
        .map_err(|e| format!("rule `{name}`: {e}"))?;
        self.push(definition.name, definition.files, severity, rule)
    }

    /// Turns on a rule that no definition names, such as one a host function implements.
    ///
    /// # Errors
    ///
    /// A rule of the name is already on.
    pub fn push(
        &mut self,
        name: &'static str,
        files: Files,
        severity: Severity,
        rule: Box<dyn SvelteRule>,
    ) -> Result<&mut Self, String> {
        if self.rules.iter().any(|r| r.name == name) {
            return Err(format!("rule `{name}` is configured twice"));
        }
        self.rules.push(ConfiguredRule {
            name,
            files,
            severity,
            rule,
        });
        Ok(self)
    }

    #[must_use]
    pub fn rules(&self) -> &[ConfiguredRule] {
        &self.rules
    }

    #[must_use]
    pub const fn settings(&self) -> &Arc<LintSettings> {
        &self.settings
    }

    /// Whether a rule runs on JavaScript and TypeScript modules too.
    #[must_use]
    pub fn lints_modules(&self) -> bool {
        self.rules.iter().any(|r| r.files == Files::All)
    }
}

/// Whether `prefix` can prefix plugin rules: a non-empty name without `/`.
pub(crate) fn is_prefix(prefix: &str) -> bool {
    !prefix.is_empty() && !prefix.contains('/')
}

/// Plugins name their rules `<prefix>/<rule>` under a prefix of their own, never `svelte`, so no
/// plugin rule can stand for another rule.
///
/// # Errors
///
/// A plugin's prefix or rule name breaks that, or two plugins share a prefix.
pub fn check_plugins(plugins: &[&'static LintPlugin]) -> Result<(), String> {
    for (i, plugin) in plugins.iter().enumerate() {
        if !is_prefix(plugin.prefix) || plugin.prefix == "svelte" {
            return Err(format!(
                "a plugin cannot use the prefix `{}`",
                plugin.prefix
            ));
        }
        if plugins[..i]
            .iter()
            .any(|other| other.prefix == plugin.prefix)
        {
            return Err(format!("two plugins use the prefix `{}`", plugin.prefix));
        }
        for rule in plugin.rules {
            let named = rule
                .name
                .strip_prefix(plugin.prefix)
                .and_then(|rest| rest.strip_prefix('/'))
                .is_some_and(|rest| !rest.is_empty());
            if !named {
                return Err(format!(
                    "plugin `{}` names a rule `{}` outside its prefix",
                    plugin.prefix, rule.name
                ));
            }
        }
    }
    Ok(())
}

/// The built-in rule or plugin rule called `name`.
#[must_use]
pub fn definition(name: &str, plugins: &[&'static LintPlugin]) -> Option<&'static RuleDefinition> {
    crate::rules::BUILT_IN
        .iter()
        .chain(plugins.iter().flat_map(|plugin| plugin.rules))
        .find(|definition| definition.name == name)
        .copied()
}

const DEFAULT_RULES: &[&str] = &["no-unused-vars", "svelte/button-has-type"];

pub(crate) static DEFAULT: LazyLock<Configuration> = LazyLock::new(Configuration::default);

impl Configuration {
    /// The default rules, `no-unused-vars` and `svelte/button-has-type` as errors, with
    /// `settings`.
    ///
    /// # Panics
    ///
    /// Never: the default rules take no options.
    #[must_use]
    pub fn with_default_rules(settings: LintSettings) -> Self {
        let mut configuration = Self::new(settings);
        for name in DEFAULT_RULES {
            configuration
                .rule(name, Severity::Error, &[], &[])
                .expect("default rules configure without options");
        }
        configuration
    }
}

impl Default for Configuration {
    fn default() -> Self {
        Self::with_default_rules(LintSettings::default())
    }
}

#[cfg(test)]
mod tests;
