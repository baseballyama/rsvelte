//! Port of [`svelte-preprocess-sass`](https://github.com/ls-age/svelte-preprocess-sass)
//! (v2.0.1) — a `<style>` preprocessor that compiles Sass/SCSS to CSS.
//!
//! The JS original wraps dart-sass; this port uses the pure-Rust
//! [`grass`](https://docs.rs/grass) compiler, which targets dart-sass
//! compatibility.

use std::path::PathBuf;

use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, PreprocessAttributeMap as Map, PreprocessError, PreprocessorFn,
    PreprocessorGroup, PreprocessorOptions, PreprocessorResult, Processed,
};

use crate::filter::{FilterOptions, matches};

/// Options forwarded to the Sass compiler (subset of the dart-sass options
/// object the JS package accepts).
#[derive(Debug, Clone, Default)]
pub struct SassOptions {
    /// Force the indented (`.sass`) syntax regardless of the detected language.
    pub indented_syntax: Option<bool>,
    /// Extra load paths for `@import` / `@use` resolution.
    pub load_paths: Vec<PathBuf>,
}

/// Core transform — mirrors the upstream `preprocessSass(sassOptions,
/// filterOptions, { filename, content, attributes })`.
///
/// Returns `Ok(None)` when the block's `type`/`lang` does not select Sass/SCSS
/// (matching the upstream `return null`).
pub fn preprocess_sass(
    sass_options: &SassOptions,
    filter_options: &FilterOptions,
    filename: Option<&str>,
    content: &str,
    attributes: &Map<String, AttributeValue>,
) -> Result<Option<Processed>, String> {
    let (indented_syntax, process_styles) = if filter_options.name.is_none() {
        let indented = matches(
            &FilterOptions {
                name: Some("sass".to_string()),
                ..filter_options.clone()
            },
            attributes,
        );
        let process = indented
            || matches(
                &FilterOptions {
                    name: Some("scss".to_string()),
                    ..filter_options.clone()
                },
                attributes,
            );
        (indented, process)
    } else {
        let indented = filter_options.name.as_deref() == Some("sass");
        let process = matches(filter_options, attributes);
        (indented, process)
    };

    if !process_styles {
        return Ok(None);
    }

    // `sassOptions.indentedSyntax` (when set) overrides the detected syntax —
    // upstream spreads `...sassOptions` after the computed `indentedSyntax`.
    let indented = sass_options.indented_syntax.unwrap_or(indented_syntax);

    let mut options = grass::Options::default();
    if indented {
        options = options.input_syntax(grass::InputSyntax::Sass);
    }
    if let Some(file) = filename
        && let Some(dir) = std::path::Path::new(file).parent()
    {
        options = options.load_path(dir);
    }
    for path in &sass_options.load_paths {
        options = options.load_path(path);
    }

    let mut css = grass::from_string(content.to_string(), &options).map_err(|e| e.to_string())?;

    // dart-sass's legacy `render` (which the JS package wraps) emits expanded CSS
    // without a trailing newline; `grass` appends one, so drop it to match.
    if css.ends_with('\n') {
        css.pop();
    }

    Ok(Some(Processed {
        code: css,
        ..Default::default()
    }))
}

/// Build the `svelte-preprocess-sass` [`PreprocessorGroup`].
///
/// Mirrors the upstream `sass(sassOptions, filterOptions)` factory, which binds
/// the options and returns the `<style>` preprocessor.
pub fn sass(sass_options: SassOptions, filter_options: FilterOptions) -> PreprocessorGroup {
    PreprocessorGroup {
        name: Some("svelte-preprocess-sass".to_string()),
        style: Some(
            Box::new(move |opts: PreprocessorOptions| -> PreprocessorResult {
                let sass_options = sass_options.clone();
                let filter_options = filter_options.clone();
                Box::pin(async move {
                    preprocess_sass(
                        &sass_options,
                        &filter_options,
                        opts.filename.as_deref(),
                        &opts.content,
                        &opts.attributes,
                    )
                    .map_err(PreprocessError::Other)
                })
            }) as PreprocessorFn,
        ),
        ..Default::default()
    }
}
