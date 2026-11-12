use std::sync::{Arc, LazyLock};

use rsvelte_kernel::diagnostics::Severity;
use rsvelte_lint_runner::catalog::{self, Enabled, EnabledRules};
use rsvelte_lint_runner::rule::{Reporter, Rule};
use serde_json::value::RawValue;

use crate::LintSettings;
use crate::rule::{File, Files, LintPlugin, RuleDefinition, RuleOptions, SvelteRule};

/// The rules that run, in configuration order, and the settings they were configured with.
#[derive(Debug)]
pub struct Configuration {
    rules: EnabledRules<dyn SvelteRule, Files>,
    settings: Arc<LintSettings>,
}

/// A rule that configuration turned on, with the documents it runs on.
pub type ConfiguredRule = Enabled<dyn SvelteRule, Files>;

pub(crate) fn applies(rule: &ConfiguredRule, file: &File<'_>) -> bool {
    rule.extra == Files::All || file.is_component()
}

/// Runs a configured rule over a document; its own name and severity stamp its findings.
#[derive(Debug)]
pub(crate) struct Running<'r>(pub &'r ConfiguredRule);

impl Rule<File<'_>> for Running<'_> {
    fn identifier(&self) -> &'static str {
        self.0.name()
    }

    fn severity(&self) -> Severity {
        self.0.severity()
    }

    fn check(&self, context: &File<'_>, reporter: &mut Reporter<'_>) {
        self.0.rule().check(context, reporter);
    }
}

impl Configuration {
    /// No rules; add them with [`Configuration::rule`]. A rule that is not added is off.
    #[must_use]
    pub fn new(settings: LintSettings) -> Self {
        Self {
            rules: EnabledRules::default(),
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
        self.rules.push(name, severity, files, rule)?;
        Ok(self)
    }

    #[must_use]
    pub fn rules(&self) -> &[ConfiguredRule] {
        self.rules.as_slice()
    }

    #[must_use]
    pub const fn settings(&self) -> &Arc<LintSettings> {
        &self.settings
    }

    /// Whether a rule runs on JavaScript and TypeScript modules too.
    #[must_use]
    pub fn lints_modules(&self) -> bool {
        self.rules().iter().any(|r| r.extra == Files::All)
    }
}

/// Plugins name their rules `<prefix>/<rule>` under a prefix of their own, never `svelte`.
///
/// # Errors
///
/// A plugin's prefix or rule name breaks that, or two plugins share a prefix.
pub fn check_plugins(plugins: &[&'static LintPlugin]) -> Result<(), String> {
    catalog::check_plugins("svelte", plugins)
}

/// The built-in rule or plugin rule called `name`.
#[must_use]
pub fn definition(name: &str, plugins: &[&'static LintPlugin]) -> Option<&'static RuleDefinition> {
    catalog::find(crate::rules::BUILT_IN, plugins, name)
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
