//! Port of [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess)
//! (v6.0.5) — the **auto-preprocessor**.
//!
//! This is the native subset prioritized by the port plan: `replace` (markup),
//! `globalStyle` (style), and `scss`/`sass` (style, via the `grass` backend).
//!
//! The remaining language transforms are JS-toolchain transforms left to the
//! JS-fallback boundary and tracked as known failures: `typescript` (full
//! `tsc`: enums/decorators, not just type-strip), `postcss`, `less`, `stylus`,
//! `pug`, `coffeescript`, `babel`. See `tests/svelte_preprocess.rs` for the
//! covered fixtures.

pub mod global_style;
pub mod replace;
pub mod scss;

use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, MarkupPreprocessorFn, MarkupPreprocessorOptions, PreprocessAttributeMap as Map,
    PreprocessError, PreprocessorFn, PreprocessorGroup, PreprocessorOptions, PreprocessorResult,
    Processed,
};

pub use replace::{ReplaceRule, Replacement};
pub use scss::ScssOptions;

/// Options for the auto-preprocessor (the native subset).
#[derive(Default, Clone)]
pub struct AutoOptions {
    /// `replace` markup rules.
    pub replace: Vec<ReplaceRule>,
    /// `scss` / `sass` options.
    pub scss: Option<ScssOptions>,
}

/// Resolve the `lang` for a `<script>`/`<style>` block from its attributes,
/// applying the alias map (`sass` → `scss`, …).
fn get_lang(attributes: &Map<String, AttributeValue>) -> Option<String> {
    let raw = match attributes.get("lang") {
        Some(AttributeValue::String(s)) => Some(s.clone()),
        _ => match attributes.get("type") {
            Some(AttributeValue::String(s)) => s.strip_prefix("text/").map(str::to_string),
            _ => None,
        },
    }?;
    Some(alias_of(&raw))
}

/// Subset of svelte-preprocess's ALIAS_MAP relevant to the native transforms.
fn alias_of(alias: &str) -> String {
    match alias {
        "pcss" | "postcss" | "sugarss" | "sss" => "css",
        "sass" => "scss",
        "styl" => "stylus",
        "js" => "javascript",
        "coffee" => "coffeescript",
        "ts" => "typescript",
        other => other,
    }
    .to_string()
}

/// Whether the style block uses the indented (`.sass`) syntax.
fn lang_is_indented(attributes: &Map<String, AttributeValue>) -> bool {
    let raw = match attributes.get("lang") {
        Some(AttributeValue::String(s)) => Some(s.as_str()),
        _ => match attributes.get("type") {
            Some(AttributeValue::String(s)) => s.strip_prefix("text/"),
            _ => None,
        },
    };
    raw == Some("sass")
}

/// Build the `svelte-preprocess` auto-preprocessor [`PreprocessorGroup`].
pub fn svelte_preprocess(options: AutoOptions) -> PreprocessorGroup {
    let markup_opts = options.clone();
    let style_opts = options.clone();

    PreprocessorGroup {
        name: Some("svelte-preprocess".to_string()),
        markup: Some(Box::new(
            move |opts: MarkupPreprocessorOptions| -> PreprocessorResult {
                let rules = markup_opts.replace.clone();
                Box::pin(async move {
                    if rules.is_empty() {
                        return Ok(None);
                    }
                    Ok(Some(Processed {
                        code: replace::apply(&opts.content, &rules),
                        ..Default::default()
                    }))
                })
            },
        ) as MarkupPreprocessorFn),
        style: Some(
            Box::new(move |opts: PreprocessorOptions| -> PreprocessorResult {
                let o = style_opts.clone();
                Box::pin(async move { style_hook(&o, opts) })
            }) as PreprocessorFn,
        ),
        ..Default::default()
    }
}

fn style_hook(
    options: &AutoOptions,
    opts: PreprocessorOptions,
) -> Result<Option<Processed>, PreprocessError> {
    let lang = get_lang(&opts.attributes);
    let mut code = opts.content.clone();
    let mut dependencies = Vec::new();

    // Language transform (scss/sass via grass).
    if lang.as_deref() == Some("scss") {
        let indented = lang_is_indented(&opts.attributes);
        let transformed = scss::transform(
            options.scss.clone().unwrap_or_default(),
            indented,
            opts.filename.as_deref(),
            &code,
        )
        .map_err(PreprocessError::Other)?;
        code = transformed.code;
        dependencies = transformed.dependencies;
    }

    // globalStyle always runs (mirrors autoProcess's built-in globalStyle pass).
    let is_global = opts.attributes.contains_key("global");
    code = global_style::transform(&code, is_global).map_err(PreprocessError::Other)?;

    Ok(Some(Processed {
        code,
        dependencies,
        ..Default::default()
    }))
}
