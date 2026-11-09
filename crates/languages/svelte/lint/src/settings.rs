use serde::Deserialize;

/// `ESLint`'s `settings.svelte`, and the parts of `svelte.config.js` rules read.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LintSettings {
    /// Rules whose findings `svelte/system` drops outside `<script>`; `/…/` is a pattern.
    #[serde(default)]
    pub ignore_warnings: Vec<String>,
    pub kit: Option<Kit>,
    /// The project's `svelte.config.js`, which `svelte-eslint-parser` reads; the host loads it.
    #[serde(skip)]
    pub svelte_config: Option<SvelteConfig>,
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

#[derive(Clone, Debug, Default)]
pub struct SvelteConfig {
    pub kit: Option<Kit>,
}

impl LintSettings {
    /// `SvelteKit`'s routes directory: the settings', then `svelte.config.js`'s, then the default.
    #[must_use]
    pub fn routes(&self) -> &str {
        self.kit
            .as_ref()
            .and_then(|kit| kit.files.routes.as_deref())
            .or_else(|| {
                self.svelte_config
                    .as_ref()?
                    .kit
                    .as_ref()?
                    .files
                    .routes
                    .as_deref()
            })
            .unwrap_or("src/routes")
    }
}
