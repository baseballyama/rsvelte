//! Port of [`svelte-preprocess-sass`](https://github.com/ls-age/svelte-preprocess-sass)
//! (v2.0.1) — a `<style>` preprocessor that compiles Sass/SCSS to CSS.
//!
//! The JS original wraps dart-sass; this port uses the pure-Rust
//! [`grass`](https://docs.rs/grass) compiler, which targets dart-sass
//! compatibility.

use std::{
    any::Any,
    panic::{AssertUnwindSafe, catch_unwind},
    path::PathBuf,
};

use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, PreprocessAttributeMap as Map, PreprocessError, PreprocessorFn,
    PreprocessorGroup, PreprocessorOptions, PreprocessorResult, Processed,
};

use crate::filter::{FilterOptions, matches};
use crate::sass_fs::RecordingFs;

pub(crate) const INDENTED_BASE_ERROR: &str =
    "Indenting at the beginning of the document is illegal.";

/// Dart Sass (since 1.107) rejects an indented-syntax document whose first
/// non-blank line is indented, however many blank lines precede it. grass
/// aborts on that shape instead of erroring, and `catch_unwind` is void under
/// `panic = "abort"`, so it has to be rejected before grass sees it.
/// Whitespace-only leading lines are emptied (line count kept) because dart
/// Sass accepts them and grass does not.
pub(crate) fn prepare_indented(source: &str) -> Result<String, String> {
    let mut output = String::with_capacity(source.len());
    let mut saw_content = false;
    for chunk in source.split_inclusive('\n') {
        if saw_content {
            output.push_str(chunk);
            continue;
        }
        let line = chunk.trim_end_matches(['\n', '\r']);
        if line.trim().is_empty() {
            output.push_str(&chunk[line.len()..]);
            continue;
        }
        if line.starts_with([' ', '\t']) {
            return Err(INDENTED_BASE_ERROR.to_string());
        }
        saw_content = true;
        output.push_str(chunk);
    }
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::{INDENTED_BASE_ERROR, prepare_indented};

    #[test]
    fn rejects_base_indentation_after_leading_blank_lines() {
        for source in [
            "\n\t.card\n\t\tdisplay: block\n",
            "\n\n  .a\n    color: red\n",
            "\r\n\t.a\r\n\t\tcolor: red\r\n",
            "\t.card\n\t\tdisplay: block\n",
        ] {
            assert_eq!(
                prepare_indented(source),
                Err(INDENTED_BASE_ERROR.to_string())
            );
        }
    }

    #[test]
    fn empties_whitespace_only_leading_lines() {
        assert_eq!(
            prepare_indented("  \n.a\n  color: red\n").as_deref(),
            Ok("\n.a\n  color: red\n")
        );
    }

    #[test]
    fn leaves_unindented_documents_unchanged() {
        for source in [
            "\n.card\n  display: block\n",
            "// c\n  .a\n    color: red\n",
            "",
            "\n  \n",
        ] {
            let expected = source.replace("  \n", "\n");
            assert_eq!(prepare_indented(source).as_deref(), Ok(expected.as_str()));
        }
    }
}

fn panic_message(payload: Box<dyn Any + Send>) -> String {
    if let Some(message) = payload.downcast_ref::<&str>() {
        (*message).to_string()
    } else if let Some(message) = payload.downcast_ref::<String>() {
        message.clone()
    } else {
        "unknown panic".to_string()
    }
}

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
///
/// # Errors
///
/// Returns an error when compiling a selected Sass or SCSS block fails.
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

    let fs = RecordingFs::default();
    let mut options = grass::Options::default().fs(&fs);
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

    let source = if indented {
        prepare_indented(content)?
    } else {
        content.to_string()
    };
    let compile =
        |source: String| catch_unwind(AssertUnwindSafe(|| grass::from_string(source, &options)));
    let mut css = match compile(source) {
        Ok(result) => result.map_err(|error| error.to_string())?,
        Err(payload) => return Err(format!("grass panicked: {}", panic_message(payload))),
    };

    // dart-sass's legacy `render` (which the JS package wraps) emits expanded CSS
    // without a trailing newline; `grass` appends one, so drop it to match.
    if css.ends_with('\n') {
        css.pop();
    }

    Ok(Some(Processed {
        code: css,
        dependencies: fs.dependencies(),
        ..Default::default()
    }))
}

/// Build the `svelte-preprocess-sass` [`PreprocessorGroup`].
///
/// Mirrors the upstream `sass(sassOptions, filterOptions)` factory, which binds
/// the options and returns the `<style>` preprocessor.
#[must_use]
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
