use std::sync::{Arc, OnceLock};

use serde::Deserialize;

use crate::Pattern;

/// `ESLint`'s `settings.svelte`.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LintSettings {
    /// Rules whose findings `svelte/system` drops outside `<script>`; `/…/` is a pattern.
    #[serde(default)]
    pub ignore_warnings: Vec<String>,
    /// [`LintSettings::ignore_warnings`] compiled, once `svelte/system` is configured.
    #[serde(skip)]
    ignored_rules: OnceLock<Vec<Pattern>>,
    pub compile_options: Option<CompileOptions>,
    pub kit: Option<Kit>,
}

/// How upstream transforms scripts (with `babel`) and styles (with `postcss`) before it compiles.
/// rsvelte runs neither tool, so the options change nothing it reports.
#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CompileOptions {
    pub babel: Option<bool>,
    pub postcss: Option<Postcss>,
}

/// `false`, or the `postcss` configuration to load.
#[derive(Clone, Debug, Deserialize)]
#[serde(untagged)]
pub enum Postcss {
    Disabled(bool),
    Configuration {
        #[serde(rename = "configFilePath")]
        config_file_path: Option<String>,
    },
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Kit {
    #[serde(default)]
    pub files: KitFiles,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct KitFiles {
    pub routes: Option<String>,
}

/// The parts of a `svelte.config.js` rules read.
///
/// It is what `svelte-eslint-parser` takes from its `svelteConfig` option or, without one, from
/// the nearest file above the document. A project can have several, so the host answers it per
/// document ([`crate::computation::SvelteConfiguration`]).
#[derive(Clone, Debug, Default)]
pub struct SvelteConfig {
    pub kit: Option<Kit>,
    /// `compilerOptions.experimental.async`.
    pub experimental_async: bool,
    /// `warningFilter`, or else `onwarn`, as one function: the warning to report, or `None`.
    pub on_warning: Option<WarningHandler>,
}

/// A compiler warning as `svelte.config.js`'s `onwarn` and `warningFilter` see it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Warning {
    pub code: String,
    pub message: String,
}

/// The function the host builds from `svelte.config.js`.
#[derive(Clone)]
pub struct WarningHandler(pub Arc<dyn Fn(Warning) -> Option<Warning> + Send + Sync>);

impl std::fmt::Debug for WarningHandler {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("WarningHandler")
    }
}

impl LintSettings {
    /// Compiles [`LintSettings::ignore_warnings`] for [`LintSettings::ignored_rules`].
    ///
    /// # Errors
    ///
    /// A pattern is not a valid regular expression.
    pub(crate) fn compile_ignored_rules(&self) -> Result<(), String> {
        if self.ignored_rules.get().is_none() {
            let patterns = self
                .ignore_warnings
                .iter()
                .map(|p| Pattern::new(p))
                .collect::<Result<Vec<_>, _>>()?;
            self.ignored_rules.get_or_init(|| patterns);
        }
        Ok(())
    }

    /// The compiled [`LintSettings::ignore_warnings`]; empty until `svelte/system` compiles them.
    #[must_use]
    pub fn ignored_rules(&self) -> &[Pattern] {
        self.ignored_rules.get().map_or(&[], Vec::as_slice)
    }

    /// `SvelteKit`'s routes directory for a document with `svelte_config`: the settings', then the
    /// config's, then the default, without a leading `/` as `eslint-plugin-svelte` reads it.
    #[must_use]
    pub fn routes<'a>(&'a self, svelte_config: Option<&'a SvelteConfig>) -> &'a str {
        let routes = self
            .kit
            .as_ref()
            .and_then(|kit| kit.files.routes.as_deref())
            .or_else(|| svelte_config?.kit.as_ref()?.files.routes.as_deref())
            .unwrap_or("src/routes");
        routes.strip_prefix('/').unwrap_or(routes)
    }
}
