use serde::Deserialize;

/// `ESLint`'s `settings.svelte`.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LintSettings {
    /// Compiler warning codes `svelte/valid-compile` does not report; `/…/` is a pattern.
    #[serde(default)]
    pub ignore_warnings: Vec<String>,
    pub kit: Option<Kit>,
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
}

impl LintSettings {
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
