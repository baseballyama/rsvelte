//! Port of [`@modular-css/svelte`](https://github.com/tivac/modular-css)
//! (v29.x) — CSS Modules for Svelte (scoped class hashing, `composes`,
//! `@value`, `:export`, cross-file resolution).
//!
//! modular-css's exact output is produced by `@modular-css/processor` (a
//! postcss-based engine whose composes/value resolution and whitespace handling
//! define the fixtures). lightningcss's css-modules uses a different naming and
//! serialization, so it cannot reproduce these fixtures byte-for-byte. Per the
//! plan's JS-fallback boundary, the rsvelte [`PreprocessorGroup`] delegates to
//! the installed `@modular-css/svelte` over a Node bridge
//! ([`js/modular-css-bridge.mjs`]). A lightningcss-native core is future work.

use rsvelte_core::compiler::preprocess::types::{
    MarkupPreprocessorFn, MarkupPreprocessorOptions, PreprocessError, PreprocessorGroup,
    PreprocessorResult, Processed,
};

use crate::bridge::{self, MarkupBridge};

const SCRIPT: &str = include_str!("../js/modular-css-bridge.mjs");

/// Result of processing a file through modular-css.
#[derive(Debug, Clone, Default)]
pub struct ModularCssOutput {
    /// Transformed markup (with `{css.<key>}` references replaced).
    pub code: String,
    /// The aggregated, scoped output CSS (`processor.output().css`).
    pub css: String,
    /// Watched file dependencies.
    pub dependencies: Vec<String>,
}

/// Run the modular-css markup transform, returning the transformed markup, the
/// aggregated CSS, and dependencies. Mirrors `plugin(opts).preprocess.markup`
/// plus `processor.output()`.
pub fn process(
    content: &str,
    filename: Option<&str>,
    config: &MarkupBridge,
) -> Result<ModularCssOutput, String> {
    let request = serde_json::json!({
        "content": content,
        "filename": filename,
        "options": config.options,
    });
    let value = bridge::run(SCRIPT, &request, &config.bridge)?;
    if let Some(err) = value.get("renderError").and_then(|v| v.as_str()) {
        return Err(err.to_string());
    }
    let ok = value.get("ok").ok_or("empty bridge response")?;
    Ok(ModularCssOutput {
        code: ok
            .get("code")
            .and_then(|v| v.as_str())
            .unwrap_or(content)
            .to_string(),
        css: ok
            .get("css")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        dependencies: ok
            .get("dependencies")
            .and_then(|v| v.as_array())
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_default(),
    })
}

/// Build the `@modular-css/svelte` [`PreprocessorGroup`].
pub fn modular_css(config: MarkupBridge) -> PreprocessorGroup {
    PreprocessorGroup {
        name: Some("@modular-css/svelte".to_string()),
        markup: Some(Box::new(
            move |opts: MarkupPreprocessorOptions| -> PreprocessorResult {
                let config = config.clone();
                Box::pin(async move {
                    let out = process(&opts.content, opts.filename.as_deref(), &config)
                        .map_err(PreprocessError::Other)?;
                    Ok(Some(Processed {
                        code: out.code,
                        dependencies: out.dependencies,
                        ..Default::default()
                    }))
                })
            },
        ) as MarkupPreprocessorFn),
        ..Default::default()
    }
}
